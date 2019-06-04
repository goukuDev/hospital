import React from 'react';
import style from './index.css';

const DEFAULT_CONFIG = {
    label: 'label',
    labelWidth: 100,
    containerWidth: 500,
    inputWidth: 175,
    defaultValue: '',
    breakLine: true
};

export function Input(props) {
    const { config, updateConfig, handleClick, handleDelete, handleInsertBefore } = props;
    const {
        value = '', // 值
        label, // 标签名称π
        labelWidth, // 标签宽度，用于排版
        containerWidth, // 容器宽度，用于排版
        inputWidth, // 输入框宽度
        defaultValue, // 输入框默认值
        breakLine, // 是否换行，默认换行
        isActive, // 是否选中
        options
    } = Object.assign({}, DEFAULT_CONFIG, config);

    return (
        <div
            className={style.container}
            style={{
                width: `${containerWidth}px`,
                display: breakLine ? 'block' : 'inline-block',
                background: isActive ? '#fff' : ''
            }}
            onClick={handleClick}
        >
            <label className={style.label} style={{ width: `${labelWidth}px` }}>
                {label}
            </label>
            <input
                type='text'
                style={{ width: `${inputWidth}px` }}
                className={style.input}
                value={value || defaultValue}
                onChange={e => updateConfig(Object.assign({}, config, { value: e.target.value }))}
            />
            {RenderOptions(options, props)}
            {isActive && <span onClick={handleDelete}>删除</span>}
            {isActive && <span onClick={handleInsertBefore}>向前插入</span>}
        </div>
    );
}

function RenderOptions(options = [], props) {
    const { config, updateConfig } = props;

    return (
        <div>
            {options.map(option => {
                const { id, displayValue, value, width, align } = option;
                return (
                    <span
                        key={id}
                        style={{ width: `${width}px`, textAlign: align, display: 'inline-block' }}
                        onClick={e => {
                            e.stopPropagation();
                            const currentValue = config.value;
                            updateConfig(Object.assign({}, config, { value: currentValue + value }));
                        }}
                    >
                        {displayValue}
                    </span>
                );
            })}
        </div>
    );
}

function AddOptions(configs, updateConfig) {
    const { options = [] } = configs;

    const addOption = e => {
        const option = {
            type: 'radio',
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

    const handleChange = (id, key, value) => {
        const index = options.findIndex(o => o.id === id);
        options.splice(index, 1, Object.assign({}, options[index], { [key]: value }));
        updateConfig({ options });
    };

    const renderOption = option => (
        <div key={option.id}>
            <div className={style.row}>
                <label>option 显示值：</label>
                <input
                    type='text'
                    value={option.displayValue}
                    className={style.input}
                    onChange={e => handleChange(option.id, 'displayValue', e.target.value)}
                />
            </div>
            <div className={style.row}>
                <label>option 实际值：</label>
                <input
                    type='text'
                    value={option.value}
                    className={style.input}
                    onChange={e => handleChange(option.id, 'value', e.target.value)}
                />
            </div>
            <div className={style.row}>
                <label>宽度：</label>
                <input
                    type='text'
                    value={option.width}
                    className={style.input}
                    onChange={e => handleChange(option.id, 'width', e.target.value)}
                />
            </div>
            <div className={style.row}>
                <label>对齐方式：</label>
                <select onChange={e => handleChange(option.id, 'align', e.target.value)}>
                    <option value='left'>left</option>
                    <option value='center'>center</option>
                    <option value='right'>right</option>
                </select>
            </div>
            <hr />
        </div>
    );

    return (
        <div className={style.options}>
            {options.map(renderOption)}
            <span className={style.add} onClick={addOption}>
                添加
            </span>
        </div>
    );
}

export function InputConfig(props) {
    const { config, updateConfig } = props;
    const { label, labelWidth, containerWidth, inputWidth, defaultValue, breakLine } = Object.assign(
        {},
        DEFAULT_CONFIG,
        config
    );

    const handleChange = property => {
        updateConfig(Object.assign({}, config, property));
    };

    return (
        <div className={style.config}>
            <div className={style.item}>
                <label className={style.label}>label: </label>
                <input
                    type='text'
                    value={label}
                    className={style.input}
                    onChange={e => handleChange({ label: e.target.value })}
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
                    onChange={e => handleChange({ containerWidth: e.target.value })}
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
                    onChange={e => handleChange({ defaultValue: e.target.value })}
                />
            </div>
            <div className={style.item}>
                <label className={style.label}>是否换行：</label>
                <input
                    type='checkbox'
                    checked={breakLine}
                    className={style.input}
                    onChange={e => handleChange({ breakLine: e.target.checked })}
                />
            </div>
            <hr />
            {AddOptions(config, handleChange)}
        </div>
    );
}
