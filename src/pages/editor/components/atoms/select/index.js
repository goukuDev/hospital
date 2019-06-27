import React from 'react';
import { Select } from 'antd';

const { Option } = Select;

function SelectWrap(props) {
    const { defaultValue, value, options, style, onChange } = props;

    return (
        <Select
            defaultValue={defaultValue}
            value={value}
            style={style}
            onChange={onChange}
        >
            {options.map(({ value, title }) => (
                <Option value={value} key={value}>
                    {title}
                </Option>
            ))}
        </Select>
    );
}

export default SelectWrap;
