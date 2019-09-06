import React, {} from 'react';
import Input from 'input';
import Select from 'select';
import Panel from 'panel';
import style from './index.css';
import TextArea from 'textarea';
import deep from 'deep';

export default function Index(props){

    const {applyInfo,updateState} = props;

    const handleChange = (key,value) => {
        let applyInfoClone = deep.clone(applyInfo);
        applyInfoClone[key] = value;
        updateState(applyInfoClone)
    }

    const creatInput = (label,key,containerStyle,disabled = false) => (
        <Input
            value={applyInfo[key]}
            label={label}
            onChange={e=>!disabled && handleChange(key,e.target.value)}
            containerStyle={containerStyle}
            inputStyle={{width:'100%'}}
        ></Input>
    )

    const creatTextArea = (label,key,containerStyle) => (
        <TextArea
            value={applyInfo[key]}
            label={label}
            onChange={e=>handleChange(key,e.target.value)}
            containerStyle={containerStyle}
            textAreaStyle={{width:'100%',height:'104px'}}
        ></TextArea>
    )

    const creatSelect = (label,key,options,containerStyle) => (
        <Select
            value={applyInfo[key]}
            label={label}
            options={options}
            onChange={value=>handleChange(key,value)}
            containerStyle={containerStyle}
            selectStyle={{width:'100%'}}
        ></Select>
    )
   

    return (
        <Panel 
            title={'本次申请信息'}
        >
            <div className={style.box}>
                <div className={style.row}>
                    {creatInput('登记时间','checkin_time',{width:'24%',marginRight:'1%'},true)}
                    {creatInput('住院号','admission_num',{width:'24%',marginRight:'1%'})}
                    {creatInput('门诊号','outpatient_num',{width:'24%',marginRight:'1%'})}
                    {creatInput('送检部位','deliver_location',{width:'25%'})}
                </div>
                <div className={style.row}>
                    {creatInput('送检单位','deliver_org',{width:'49%',marginRight:'1%'})}
                    {creatInput('电话','tel_num',{width:'24%',marginRight:'1%'})}
                    {creatSelect('收费状态','charge_status',[{title:'已收费',value:1},{title:'欠费',value:0}],{width:'25%'})}
                </div>
                <div className={style.row} style={{marginBottom:'0px'}}>
                    {creatTextArea('原单位病理诊断','clinical_diagnosis',{width:'49%',marginRight:'1%'})}
                    {creatTextArea('备注','comment',{width:'50%'})}
                </div>
            </div>

        </Panel>
    )
}