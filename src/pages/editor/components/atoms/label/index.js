import React from 'react';
import styled from 'styled-components';

const Label = styled.label`
    width: ${props => props.width}px;
    font-weight: ${props => props.fontWeight};
    display: inline-block;
`;

export default function LabelWrap(props) {
    const { value, width, fontWeight } = props;

    return (
        <Label width={width} fontWeight={fontWeight}>
            {value}
        </Label>
    );
}
