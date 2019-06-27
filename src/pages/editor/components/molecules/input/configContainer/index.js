import React from 'react';
import Select from '../../../atoms/select';
import style from './index.css';
import styled from 'styled-components';

const DEFAULT_CONFIG = {
    label: 'label',
    labelWidth: 100,
    containerWidth: 500,
    inputWidth: 175,
    defaultValue: '',
    breakLine: true
};

const ButtonGroup = styled.div``;

const Button = styled.span`
    width: 44px;
    height: 24px;
    font-size: 12px;
    background: ${props => props.backgroundColor || '#1585d8'};
    color: white;
    border-radius: 4px;
    line-height: 24px;
    display: inline-block;
    text-align: center;
    margin: 0 8px 8px 0;
    cursor: pointer;
`;

function AddOptions(configs, updateConfig) {
    const { options = [] } = configs;

    const addOption = e => {
        const option = {
            type: 'normal',
            id: Math.random()
                .toString(36)
                .substr(2),
            displayValue: '',
            value: '',
            width: ''
        };

        options.push(option);

        updateConfig({ options });
    };

    const deleteOption = id => {
        updateConfig({ options: options.filter(option => option.id !== id) });
    };

    const handleChange = (id, key, value) => {
        const index = options.findIndex(o => o.id === id);
        options.splice(
            index,
            1,
            Object.assign({}, options[index], { [key]: value })
        );
        updateConfig({ options });
    };

    const renderOption = option => (
        <div key={option.id}>
            <div className={style.row}>
                <label>类型：</label>
                <Select
                    options={[
                        { value: 'radio', title: 'radio' },
                        { value: 'checkbox', title: 'checkbox' },
                        { value: 'normal', title: 'normal' }
                    ]}
                    style={{ width: 154 }}
                    value={option.type}
                    onChange={value => handleChange(option.id, 'type', value)}
                />
            </div>
            <div className={style.row}>
                <label>option 显示值：</label>
                <input
                    type='text'
                    value={option.displayValue}
                    className={style.input}
                    onChange={e =>
                        handleChange(option.id, 'displayValue', e.target.value)
                    }
                />
            </div>
            <div className={style.row}>
                <label>option 实际值：</label>
                <input
                    type='text'
                    value={option.value}
                    className={style.input}
                    onChange={e =>
                        handleChange(option.id, 'value', e.target.value)
                    }
                />
            </div>
            <div className={style.row}>
                <label>宽度：</label>
                <input
                    type='text'
                    value={option.width}
                    className={style.input}
                    onChange={e =>
                        handleChange(option.id, 'width', e.target.value)
                    }
                />
            </div>
            <div className={style.row}>
                <label>对齐方式：</label>
                <select
                    onChange={e =>
                        handleChange(option.id, 'align', e.target.value)
                    }
                >
                    <option value='left'>left</option>
                    <option value='center'>center</option>
                    <option value='right'>right</option>
                </select>
            </div>
            <Button
                onClick={e => deleteOption(option.id)}
                backgroundColor='#f25b24'
            >
                删除
            </Button>
            <hr />
        </div>
    );

    return (
        <div className={style.options}>
            {options.map(renderOption)}
            <Button onClick={addOption}>添加</Button>
        </div>
    );
}

export default function InputConfig(props) {
    const {
        config,
        updateConfig,
        handleCopy,
        handleDelete,
        handleMoveUp,
        handleMoveDown
    } = props;

    const {
        id,
        key,
        labelText,
        labelWeight,
        labelWidth,
        containerWidth,
        inputWidth,
        defaultValue,
        breakLine
    } = Object.assign({}, DEFAULT_CONFIG, config);

    const handleChange = property => {
        updateConfig(Object.assign({}, config, property));
    };

    return (
        <div className={style.config}>
            <ButtonGroup>
                <Button onClick={handleMoveUp}>上移</Button>
                <Button onClick={handleMoveDown}>下移</Button>
                <Button onClick={handleCopy}>复制</Button>
                <Button backgroundColor='#f25b24' onClick={handleDelete}>
                    删除
                </Button>
            </ButtonGroup>
            <hr />
            <div className={style.item}>
                <label className={style.label}>key: </label>
                <input
                    type='text'
                    value={key}
                    className={style.input}
                    onChange={e => handleChange({ key: e.target.value })}
                />
            </div>
            <div className={style.item}>
                <label className={style.label}>索引: </label>
                <input
                    type='text'
                    value={id}
                    className={style.input}
                    onChange={() => {}}
                    readOnly
                />
            </div>
            <div className={style.item}>
                <label className={style.label}>label: </label>
                <input
                    type='text'
                    value={labelText}
                    className={style.input}
                    onChange={e => handleChange({ labelText: e.target.value })}
                />
            </div>
            <div className={style.item}>
                <label className={style.label}>label 字重: </label>
                <Select
                    options={[
                        { value: 400, title: 'light' },
                        { value: 600, title: 'normal' },
                        { value: 800, title: 'bold' }
                    ]}
                    style={{ width: 154 }}
                    value={labelWeight}
                    onChange={value => handleChange({ labelWeight: value })}
                />
            </div>
            <div className={style.item}>
                <label className={style.label}>label 宽度: </label>
                <input
                    type='text'
                    value={labelWidth}
                    className={style.input}
                    onChange={e => handleChange({ labelWidth: e.target.value })}
                />
            </div>
            <div className={style.item}>
                <label className={style.label}>容器宽度：</label>
                <input
                    type='text'
                    value={containerWidth}
                    className={style.input}
                    onChange={e =>
                        handleChange({ containerWidth: e.target.value })
                    }
                />
            </div>
            <div className={style.item}>
                <label className={style.label}>输入框宽度：</label>
                <input
                    type='text'
                    value={inputWidth}
                    className={style.input}
                    onChange={e => handleChange({ inputWidth: e.target.value })}
                />
            </div>
            <div className={style.item}>
                <label className={style.label}>默认值：</label>
                <input
                    type='text'
                    value={defaultValue}
                    className={style.input}
                    onChange={e =>
                        handleChange({ defaultValue: e.target.value })
                    }
                />
            </div>
            <div className={style.item}>
                <label className={style.label}>是否换行：</label>
                <input
                    type='checkbox'
                    checked={breakLine}
                    className={style.input}
                    onChange={e =>
                        handleChange({ breakLine: e.target.checked })
                    }
                />
            </div>
            <hr />
            {AddOptions(config, handleChange)}
        </div>
    );
}
