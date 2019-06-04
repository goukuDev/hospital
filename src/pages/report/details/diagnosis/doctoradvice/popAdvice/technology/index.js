import React, { Component } from 'react';
import style from './index.css';
import Select from 'select';
import Input from 'input';
import Table from 'table';
import translate from '../../../../../language/zh.js';
import {api} from 'utils.js'
import Message from 'message';
import {CODE} from 'myConstants';

export default class Index extends Component{
    columns = [
        {
            title: '医嘱类别',
            dataIndex: 'tech_order_type',
            render:text=>(
                <React.Fragment>
                    {translate.techType[text]}
                </React.Fragment>
            )
        },
        {
            title: '蜡块号',
            dataIndex: 'paraffin_num',
        },
        {
            title: '切片号',
            dataIndex: 'slice_num',
        },
        {
            title: '备注',
            dataIndex: 'comment',
        },
        {
            title: '预申请医生',
            dataIndex: 'pre_doc',
        },
        {
            title: '复核医生',
            dataIndex: 'review_doc',
        },
        {
            title: '申请时间',
            dataIndex: 'apply_time',
        },
        {
            title: '执行状态',
            dataIndex: 'status',
            render:(text)=>(
                <React.Fragment>
                    <i
                        className={style.state}
                        style={{ backgroundColor: { 0: '#0B94FC', 2: '#6FC831' }[text] }}
                    />
                    {translate.adviceState[text]}
                </React.Fragment>
            )
        },
        {
            title: '执行人',
            dataIndex: 'execute_doc',
        },
        {
            title: '执行时间',
            dataIndex: 'execute_time',
        },
        {
            title: '操作',
            dataIndex: 'action',
            render:(text,record)=>(
                <React.Fragment>
                    <button className={style.actionBtn} disabled={record.status!==0} onClick={e=>this.deleteAdvice(record.tech_order_id,e)}>删除</button>
                </React.Fragment>
            )
        },
    ].map(o=>{o.width=167;return o});

    
    constructor(){
        super();
        this.state = {
            techList:[],
            paraList:[],
            selectedIds:[],
            adviceType:null,
            paraffinNum:null,
            comment:'',
            sliceNum:'',
        }
        this.handleSelect = this.handleSelect.bind(this);
        this.handleInput = this.handleInput.bind(this);
        this.addApply = this.addApply.bind(this);
        this.deleteAdvice = this.deleteAdvice.bind(this);
        this.sendApply = this.sendApply.bind(this);
        this.handleClickTr = this.handleClickTr.bind(this);
    }

    getTechAdvice(){
        let pathnum = this.props.pathnum;
        api(`order/get_tech_orders_detail?`,{pathnum:pathnum,filter:JSON.stringify([0,1,2])})
        .then(({code,data})=>{
            if(code === CODE.SUCCESS){
                this.setState({techList:data.map(record=>Object.assign({}, record, {disabled: record.status !== 0}))});
            }
        })
    }

    getParaffins(){
        api('records/get_paraffins',{pathnum:this.props.pathnum}).then(({code,message,data})=>{
            if(code === CODE.SUCCESS){
                this.setState({paraList:data});
            }
        })
    }

    handleSelect(key,value){
        this.setState({[key]:value});
        if(key === 'adviceType' && value !== 1){
            this.setState({sliceNum:'1',paraffinNum:null});
        }else if(key === 'adviceType' && value === 1){
            this.setState({sliceNum:'',paraffinNum:''});
        }
    }

    handleInput(key,value){
        this.setState({[key]:value})
    }

    handleClickTr(record){
        if(record.status!==0)return;
        let { selectedIds } = this.state;   
        if(selectedIds.includes(record.tech_order_id)){
            this.setState({selectedIds:selectedIds.filter(o=>o !== record.tech_order_id)});
        }else{
            this.setState({selectedIds:selectedIds.concat([record.tech_order_id])});
        }
    }

    addApply(){
        let {adviceType,paraffinNum,comment,sliceNum} = this.state;
        if(adviceType === null)return
        let data = {
            pathnum:this.props.pathnum,
            tech_order_type: adviceType,
            paraffin_num: paraffinNum,
            comment:comment.trim(),
            slice_num: sliceNum.trim(),
        }
        api(`order/add_tech_order`,data).then(({code,message,data})=>{
            if(code === CODE.SUCCESS){
                this.getTechAdvice(); 
                Message.success('新增申请成功');
                this.setState({
                    adviceType:null,
                    paraffinNum:null,
                    comment:'',
                    sliceNum:'',
                })
            }else{
                Message.error('新增申请失败'); 
            }
        })
    }
    deleteAdvice(id,e){
        e.stopPropagation();
        
        let  data = {
            order_type:0,
            order_ids:JSON.stringify([id])
        }
        api(`order/delete_order?`,data).then(({code,message,data})=>{
            if(code === CODE.SUCCESS){
                let arr = this.state.selectedIds.filter(o=>o!==id);
                this.setState({selectedIds:arr});
                this.getTechAdvice();
                Message.success('删除成功');
            }else{
                Message.error('删除失败');
            }
        })
    }

    sendApply(){
        if(!this.state.selectedIds.length)return
        let data = {
            order_type:0,
            order_ids:JSON.stringify(this.state.selectedIds),
        }
        api('order/send_orders?',data).then(({code,message,data})=>{
            if(code === CODE.SUCCESS){
                this.getTechAdvice(); 
                this.setState({selectedIds:[]});
                Message.success('发送申请成功');
            }else{
                Message.error('发送申请失败');
            }
        })
    }

    componentDidMount(){
        this.getTechAdvice();
        this.getParaffins();
    }
    render(){

        const {techList,paraList,adviceType,paraffinNum,comment,sliceNum,selectedIds} = this.state;
        var paraffins = paraList.map(o=>({title:o.paraffin_num,value:o.paraffin_num})).concat([{title:'不适用',value:''}]);

        return (
            <div className={style.technology}>
                <div className={style.list}>
                    <div className={style.listHeader}>
                        <div className={style.fl}>
                            医嘱列表
                        </div>
                        <div className={style.fr}>
                            <span style={{
                                color:'#F25B24',
                                fontSize: '21px',paddingTop: '8px',
                                marginRight: '3px'}}
                            >*</span>
                            医嘱类别：
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
                                style={{width:'102px',marginLeft:'8px',marginRight:'15px'}}
                                lineFeed={false}
                                value={adviceType}
                                onChange={value=>this.handleSelect('adviceType',value)}
                            ></Select>
                            对应蜡块：
                            <Select
                                options={paraffins}
                                style={{width:'143px',marginLeft:'8px',marginRight:'15px'}}
                                lineFeed={false}
                                value={paraffinNum}
                                onChange={value=>this.handleSelect('paraffinNum',value)}
                            ></Select>
                            备注：
                            <Input
                                lineFeed={false}
                                containerStyle={{width:'168px',marginRight:'15px'}}
                                value={comment}
                                onChange={e=>this.handleInput('comment',e.target.value)}
                            ></Input>
                            新增切片数量：
                            <input
                                className={style.inputNum}
                                value={sliceNum}
                                disabled={adviceType === 1}
                                onChange={e=>this.handleInput('sliceNum',e.target.value.replace(/^(0+)|[^\d]/g, ''))}
                            ></input>
                            <button
                                className={style.addBtn} 
                                disabled={(adviceType === null) || (!(adviceType === 1) && !paraffinNum)} 
                                onClick={this.addApply}
                            >新增</button>
                        </div>
                    </div>
                    <Table
                        columns={this.columns}
                        style={{height: 'calc(100% - 100px)',
                                width:'100%', 
                                overflowY: 'auto',
                                borderLeft:'1px solid rgba(218,222,226,1)',
                                borderRight:'1px solid rgba(218,222,226,1)', }}
                        scroll={{ y: 'calc(100vh - 340px)' }}
                        selectedRowKeys={selectedIds}
                        onSelectChange={selectedIds=>this.setState({selectedIds})}
                        data={techList}
                        rowKey={'tech_order_id'}
                        onRow={record=>{
                            return {
                                onClick:e=>this.handleClickTr(record)
                            }
                        }}
                    ></Table>
                    <button className={style.sendBtn} disabled={!selectedIds.length} onClick={this.sendApply}>发送申请</button>
                </div>

            </div>
        )

    }
}