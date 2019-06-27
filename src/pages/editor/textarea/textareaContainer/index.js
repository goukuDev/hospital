import React from 'react';
import { Input } from 'antd';
import Label from '../../components/atoms/label';
import styled from 'styled-components';
import PropTypes from 'prop-types';

const { TextArea } = Input;

const Container = styled.div`
    margin: 0 0 8px 0;
    width: ${props => props.width}px;
    display: ${props => (props.breakLine ? 'block' : 'inline-block')};
    border: 1px dashed ${props => (props.isActive ? '#aaa' : 'transparent')};
    position: relative;
    cursor: pointer;

    & > * {
        cursor: pointer;
    }
`;

function SelectContainer(props) {
    const { config, updateConfig, handleClick } = props;

    const {
        isActive,
        containerWidth,
        breakLine,
        labelText,
        labelWidth,
        defaultValue,
        value,
        textareaWidth,
        textareaHeight
    } = config;

    return (
        <Container
            isActive={isActive}
            width={Number(containerWidth) + 2}
            breakLine={breakLine}
            onClick={handleClick}
        >
            <Label value={labelText} width={labelWidth} />
            <TextArea
                value={value === null ? defaultValue : value}
                options={[
                    { title: '阴性', value: '-' },
                    { title: '阳性', value: '+' }
                ]}
                style={{
                    width: `${textareaWidth}px`,
                    height: `${textareaHeight}px`,
                    resize: 'none',
                    verticalAlign: 'top'
                }}
                onChange={e => {
                    updateConfig({ ...config, value: e.target.value });
                }}
            />
        </Container>
    );
}

SelectContainer.propTypes = {
    config: PropTypes.object.isRequired,
    updateConfig: PropTypes.func.isRequired
};

export default SelectContainer;
