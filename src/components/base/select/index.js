import React, { Component } from 'react';
import { Select } from 'antd';
import style from './index.css';

const { Option } = Select;

export default class index extends Component {
    render() {
        const {
            label,
            lineFeed = true,
            containerStyle,
            selectStyle,
            labelStyle = {},
            options,
            required = false,
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
                    <span className={style.label} style={{color:labelStyle.color || '#62707c'}}>{label}</span>
                </span>
                <Select
                    className={style.select}
                    style={selectStyle}
                    {...otherProps}
                    onChange={onChange}
                >
                    {(options || []).map(
                        ({ title, value, disabled = false }) => (
                            <Option
                                key={value}
                                value={value}
                                disabled={disabled}
                            >
                                {title}
                            </Option>
                        )
                    )}
                </Select>
            </div>
        );
    }
}
