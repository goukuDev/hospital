import React from 'react';
import style from './index.css';

const DEFAULT_CONFIG = {
    label: 'label：',
    labelWidth: 100,
    containerWidth: 500,
    selectWidth: 175,
    defaultValue: '',
    breakLine: true
};

export function Radio(props) {
    const { config, updateConfig, handleClick, handleDelete } = props;
    const { value = '', label, labelWidth, containerWidth, selectWidth, breakLine, isActive } = Object.assign(
        {},
        DEFAULT_CONFIG,
        config
    );

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
            <select
                style={{ width: `${selectWidth}px` }}
                value={value}
                onChange={e => updateConfig(Object.assign({}, config, { value: e.target.value }))}
            >
                <option value='123'>123</option>
                <option value='456'>456</option>
            </select>
            {isActive && <span onClick={handleDelete}>删除</span>}
        </div>
    );
}

export function RadioConfig(props) {
    const { config, updateConfig } = props;
    const { label, labelWidth, containerWidth, selectWidth, defaultValue, breakLine } = Object.assign(
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
                <label className={style.label}>选择框宽度：</label>
                <input
                    type='text'
                    value={selectWidth}
                    className={style.input}
                    onChange={e => handleChange({ selectWidth: e.target.value })}
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
        </div>
    );
}
