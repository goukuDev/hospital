import React, { useState } from 'react';
import style from './index.css';
import { api, getCookie } from 'utils';
import { CODE } from 'myConstants';

export default props => {
    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const [errorText, setErrorText] = useState('');

    const login = () => {
        if (userName && password) {
            api('user/login', {
                password,
                username: userName,
                checked: false,
            }).then(({ code, data }) => {
                if (code === CODE.SUCCESS) {
                    localStorage.roles = JSON.stringify(data.role);
                    localStorage.userInfo = atob(getCookie('jwt').split('.')[1] + '');
                    props.history.push('/');
                } else {
                    setErrorText('用户名或密码错误');
                }
            });
        } else {
            setErrorText('请输入用户名和密码');
        }
    };

    const handleKeyDown = e => e.keyCode === 13 && login();

    return (
        <div className={style.container} id="container">
            <img src={require('./img/logo.png')} alt="" className={style.logo} />
            <div className={style.form}>
                <header>病理信息管理系统</header>
                <div className={style.usernameWrap}>
                    <input
                        type="text"
                        className={style.username}
                        maxLength="30"
                        value={userName}
                        autoComplete="off"
                        onChange={e => setUserName(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                </div>
                <div className={style.passwordWrap}>
                    <input
                        type="password"
                        className={style.password}
                        maxLength="30"
                        value={password}
                        autoComplete="off"
                        onChange={e => setPassword(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                </div>
                <div className={style.tipsWrap}>
                    <span className={errorText ? style.tip : style.hide}>{errorText}</span>
                    <span className={style.changePassword}>修改密码</span>
                </div>
                <div className={style.submit} onClick={login}>
                    登录
                </div>
            </div>
        </div>
    );
};
