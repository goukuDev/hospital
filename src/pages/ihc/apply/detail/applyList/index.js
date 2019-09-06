import React ,{useEffect,useState,useCallback} from 'react';
import style from './index.css';
import Table from 'table';
import EventBus from 'eventBus';
import {CODE} from 'myConstants';
import {api} from 'utils';
import Message from 'message';

const ihcState = {
    0 : '预申请',
    1 : '已申请',
    2 : '已接收',
    3 : '已切片',
    4 : '已染色',
}

export default function Index(props){

    const columns = [
        {
            title: '医嘱类别',
            width: 130,
            dataIndex: 'type',
            render:text=>('免疫组化')
        },
        {
            title: '切片号',
            width: 130,
            dataIndex: 'slice_num'
        },
        {
            title: '病理号',
            width: 130,
            dataIndex: 'samplePathnum'
        },
        {
            title: '蜡块号',
            width: 100,
            dataIndex: 'paraffinNum'
        },
        {
            title: '标记物（克隆号）',
            width: 180,
            dataIndex: 'markerClone'
        },
        {
            title: '备注',
            dataIndex: 'comment'
        },
        {
            title: '预申请医生',
            width: 130,
            dataIndex: 'pre_apply_tech'
        },
        {
            title: '复核医生',
            width: 120,
            dataIndex: 'apply_tech'
        },
        {
            title: '申请时间',
            width: 130,
            dataIndex: 'apply_time'
        },
        {
            title: '执行状态',
            width: 120,
            dataIndex: 'status',
            render:text=>(
                <React.Fragment>
                    <i className={style.state} style={{backgroundColor: {0: '#2399F1', 1: '#F4BB00',2:'#ACAEB5',3:'#6FC831'}[text]}} />
                    {ihcState[text]}
                </React.Fragment>
            )
        },
        {
            title: '执行人',
            width: 120,
            dataIndex: 'execute_tech'
        },
        {
            title: '执行时间',
            width: 130,
            dataIndex: 'execute_time'
        },
        {
            title: '操作',
            width: 180,
            dataIndex: 'action',
            fixed:'right',
            render:(text,record)=>{
                return (
                    <>
                        <button 
                            className={style.tableButton} 
                            disabled={record.status !== 0} 
                            style={{background:'#F25B24',marginRight:'7px'}}
                            onClick={e=>{e.stopPropagation();deleteSlices([record.slice_id])}}
                        >删除</button>
                        {record.canDisperse?
                            <button className={style.tableButton} onClick={e=>{e.stopPropagation();cancelMerge(record.slice_id)}}>取消合并</button> :
                            ''
                        }
                    </>
                )
            }
        },
    ]

    const {applyId,} = props;
    const [slices,setSlices] = useState([]);
    const [selectedSlices,setSelectedSlices] = useState([]);

    // ---------------------------- api --------------------------------

    const getSlices = useCallback(
        () => {
            if(!applyId)return;
            api('immuno/get_application_slices',{apply_id:applyId})
            .then(({code,data})=>{
                if(code === CODE.SUCCESS){
                    let temp = data.map(o=>{
                        o.markerClone = `${o.marker_name}${o.marker_clone_num?'('+o.marker_clone_num+')':''}`;
                        o.samplePathnum = [...new Set(o.samples.map(s=>s.sample_pathnum))].join(',');
                        o.paraffinNum = o.samples.map(s=>s.sample_num).join(',');
                        o.canDisperse = o.samples.length !== 1;
                        return o;
                    })
                    
                    setSlices(temp);
                    window.applyLength = temp.length;
                }
            })
        }
    ,[applyId])

    const cancelMerge = id => {
        api('immuno/unmerge_slice',{slices_id:JSON.stringify([id])})
        .then(({code,data})=>{
            code === CODE.SUCCESS && getSlices()
        })
    }

    const deleteSlices = ids => {
        api('immuno/delete_application_slice',{slices_id:JSON.stringify(ids)})
        .then(({code,data})=>{
            code === CODE.SUCCESS && getSlices();
        })
    }

    const mergeSlice = () => {
        let canMerge = slices.filter(o=>selectedSlices.includes(o.slice_id)).map(o=>o.marker_name);
        canMerge = [...new Set(canMerge)].length === 1;
        if(!canMerge){
            Message.info('请选择相同标记物合并');
            return;
        }
        api('immuno/merge_slice',{slices_id:JSON.stringify(selectedSlices)})
        .then(({code,data})=>{
            if(code === CODE.SUCCESS){
                getSlices();
                setSelectedSlices([]);
            }
        })
    }

    useEffect(()=>{
        getSlices();
    },[getSlices])

    // ------------------------ method --------------------------------

    EventBus.addListener('addApply',()=>{
        console.log('listener~')
        getSlices();
    })

    EventBus.addListener('deleteApply',()=>{
        console.log('delete')
        let ids = slices.map(({slice_id})=>slice_id)
        deleteSlices(ids);
    })

    const handleSelectChange = record => {
        if(selectedSlices.includes(record.slice_id)){
            setSelectedSlices(selectedSlices.filter(o=>o !== record.slice_id));
        }else{
            setSelectedSlices(selectedSlices.concat([record.slice_id]));
        }
    };

    // ------------------------- render -------------------------
    return (
        <div className={style.outer}>
            <p className={style.title}>申请列表</p>
            <Table
                data={slices}
                rowKey={'slice_id'}
                columns={columns}
                scroll={{ x: 1750,}}
                selectedRowKeys={selectedSlices}
                onSelectChange={ids=>setSelectedSlices(ids)}
                onRow={record => ({
                    onClick: event => {
                        handleSelectChange(record);
                    }
                })}
            ></Table>
            <div className={style.btnBox}>
                <button className={style.btn} disabled={selectedSlices.length < 2} onClick={mergeSlice}>合并</button>
            </div>
        </div>
    )
}