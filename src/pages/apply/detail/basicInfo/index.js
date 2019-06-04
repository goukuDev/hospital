import React from 'react';
import style from './index.css';
import Panel from 'panel';
import Input from 'input';
import Select from 'select';
import deep from 'deep';
import { ACTIONS } from 'myConstants';
import { isNotNull } from 'utils';

export default function BasicInfo(props) {
    const { action, basicMessage } = props;

    const handleChange = (key, value) => {
        const basicMessageCopy = deep.clone(basicMessage);
        basicMessageCopy[key] = isNotNull(value) ? value : null;
        props.updateState(basicMessageCopy);
    };

    const containerStyle = { marginTop: '8px', paddingRight: '12px' };

    const createInput = (label, key, inputStyle, restProps) => (
        <Input
            label={label}
            value={basicMessage[key]}
            onChange={e => handleChange(key, e.target.value)}
            containerStyle={containerStyle}
            inputStyle={inputStyle || { width: '225px' }}
            {...restProps}
        />
    );

    const createSelect = (label, key, options) => (
        <Select
            label={label}
            value={basicMessage[key]}
            options={options}
            onChange={value => handleChange(key, value)}
            containerStyle={containerStyle}
            selectStyle={{ width: '225px' }}
        />
    );

    return (
        <Panel
            icon={require('@images/basic.svg')}
            title='患者基本信息'
            className={style.panel}
        >
            <div className={style.content}>
                {createInput(
                    '患者识别号',
                    'identify_id',
                    { width: '462px' },
                    {
                        required: true,
                        disabled: ACTIONS.NEW !== action
                    }
                )}
                {createInput('姓名', 'name')}
                {createSelect('性别', 'gender', [
                    { title: '男', value: 1 },
                    { title: '女', value: 0 },
                    { title: '其他', value: 2 }
                ])}
                {createInput('年龄', 'age', null, {
                    maxLength: 3,
                    validate: value => {
                        value = value.replace(/[^\d]/g, '');
                        let first = value.slice(0, 1);
                        if (first === '0') value = first;
                        return value;
                    }
                })}
                {createInput('联系人手机', 'contact_phone')}
                {createInput('联系人', 'contact')}
                {createInput('联系人关系', 'relationship')}
                {createInput('地址', 'address', { width: '462px' })}
            </div>
        </Panel>
    );
}
