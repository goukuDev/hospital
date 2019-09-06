import React ,{useState,useEffect} from 'react';
import style from './index.css';
import Table from 'table';
import Add from './add';
import Input from 'input';
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
    const [current,setCurrent] = useState(null);
    const [addShow,setAddShow] = useState(false);


    const columns = [
        {
            title:'名称',
            dataIndex:'name',
            width:250,
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
            width:280,
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
            width:150,
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
            width:150,
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
            width:200,
            fixed:'right',
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
        api('mpf_manage/get_markers',{type:2})
        .then(({code,data}) =>{
            if(code === CODE.SUCCESS){
                let arr = data.map(o => Object.assign({},o,{disabled:true}));
                setMarkList(arr);
                setFilter(arr);
            }
        })},[])
    // ---------------------api--------------------

    const getMarkList = () => {
        api('mpf_manage/get_markers',{type:2})
        .then(({code,data}) =>{
            if(code === CODE.SUCCESS){
                setMarkList(data);
                setFilter(filterList(keySearch.trim().toLowerCase(),data));
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
                // onOk:() => modifyStatus(record.marker_id)
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
                comment: item.comment && item.comment.trim(),
            }
            api('mpf_manage/alter_marker',data)
            .then(({code,message}) => {
                if(code === CODE.SUCCESS){
                    // getMarkList();
                    setCurrent(null)
                }else{
                    // Message.error(message);
                }
            })
        }
        setCurrent(id)
    }
    // -------------------------methods---------------------------

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
                                    o.clone_num.toLowerCase().includes(key)
                                    )
        
    }

    return (
        <div className={style.outer}>
            {addShow && 
                <Add 
                    onAdd={()=>getMarkList()}
                    onCancel={e=>setAddShow(false)}
                    onClose={e=>setAddShow(false)}
                ></Add>
            }
            <div className={style.list}>
                <div className={style.listHeader}>
                    <div className={style.fl} style={{ background:`url(${require('@images/list.svg')}) no-repeat 16px center`}}>
                        标记物列表
                        <button className={style.addbtn} onClick={e=>setAddShow(true)}>新增</button>
                    </div>
                    <div className={style.search}>
                        <Input
                            lineFeed={false}
                            containerStyle={{width:'189px',marginRight:'8px'}}
                            value={keySearch}
                            onChange={e=>setKeySearch(e.target.value)}
                            onKeyUp={e=>e.keyCode === 13 && setFilter(filterList())}
                        ></Input>
                        <button className={style.btn} onClick={e=>setFilter(filterList())}>查询</button>
                    </div>
                </div>
                <div style={{width:'calc(100% - 28px)',margin:'0 auto'}}>

                    <Table
                        columns={columns}
                        style={{height: 'calc(100% - 100px)',
                                width:'100%',
                                margin:'0 auto', 
                                overflowY: 'auto',
                                 }}
                        scroll={{ y: 300,x:1600 }}
                        data={filter}
                        rowKey={'marker_id'}
                    ></Table>
                </div>
            </div>
        </div>
    )
}