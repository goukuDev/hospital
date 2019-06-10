import React from 'react';
import styled from 'styled-components';

const Label = styled.label`
    width: ${props => props.width}px;
    display: inline-block;
`;

export default function LabelWrap(props) {
    const { value, width } = props;

    return <Label width={width}>{value}</Label>;
}
