import React, {} from 'react';
import Input from 'input';
import Select from 'select';
import Panel from 'panel';
import style from './index.css';
import deep from 'deep';

export default function Index(props){
    const {baseInfo,updateState} = props;

    const handleChange = (key,value) => {
        let baseInfoClone = deep.clone(baseInfo);
        baseInfoClone[key] = value;
        updateState(baseInfoClone)
    }

    return (
        <Panel 
            title={'患者基本信息'}
        >
            <div className={style.box}>
                <Input
                    value={baseInfo.name}
                    label={'姓名'}
                    inputStyle={{width:'100%'}}
                    onChange={e=>handleChange('name',e.target.value)}
                    containerStyle={{width:'100%',marginTop:'10px'}}
                ></Input>
                <Select
                    label={'性别'}
                    value={baseInfo.gender}
                    selectStyle={{width:'100%'}}
                    containerStyle={{width:'100%',marginTop:'9px'}}
                    onChange={value=>handleChange('gender',value)}
                    options={[
                        {title:'女',value:0},
                        {title:'男',value:1},
                        {title:'其他',value:2},
                    ]}
                ></Select>
                <Input
                    value={baseInfo.age}
                    label={'年龄'}
                    inputStyle={{width:'100%'}}
                    containerStyle={{width:'100%',marginTop:'9px'}}
                    onChange={e=>handleChange('age',e.target.value)}
                    maxLength={3}
                    validate={value => {
                        value = value.replace(/[^\d]/g, '');
                        let first = value.slice(0, 1);
                        if (first === '0') value = first;
                        return value;
                    }}
                ></Input>
                <Input
                    value={baseInfo.identify_num}
                    label={'患者识别号'}
                    onChange={e=>handleChange('identify_num',e.target.value)}
                    inputStyle={{width:'100%'}}
                    containerStyle={{width:'100%',marginTop:'9px'}}
                ></Input>
            </div>

        </Panel>
    )
}