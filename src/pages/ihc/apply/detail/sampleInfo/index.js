import React, {useState,useEffect,useRef} from 'react';
import Input from 'input';
import Select from 'select';
import Panel from 'panel';
import style from './index.css';
import Table from 'table';
import { api, } from 'utils';
import {CODE} from 'myConstants';
import Confirm from 'confirm';
import EventBus from 'eventBus';

const sampleSourceOptions = [
    {value:0,title:'本院'},
    {value:1,title:'外院'},
    {value:2,title:'会诊'},
]
const sampleTypeOptions = [
    {value:0,title:'蜡块'},
]

export default function Index(props){
    const columns = [
        {
            title: '样本来源',
            dataIndex: 'sample_source',
            render:text=>({0:'本院',1:'外院',2:'会诊'}[text])
        },
        {
            title: '标本类型',
            dataIndex: 'sample_type',
            render:text=>({0:'蜡块'}[text])
        },
        {
            title: '病理号',
            dataIndex: 'sample_pathnum',
        },
        {
            title: '蜡块号',
            dataIndex: 'sample_num',
        },
        {
            title: '操作',
            dataIndex: 'action',
            render:(text,record)=>
                (   
                    <React.Fragment>
                        <span className={style['btn-table']} onClick={e=>handleDeleteSample(record.sample_id)}>
                        删除
                        </span>
                    </React.Fragment>
                )
            
        },
    ].map(o=>{o.width = 192;return o})

    const [source,setSource] = useState(0);
    const [type,setType] = useState(0);
    const [pathnum,setPathnum] = useState('');
    const [paraffinNum,setParaffinNum] = useState('');

    const applyId = useRef(props.applyId);

    const { saveAction } = props;

    const [samples,setSamples] = useState([]);

    // --------------------------------------- api ----------------------------------

    const getSamples = (applyId)=>{
            if(!applyId)return;
            api('immuno/get_application_samples',{apply_id:applyId})
            .then(({code,data})=>{
                if(code === CODE.SUCCESS){
                    setSamples(data);
                    window.sampleLength = data.length;
                }
            })
        }

    const deleteSample = (sampleId) => {
        return new Promise(resolve=>{
            api('immuno/delete_application_sample',{sample_id:sampleId})
            .then(({code,data})=>{
                if(code === CODE.SUCCESS){
                    getSamples(applyId.current); 
                    resolve();
                }
            })
        })
    }

    const addSample = id => {
        return new Promise(resolve=>{
            let data = {
                apply_id: id,
                sample_source: source,
                sample_type: type,
                sample_pathnum: pathnum.trim(),
                sample_num: paraffinNum.trim(),
            }
            api('immuno/add_application_sample',data)
            .then(({code,data}) => {
                if(code === CODE.SUCCESS){
                    getSamples(applyId.current);
                    setParaffinNum('');
                    resolve();
                }
            })
        })
    }

    useEffect(()=>{
        getSamples(applyId.current);
    },[])

    // ---------------------------------- methods -------------------------------

    const handleDeleteSample = sampleId => {
        if(window.applyLength){
            Confirm({
                content:'将清空该患者的申请列表，是否确认删除标本？',
                onOk:async ()=>{
                    await deleteSample(sampleId);
                    EventBus.emit('deleteApply')
                }
            })
        }else{
            deleteSample(sampleId)
        }
    }

    const addSampleNext = id => {
        if(samples.length && window.applyLength){
            Confirm({
                content:'将清空该患者的申请列表，是否确认新增标本？',
                onOk:async ()=>{
                    await addSample(id);
                    EventBus.emit('deleteApply');
                }
            })
        }else{
            addSample(id);
        }
    }

    const handleAddSample = async () => {
        if(!pathnum.trim() || !paraffinNum.trim())return;
        !applyId.current && (applyId.current = await saveAction(0,'noClose'));
        addSampleNext(applyId.current);
    }

    // ----------------------------- AddSample module ----------------------------

    const AddSample = () =>{
    
        const labelStyle={color:'#434343'}
    
        return (
            <div>
                <Select
                    label={'标本来源：'}
                    value={source}
                    onChange={value=>setSource(value)}
                    lineFeed={false}
                    labelStyle={labelStyle}
                    containerStyle={{width:'22%',marginRight:'8px'}}
                    selectStyle={{width:'calc(100% - 75px)'}}
                    options={sampleSourceOptions}
                ></Select>
                <Select
                    label={'标本类型：'}
                    value={type}
                    onChange={value=>setType(value)}
                    lineFeed={false}
                    labelStyle={labelStyle}
                    containerStyle={{width:'22%',marginRight:'8px'}}
                    selectStyle={{width:'calc(100% - 75px)'}}
                    options={sampleTypeOptions}
                ></Select>
                <Input
                    label={'病理号：'}
                    value={pathnum}
                    onChange={e=>setPathnum(e.target.value)}
                    lineFeed={false}
                    labelStyle={labelStyle}
                    containerStyle={{width:'21%',marginRight:'8px'}}
                    inputStyle={{width:'calc(100% - 70px)'}}
                    required={true}
                ></Input>
                <Input
                    label={'蜡块号：'}
                    value={paraffinNum}
                    onChange={e=>setParaffinNum(e.target.value)}
                    lineFeed={false}
                    labelStyle={labelStyle}
                    containerStyle={{width:'21%'}}
                    inputStyle={{width:'calc(100% - 70px)'}}
                    required={true}
                ></Input>
    
                <span className={`${style.addBtn} ${!pathnum.trim() || !paraffinNum.trim()? style.addBtnDisabled:''}`} onClick={handleAddSample}>新增</span>
            </div>
        )
    }

    // ---------------------------------------- render -----------------------------------------------
    
    return (
        <Panel 
            title={'标本信息'}
        >
            <div className={style.box}>
                {AddSample()} 
                    {
                        !!samples.length && 
                        <div style={{marginTop:'13px'}}>
                            <Table
                                data={samples}
                                columns={columns}
                                rowKey={'sample_id'}
                            ></Table>
                        </div>
                    }
            </div>


        </Panel>
    )
}