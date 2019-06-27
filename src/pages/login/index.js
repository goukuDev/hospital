import React, { useState } from 'react';
import style from './index.css';
import { api, getCookie } from 'utils';
import { CODE } from 'myConstants';
import Menus from 'menus';

export default props => {
    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const [errorText, setErrorText] = useState('');

    const login = () => {
        if (userName && password) {
            api('user/login', {
                password,
                username: userName,
                checked: false
            }).then(({ code, data }) => {
                if (code === CODE.SUCCESS) {
                    localStorage.roles = JSON.stringify(data.role);
                    localStorage.userInfo = atob(
                        getCookie('jwt').split('.')[1] + ''
                    );
                    // 如果只有一个工作站的权限，则直接进入该工作站
                    if (data.role.length === 1) {
                        const role = data.role[0];
                        const menu = Menus.find(
                            menu => menu.roleName === role.rolename
                        );
                        props.history.push(`/${menu.url}`);
                    } else {
                        props.history.push('/');
                    }
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
        <div className={style.container} id='container' style={{background:`url(${require("@images/bj.jpg")})`,backgroundSize:'cover'}}>
            <img
                src={require('@images/logo.png')}
                alt=''
                className={style.logo}
            />
            <div className={style.form}>
                <header>病理信息管理系统</header>
                <div className={style.usernameWrap} style={{background:`url(${require("@images/name.svg")}) no-repeat 22px center rgba(248, 249, 250, 0.1)`,backgroundSize:'20px'}}>
                    <input
                        type='text'
                        className={style.username}
                        maxLength='30'
                        value={userName}
                        autoComplete='off'
                        onChange={e => setUserName(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                </div>
                <div className={style.passwordWrap} style={{background:`url(${require("@images/psd.svg")}) no-repeat 22px center rgba(248, 249, 250, 0.1)`,backgroundSize:'20px'}}>
                    <input
                        type='password'
                        className={style.password}
                        maxLength='30'
                        value={password}
                        autoComplete='off'
                        onChange={e => setPassword(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                </div>
                <div className={style.tipsWrap}>
                    <span className={errorText ? style.tip : style.hide} style={{backgroundImage: errorText ?`url(${require("@images/tips.svg")})` : ''}} >
                        {errorText}
                    </span>
                    <span className={style.changePassword}>修改密码</span>
                </div>
                <div className={style.submit} onClick={login}>
                    登录
                </div>
            </div>
        </div>
    );
};
