import React ,{useState,useEffect} from 'react';
import style from './index.css';
import Table from 'table';
import Add from './add';
import Input from 'input';
import EditInput from 'editInput';
import Confirm from 'confirm';
import {CODE} from 'myConstants.js';
import {api} from 'utils.js';

const state = {
    0:'停用',
    1:'使用中'
}

export default function Index(props){

    const [markList,setMarkList] = useState([]);
    
    const columns = [
        {
            title:'名称',
            dataIndex:'name',
            render:(text,record) => {
                return (
                    <React.Fragment>
                        <EditInput
                            value={text}
                            disabled={record.disabled}
                            onChange={e=>handleInputChange(e.target.value, record.marker_id,'name')}
                        ></EditInput>
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
                        <EditInput
                            value={text}
                            disabled={record.disabled}
                            onChange={e=>handleInputChange(e.target.value, record.marker_id,'short_name')}
                        ></EditInput>
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
                        <EditInput
                            value={text}
                            disabled={record.disabled}
                            onChange={e=>handleInputChange(e.target.value, record.marker_id,'zh_name')}
                        ></EditInput>
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
                        <EditInput
                            value={text}
                            disabled={record.disabled}
                            onChange={e=>handleInputChange(e.target.value, record.marker_id,'clone_num')}
                        ></EditInput>
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
                        <EditInput
                            value={text}
                            disabled={record.disabled}
                            onChange={e=>handleInputChange(e.target.value, record.marker_id,'brand')}
                        ></EditInput>
                    </React.Fragment>
                )
            }
        },
        {
            title:'设备名称',
            dataIndex:'model',
            render:(text,record) => {
                return (
                    <React.Fragment>
                        <EditInput
                            value={text}
                            disabled={record.disabled}
                            onChange={e=>handleInputChange(e.target.value, record.marker_id,'model')}
                        ></EditInput>
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
                        <EditInput
                            value={text}
                            disabled={record.disabled}
                            onChange={e=>handleInputChange(e.target.value, record.marker_id,'comment')}
                        ></EditInput>
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
                        onClick={e=>toggleStatus(record)}
                    >{record.status?'停用' :'使用'}</button>
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

    useEffect(()=>getMarkList(),[])    

    const getMarkList = () => {
        api('immu_manage/get_markers')
        .then(({code,data}) =>{
            if(code === CODE.SUCCESS){
                setMarkList(data.map(o => Object.assign({},o,{disabled:true})))
            }
        })
    }

    const toggleStatus = (record) => {
        if(record.status && record.packages.length ){
            let str = '';
            record.packages.forEach(o => {
                str = str + o.package_name + '、'; 
            })
            str = str.substr(0,str.length - 1)
            console.log(str)
            Confirm({
                content:`停用后该标记物将从套餐${str}中删除，确认停用？`,
                onOk:() => modifyStatus(record.marker_id)
            })
        }else{
            modifyStatus(record.marker_id);
        }

    }

    const modifyStatus = (id) => {
        api(`immu_manage/alter_marker_status?marker_id=${id}`)
        .then(data => (data.code === CODE.SUCCESS) && getMarkList())
    }

    const editRecord = (id,flag) => { 
        if(flag){
            let arr = markList.map(o => {
                if(o.marker_id === id){
                    o.disabled = false;
                }
                return o;
            });
            setMarkList(arr);
        }else{
            let item = markList.find(o => o.marker_id === id);
            if(!item.name)return;
            let data = {
                marker_id: item.marker_id,
                name: item.name.trim(),
                clone_num: item.clone_num.trim(),
                zh_name: item.zh_name.trim(),
                short_name: item.short_name.trim(),
                brand: item.brand,
                model: item.model,
                comment: item.comment && item.comment.trim(),
            }
            console.log(data)
            api('immu_manage/alter_marker',data)
            .then(({code,message}) => {
                if(code === CODE.SUCCESS){
                    let arr = markList.map(o => {
                        if(o.marker_id === id){
                            o.disabled = true;
                        }
                        return o;
                    });
                    setMarkList(arr);
                    getMarkList();
                }else{
                    // Message.error(message);
                }
            })

        }
    }

    const handleInputChange = (value,id,key) => {
        let arr = markList.map(item => {
            if(item.marker_id === id){
                item[key] = value
            }
            return item;
        })
        setMarkList(arr);
    }

    return (
        <div className={style.outer}>
            <div className={style.list}>
                <div className={style.listHeader}>
                    <div className={style.fl}>
                        标记物列表
                    </div>
                    <div className={style.fr}>
                        <Add onAdd={()=>getMarkList()}></Add>
                    </div>
                </div>
                <div className={style.search}>
                    <Input
                        lineFeed={false}
                        containerStyle={{width:'189px',marginRight:'8px'}}
                    ></Input>
                    <button className={style.btn} >搜索</button>
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
                    data={markList}
                    rowKey={'marker_id'}
                ></Table>
            </div>
        </div>
    )
}