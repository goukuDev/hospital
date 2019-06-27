import React , {useState,useEffect} from 'react';
import style from './index.css';
import Table from 'table';
import Input from 'input';
import {api} from 'utils.js';
import {CODE} from 'myConstants.js';
import Message from 'message';

const state = {
    0:'停用',
    1:'使用中'
}


function Add(props){
    const addStyle={
        display:'flex',
        alignItems:'center',
        color:'#575757',
        fontSize:'14px',
        height:'100%',
    }

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
            }else{
                Message.error(message);
            }
        })
    }


    return (
        <div style={addStyle}>
            <span style={{
                color:'#F25B24',
                fontSize: '21px',paddingTop: '8px',
                marginRight: '3px'}}
            >*</span>
            品牌：
            <Input
                lineFeed={false}
                containerStyle={{width:'102px',marginRight:'10px'}}
                onChange={e=>setBrand(e.target.value)}
                value={brand}
            ></Input>
            <span style={{
                color:'#F25B24',
                fontSize: '21px',paddingTop: '8px',
                marginRight: '3px'}}
            >*</span>
            型号：
            <Input
                lineFeed={false}
                containerStyle={{width:'102px',marginRight:'10px'}}
                onChange={e=>setModel(e.target.value)}
                value={model}
            ></Input>
            序号：
            <Input
                lineFeed={false}
                containerStyle={{width:'60px',marginRight:'10px'}}
                onChange={e=>setNumber(e.target.value)}
                value={number}
            ></Input>
            备注：
            <Input
                lineFeed={false}
                containerStyle={{width:'168px',marginRight:'10px'}}
                onChange={e=>setComment(e.target.value)}
                value={comment}
            ></Input>
            <button className={style.addBtn} disabled={!brand.trim() || !model.trim()} onClick={addBrand}>新增</button>
        </div>
    )
}

export default function Index(props){

    const [deviceList,setDeviceList] = useState([]);    
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
                    style={{background:'#0B94FC'}}
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
            <div className={style.list}>
                <div className={style.listHeader}>
                    <div className={style.fl}>
                        免疫组化设备列表
                    </div>
                    <div className={style.fr}>
                        <Add onAdd={()=>getDeviceList()}></Add>
                    </div>
                </div>
                <Table
                    columns={columns}
                    style={{height: 'calc(100% - 100px)',
                            width:'100%', 
                            overflowY: 'auto',
                            borderLeft:'1px solid rgba(218,222,226,1)',
                            borderRight:'1px solid rgba(218,222,226,1)', }}
                    scroll={{ y: 'calc(100vh - 289px)' }}
                    data={deviceList}
                    rowKey={'facility_id'}
                ></Table>
            </div>
        </div>
    )
}

