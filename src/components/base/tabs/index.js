import React, { Component } from 'react';
import style from './index.css';

export default class index extends Component {
    constructor() {
        super();
        this.state = {};
    }
    render() {
        const { tabList, curCompnent, switchChildren } = this.props;

        return (
            <div className={style.detail}>
                <ul className={style.list}>
                    {tabList.map(content => (
                        <li
                            className={
                                curCompnent === content.value ? style.cur : ''
                            }
                            onClick={e => switchChildren(content.value)}
                            key={content.value}
                        >
                            {content.type}
                        </li>
                    ))}
                </ul>
                <div className={style.content}>{this.props.children}</div>
            </div>
        );
    }
}
