import React, { Component } from 'react';
import { DatePicker } from 'antd';
import style from './index.css';

export default class index extends Component {
    render() {
        const {
            label,
            lineFeed = true,
            showTime = true,
            containerStyle,
            datePickerStyle,
            labelStyle,
            ...otherProps
        } = this.props;

        return (
            <div className={style.container} style={containerStyle}>
                <span
                    className={lineFeed ? style.lineFeed : ''}
                    style={labelStyle || {}}
                >
                    <span className={style.label}>{label}</span>
                </span>
                <DatePicker
                    showTime={showTime}
                    style={datePickerStyle}
                    allowClear={false}
                    className={style.datePicker}
                    {...otherProps}
                />
            </div>
        );
    }
}
