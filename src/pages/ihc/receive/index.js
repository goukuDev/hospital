import React, { useEffect, useState, useRef,useCallback } from 'react';
import styled from 'styled-components';
import style from './index.css';
import { DatePicker,Switch } from 'antd';
import Input from 'input';
import { CODE } from 'myConstants';
import Table from 'table';
import { api } from 'utils';
import Confirm from 'confirm';
import Message from 'message';
import Select from 'select';


const { RangePicker } = DatePicker;

const Container = styled.div`
    height: 100%;
    width: 100%;
    position: relative;
`;

const Header = styled.div`
    width: 100%;
    height: 54px;
    line-height: 54px;
    padding: 0 14px;
`;

const Title = styled.span`
    font-size: 18px;
    font-weight: 550;
    color: #323d4a;
    vertical-align: middle;

    img {
        vertical-align: middle;
        margin-right: 6px;
        margin-top: -4px;
    }
`;

const SearchBlock = styled.div`
    float: right;

    .title {
        font-size: 14px;
        color: rgb(98, 112, 124);
    }

    .ant-input {
        height: 34px;
    }

    & > span:last-child {
        margin: 0;
    }
`;


const CancelMergeButton = styled.span`
    display:inline-block;
    width:76px;
    height:24px;
    color:#fff;
    text-align:center;
    line-height:24px;
    background:rgba(35,153,241,1);
    border-radius:4px;
    cursor:pointer;
`


const Body = styled.div`
    padding: 0 14px;
`;

const Dot = styled.span`
    width: 12px;
    height: 12px;
    display: inline-block;
    border-radius: 50%;
    vertical-align: middle;
    margin-right: 4px;
    background: ${props => props.background};
`;

const Footer = styled.div`
    padding: 0 16px;
    display:flex;
    justify-content:space-between;
`;

const DistributionButton = styled.div`
    padding: 12px 0;
    position:relative;
`

const ButtonGroup = styled.div`
    padding: 12px 0;

    & > span:last-child {
        margin: 0;
    }
`;

const Button = styled.span`
    height: 34px;
    line-height: 34px;
    width:100px;
    text-align:center;
    background: ${props => (props.disabled ? '#cdd0cf' : '#2399F1')};
    color: white;
    display: inline-block;
    border-radius: 4px;
    margin: 0 10px 0 0;
    cursor: ${props=>(props.disabled? 'not-allowed' : 'pointer')};
`;

const StatisticalBar = styled.div`
    font-size: 14px;
    color: #333333;
    padding-left: 26px;

    .total {
        font-size: 18px;
        color: #2c2c2c;
        display: inline-block;
        margin-right: 16px;
    }

    .selected {
        font-size: 18px;
        color:#2399F1;
    }
`;

const DialogWrap = styled.div`
    width: 362px;
    height: 235px;
    box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.16);
    border-radius: 4px;
    position: absolute;
    bottom: 48px;
    z-index: 100;
    background: white;
    left: 12px;

    .dialogTitle {
        width: 100%;
        height: 42px;
        line-height: 42px;
        background: linear-gradient(
            180deg,
            rgba(43, 159, 246, 1) 0%,
            rgba(27, 146, 236, 1) 100%
        );
        display: inline-block;
        padding: 0 0 0 22px;
        color: white;
        font-size: 16px;
    }

    .dialogContent {
        height: calc(100% - 92px);
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .dialogBtns {
        width: 100%;
        height: 50px;
        padding: 7px 16px 0 16px;
        background: rgba(240, 243, 248, 1);
    }
    .cancel {
        width: 60px;
        height: 36px;
        border: 1px solid rgba(206, 208, 218, 1);
        background: linear-gradient(
            360deg,
            rgba(241, 243, 247, 1) 0%,
            rgba(255, 255, 255, 1) 100%
        );
        border-radius: 4px;
        color: #7383a1;
        font-size: 14px;
        display: inline-block;
        text-align: center;
        line-height: 36px;
        cursor: pointer;
    }
    .ok {
        width: 60px;
        height: 36px;
        background: linear-gradient(
            360deg,
            rgba(34, 152, 240, 1) 0%,
            rgba(79, 178, 252, 1) 100%
        );
        border-radius: 4px;
        color: white;
        font-size: 14px;
        text-align: center;
        line-height: 36px;
        cursor: pointer;
        float: right;
    }
`

var ipcRenderer = window.electron && window.electron.ipcRenderer;
var remote = window.electron && window.electron.remote;

export default function Index(props) {
    const [data, setData] = useState([]);
    const [selectedSliceIds, setSelectedSliceIds] = useState([]);
   
    const tableRef = useRef();

    const columns = [
        {
            title: '任务来源',
            dataIndex: 'source',
            width: 116,
            render:()=>'免疫组化',
        },
        {
            title: '免疫号',
            dataIndex: 'immu_num',
            width: 116
        },
        {
            title: '姓名',
            dataIndex: 'name',
            width: 116
        },
        {
            title: '切片号',
            dataIndex: 'slice_num',
            
        },
        {
            title: '蜡块号',
            dataIndex: 'paraffinNum',
            width:116,
        },

        {
            title: '标记物(克隆号)',
            dataIndex: 'markerClone',
            width: 180,
            filters:[],
        },
        {
            title: '对照',
            dataIndex: 'contrast_status',
            width: 116,
            render:(text,record)=>(
                <Switch 
                    onChange={(checked,e)=>handleContrastChange(record.slice_id)}
                    onClick={(checked,e)=>e.stopPropagation()} 
                    checkedChildren="是" 
                    unCheckedChildren="否"
                    checked={text === 1} 
                />
            )
            
        },
        {
            title: '状态',
            dataIndex: 'status',
            width: 100,
            render: value => (
                <>
                    <Dot background={{
                        0: '#BFCCD9',
                        1: '#F4BB00',
                        2: '#6FC831',
                        3: '#5D6CB2',
                        4: '#D25BF5',
                        5: '#6FC831'
                    }[value]} />
                    {{
                        0: '预申请',
                        1: '待接收',
                        2: '已接收',
                        3: '已切片',
                        4: '已染色',
                    }[value]}
                </>
            ),
            filters:[
                {text:'待接收',value:1},
                {text:'已接收',value:2}
            ]
        },

        {
            title: '申请医生',
            dataIndex: 'apply_tech',
            width: 116
        },
        {
            title: '申请时间',
            dataIndex: 'apply_time',
            width: 180
        },
        {
            title: '备注',
            dataIndex: 'comment',
            width: 120
        },
        {
            title: '设备型号',
            dataIndex: 'equip_model',
            width: 116,
            filters:[],
            render:(text,record)=>`${text? record.equip_brand+' '+text :''}`
        },
        {
            title: '接收技师',
            dataIndex: 'receive_tech',
            width: 116
        },
        {
            title: '接收时间',
            dataIndex: 'receive_time',
            width: 180
        },
        {
            title: '操作',
            fixed: 'right',
            dataIndex: 'option',
            width: 130,
            render: (value, record) => {
                return (
                    <>
                        {
                            record.canDisperse?
                            <CancelMergeButton onClick={e=>{e.stopPropagation(); CancelMerge(record.slice_id)}}>取消合并</CancelMergeButton> : ''
                        }
                    </>
                );
            }
        }
    ];

    /****************************************************** api *****************************************************/
    const [searchWords,setSearchWords] = useState('');
    const [showDialog, setShowDialog] = useState(false);
    const [immunoNum,setImmunoNum] = useState('');
    const [equip,setEquip] = useState(null);

    const [facilities,setFacilities] = useState([]);

    const [total,setTotal] = useState(0);
    const [unfinished,setUnfinished] = useState(0);

    const pageNum = useRef(1);
    const pageLength = useRef(20);

    const applyFilters = useRef({});
    const applySort = useRef({key:'apply_time',value:1});


    const getSlices = ({pageNum,pageSize,filters,sort}) => {
        api(`immuno/get_slices?pageNum=${pageNum}&pageSize=${pageSize}`,
        {
            filters:JSON.stringify(filters),
            sort_key:sort.key,
            sort_value:sort.value
        })
        .then(({ data, code }) => {
            if (code === CODE.SUCCESS) {
                setTotal(data.total);
                setUnfinished(data.unfinished);
                let temp = data.result.map(o=>{
                    o.markerClone = `${o.marker_name}${o.marker_clone_num?'('+o.marker_clone_num+')':''}`;
                    o.paraffinNum = o.samples.map(s=>s.sample_num).join(',');
                    o.canDisperse = o.samples.length !== 1;
                    return o;
                })
                setData(temp);
            }
        });
    };



    // const updateSliceStatus = ids => {
    //     api('molecule/alter_slice_print_status',{apply_ids:JSON.stringify(ids)})
    //     .then(({code,data,message})=>{
    //         if(code !== CODE.SUCCESS)Message.error(message);
    //         else console.log('打印成功')
    //     })
    // }

    const handleContrastChange = id => {
        api('immuno/alter_slice_contrast_status',{slices_id:JSON.stringify([id])})
        .then(({code})=>{
            if(code === CODE.SUCCESS){
                let temp = data.map(o=>{
                    if(o.slice_id === id){
                        o.contrast_status = o.contrast_status? 0:1;
                    }
                    return o;
                })
                setData(temp);
            }
        })
    }

    const getImmuneNum = () => {
        if(!selectedSliceIds.length)return;
        api('immuno/get_immu_num')
        .then(({code,data}) => {
            if(code === CODE.SUCCESS) {
                setImmunoNum(data);
                setShowDialog(true)
            }
        })
    }

    const distributeImmuneNum = () => {
        api('immuno/assign_immu_num',{slices_id:JSON.stringify(selectedSliceIds),immune_num:immunoNum})
        .then(({code,data})=>{
            if(code === CODE.SUCCESS){
                let param = {
                    pageNum:pageNum.current,
                    pageSize:pageLength.current,
                    filters:applyFilters.current,
                    sort:applySort.current,
                }
                getSlices(param);
                setShowDialog(false)
            }else{
                Message.error('分配免疫号失败')
            }
        })
    }

    const distributeEquip = () => {
        api('immuno/assign_equip',{slices_id:JSON.stringify(selectedSliceIds),equip_id:equip})
        .then(({code,data})=>{
            if(code === CODE.SUCCESS){
                setEquip(null);
                let param = {
                    pageNum:pageNum.current,
                    pageSize:pageLength.current,
                    filters:applyFilters.current,
                    sort:applySort.current,
                }
                getSlices(param);
            }else{
                Message.error('分配设备失败')
            }
        })
    }

    const getFacilties = useCallback(
        () => {
            api('mpf_manage/get_facilities',{filter:JSON.stringify([1]),type:1})
            .then(({code,data})=>{
                if(code === CODE.SUCCESS){
                    let temp = [];
                    data.forEach(f=>{
                        for(let key in f.models){
                            temp = temp.concat([{title:`${f.brand} ${f.models[key]}`,value:key}])
                        }
                    })
                    setFacilities(temp);
                }
            })
        }
    ,[setFacilities])

    const CancelMerge = id => {
        Confirm({
            content:'是否取消合并？',
            onOk:()=>{
                api('immuno/unmerge_slice',{slices_id:JSON.stringify([id])})
                .then(({code,data})=>{
                    if(code === CODE.SUCCESS){
                        let param = {
                            pageNum:pageNum.current,
                            pageSize:pageLength.current,
                            filters:applyFilters.current,
                            sort:applySort.current,
                        }
                        getSlices(param);
                    }else{
                        Message.error('取消合并失败');
                    }
                })
            }
        })
    }

    const mergeSlice = () => {
        let flag = data.filter(o=>selectedSliceIds.includes(o.slice_id)).map(o=>o.markerClone);
        flag = [...new Set(flag)].length === 1;
        if(flag && selectedSliceIds.length > 1){
            Confirm({
                content:'所选蜡块是否合并为这一张蜡块？',
                onOk:()=>{
                    api('immuno/merge_slice',{slices_id:JSON.stringify(selectedSliceIds)})
                    .then(({code,data,message})=>{
                        if(code === CODE.SUCCESS){
                            let param = {
                                pageNum:pageNum.current,
                                pageSize:pageLength.current,
                                filters:applyFilters.current,
                                sort:applySort.current,
                            }
                            getSlices(param);
                            setSelectedSliceIds([])
                        }else{
                            Message.error(message);
                        }
                    })
                }
            })
        }else{
            Message.info('请选择2张以上相同标记物合并')
        }

    }

    const handleSend = () => {
        if (selectedSliceIds.length) {
            api('immuno/alter_slice_status',{slices_id:JSON.stringify(selectedSliceIds),status:2})
            .then(({code,data})=>{
                if(code === CODE.SUCCESS){
                    let param = {
                        pageNum:pageNum.current,
                        pageSize:pageLength.current,
                        filters:applyFilters.current,
                        sort:applySort.current,
                    }
                    getSlices(param);
                    setSelectedSliceIds([]);
                }
            })
        } else {
            Message.error('未勾选切片');
        }
    };

    useEffect(() => {
        applyFilters.current.status = [1,2];
        let param = {
            pageNum:pageNum.current,
            pageSize:pageLength.current,
            filters:applyFilters.current,
            sort:applySort.current,
        }
        getSlices(param);
        getFacilties();
    }, [getFacilties]);

    /******************************************************* methods *******************************************************/

    

    const handleSearch = () => {
        // applyFilters.current.status = !searchWords.trim()? [1,2]:undefined;
        applyFilters.current.immu_num = searchWords.trim()?searchWords.trim():undefined;
        pageNum.current = 1;
        let param = {
            pageNum:pageNum.current,
            pageSize:pageLength.current,
            filters:applyFilters.current,
            sort:applySort.current,
        }
        getSlices(param);
        tableRef.current.jumpToFirstPage();
    };

    const handleTableChange = (pagination,filter,sorter) =>{
        let {current,pageSize} = pagination;
        pageNum.current = current;
        pageLength.current = pageSize;
        let tmpObj = Object.assign({},filter);
        tmpObj.status = tmpObj.status && tmpObj.status.length ? tmpObj.status : [1,2];
        applyFilters.current = Object.assign(applyFilters.current,tmpObj);

        let param = {
            pageNum:pageNum.current,
            pageSize:pageLength.current,
            filters:applyFilters.current,
            sort:applySort.current,
        }
        getSlices(param);

    }

    const handleRangeChange = (dates,range) => {
        let beginTime = range[0];
        let endTime = range[1];
        if(dates.length){
            beginTime += ' 00:00:00';
            endTime += ' 23:59:59';
            applyFilters.current.apply_time = [beginTime,endTime]
        }else{
            applyFilters.current.apply_time = undefined;
        }
    }

    /********************************************************** table *******************************************************/

    const renderTable = () => {
        // if (!data.length) return null;

        const handleSelectChange = record => {
            if(selectedSliceIds.includes(record.slice_id)){
                setSelectedSliceIds(selectedSliceIds.filter(o=>o !== record.slice_id))
            }else{
                setSelectedSliceIds(selectedSliceIds.concat([record.slice_id]))
            }
        };
        

        return (
            <Table
                ref={tableRef}
                columns={columns}
                data={data}
                total={total}
                showPagination={true}
                rowKey={'slice_id'}
                
                onChange={handleTableChange}
               
                indentSize={12}
                onRow={record => ({
                    onClick: event => {
                        handleSelectChange(record);
                    }
                })}
                selectedRowKeys={selectedSliceIds}
                onSelectChange={ids=>setSelectedSliceIds(ids)}
                renderStatisticalBar={() => {
                    return (
                        <StatisticalBar>
                            切片数总计{' '}
                            <span className='total'>{total}</span>
                            未接收数量
                            <span className='total'>{unfinished}</span>
                            已勾选{' '}
                            <span className='selected'>{selectedSliceIds.length}</span>
                        </StatisticalBar>
                    );
                }}
                scroll={{ x: 2000, y: 375}}
            />
        );
    };
    
    
    // -------------------------------------------- 打印 -------------------------------------------------------------
    const printCode = () => {
        if(!remote && !ipcRenderer)return;
        let codeFlag = remote.getGlobal('sharedObject').printMoleculeLabelStatus;
        if(codeFlag)return;
                 
        // updateSliceStatus(selectedSliceIds);

    };
 
    const printApply = () => {
        if(!remote && !ipcRenderer)return;
        
        let applyFlag = remote.getGlobal('sharedObject').printMoleculeApplicationStatus;

        if(applyFlag)return;

        if(!selectedSliceIds.length){
            Message.info('无内容可打印')
            return;
        }

        remote.getGlobal('sharedObject').moleculeApplication = selectedSliceIds;

        const params = {
            message_type: 'moleculeApplicationPre',
            content: 'template/molecular/apply.html'
        };

        ipcRenderer.send('print', params);
    };

    // ----------------------------------- render ----------------------------------------------

    return (
        <div className={style.outer}>
            <Container>
                <Header>
                    <Title>
                        <img src={require('@images/list.svg')} alt='' />
                        IHC接收列表
                    </Title>
                    <SearchBlock>
                        <span style={{fontSize:'16px',color:'rgb(98, 112, 124)'}}>申请日期：</span>
                        <RangePicker
                            onChange={handleRangeChange}
                        />
                        <Input
                            label={'免疫号：'}
                            lineFeed={false}
                            labelStyle={{ fontSize: '14px' }}
                            inputStyle={{ width: '188px', height: '34px' }}
                            containerStyle={{ margin: '0 10px 0 18px', color: '#2E3134' }}
                            value={searchWords}
                            onChange={e => setSearchWords(e.target.value)}
                            onKeyDown={e => e.keyCode === 13 && handleSearch()}
                        />
                        <Button style={{width:'80px',fontWeight:'600'}} onClick={e => handleSearch()}>查询</Button>
                    </SearchBlock>
                </Header>
                <Body>{renderTable()}</Body>
                <Footer>
                    <DistributionButton>
                        <Button
                        disabled={!selectedSliceIds.length}
                        onClick={getImmuneNum}
                        >分配免疫号</Button>
                        <Select
                            label={"分配设备："}
                            lineFeed={false}
                            options={facilities}
                            selectStyle={{width:'156px',marginRight:'10px'}}
                            value={equip}
                            onChange={value=>setEquip(value)}
                        ></Select>
                        <Button disabled={!selectedSliceIds.length || !equip} onClick={distributeEquip}>分配设备</Button>
                        {
                            showDialog && 
                            <DialogWrap>
                                <div className='dialogTitle'>分配免疫号</div>
                                <div className='dialogContent'>
                                    <Input
                                        label='免疫号：'
                                        lineFeed={false}
                                        value={immunoNum}
                                        onChange={e => setImmunoNum(e.target.value)}
                                        inputStyle={{ width: '263px' }}
                                    />
                                </div>
                                <div className='dialogBtns'>
                                    <span
                                        className='cancel'
                                        onClick={e => setShowDialog(false)}
                                    >
                                        取消
                                    </span>
                                    <span className='ok' onClick={distributeImmuneNum}>
                                        确定
                                    </span>
                                </div>
                            </DialogWrap>
                        }
                    </DistributionButton>
                    <ButtonGroup>
                        <Button onClick={mergeSlice}>合并</Button>
                        <Button onClick={printCode}>打印标签</Button>
                        <Button onClick={printApply}>打印工作单</Button>
                        <Button 
                            style={{width:'143px'}}
                        >
                            打印标本使用记录
                        </Button>
                        <Button
                            onClick={handleSend}
                        >
                            发送至切片
                        </Button>
                    </ButtonGroup>
                </Footer>

            </Container>
        </div>
        
    );
}
