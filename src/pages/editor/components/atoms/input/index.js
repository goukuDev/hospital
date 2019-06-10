import React from 'react';
import { Input } from 'antd';

export default function InputWrap(props) {
    const { value = '', defaultValue = '', width = 175, onChange } = props;

    return (
        <Input
            type='text'
            style={{ width: `${width}px`, height: '30px' }}
            value={value || defaultValue}
            onChange={onChange}
        />
    );
}
