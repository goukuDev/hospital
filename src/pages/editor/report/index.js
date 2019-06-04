import React from 'react';
import style from './index.css';

export default function ReportConfig(props) {
    const { config, updateConfig } = props;
    const { name = '', type = '' } = config;
    const handleChange = (key, e) => {
        updateConfig(Object.assign({}, config, { [key]: e.target.value }));
    };

    return (
        <div className={style.config}>
            <div className={style.item}>
                <label className={style.label}>报告名称: </label>
                <input type='text' value={name} className={style.input} onChange={e => handleChange('name', e)} />
            </div>
            <div className={style.item}>
                <label className={style.label}>报告类型: </label>
                <input type='text' value={type} className={style.input} onChange={e => handleChange('type', e)} />
            </div>
        </div>
    );
}
