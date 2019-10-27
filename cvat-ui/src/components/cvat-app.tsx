import React from 'react';

import { Switch, Route, Redirect } from 'react-router';
import { BrowserRouter } from 'react-router-dom';

import { Spin, Layout, Modal } from 'antd';

import 'antd/dist/antd.css';
import '../stylesheet.css';

import TasksPageContainer from '../containers/tasks-page/tasks-page';
import CreateTaskPageContainer from '../containers/create-task-page/create-task-page';
import TaskPageContainer from '../containers/task-page/task-page';
import ModelsPageContainer from '../containers/models-page/models-page';
import AnnotationPageContainer from '../containers/annotation-page/annotation-page';
import LoginPageContainer from '../containers/login-page/login-page';
import RegisterPageContainer from '../containers/register-page/register-page';
import HeaderContainer from '../containers/header/header';

type CVATAppProps = {
    loadFormats: () => void;
    verifyAuthorized: () => void;
    userInitialized: boolean;
    formatsInitialized: boolean;
    gettingAuthError: string;
    gettingFormatsError: string;
    user: any;
}

export default class CVATApplication extends React.PureComponent<CVATAppProps> {
    constructor(props: any) {
        super(props);
    }

    public componentDidMount() {
        this.props.loadFormats();
        this.props.verifyAuthorized();
    }

    public componentDidUpdate() {
        if (this.props.gettingAuthError) {
            Modal.error({
                title: 'Could not check authorization',
                content: `${this.props.gettingAuthError}`,
            });
        }
    }

    // Where you go depends on your URL
    public render() {
        if (this.props.userInitialized && this.props.formatsInitialized) {
            if (this.props.user) {
                return (
                    <BrowserRouter>
                        <Layout>
                            <HeaderContainer> </HeaderContainer>
                            <Layout.Content>
                                <Switch>
                                    <Route exact path='/tasks' component={TasksPageContainer}/>
                                    <Route exact path='/models' component={ModelsPageContainer}/>
                                    <Route path='/tasks/create' component={CreateTaskPageContainer}/>
                                    <Route path='/tasks/:number' component={TaskPageContainer}/>
                                    <Route path='/tasks/:number/jobs/:number' component={AnnotationPageContainer}/>
                                    <Redirect to='/tasks'/>
                                </Switch>
                            </Layout.Content>
                        </Layout>
                    </BrowserRouter>
                );
            } else {
                return (
                    <BrowserRouter>
                        <Switch>
                            <Route exact path='/auth/register' component={RegisterPageContainer}/>
                            <Route exact path='/auth/login' component={LoginPageContainer}/>
                            <Redirect to='/auth/login'/>
                        </Switch>
                    </BrowserRouter>
                );
            }
        } else {
            return (
                <Spin size="large" style={{margin: '25% 50%'}}/>
            );
        }
    }
}
