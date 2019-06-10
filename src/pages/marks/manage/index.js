import React ,{useState,useEffect} from 'react';
import style from './index.css';
import Table from 'table';
import Add from './add';
import Input from 'input';
import Select from 'select';
// import {Select} from 'antd';
import Confirm from 'confirm';
import {CODE} from 'myConstants.js';
import {api} from 'utils.js';

const state = {
    0:'停用',
    1:'使用中'
}

export default function Index(props){

    const [markList,setMarkList] = useState([]);
    const [keySearch,setKeySearch] = useState('');
    const [filter,setFilter] = useState([]);
    const [device,setDevice] = useState([]);

    const columns = [
        {
            title:'名称',
            dataIndex:'name',
            render:(text,record) => {
                return (
                    <React.Fragment>
                        {record.disabled && text}
                        {!record.disabled && 
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
            render:(text,record) => {
                return (
                    <React.Fragment>
                        {record.disabled && text}
                        {!record.disabled && 
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
            render:(text,record) => {
                return (
                    <React.Fragment>
                        {record.disabled && text}
                        {!record.disabled && 
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
            render:(text,record) => {
                return (
                    <React.Fragment>
                        {record.disabled && text}
                        {!record.disabled && 
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
            render:(text,record) => {
                return (
                    <React.Fragment>
                        {record.disabled && text}
                        {!record.disabled && 
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
            }
        },
        {
            title:'型号',
            dataIndex:'equip_id',
            render:(text,record) => {
                return (
                    <React.Fragment>
                        {record.disabled && record.model}
                        {!record.disabled && 
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
                        style={{background:'#0B94FC',marginRight:'5px'}}
                        onClick={e=>editRecord(record.marker_id,record.disabled)}
                    >{record.disabled?'编辑':'保存'}</button>
                    <button className={style.actionBtn} style={{background:'#24BBF2'}}>库存管理</button>
                </React.Fragment>
            )
        },
    ].map(o=>{o.width = 204;return o})

    useEffect(()=>{getMarkList();getDevice()},[])
    // ---------------------api--------------------

    const getMarkList = () => {
        api('immu_manage/get_markers')
        .then(({code,data}) =>{
            if(code === CODE.SUCCESS){
                setMarkList(data.map(o => Object.assign({},o,{disabled:true})))
                setFilter(data.map(o => Object.assign({},o,{disabled:true})));
            }
        })
    }

    const getDevice = () => {
        api('immu_manage/get_facilities',{filter:JSON.stringify([1])})
        .then(({code,data}) => {
            if(code === CODE.SUCCESS){
                setDevice(data)
            }
        })
    }

    const modifyStatus = (id) => {
        api(`immu_manage/alter_marker_status?marker_id=${id}`)
        .then(data => (data.code === CODE.SUCCESS) && getMarkList())
    }

    const editRecord = (id,flag) => {
        if(flag){
            let arr = filter.map(o => {
                if(o.marker_id === id){
                    o.disabled = false;
                }
                return o;
            });
            setFilter(arr);
        }else{
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
            console.log(data)
            api('immu_manage/alter_marker',data)
            .then(({code,message}) => {
                if(code === CODE.SUCCESS){
                    getMarkList();
                }else{
                    // Message.error(message);
                }
            })

        }
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
        key = keySearch.trim().toLowerCase() || '';
        let tmp = arr.filter(o => o.name.toLowerCase().includes(key) || 
                                    o.short_name.toLowerCase().includes(key) ||
                                    o.zh_name.includes(key) ||
                                    o.clone_num.toLowerCase().includes(key) ||
                                    o.brand.toLowerCase().includes(key) ||
                                    o.model.toLowerCase().includes(key) 
                                    )
        setFilter(tmp)
    }

    return (
        <div className={style.outer}>
            <div className={style.list}>
                <div className={style.listHeader}>
                    <div className={style.fl}>
                        标记物列表
                    </div>
                    <div className={style.fr}>
                        {
                            device.length &&
                            <Add device={device} onAdd={()=>getMarkList()}></Add>
                        }
                    </div>
                </div>
                <div className={style.search}>
                    <Input
                        lineFeed={false}
                        containerStyle={{width:'189px',marginRight:'8px'}}
                        value={keySearch}
                        onChange={e=>setKeySearch(e.target.value)}
                        onKeyUp={e=>e.keyCode === 13 && filterList()}
                    ></Input>
                    <button className={style.btn} onClick={filterList}>搜索</button>
                </div>
                <Table
                    columns={columns}
                    style={{height: 'calc(100% - 100px)',
                            width:'calc(100% - 20px)',
                            margin:'0 auto', 
                            overflowY: 'auto',
                            borderLeft:'1px solid rgba(218,222,226,1)',
                            borderRight:'1px solid rgba(218,222,226,1)', }}
                    scroll={{ y: 'calc(100vh - 340px)' }}
                    data={filter}
                    rowKey={'marker_id'}
                ></Table>
            </div>
        </div>
    )
}