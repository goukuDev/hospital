import React from 'react';
import styled from 'styled-components';

const Input = styled.input`
    border: none;
    border-bottom: 1px solid #ccc;
    background: transparent;
    outline: none;
`;

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
