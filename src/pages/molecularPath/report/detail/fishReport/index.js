import React, {} from 'react';
import Input from 'input';
import Select from 'select';
import style from './index.css';
import TextArea from 'textarea';
import Datepicker from 'datepicker';
import Moment from 'moment';

export default function Index(props){

    const {samples,content,changeContent,users,reviewStatus,focused} = props;
    const sampleType={
        0 :'蜡块',
        1 : '蜡块，外周血',
        2 : '白片',
        3 : '胸水',
        4 : 'DNA',
        5 : '外周血',
        6 : '腹水',
        7 : '血浆',
        8 : '血清',
        9 : '骨髓',
        10 : '其他'
    }
   
    const containerStyle = {
        width: '100%',
        display:'flex',
        marginBottom:'9px'
    };
    const labelStyle = {
        color:'#434343',
        verticalAlign:'top',
        fontSize:'16px',
        fontWeight:'600',
        textAlign:'left',
        width:'80px'
    };
    const textAreaStyle ={
        height:'200px',
        flex:1
    }
    const inputContainer={
        width:'182px'
    }
    const inputLabel={
        width:'75px',
        color:'#525F7F',
        fontSize:'15px',
    }

    const creatInput = (label,key,disabled) => (
        <Input
            value={content[key]}
            label={label}
            lineFeed ={false}
            labelStyle={inputLabel}
            disabled={disabled}
            onChange={e=>!disabled && handleChange(key,e.target.value)}
            containerStyle={inputContainer}
            inputStyle={{width:'92px',height:'34px'}}
        ></Input>
    )

    const creatTextArea = (label,key) => (
        <TextArea
            value={content[key]}
            label={label}
            lineFeed ={false}
            disabled={reviewStatus?true:false}
            onChange={e=>handleChange(key,e.target.value)}
            containerStyle={containerStyle}
            labelStyle={labelStyle}
            textAreaStyle={textAreaStyle}
            onFocus={e=>focused(key)}
        ></TextArea>
    )










    
    const handleChange =(key,value)=>{
        let curContent = Object.assign({},content);
        curContent[key]=value
        changeContent(curContent)
    }
    const fmtDate = date => (date ? Moment(date) : null);
    return (
        <div className={style.box}>
            <dl style={containerStyle}>
                <dt style={labelStyle}>标本类型：</dt>
                <dd>{Array.from(new Set(samples.map(e => sampleType[e.sample_type]))).join(';')}</dd>
            </dl>
            {creatTextArea('病理诊断：','diagnosis',)}
            {creatTextArea('FISH检测结果：','result',)}
            <div className={style.time}>
                <i >报告时间：</i>
                <Datepicker
                    lineFeed={false}
                    label={false}
                    disabled={reviewStatus?true:false}
                    style={{ width: '190px' ,marginRight:'12px',}}
                    value={fmtDate(content.time)}
                    onChange={(date, dateString) => handleChange('time', dateString)}
                />
            </div>
            {creatInput('初诊医生：','firstDoc',true)}
            <Select
                value={content.sencendDoc}
                disabled={reviewStatus?true:false}
                label={'复诊医生：'}
                options={users}
                lineFeed ={false}
                onChange={e=>handleChange('sencendDoc',e)}
                containerStyle={inputContainer}
                selectStyle={{width:'92px',height:'34px'}}
            />
            {creatInput('审核医生：','finalDoc',true)}
						
        </div>
    )
}