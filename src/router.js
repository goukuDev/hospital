import React from 'react';
import { HashRouter, Route, Redirect } from 'react-router-dom';
import Login from 'login';
import Apply from 'apply';
import Cases from 'cases';
import Report from 'report';
import Embedding from 'embedding';
import Sectioning from 'sectioning';
import Staining from 'staining';
import IhcWorkstation from 'ihcWorkstation';
import WorkPlace from 'workplace';
import Marks from 'marks';
import Test from 'test';
import Editor from 'editor';
import { LocaleProvider } from 'antd';
import zh_CN from 'antd/lib/locale-provider/zh_CN';
import moment from 'moment';
import 'moment/locale/zh-cn';

moment.locale('zh-cn');

const getAuth = () => {
    try {
        return JSON.parse(localStorage.roles).map(role => role.rolename);
    } catch (error) {
        console.error('无权访问');
        return [];
    }
};

function AuthRoute({ roleName, component: Component, ...rest }) {
    return (
        <Route
            {...rest}
            render={props => {
                return !roleName || getAuth().includes(roleName) ? (
                    <Component {...props} />
                ) : (
                    <Redirect
                        to={{
                            pathname: '/login',
                            state: { from: props.location },
                        }}
                    />
                );
            }}
        />
    );
}

export default () => {
    return (
        <LocaleProvider locale={zh_CN}>
            <HashRouter>
                <Route path="/login" component={Login} />
                <AuthRoute exact path="/" component={WorkPlace} />
                <AuthRoute path="/workplace" component={WorkPlace} />
                <AuthRoute roleName="register" path="/apply" component={Apply} />
                <AuthRoute roleName="case" path="/cases" component={Cases} />
                <AuthRoute roleName="report" path="/report" component={Report} />
                <AuthRoute roleName="common" path="/embedding" component={Embedding} />
                <AuthRoute roleName="common" path="/sectioning" component={Sectioning} />
                <AuthRoute roleName="common" path="/staining" component={Staining} />
                <AuthRoute roleName="ihcWorkstation" path="/ihcWorkstation" component={IhcWorkstation} />
                <AuthRoute path="/marks" component={Marks} />
                <Route path="/test" component={Test} />
                <Route path="/editor" component={Editor} />
            </HashRouter>
        </LocaleProvider>
    );
};
