import React, { Component } from 'react';
import { Input } from 'antd';
import { EMOTION_REG } from 'myConstants';
import style from './index.css';

export default class index extends Component {
    render() {
        const {
            required,
            label,
            lineFeed = true,
            containerStyle,
            inputStyle,
            readOnly = false,
            validate,
            onChange = e => e,
            ...otherProps
        } = this.props;

        return (
            <div className={style.container} style={containerStyle}>
                <span className={lineFeed ? style.lineFeed : ''}>
                    {required && <span className={style.required}>*</span>}
                    <span className={style.label}>{label}</span>
                </span>
                <Input
                    style={inputStyle}
                    className={style.input}
                    readOnly={readOnly}
                    onInput={e => {
                        // 过滤掉输入法表情
                        let value = e.target.value.replace(EMOTION_REG, '');
                        if (validate) value = validate(value);
                        onChange({ target: { value } });
                    }}
                    // onChange={onChange}
                    {...otherProps}
                />
            </div>
        );
    }
}
