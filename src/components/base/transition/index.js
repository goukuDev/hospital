import React, { Component } from 'react';
import style from './index.css';

export default class index extends Component {
    render() {
        return <div className={style.container}>{this.props.children}</div>;
    }
}
