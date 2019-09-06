import React ,{useState,useEffect} from 'react';
import style from './index.css';
import Table from 'table';
import Input from 'input';
import Select from 'select';
import Confirm from 'confirm';
import {CODE} from 'myConstants.js';
import {api} from 'utils.js';
import Add from './add';

const state = {
    0:'停用',
    1:'使用中'
}

export default function Index(props){

    const [markList,setMarkList] = useState([]);
    const [keySearch,setKeySearch] = useState('');
    const [filter,setFilter] = useState([]);
    const [device,setDevice] = useState([]);
    const [current ,setCurrent] = useState(null);
    const [addShow,setAddShow] = useState(false);

    const filterCol = (key,arr) => {
        key = key || '';
        arr = arr || [];
        let temp = arr.map(o=>o[key]);
        temp = [...new Set(temp)].sort((a,b)=>a.localeCompare(b));
        return temp.map(o=>({text:o,value:o}))
    }

    const columns = [
        {
            title:'名称',
            dataIndex:'name',
            width:180,
            render:(text,record) => {
                return (
                    <React.Fragment>
                        {!(current === record.marker_id) && text}
                        {(current === record.marker_id) &&
                            <Input
                                lineFeed={false}
                                value={text}
                                onChange={e=>handleInputChange(e.target.value, record.marker_id,'name')}
                            ></Input>
                        }
                    </React.Fragment>
                )
            }
        },
        {
            title:'简称',
            dataIndex:'short_name',
            width:180,
            render:(text,record) => {
                return (
                    <React.Fragment>
                        {!(current === record.marker_id) && text}
                        {(current === record.marker_id) &&
                            <Input
                                lineFeed={false}
                                value={text}
                                onChange={e=>handleInputChange(e.target.value, record.marker_id,'short_name')}
                            ></Input>
                        }
                    </React.Fragment>
                )
            }
        },
        {
            title:'中文名',
            dataIndex:'zh_name',
            width:180,
            render:(text,record) => {
                return (
                    <React.Fragment>
                        {!(current === record.marker_id) && text}
                        {(current === record.marker_id) &&
                            <Input
                                lineFeed={false}
                                value={text}
                                onChange={e=>handleInputChange(e.target.value, record.marker_id,'zh_name')}
                            ></Input>
                        }
                    </React.Fragment>
                )
            }
        },
        {
            title:'克隆号',
            dataIndex:'clone_num',
            width:180,
            render:(text,record) => {
                return (
                    <React.Fragment>
                        {!(current === record.marker_id) && text}
                        {(current === record.marker_id) &&
                            <Input
                                lineFeed={false}
                                value={text}
                                onChange={e=>handleInputChange(e.target.value, record.marker_id,'clone_num')}
                            ></Input>
                        }
                    </React.Fragment>
                )
            }
        },
        {
            title:'品牌',
            dataIndex:'brand',
            width:180,
            render:(text,record) => {
                return (
                    <React.Fragment>
                        {!(current === record.marker_id) && text}
                        {(current === record.marker_id) &&
                            <Select
                            lineFeed={false}
                            options={brandOptions()}
                            containerStyle={{width:'100%'}}
                            selectStyle={{width:'100%'}}
                            defaultValue={text}
                            onChange={value => handleInputChange(value,record.marker_id,'brand')}
                            ></Select>
                        }
                    </React.Fragment>
                )
            },
            filters:filterCol('brand',markList),
            onFilter:(value,record)=>record.brand === value
        },
        {
            title:'型号',
            dataIndex:'equip_id',
            width:180,
            render:(text,record) => {
                return (
                    <React.Fragment>
                        {!(current === record.marker_id) && record.model}
                        {(current === record.marker_id) &&
                            <Select
                            lineFeed={false}
                            options={modelOptions(record.brand)}
                            containerStyle={{width:'100%'}}
                            selectStyle={{width:'100%'}}
                            defaultValue={record.model}
                            onChange={value => handleInputChange(value,record.marker_id,'equip_id')}
                            ></Select>
                        }
                    </React.Fragment>
                )
            },
            filters:filterCol('model',markList),
            onFilter:(value,record)=>record.model === value
        },
        {
            title:'备注',
            dataIndex:'comment',
            render:(text,record) => {
                return (
                    <React.Fragment>
                        {!(current === record.marker_id) && text}
                        {(current === record.marker_id) &&
                            <Input
                                lineFeed={false}
                                value={text}
                                onChange={e=>handleInputChange(e.target.value, record.marker_id,'comment')}
                            ></Input>
                        }
                    </React.Fragment>
                )
            }
        },
        {
            title:'状态',
            dataIndex:'status',
            width:180,
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
            fixed:'right',
            width:220,
            render:(text,record) => (
                <React.Fragment>
                    <span
                        className={style.actionBtn}
                        style={{
                            marginRight:'5px',
                            background:{0:'#6FC831',1:'#F25B24'}[record.status],
                            display:'inline-block',
                            lineHeight:'24px'
                        }}
                        onClick={e=>toggleStatus(record)}
                    >{record.status?'停用' :'使用'}</span>
                    <button
                        className={style.actionBtn}
                        style={{background:'#2399F1',marginRight:'5px'}}
                        onClick={e=>editRecord(record.marker_id)}
                    >{!(current === record.marker_id)?'编辑':'保存'}</button>
                    <button className={style.actionBtn} style={{background:'#24BBF2'}}>库存管理</button>
                </React.Fragment>
            )
        },
    ]

    useEffect(()=>{
        api('mpf_manage/get_markers',{type:1})
        .then(({code,data}) =>{
            if(code === CODE.SUCCESS){
                let arr = data.map(o => Object.assign({},o,{disabled:true}));
                setMarkList(arr);
                setFilter(arr);
            }
        });
        getDevice()},[])
    // ---------------------api--------------------

    const getMarkList = () => {
        api('mpf_manage/get_markers',{type:1})
        .then(({code,data}) =>{
            if(code === CODE.SUCCESS){
                let arr = data.map(o => Object.assign({},o,{disabled:true}));
                setMarkList(arr);
                setFilter(filterList(keySearch.trim().toLowerCase(),arr));
            }
        })
    }

    const getDevice = () => {
        api('mpf_manage/get_facilities',{filter:JSON.stringify([1]),type:1})
        .then(({code,data}) => {
            if(code === CODE.SUCCESS){
                setDevice(data)
            }
        })
    }

    const modifyStatus = (id) => {
        api(`mpf_manage/alter_marker_status?marker_id=${id}`)
        .then(data => (data.code === CODE.SUCCESS) && getMarkList())
    }

    const editRecord = (id) => {
        if(current && current !== id){
            Confirm({
                content:`有未保存内容，请先保存`,
            })
            return false;
        }else if(current === id){
            let item = filter.find(o => o.marker_id === id);
            if(!item.name.trim())return;
            let data = {
                marker_id: item.marker_id,
                name: item.name.trim(),
                clone_num: item.clone_num.trim(),
                zh_name: item.zh_name.trim(),
                short_name: item.short_name.trim(),
                brand: item.brand,
                equip_id: item.equip_id,
                comment: item.comment && item.comment.trim(),
            }
            api('mpf_manage/alter_marker',data)
            .then(({code,message}) => {
                if(code === CODE.SUCCESS){
                    setCurrent(null);
                }else{
                    // Message.error(message);
                }
            })
        }
        setCurrent(id)
    }
    // -------------------------methods---------------------------

    const brandOptions = () => {
        return device.map(o=>({title:o.brand,value:o.brand}))
    }

    const modelOptions = (brand) => {
        let item = device.find(o => o.brand === brand);
        if(!item)return [];
        else return Object.entries(item.models).map(o => ({title:o[1],value:o[0]}))
    }

    const toggleStatus = (record) => {
        if(record.status && record.packages.length ){
            let str = '';
            record.packages.forEach(o => {
                str = str + o.package_name + '、';
            })
            str = str.substr(0,str.length - 1)
            Confirm({
                content:`停用后该标记物将从${str}中删除，确认停用？`,
                onOk:() => modifyStatus(record.marker_id)
            })
        }else{
            modifyStatus(record.marker_id);
        }

    }

    const handleInputChange = (value,id,key) => {
        let arr = filter.map(item => {
            if(item.marker_id === id){
                item[key] = value
            }
            return item;
        })
        setFilter(arr);
    }

    const filterList = (key,arr = markList) => {
        key = keySearch.trim().toLowerCase() || ''
        return arr.filter(o => o.name.toLowerCase().includes(key) ||
                                    o.short_name.toLowerCase().includes(key) ||
                                    o.zh_name.includes(key) ||
                                    o.clone_num.toLowerCase().includes(key) ||
                                    o.brand.toLowerCase().includes(key) ||
                                    o.model.toLowerCase().includes(key)
                                    )

    }

    return (
        <div className={style.outer}>
            {
                addShow &&
                <Add
                    device={device}
                    onClose={e=>setAddShow(false)}
                    onCancel={e=>setAddShow(false)}
                    onAdd={e=>getMarkList()}
                ></Add>
            }
            <div className={style.list}>
                <div className={style.listHeader}>
                    <div className={style.fl} style={{ background:`url(${require('@images/list.svg')}) no-repeat 22px center`}}>
                        标记物列表
                        <button className={style.addbtn} onClick={e=>setAddShow(true)}>新增</button>
                    </div>
                    <div className={style.fr}>
                        <div className={style.search}>
                            <Input
                                lineFeed={false}
                                containerStyle={{width:'189px',margin:'0 8px'}}
                                value={keySearch}
                                onChange={e=>setKeySearch(e.target.value)}
                                onKeyUp={e=>e.keyCode === 13 && setFilter(filterList())}
                            ></Input>
                            <button className={style.btn} onClick={e=>setFilter(filterList())}>查询</button>
                        </div>
                    </div>
                </div>

                <div style={{width:'calc(100% - 28px)',margin:'0 auto'} }>
                    <Table
                        columns={columns}
                        scroll={{ y: 278,x: 1800}}
                        data={filter}
                        rowKey={'marker_id'}
                    ></Table>
                </div>
            </div>
        </div>
    )
}