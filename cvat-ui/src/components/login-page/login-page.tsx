import React from 'react';

import { RouteComponentProps } from 'react-router';
import { Link, withRouter } from 'react-router-dom';

import Title from 'antd/lib/typography/Title';
import Text from 'antd/lib/typography/Text';
import {
    Col,
    Row,
    Modal,
} from 'antd';

import LoginForm, { LoginData } from './login-form';

interface LoginPageComponentProps {
    loginError: string;
    onLogin: (username: string, password: string) => void;
}

function LoginPageComponent(props: LoginPageComponentProps & RouteComponentProps) {
    const sizes = {
        xs: { span: 14 },
        sm: { span: 14 },
        md: { span: 10 },
        lg: { span: 4 },
        xl: { span: 4 },
    }

    if (props.loginError) {
        Modal.error({
            title: 'Could not login',
            content: props.loginError,
        });
    }

    return (
        <Row type='flex' justify='center' align='middle'>
            <Col {...sizes}>
                <Title level={2}> Login </Title>
                <LoginForm onSubmit={(loginData: LoginData) => {
                    props.onLogin(loginData.username, loginData.password);
                }}/>
                <Row type='flex' justify='start' align='top'>
                    <Col>
                        <Text strong>
                            New to CVAT? Create <Link to="/auth/register">an account</Link>
                        </Text>
                    </Col>
                </Row>
            </Col>
        </Row>
    );
}

export default withRouter(LoginPageComponent);
