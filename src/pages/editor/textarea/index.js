import React, { Component } from 'react';
import style from './index.css';

export class TextArea extends Component {
    render() {
        const { label, value, breakLine = true, onClick } = this.props;

        return (
            <div
                className={style.container}
                style={{ display: breakLine ? 'block' : 'inline-block' }}
                onClick={onClick}
            >
                <label className={style.label}>{label}：</label>
                <textarea
                    className={style.textarea}
                    value={value}
                    onChange={e => this.props.updateConfig(Object.assign({}, this.props, { value: e.target.value }))}
                />
            </div>
        );
    }
}

export class TextAreaConfig extends Component {
    handleChange(key, e) {
        this.props.updateConfig(Object.assign({}, this.props, { [key]: e.target.value }));
    }

    render() {
        const { label, breakLine = true } = this.props;

        return (
            <div className={style.config}>
                <div className={style.item}>
                    <label className={style.label}>label: </label>
                    <input
                        type='text'
                        value={label}
                        className={style.input}
                        onChange={e => this.handleChange('label', e)}
                    />
                </div>
                {/* <div className={style.item}>
                    <label className={style.label}>字段标识：</label>
                    <input
                        type='text'
                        value={uniqueKey}
                        className={style.input}
                        onChange={e => this.handleChange('uniqueKey', e)}
                    />
                </div> */}
                <div className={style.item}>
                    <label className={style.label}>是否换行：</label>
                    <input
                        type='checkbox'
                        checked={breakLine}
                        className={style.input}
                        onChange={e => this.handleChange('breakLine', { target: { value: e.target.checked } })}
                    />
                </div>
            </div>
        );
    }
}
