/*
* Copyright (C) 2019 Intel Corporation
* SPDX-License-Identifier: MIT
*/

/* eslint prefer-arrow-callback: [ "error", { "allowNamedFunctions": true } ] */

/* global
    require:false
*/


(() => {
    const PluginRegistry = require('./plugins');
    const serverProxy = require('./server-proxy');
    const {
        isBoolean,
        isInteger,
        isEnum,
        isString,
        checkFilter,
    } = require('./common');

    const {
        TaskStatus,
        TaskMode,
    } = require('./enums');

    const User = require('./user');
    const { AnnotationFormat } = require('./annotation-format.js');
    const { ArgumentError } = require('./exceptions');
    const { Task } = require('./session');

    function implementAPI(cvat) {
        cvat.plugins.list.implementation = PluginRegistry.list;
        cvat.plugins.register.implementation = PluginRegistry.register.bind(cvat);

        cvat.server.about.implementation = async () => {
            const result = await serverProxy.server.about();
            return result;
        };

        cvat.server.share.implementation = async (directory) => {
            const result = await serverProxy.server.share(directory);
            return result;
        };

        cvat.server.formats.implementation = async () => {
            const result = await serverProxy.server.formats();
            return result.map((el) => new AnnotationFormat(el));
        };

        cvat.server.register.implementation = async (username, firstName, lastName,
            email, password1, password2) => {
            await serverProxy.server.register(username, firstName, lastName, email,
                password1, password2);
        };

        cvat.server.login.implementation = async (username, password) => {
            await serverProxy.server.login(username, password);
        };

        cvat.server.logout.implementation = async () => {
            await serverProxy.server.logout();
        };

        cvat.server.authorized.implementation = async () => {
            const result = await serverProxy.server.authorized();
            return result;
        };

        cvat.users.get.implementation = async (filter) => {
            checkFilter(filter, {
                self: isBoolean,
            });

            let users = null;
            if ('self' in filter && filter.self) {
                users = await serverProxy.users.getSelf();
                users = [users];
            } else {
                users = await serverProxy.users.getUsers();
            }

            users = users.map((user) => new User(user));
            return users;
        };

        cvat.jobs.get.implementation = async (filter) => {
            checkFilter(filter, {
                taskID: isInteger,
                jobID: isInteger,
            });

            if (('taskID' in filter) && ('jobID' in filter)) {
                throw new ArgumentError(
                    'Only one of fields "taskID" and "jobID" allowed simultaneously',
                );
            }

            if (!Object.keys(filter).length) {
                throw new ArgumentError(
                    'Job filter must not be empty',
                );
            }

            let tasks = null;
            if ('taskID' in filter) {
                tasks = await serverProxy.tasks.getTasks(`id=${filter.taskID}`);
            } else {
                const job = await serverProxy.jobs.getJob(filter.jobID);
                if (typeof (job.task_id) !== 'undefined') {
                    tasks = await serverProxy.tasks.getTasks(`id=${job.task_id}`);
                }
            }

            // If task was found by its id, then create task instance and get Job instance from it
            if (tasks !== null && tasks.length) {
                tasks[0].owner = await serverProxy.users.getUsers(tasks[0].owner);
                tasks[0].assignee = await serverProxy.users.getUsers(tasks[0].assignee);
                const task = new Task(tasks[0]);
                return filter.jobID ? task.jobs
                    .filter((job) => job.id === filter.jobID) : task.jobs;
            }

            return [];
        };

        cvat.tasks.get.implementation = async (filter) => {
            checkFilter(filter, {
                page: isInteger,
                name: isString,
                id: isInteger,
                owner: isString,
                assignee: isString,
                search: isString,
                status: isEnum.bind(TaskStatus),
                mode: isEnum.bind(TaskMode),
            });

            if ('search' in filter && Object.keys(filter).length > 1) {
                if (!('page' in filter && Object.keys(filter).length === 2)) {
                    throw new ArgumentError(
                        'Do not use the filter field "search" with others',
                    );
                }
            }

            if ('id' in filter && Object.keys(filter).length > 1) {
                if (!('page' in filter && Object.keys(filter).length === 2)) {
                    throw new ArgumentError(
                        'Do not use the filter field "id" with others',
                    );
                }
            }

            const searchParams = new URLSearchParams();
            for (const field of ['name', 'owner', 'assignee', 'search', 'status', 'mode', 'id', 'page']) {
                if (Object.prototype.hasOwnProperty.call(filter, field)) {
                    searchParams.set(field, filter[field]);
                }
            }

            const users = await serverProxy.users.getUsers();
            const tasksData = await serverProxy.tasks.getTasks(searchParams.toString());
            const tasks = tasksData.map((task) => {
                [task.owner] = users.filter((user) => user.id === task.owner);
                [task.assignee] = users.filter((user) => user.id === task.assignee);
                return new Task(task);
            });
            tasks.count = tasksData.count;

            return tasks;
        };

        return cvat;
    }

    module.exports = implementAPI;
})();
