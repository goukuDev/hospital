import React, {Component} from 'react';
import style from './index.css';
import {withRouter, Link} from 'react-router-dom';
import confirm from 'confirm';
import {userInfo} from 'utils';

class Header extends Component {
    state = {
        showLogout: false
    };

    componentDidMount() {
        document.body.onclick = e => {
            if (e.target.id !== 'logout') this.setState({showLogout: false});
        };
    }

    componentWillUnmount() {
        document.body.onclick = null;
    }

    toggleLogout = () => {
        this.setState({showLogout: !this.state.showLogout});
    };

    logout = () => {
        this.setState({showLogout: false});

        confirm({
            content: '确认退出登录？',
            onOk: e => {
                localStorage.userInfo = '';
                this.props.history.push('/login');
            }
        });
    };

    render() {
        const {showLogout} = this.state;

        return (
            <div className={style.container} id='header'>
                <div className={style.titleWrap}>
                    <Link to='/'>
                        <img src={require('./img/logo.svg')} alt='' height='36' />
                        <span>病理信息管理系统</span>
                    </Link>
                </div>
                <div className={style.userWrap}>
                    <span className={style.userName}>当前账户：{userInfo().name}</span>
                    <span className={style.icon} onClick={this.toggleLogout} />
                    {showLogout && (
                        <div className={style.logout} onClick={this.logout} id='logout'>
                            退出登录
                        </div>
                    )}
                </div>
            </div>
        );
    }
}

export default withRouter(Header);
