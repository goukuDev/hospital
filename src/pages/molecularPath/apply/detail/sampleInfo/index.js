import React, {useState} from 'react';
import Input from 'input';
import Select from 'select';
import Panel from 'panel';
import style from './index.css';
import {Checkbox} from 'antd';
import deep from 'deep';
import Table from 'table';

const CheckboxGroup = Checkbox.Group;

const sampleType = [
    {value:0 ,title: '蜡块'},
    {value:1 ,title: '蜡块，外周血'},
    {value:2 ,title: '白片'},
    {value:3 ,title: '胸水'},
    {value:4 ,title: 'DNA'},
    {value:5 ,title: '外周血'},
    {value:6 ,title: '腹水'},
    {value:7 ,title: '血浆'},
    {value:8 ,title: '血清'},
    {value:9 ,title: '骨髓'},
    {value:10,title: '其他'},
]

const sampleSource = [
    {value:0,title:'本院'},
    {value:1,title:'外院'},
    {value:2,title:'会诊'},
]

const titleStyle = {
    color:'#20252B',
    fontWeight:'600'
}

const deliverLocationChecks = [
    {label:'原发病灶',value:'0'},
    {label:'淋巴结转移病灶',value:'1'},
    {label:'远处转移病灶',value:'2'},
]

function CheckInput(props) {
    const { 
            checked,
            label,
            value = {},
            unit,
            inputStyle = {width:'65px'}, 
            outerStyle = {},
            onCheckChange,
            onInputChange
         } = props;


    return (
        <div className={style.checkInput} style={outerStyle}>
            <Checkbox value={value.checkbox} checked={checked} onChange={onCheckChange}>{label}</Checkbox>
            <Input
                lineFeed={false}
                inputStyle={inputStyle}
                value={value.input}
                disabled={!checked}
                onChange={onInputChange}
                validate={value => {
                    if(unit){
                        value = value.replace(/[^\d]/g, '');
                        let first = value.slice(0, 1);
                        if (first === '0') value = first;
                    }
                    return value;
                }}
            ></Input>
            {unit && <span style={{marginLeft:'5px'}}>{unit}</span>}
        </div>
    )
}

export default function Index(props){
    const {sampleInfo,updateState} = props;

      const checkInputList = [
        {
            label:'胸水',
            value:{checkbox:'胸水',input:''},
            unit:'ml'
        },
        {
            label:'腹水',
            value:{checkbox:'腹水',input:''},
            unit:'ml'
        },
        {
            label:'骨髓',
            value:{checkbox:'骨髓',input:''},
            unit:'ml'
        },
        {
            label:'骨髓血',
            value:{checkbox:'骨髓血',input:''},
            unit:'ml'
        },
        {
            label:'DNA',
            value:{checkbox:'DNA',input:''},
            unit:'ml'
        },
        {
            label:'其他',
            value:{checkbox:'其他',input:''},
            inputStyle:{width:'134px'}
        },
    ]

    const colums = [
        {
            title: '标本来源',
            width: 160,
            dataIndex: 'sample_source',
            render:text=>({0:'本院',1:'外院',2:'会诊'}[text])
        },
        {
            title: '标本类型',
            width: 160,
            dataIndex: 'sample_type',
            render:text=>(
                {
                    0 :' 蜡块',
                    1 :' 蜡块，外周血',
                    2 :' 白片',
                    3 :' 胸水',
                    4 :' DNA',
                    5 :' 外周血',
                    6 :' 腹水',
                    7 :' 血浆',
                    8 :' 血清',
                    9 :' 骨髓',
                    10 :' 其他',
                }[text]
            )
        },
        {
            title: '病理号',
            width: 160,
            dataIndex: 'sample_pathnum'
        },
        {
            title: '蜡块号/标本号',
            width: 160,
            dataIndex: 'sample_num'
        },
        {
            title: '备注',
            width: 160,
            dataIndex: 'sample_comment'
        },
        {
            title: '操作',
            width: 160,
            dataIndex: 'action',
            render:(text,record)=>(
                <React.Fragment>
                    <button className={style['btn-table']} onClick={e=>deleteSample(record.id)}>
                        删除
                    </button>
                </React.Fragment>
            )
        },
    ]

    // const [source,setSource] = useState(0);
    const [type,setType] = useState(0);
    const [pathnum,setPathnum] = useState('');
    const [paraffinNum,setParaffinNum] = useState('');
    const [comment,setComment] = useState('');

    const samples = ((sampleInfo.samples && sampleInfo.samples) || []).map(o=>{
        if(o.sample_id){
            o.id = o.sample_id;
        }else if(!o.id){
            o.id = Math.random();
        }
        return o;
    })

    const creatSelect = (label,key,options,containerStyle) => (
        <Select
            label={label}
            value={sampleInfo[key]}
            options={options}
            lineFeed={false}
            labelStyle={titleStyle}
            containerStyle={containerStyle}
            selectStyle={{width:'calc(100% - 75px)'}}
            onChange={value=>handleChange(key,value)}
        ></Select>
    )

    const creatInput = (label,key,inputStyle,labelStyle={}) => (
        <Input
            label={label}
            value={sampleInfo[key]}
            lineFeed={false}
            labelStyle={labelStyle}
            inputStyle={inputStyle}
            onChange={e=>handleChange(key,e.target.value)}
        ></Input>
    )

    const handleChange = (key,value) => {
        let sampleInfoClone = deep.clone(sampleInfo);
        sampleInfoClone[key] = value;
        updateState(sampleInfoClone);
    }


    const checkedList = (arr = JSON.parse(sampleInfo.sample_source_detail || '[]')) => {
        return arr.map(o=>o.checkbox);
    }

    const handleCheckChange = (e) => {
        let checked = e.target.checked;
        let value = e.target.value;
        let temp = deep.clone(JSON.parse(sampleInfo.sample_source_detail || '[]'));
        if(checked){
            temp = temp.concat([{checkbox:value}])
            handleChange('sample_source_detail',JSON.stringify(temp))
        }else if(!checked){
            temp = temp.filter(o => o.checkbox!==value);
            handleChange('sample_source_detail',JSON.stringify(temp))   
        }
    }

    const handleInputChange = (key,e) => {
        let temp = JSON.parse(sampleInfo.sample_source_detail || '[]').map(o => {
            if(o.checkbox === key){
                o.input = e.target.value;
            }
            return o
        })
        handleChange('sample_source_detail',JSON.stringify(temp))  
    }

    const addSample = () => {
        let temp = {
            sample_source: sampleInfo.sample_source,
            sample_type: type,
            sample_pathnum: pathnum.trim(),
            sample_num: paraffinNum.trim(),
            sample_comment: comment.trim(),
        }

        let arr = sampleInfo.samples?sampleInfo.samples.concat([temp]):[].concat([temp])

        handleChange('samples',arr);

    }

    const deleteSample = id => {
        let arr = samples.filter(o=>o.id !== id);
        handleChange('samples',arr);
    }
  

    return (
        <Panel 
            title={'标本信息'}
        >
            <div className={style.box}>
                <div className={style.line}>
                    <div className={style.fl}>
                        {creatSelect('标本来源：','sample_source',sampleSource,{width:'100%'})}
                    </div>
                    <div className={style.fr}>
                        <Checkbox 
                            checked={checkedList().includes('外科手术标本')} 
                            value={'外科手术标本'}
                            onChange={e=>handleCheckChange(e)}
                        >外科手术标本</Checkbox>
                        <Checkbox 
                            checked={checkedList().includes('穿刺/活检')} 
                            onChange={e=>handleCheckChange(e)}
                            value={'穿刺/活检'}
                        >穿刺/活检</Checkbox>

                        {
                            checkInputList.map(o => {
                                return (
                                    <CheckInput
                                        key={o.value.checkbox}
                                        checked={checkedList().includes(o.value.checkbox)}
                                        label={o.label}
                                        onCheckChange={e=>handleCheckChange(e)}
                                        onInputChange={e=>handleInputChange(o.value.checkbox,e)}
                                        value={JSON.parse(sampleInfo.sample_source_detail || '[]').find(a=>a.checkbox === o.value.checkbox) || o.value}
                                        unit={o.unit}
                                        inputStyle={o.inputStyle}
                                    ></CheckInput>
                                )
                            })
                        }
                    </div>
                </div>
                <div className={style.line}>
                    <div className={style.fl}>
                        {creatInput('送检部位：','deliver_location',{width:'165px'},titleStyle)}
                    </div>
                    <div className={style.fr} style={{height:'36px',display:'flex',alignItems:'center'}}>
                        <CheckboxGroup
                            value={JSON.parse(sampleInfo.deliver_location_detail || '[]')}
                            options={deliverLocationChecks}
                            onChange={value=>handleChange('deliver_location_detail',JSON.stringify(value))}
                        ></CheckboxGroup>
                    </div>
                </div>
                <div className={style.line}>
                    <div className={style.set}>
                        <Select
                            label={'标本类型：'}
                            value={type}
                            options={sampleType}
                            lineFeed={false}
                            labelStyle={titleStyle}
                            containerStyle={{width:'240px'}}
                            selectStyle={{width:'calc(100% - 75px)'}}
                            onChange={value=>setType(value)}
                        ></Select>
                    </div>
                    <div className={style.set}>
                        <Input
                            label={'病理号：'}
                            value={pathnum}
                            lineFeed={false}
                            labelStyle={{color:'#20252B'}}
                            inputStyle={{width:'120px'}}
                            onChange={e=>setPathnum(e.target.value)}
                        ></Input>
                    </div>
                    <div className={style.set}>
                        <Input
                            label={'蜡块号（标本号)：'}
                            value={paraffinNum}
                            lineFeed={false}
                            labelStyle={{color:'#20252B'}}
                            inputStyle={{width:'120px'}}
                            onChange={e=>setParaffinNum(e.target.value)}
                        ></Input>
                    </div>
                    <div className={style.set}>
                        <Input
                            label={'备注：'}
                            value={comment}
                            lineFeed={false}
                            labelStyle={{color:'#20252B'}}
                            inputStyle={{width:'120px'}}
                            onChange={e=>setComment(e.target.value)}
                        ></Input>
                    </div>
                    <button className={style.addBtn} onClick={addSample}>新增</button>
                </div>
                {
                    !!samples.length && 
                    <div className={style.line}>
                        <Table
                            columns={colums}
                            data={samples}
                            rowKey={'id'}
                        ></Table>
                    </div>
                }
            </div>

        </Panel>
    )
}