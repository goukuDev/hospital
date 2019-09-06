import React, { Component } from 'react';
import { Input } from 'antd';
import { EMOTION_REG } from 'myConstants';
import style from './index.css';

const { TextArea } = Input;

export default class index extends Component {
    render() {
        const {
            required,
            label,
            lineFeed = true,
            containerStyle,
            textAreaStyle,
            labelStyle,
            onChange = e => e,
            ...otherProps
        } = this.props;

        return (
            <div className={style.container} style={containerStyle}>
                <span 
                    className={lineFeed ? style.lineFeed : ''}
                    style={labelStyle || {}}
                >
                    {required && <span className={style.required}>*</span>}
                    <span className={style.label} style={Object.assign({},labelStyle)}>{label}</span>
                </span>
                <TextArea
                    style={textAreaStyle}
                    className={style.textArea}
                    autosize={false}
                    onKeyUp={e => {
                        // 过滤掉输入法表情
                        const value = e.target.value.replace(EMOTION_REG, '');
                        onChange({ target: { value } });
                    }}
                    onChange={onChange}
                    {...otherProps}
                />
            </div>
        );
    }
}
