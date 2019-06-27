import React from 'react';
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
        labelWidth,
        containerWidth,
        selectWidth,
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
                <label className={style.label}>下拉框宽度：</label>
                <input
                    type='text'
                    value={selectWidth}
                    className={style.input}
                    onChange={e =>
                        handleChange({ selectWidth: e.target.value })
                    }
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
        </div>
    );
}
