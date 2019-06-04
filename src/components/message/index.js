import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import style from './index.css';

let timer = null;

class Message extends Component {
    state = {
        visible: this.props.visible
    };

    componentDidMount() {
        timer = setTimeout(e => {
            this.setState({ visible: false }, clear);
        }, 2000);
    }

    render() {
        const { text, type } = this.props;
        return <div className={`${style.message} ${style[type]}`}>{text}</div>;
    }
}

function clear() {
    const messageWrap = document.querySelector('#message');
    if (messageWrap) {
        clearTimeout(timer);
        messageWrap.remove();
    }
}

function open(text, type) {
    clear();
    let messageWrap = document.createElement('div');
    messageWrap.id = 'message';
    messageWrap.innerHTML = '';
    document.querySelector('#root').appendChild(messageWrap);
    ReactDOM.render(<Message text={text} visible={true} type={type} />, messageWrap);
}

export default Object.assign(
    {},
    ...['info', 'success', 'error'].map(api => ({
        [api]: text => open(text, api)
    }))
);
