import React from 'react';
import Input from '../../components/atoms/input';
import Label from '../../components/atoms/label';
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

    return (
        <div>
            {options.map(option => {
                const { id, displayValue, value, width, align } = option;
                return (
                    <span
                        key={id}
                        style={{
                            width: `${width}px`,
                            textAlign: align,
                            display: 'inline-block'
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
                    </span>
                );
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
        labelWidth,
        defaultValue,
        value,
        inputWidth,
        options
    } = config;

    return (
        <Container
            isActive={isActive}
            width={containerWidth + 2}
            breakLine={breakLine}
            onClick={handleClick}
        >
            <Label value={labelText} width={labelWidth} />
            <Input
                defaultValue={defaultValue}
                value={value}
                width={inputWidth}
                onChange={e => {
                    updateConfig({ ...config, value: e.target.value });
                }}
            />
            {RenderOptions(options, props)}
        </Container>
    );
}

InputContainer.propTypes = {
    config: PropTypes.object.isRequired,
    updateConfig: PropTypes.func.isRequired
};

export default InputContainer;
