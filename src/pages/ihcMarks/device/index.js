import React , {useState,useEffect} from 'react';
import style from './index.css';
import Table from 'table';
import Input from 'input';
import {api} from 'utils.js';
import {CODE} from 'myConstants.js';
import Message from 'message';
import AddPop from 'addPop';
import TextArea from 'textarea';

const state = {
    0:'停用',
    1:'使用中'
}


function Add(props){
    
    const {onClose,onCancel,onAdd} = props;

    const [brand,setBrand] = useState('');
    const [model,setModel] = useState('');
    const [number,setNumber] = useState('');
    const [comment,setComment] = useState('');

    const addBrand = () => {
        if(!brand.trim() || !model.trim())return;
        let data = {
            type:1,
            brand:brand.trim(),
            model:model.trim() ,
            serial_num: number.trim(),
            comment :comment.trim(),
        }
        api('mpf_manage/add_facility',data)
        .then(({code,data,message}) => {
            if(code === CODE.SUCCESS){
                props.onAdd();
                setBrand('');
                setModel('');
                setNumber('');
                setComment('');
                Message.success('新增成功');
                onAdd();
                onClose();
            }else{
                Message.error(message);
            }
        })
    }

    const labelStyle = {
        width: '150px',
        display: 'inline-block',
        textAlign: 'right'
    };


    return (
        <AddPop
            title={'新增设备'}
            onClose={onClose}
            onCancel={onCancel}
            confirmButtonDisabled={!brand.trim() || !model.trim()}
            onConfirm={addBrand}
        >
            <div className={style.row}>
                <Input
                    label={'品牌：'}
                    required={true}
                    lineFeed={false}
                    containerStyle={{marginTop:'10px'}}
                    inputStyle={{width:'240px'}}
                    labelStyle={labelStyle}
                    onChange={e=>setBrand(e.target.value)}
                    value={brand}
                ></Input>
            </div>
            <div className={style.row}>
                <Input
                    label={'型号：'}
                    required={true}
                    lineFeed={false}
                    inputStyle={{width:'240px'}}
                    labelStyle={labelStyle}
                    onChange={e=>setModel(e.target.value)}
                    value={model}
                ></Input>
            </div>
            <div className={style.row}>
                <Input
                    label={'序号：'}
                    lineFeed={false}
                    inputStyle={{width:'240px'}}
                    labelStyle={labelStyle}
                    onChange={e=>setNumber(e.target.value)}
                    value={number}
                ></Input>
            </div>
            <div className={style.row}>
                <TextArea
                    lineFeed={false}
                    label={'备注：'}
                    textAreaStyle={{width:'240px',height:'56px'}}
                    labelStyle={{
                        width: '150px',
                        display: 'inline-block',
                        textAlign: 'right',
                        verticalAlign:'top',
                    }}
                    value={comment}
                    onChange={e=>setComment(e.target.value)}
                ></TextArea>
            </div>
        </AddPop>
    )
}

export default function Index(props){

    const [deviceList,setDeviceList] = useState([]);
    const [addShow,setAddShow] = useState(false);

    const tableFilters = (key) => {
        let col = {};
        deviceList.filter(o => o[key] && o).map(o=>o[key]).forEach(o=>col[o]=o)
        return Object.keys(col).map(o=>({text:o,value:o}))
    }

    const columns = [
    {
        title:'品牌',
        dataIndex:'brand',
        filters:tableFilters('brand'),
        onFilter:(value,record)=>record.brand === value,
        render:(text,record) => {
            return (
                <React.Fragment>
                    {record.disabled && text}
                    {!record.disabled && 
                        <Input
                            lineFeed={false}
                            value={text}
                            onChange={e=>handleInputChange(e.target.value, record.facility_id,'brand')}    
                        ></Input>
                    }
                </React.Fragment>
            )
        }
    },
    {
        title:'型号',
        dataIndex:'model',
        filters:tableFilters('model'),
        onFilter:(value,record)=>record.model === value,
        render:(text,record) => {
            return (
                <React.Fragment>
                    {record.disabled && text}
                    {!record.disabled && 
                        <Input
                            lineFeed={false}
                            value={text}
                            onChange={e=>handleInputChange(e.target.value, record.facility_id,'model')}    
                        ></Input>
                    }
                </React.Fragment>
            )
        }
    },
    {
        title:'设备序号',
        dataIndex:'serial_num',
        filters:tableFilters('serial_num'),
        onFilter:(value,record)=>record.serial_num === value,
        render:(text,record) => {
            return (
                <React.Fragment>
                    {record.disabled && text}
                    {!record.disabled && 
                        <Input
                            lineFeed={false}
                            value={text}
                            onChange={e=>handleInputChange(e.target.value, record.facility_id,'serial_num')}    
                        ></Input>
                    }
                </React.Fragment>
            )
        }
    },
    {
        title:'备注',
        dataIndex:'comment',
        render:(text,record) => {
            return (
                <React.Fragment>
                    {record.disabled && text}
                    {!record.disabled && 
                        <Input
                            lineFeed={false}
                            value={text}
                            onChange={e=>handleInputChange(e.target.value, record.facility_id,'comment')}    
                        ></Input>
                    }
                </React.Fragment>
            )
        }
    },
    {
        title:'状态',
        dataIndex:'status',
        render:(text) => (
            <React.Fragment>
                <i
                    className={style.state}
                    style={{ backgroundColor: { 0: '#F25B24', 1: '#6FC831' }[text] }}
                />
                {state[text]}
            </React.Fragment>
        ),
        filters:[
            {text:'停用',value:0},
            {text:'使用中',value:1}
        ],
        onFilter:(value,record)=>record.status === value
    },
    {
        title:'操作',
        dataIndex:'action',
        render:(text,record) => (
            <React.Fragment>
                <button 
                    className={style.actionBtn} 
                    style={{
                        marginRight:'5px',
                        background:{0:'#6FC831',1:'#F25B24'}[record.status]
                    }}
                    onClick={e=>modifyStatus(record.facility_id)}
                >{record.status?'停用' :'使用'}</button>
                <button 
                    className={style.actionBtn} 
                    style={{background:'#2399F1'}}
                    onClick={e=>editRecord(record.facility_id,record.disabled)}
                >{record.disabled?'编辑':'保存'}</button>
            </React.Fragment>
        )
    },
].map(o=>{o.width = 307;return o})  

    useEffect(()=>getDeviceList(),[]);

    // ------------------------- api ---------------------------

    const getDeviceList = () => {
        api('mpf_manage/get_facilities_detail',{type:1})
        .then(({code,data}) => {
            if(code === CODE.SUCCESS){
                setDeviceList(data.map(o => Object.assign({},o,{disabled:true})))
            }
        })
    }

    const modifyStatus = (id) => {
        api(`mpf_manage/alter_facility_status?facility_id=${id}`)
        .then(({code}) => {
            if(code === CODE.SUCCESS){
                getDeviceList();
            }
        })
    }

    const editRecord = (id,flag) => {
        if(flag){
            let arr = deviceList.map(o => {
                o.disabled = true;
                if(o.facility_id === id){
                    o.disabled = false;
                }
                return o;
            });
            setDeviceList(arr);
        }else{
            let item = deviceList.find(o => o.facility_id === id);
            if(!item.brand.trim() || !item.model.trim())return;
            let data = {
                facility_id: item.facility_id ,
                brand: item.brand.trim(),
                model: item.model.trim(),
                serial_num: item.serial_num.trim(),
                comment:item.comment.trim() ,
            }
            api('mpf_manage/alter_facility',data)
            .then(({code,message}) => {
                if(code === CODE.SUCCESS){
                    let arr = deviceList.map(o => {
                        if(o.facility_id === id){
                            o.disabled = true;
                        }
                        return o;
                    });
                    setDeviceList(arr);
                    getDeviceList();
                }else{
                    Message.error(message);
                }
            })

        }
    }

    // ------------------------------- methods ---------------------------

    const handleInputChange = (value,id,key) => {
        let arr = deviceList.map(item => {
            if(item.facility_id === id){
                item[key] = value
            }
            return item;
        })
        setDeviceList(arr);
    }

    return (
        <div className={style.outer}>
            {addShow && <Add onAdd={()=>getDeviceList()} onCancel={e=>setAddShow(false)} onClose={e=>setAddShow(false)}></Add>}
            <div className={style.list}>
                <div className={style.listHeader}>
                    <div className={style.fl} style={{ background:`url(${require('@images/list.svg')}) no-repeat 10px center`}}>
                        免疫组化设备列表
                        <button className={style.addbtn} onClick={e=>setAddShow(true)}>新增</button>
                    </div>
                </div>
                <Table
                    columns={columns}
                    style={{height: 'calc(100% - 100px)',
                            width:'100%', 
                            overflowY: 'auto',
                             }}
                    scroll={{ y: 'calc(100vh - 289px)' }}
                    data={deviceList}
                    rowKey={'facility_id'}
                ></Table>
            </div>
        </div>
    )
}

