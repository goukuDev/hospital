import React, { useState,useCallback,useEffect } from 'react';
import style from './index.css';
import Table from 'table';
// import translate from '../../../../../language/zh.js';
import Mark from './mark';
import {api} from 'utils.js';
import {CODE} from 'myConstants.js';
import Message from 'message';

const translate = {
    adviceState:{
        0 : '预申请',
        1 : '已申请',
        2 : '已执行',
    },
}

const paraffCol = [
    {
        title: '蜡块号',
        dataIndex: 'paraffin_num',
    },
    {
        title: '组织名称',
        dataIndex: 'paraffin_tissue',
    },
].map(o=>{o.width=162;return o;});



export default function Index(props) {
    const applyCol = [
        {
            title: '医嘱类别',
            dataIndex: 'type',
            render:()=>(['免疫组化','特殊染色'][props.currentType-1]),
            width:120,
        },
        {
            title: '蜡块号',
            dataIndex: 'paraffin_num',
            width:140,
        },
        {
            title: '切片号',
            dataIndex: 'slice_num',
            width:140,
        },
        {
            title: '标记物',
            dataIndex: 'marker_name',
            width:140,
        },
        {
            title: '克隆号',
            dataIndex: 'marker_clone_num',
            width:140,
        },
        {
            title: '备注',
            dataIndex: 'comment',
            width:140,
        },
        {
            title: '预申请医生',
            dataIndex: 'pre_doc',
            width:120,
        },
        {
            title: '复核医生',
            dataIndex: 'review_doc',
            width:120,
        },
        {
            title: '申请时间',
            dataIndex: 'apply_time',
            width:170,
        },
        {
            title: '执行状态',
            dataIndex: 'status',
            render: text => (
                <React.Fragment>
                    <i className={style.state} style={{ backgroundColor: { 0: '#0B94FC', 2: '#6FC831' }[text] }} />
                    {translate.adviceState[text]}
                </React.Fragment>
            ),
            width:120,
        },
        {
            title: '执行人',
            dataIndex: 'execute_doc',
            width:120,
        },
        {
            title: '执行时间',
            dataIndex: 'execute_time',
        },
        {
            title: '操作',
            dataIndex: 'action',
            width:100,
            fixed:'right',
            render: (text, record) => (
                <React.Fragment>
                    <button
                        className={style.actionBtn}
                        disabled={record.status !== 0}
                        onClick={e => deleteApply(e,[record.order_id])}
                    >
                        删除
                    </button>
                </React.Fragment>
            ),
        },
    ];


    const [paraffinChecked, setParaffinChecked] = useState([]);
    const [markChecked,setMarkChecked] = useState([]);
    const [applyChecked, setApplyChecked] = useState([]);
    const [comment,setComment] = useState('');
    const [paraffinList,setParaffinList] = useState([]);
    const [appList,setAppList] = useState([]);

    // --------------------api-------------------------------
    const getParaffin = useCallback(
        () => {
            api(`records/get_paraffins`,{pathnum:props.pathnum})
            .then(({code,data}) => {
                if(code === CODE.SUCCESS){
                    setParaffinList(data);
                }
            })
        },
        [props.pathnum]
    )

    const getApply = useCallback(
        () => {
            api('order/get_special_orders_detail',{pathnum:props.pathnum,type:props.currentType})
            .then(({code,data}) => {
                if(code === CODE.SUCCESS){
                    let arr = data.map(o => Object.assign({},o,{disabled:o.status !== 0}));
                    setAppList(arr);
                }
            })
        },
        [props.pathnum,props.currentType]
    )

    useEffect(()=>{
        getParaffin();
        getApply();
    },[getParaffin,getApply])

    const sendApply = () => {
        if(!applyChecked.length)return
        let data = {
            order_type:props.currentType,
            order_ids:JSON.stringify(applyChecked),
        }
        api('order/send_orders?',data).then(({code})=>{
            if(code === CODE.SUCCESS){
                getApply();
                setApplyChecked([]);
                Message.success('发送申请成功');
            }else{
                Message.error('发送申请失败');
            }
        })
    }

    const addApply = () => {
        if(!paraffinChecked.length || !markChecked.length)return;
        let data = {
            type:props.currentType,
            pathnum:props.pathnum,
            paraffins:JSON.stringify(paraffinChecked),
            markers:JSON.stringify(markChecked),
            comment:comment,
        }
        api('order/add_special_order',data)
        .then(({code,data}) => {
            if(code === CODE.SUCCESS){
                getApply();
                setApplyChecked(applyChecked.concat(data))
                Message.success('新增申请成功');
            }else{
                Message.error('新增申请失败');
            }
        }) 
    }

    const deleteApply = (e,ids) => {
        e.stopPropagation();
        let data = {
            order_type:props.currentType,
            order_ids:JSON.stringify(ids)
        }
        api(`order/delete_order?`,data)
        .then(({code,data})=>{
            if(code === CODE.SUCCESS){
                let arr = applyChecked.filter(o => !ids.includes(o));
                setApplyChecked(arr);
                getApply();
                Message.success('删除成功');
            }else{
                Message.error('删除失败');
            }
        })        
    }

    // ------------------ methods -------------------------
    const checkParaffin = (num) => {
        if(paraffinChecked.includes(num)){
            let arr = paraffinChecked.filter(o => o !== num);
            setParaffinChecked(arr);
        }else{
            let arr = paraffinChecked.concat([num]);
            setParaffinChecked(arr);
        }
    }

    const handleChange = value => {
        setMarkChecked(value);
    }

    const handleClickTr = (record) => {
        if(record.status!==0)return;
        if(applyChecked.includes(record.order_id)){
            let arr = applyChecked.filter(o=>o !== record.order_id);
            setApplyChecked(arr);
        }else{
            let arr = applyChecked.concat([record.order_id]);
            setApplyChecked(arr);
        }
    }

    return (
        <div className={style.sabc}>
            <div className={style.top}>
                <div className={style.checks}>
                    <div className={style.paraTable}>
                        <p className={style.title}>
                            蜡块列表 <button className={style.clearBtn} onClick={e=>setParaffinChecked([])}>清空</button>
                        </p>
                        <Table
                            data={paraffinList}
                            style={{ width: '100%' ,height:'100%',overflowY:'auto'}}
                            scroll={{ y: 'calc(100vh - 770px)' }}
                            columns={paraffCol}
                            rowKey={'paraffin_num'}
                            selectedRowKeys={paraffinChecked}
                            onSelectChange={values => setParaffinChecked(values)}
                            onRow={record => {
                                return {
                                    onClick:e => checkParaffin(record.paraffin_num)
                                }
                            }}
                        />
                    </div>
                    <div className={style.markList}>
                        <Mark currentType={props.currentType} handleChange={handleChange}>
                            <div className={style.remark}>
                                <p style={{color:'#585D68',marginBottom:'10px'}}>备注：</p>
                                <textarea name="" id="" cols="30" rows="10"
                                    onChange={e => setComment(e.target.value)}
                                ></textarea>
                            </div>
                        </Mark>
                    </div>
                </div>
                <div className={style.btnbox}>
                    <button 
                            className={style.addBtn} 
                            // style={{background:'rgba(45,206,137,1)',}}
                            onClick={addApply}
                            disabled={!paraffinChecked.length || !markChecked.length}
                    >
                        新增申请
                    </button>
                </div>
            </div>
            <div className={style.bottom}>
                <p className={style.header}>申请列表</p>
                <Table
                    data={appList}
                    rowKey={'order_id'}
                    style={{
                        width: '100%',
                        height:'calc(100% - 100px)',
                        border: '1px solid rgba(218,222,226,1)',
                        borderTop:'none',
                        overflowY:'auto'
                    }}
                    scroll={{y: 809,x:1830}}
                    columns={applyCol}
                    selectedRowKeys={applyChecked}
                    onSelectChange={values => setApplyChecked(values)}
                    onRow={record => {
                        return {
                            onClick:e => handleClickTr(record)
                        }
                    }}
                />  
                <div className={style.btnboxs}>
                    <button className={style.appBtn} disabled={!applyChecked.length} onClick={sendApply}>发送申请</button>
                    <button className={style.appBtn}>打印申请单</button>
                    <button className={style.appBtn} disabled={!applyChecked.length} onClick={e=>deleteApply(e,applyChecked)}>删除</button>
                </div>
            </div>
        </div>
    );
}
