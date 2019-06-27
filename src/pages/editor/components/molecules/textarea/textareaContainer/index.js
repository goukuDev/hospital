import React from 'react';
import { Input } from 'antd';
import Label from '../../../atoms/label';
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

const LabelWrap = styled.div`
    display: inline-block;
`;

const TextAreaPreview = styled.textarea`
    width: 500px;
    resize: none;
    border: none;
    outline: none;
    vertical-align: top;
`;

function SelectContainer(props) {
    const { mode, config, updateConfig, handleClick } = props;

    const {
        isActive,
        containerWidth,
        breakLine,
        labelText,
        labelWeight,
        labelWidth,
        defaultValue,
        value,
        textareaWidth,
        textareaHeight
    } = config;

    console.log(value === null);

    return (
        <Container
            isActive={isActive}
            width={Number(containerWidth) + 2}
            breakLine={breakLine}
            onClick={handleClick}
        >
            {mode === 'normal' && (
                <>
                    <LabelWrap>
                        <Label
                            value={labelText}
                            width={labelWidth}
                            fontWeight={labelWeight}
                        />
                    </LabelWrap>
                    <TextArea
                        value={value === null ? defaultValue : value}
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
                </>
            )}
            {mode === 'preview' && (
                <>
                    <LabelWrap>
                        <Label
                            value={labelText}
                            width={labelWidth}
                            fontWeight={labelWeight}
                        />
                    </LabelWrap>
                    <TextAreaPreview
                        value={value}
                        onChange={e => {}}
                        readOnly
                    />
                </>
            )}
        </Container>
    );
}

SelectContainer.propTypes = {
    config: PropTypes.object.isRequired,
    updateConfig: PropTypes.func.isRequired
};

export default SelectContainer;
