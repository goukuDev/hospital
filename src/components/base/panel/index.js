import React, { Component } from 'react';
import style from './index.css';

export default class Panel extends Component {
    render() {
        const { icon, title, className, children, ...otherProps } = this.props;
        return (
            <div className={`${style.container} ${className}`} {...otherProps}>
                <header>
                    <span>{title}</span>
                </header>
                {children}
            </div>
        );
    }
}
