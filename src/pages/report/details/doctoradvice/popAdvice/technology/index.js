import React, { useState,useCallback,useEffect } from 'react';
import style from './index.css';
import Select from 'select';
// import Input from 'input';
import Table from 'table';
import translate from '../../../../language/zh.js';
import {api} from 'utils.js'
import Message from 'message';
import {CODE} from 'myConstants';
import EventBus from 'eventBus';
import AddPop from 'addPop';
import TextArea from 'textarea';

function Add(props){

    const [paraList,setParaList] = useState([]);
    const [adviceType,setAdviceType] = useState(null);
    const [paraffinNum,setParaffinNum] = useState(null);
    const [comment,setComment] = useState('');
    const [sliceNum,setSliceNum] = useState('');

    const {pathnum,onClose,onCancel,onAdd} = props;

    const getParaffins = useCallback(
        ()=>{
            api('records/get_paraffins',{pathnum:pathnum}).then(({code,message,data})=>{
                if(code === CODE.SUCCESS){
                    setParaList(data.map(o=>({title:o.paraffin_num,value:o.paraffin_num})).concat([{title:'不适用',value:''}]))
                }
            })
        }
    ,[pathnum])

    useEffect(()=>{getParaffins()},[getParaffins]);

    const handleSelect = (value)=>{
        setAdviceType(value);
        if(value !== 1){
            setSliceNum('1');
            setParaffinNum(null);
        }else if(value === 1){
            setSliceNum('');
            setParaffinNum('');
        }
    }

    const addApply = ()=>{
        if(adviceType === null)return
        let data = {
            pathnum:props.pathnum,
            tech_order_type: adviceType,
            paraffin_num: paraffinNum,
            comment:comment.trim(),
            slice_num: sliceNum.trim(),
        }
        api(`order/add_tech_order`,data).then(({code,message,data})=>{
            if(code === CODE.SUCCESS){
                Message.success('新增申请成功');
                setAdviceType(null);
                setParaffinNum(null);
                setComment('');
                setSliceNum('');
                onAdd(data);
                onClose();
            }else{
                Message.error('新增申请失败');
            }
        })
    }

    const labelStyle = {
        width: '160px',
        display: 'inline-block',
        textAlign: 'right'
    };

    return (
        <div>
            <AddPop
                confirmButtonDisabled={(adviceType === null) || (!(adviceType === 1) && !paraffinNum)}
                title={'新增技术医嘱'}
                onClose={onClose}
                onCancel={onCancel}
                onConfirm={addApply}
            >
                <div className={style.row}>
                    <Select
                        options={
                            [
                                {title:'重切',value:0},
                                {title:'补取',value:1},
                                {title:'深切',value:2},
                                {title:'教学片',value:3},
                                {title:'连切',value:4},
                                {title:'白片',value:5,disabled:true},
                                {title:'重染',value:6,disabled:true},
                                {title:'重处理',value:7,disabled:true},
                            ]
                        }
                        style={{width:'240px',marginTop:'10px'}}
                        lineFeed={false}
                        label={'医嘱类别：'}
                        required={true}
                        value={adviceType}
                        labelStyle={labelStyle}
                        onChange={value=>handleSelect(value)}
                    ></Select>
                </div>
                <div className={style.row}>
                    <Select
                        label={'对应蜡块：'}
                        options={paraList}
                        style={{width:'240px'}}
                        lineFeed={false}
                        value={paraffinNum}
                        labelStyle={labelStyle}
                        onChange={value=>setParaffinNum(value)}
                    ></Select>
                </div>
                <div className={style.row}>
                    <TextArea
                        label={'备注：'}
                        labelStyle={{
                            width: '160px',
                            display: 'inline-block',
                            textAlign: 'right',
                            verticalAlign:'top',
                        }}
                        value={comment}
                        onChange={e=>setComment(e.target.value)}
                        textAreaStyle={{width:'240px',height:'56px'}}
                    ></TextArea>
                </div>
                <div className={style.row}>
                    <span style={{
                            width: '160px',
                            display: 'inline-block',
                            textAlign: 'right',
                            color: '#62707c',
                            fontSize: '15px',
                    }}>新增切片数量：</span>

                    <input
                        className={style.inputNum}
                        value={sliceNum}
                        disabled={adviceType === 1}
                        onChange={e=>setSliceNum(e.target.value.replace(/^(0+)|[^\d]/g, ''))}
                    ></input>
                </div>
            </AddPop>
        </div>
    )
}

export default function Index(props){
    const    columns = [
        {
            title: '医嘱类别',
            dataIndex: 'tech_order_type',
            render:text=>(
                <React.Fragment>
                    {translate.techType[text]}
                </React.Fragment>
            ),
            width:130,
        },
        {
            title: '蜡块号',
            dataIndex: 'paraffin_num',
            width:150,
        },
        {
            title: '切片号',
            dataIndex: 'slice_num',
            width:150,
        },
        {
            title: '备注',
            dataIndex: 'comment',
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
            width:150,
        },
        {
            title: '执行状态',
            dataIndex: 'status',
            width:120,
            render:(text)=>(
                <React.Fragment>
                    <i
                        className={style.state}
                        style={{ backgroundColor: { 0: '#2399F1', 2: '#6FC831' }[text] }}
                    />
                    {translate.adviceState[text]}
                </React.Fragment>
            )
        },
        {
            title: '执行人',
            dataIndex: 'execute_doc',
            width:150,
        },
        {
            title: '执行时间',
            dataIndex: 'execute_time',
            width:150,
        },
        {
            title: '操作',
            dataIndex: 'action',
            width:100,
            fixed:'right',
            render:(text,record)=>(
                <React.Fragment>
                    <button className={style.actionBtn} disabled={record.status!==0} onClick={e=>deleteAdvice(record.tech_order_id,e)}>删除</button>
                </React.Fragment>
            )
        },
    ]

    const [techList,setTechList] = useState([]);
    const [addShow,setAddShow] = useState(false);
    const [selectedIds,setSelectedIds] = useState([]);


    // ---------------------------- api -----------------------------

    const pathnum = props.pathnum;
    const getTechAdvice = useCallback(
        ()=>{
        api(`order/get_tech_orders_detail?`,{pathnum:pathnum,filter:JSON.stringify([0,1,2])})
        .then(({code,data})=>{
            if(code === CODE.SUCCESS){
                setTechList(data.map(record=>Object.assign({}, record, {disabled: record.status !== 0})))

            }
        })
    }
    ,[pathnum])



    useEffect(()=>{
        getTechAdvice();
    },[getTechAdvice])



    const handleClickTr = (record)=>{
        if(record.status!==0)return;
        if(selectedIds.includes(record.tech_order_id)){
            setSelectedIds(selectedIds.filter(o=>o !== record.tech_order_id))
        }else{
            setSelectedIds(selectedIds.concat([record.tech_order_id]))
        }
    }


    const deleteAdvice = (id,e)=>{
        e.stopPropagation();

        let  data = {
            order_type:0,
            order_ids:JSON.stringify([id])
        }
        api(`order/delete_order?`,data).then(({code,message,data})=>{
            if(code === CODE.SUCCESS){
                let arr = selectedIds.filter(o=>o!==id);
                setSelectedIds(arr)
                getTechAdvice();
                Message.success('删除成功');
            }else{
                Message.error('删除失败');
            }
        })
    }

    const sendApply = ()=>{
        if(!selectedIds.length)return
        let data = {
            order_type:0,
            order_ids:JSON.stringify(selectedIds),
        }
        api('order/send_orders?',data).then(({code,message,data})=>{
            if(code === CODE.SUCCESS){
                getTechAdvice();
                setSelectedIds([])
                EventBus.emit('updateState')
                Message.success('发送申请成功');
            }else{
                Message.error('发送申请失败');
            }
        })
    }

    const handleAdd = (data) => {
        getTechAdvice()
        let arr = selectedIds.concat(data);
        setSelectedIds(arr);
    }

        return (
            <div className={style.technology}>
                {
                    addShow &&
                    <Add
                        pathnum={pathnum}
                        onClose={e=>setAddShow(false)}
                        onCancel={e=>setAddShow(false)}
                        onAdd={handleAdd}
                    ></Add>
                }
                <div className={style.list}>
                    <div className={style.listHeader}>
                        <div className={style.fl} style={{background:`url(${require('@images/list.svg')}) no-repeat 16px center`}}>
                            医嘱列表
                        </div>
                        <div className={style.fr}>

                            <button
                                className={style.addBtn}
                                onClick={e=>setAddShow(true)}
                            >新增</button>
                        </div>
                    </div>
                    <Table
                        columns={columns}
                        style={{height: 'calc(100% - 100px)',
                                width:'100%',
                                overflowY: 'auto',
                                borderLeft:'1px solid rgba(218,222,226,1)',
                                borderRight:'1px solid rgba(218,222,226,1)', }}
                        scroll={{ y: 440,x:1600 }}
                        selectedRowKeys={selectedIds}
                        onSelectChange={selectedIds=>setSelectedIds(selectedIds)}
                        data={techList}
                        rowKey={'tech_order_id'}
                        onRow={record=>{
                            return {
                                onClick:e=>handleClickTr(record)
                            }
                        }}
                    ></Table>
                    <button className={style.sendBtn} disabled={!selectedIds.length} onClick={sendApply}>发送申请</button>
                </div>

            </div>
        )
}