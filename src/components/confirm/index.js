import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import style from './index.css';

class Confirm extends Component {
    state = {
        visible: true
    };

    handleKeyDown = e => {
        const { onOk } = this.props;
        const method = { 13: e => this.onClose(onOk), 27: this.onClose }[e.keyCode];
        method && method();
    };

    componentDidMount() {
        window.addEventListener('keydown', this.handleKeyDown);
    }

    onClose = callback => {
        window.removeEventListener('keydown', this.handleKeyDown);
        document.querySelector('#confirm').remove();
        this.setState({ visible: false }, e => callback && callback());
    };

    render() {
        const { visible } = this.state;
        const { content, onOk, onCancel } = this.props;
        if (!visible) return null;

        return (
            <div className={style.container}>
                <div className={style.dialogWrap}>
                    <div className={style.header}>
                        提示信息
                        <div className={style.closeWrap}>
                            <img src={require('./close.svg')} alt='' onClick={e => this.onClose()} />
                        </div>
                    </div>
                    <div className={style.content}>{content}</div>
                    <div className={style.footer}>
                        <span className={style.cancel} onClick={e => this.onClose(onCancel)}>
                            取消
                        </span>
                        <span className={style.ok} onClick={e => this.onClose(onOk)}>
                            确认
                        </span>
                    </div>
                </div>
            </div>
        );
    }
}

class CloseConfirm extends Component {
    state = {
        visible: true
    };

    componentDidMount() {
        window.onkeydown = e => {
            const { onSave } = this.props;
            const method = { 13: e => this.onClose(onSave), 27: this.onClose }[e.keyCode];
            method && method();
        };
    }

    onClose = callback => {
        window.onkeydown = null;
        document.querySelector('#confirm').remove();
        this.setState({ visible: false }, e => callback && callback());
    };

    render() {
        const { visible } = this.state;
        const { onCancel, onNotSave, onSave } = this.props;

        if (!visible) return null;

        return (
            <div className={style.container}>
                <div className={style.dialogWrap}>
                    <div className={style.header}>
                        提示信息
                        <div className={style.closeWrap} onClick={e => this.onClose()}>
                            <img src={require('./close.svg')} alt='' />
                        </div>
                    </div>
                    <div className={style.content}>当前页面有内容更改后未保存，请选择：</div>
                    <div className={style.footer}>
                        <span className={style.cancel} onClick={e => this.onClose(onCancel)}>
                            取消
                        </span>
                        <span className={style.notSave} onClick={e => this.onClose(onNotSave)}>
                            不保存
                        </span>
                        <span className={style.save} onClick={e => this.onClose(onSave)}>
                            保存
                        </span>
                    </div>
                </div>
            </div>
        );
    }
}

export default ({ type = 'normal', ...options }) => {
    let confirmWrap = document.createElement('div');
    confirmWrap.id = 'confirm';
    confirmWrap.innerHTML = '';
    document.querySelector('#root').appendChild(confirmWrap);
    ReactDOM.render(type === 'normal' ? <Confirm {...options} /> : <CloseConfirm {...options} />, confirmWrap);
};
