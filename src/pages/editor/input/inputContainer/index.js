import React from 'react';
import Input from '../../components/atoms/input';
import Label from '../../components/atoms/label';
import { Checkbox } from 'antd';
import { Radio } from 'antd';
import styled from 'styled-components';
import PropTypes from 'prop-types';

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

function RenderOptions(options = [], props) {
    const { config, updateConfig } = props;

    if (options.some(option => option.type === 'radio')) {
        return (
            <Radio.Group
                onChange={e => {
                    updateConfig(
                        Object.assign({}, config, {
                            value: e.target.value
                        })
                    );
                }}
                value={config.value}
            >
                {options.map(option => {
                    const {
                        id,
                        type,
                        displayValue,
                        value,
                        width,
                        align
                    } = option;

                    return (
                        <Radio key={id} value={value}>
                            {displayValue}
                        </Radio>
                    );
                })}
            </Radio.Group>
        );
    }

    return (
        <div>
            {options.map(option => {
                const { id, type, displayValue, value, width, align } = option;

                if (type === 'normal') {
                    return (
                        <div
                            key={id}
                            style={{
                                width: `${width}px`,
                                textAlign: align,
                                display: 'inline-block',
                                userSelect: 'none'
                            }}
                            onDoubleClick={e => {
                                e.stopPropagation();
                                const currentValue = config.value;
                                updateConfig(
                                    Object.assign({}, config, {
                                        value: currentValue + value
                                    })
                                );
                            }}
                        >
                            {displayValue}
                        </div>
                    );
                } else if (type === 'checkbox') {
                    return (
                        <Checkbox
                            key={id}
                            style={{
                                width: `${width}px`,
                                textAlign: align,
                                display: 'inline-block',
                                userSelect: 'none'
                            }}
                            onChange={e => {
                                const { checked } = e.target;
                                const currentValue = config.value;

                                if (checked) {
                                    updateConfig(
                                        Object.assign({}, config, {
                                            value: currentValue
                                                ? `${currentValue}、${value}`
                                                : value
                                        })
                                    );
                                } else {
                                    let temp = currentValue.split('、');

                                    updateConfig(
                                        Object.assign({}, config, {
                                            value: temp
                                                .filter(o => o !== value)
                                                .join('、')
                                        })
                                    );
                                }
                            }}
                        >
                            {displayValue}
                        </Checkbox>
                    );
                }
            })}
        </div>
    );
}

function InputContainer(props) {
    const { config, updateConfig, handleClick } = props;

    const {
        isActive,
        containerWidth,
        breakLine,
        labelText,
        labelWeight,
        labelWidth,
        defaultValue,
        value,
        inputWidth,
        options
    } = config;

    return (
        <Container
            isActive={isActive}
            width={Number(containerWidth) + 2}
            breakLine={breakLine}
            onClick={handleClick}
        >
            <Label
                value={labelText}
                width={labelWidth}
                fontWeight={labelWeight}
            />
            {inputWidth > 0 && (
                <Input
                    defaultValue={defaultValue}
                    value={value}
                    width={inputWidth}
                    onChange={e => {
                        updateConfig({ ...config, value: e.target.value });
                    }}
                />
            )}
            {RenderOptions(options, props)}
        </Container>
    );
}

InputContainer.propTypes = {
    config: PropTypes.object.isRequired,
    updateConfig: PropTypes.func.isRequired
};

export default InputContainer;
