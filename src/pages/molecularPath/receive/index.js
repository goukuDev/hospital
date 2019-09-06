import { DatePicker } from 'antd';
import Input from 'input';
import { CODE } from 'myConstants';
import React, { useEffect, useState, useRef } from 'react';
import styled from 'styled-components';
import Table from 'table';
import { api } from 'utils';
import EditPop from './editPop';
import ParaffinPop from './paraffinPop';
import TagPop from './tagPop';
import Confirm from 'confirm';
import Message from 'message';

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

const EditButton = styled.span`
    width: 44px;
    height: 24px;
    line-height: 24px;
    background: rgba(11, 148, 252, 1);
    border-radius: 4px;
    font-size: 14px;
    color: white;
    display: inline-block;
    text-align: center;
    cursor: pointer;
`;

const DeleteButton = styled(EditButton)`
    background: ${props => (props.disabled ? '#cdd0cf' : '#f25b24')};
    margin: 0 0 0 6px;
`;


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
`;

const ButtonGroup = styled.div`
    padding: 12px 0;
    text-align: right;

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
    cursor: pointer;
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

var ipcRenderer = window.electron && window.electron.ipcRenderer;
var remote = window.electron && window.electron.remote;

export default function Index(props) {
    const [data, setData] = useState([]);
    const [selectedApplyIds, setSelectedApplyIds] = useState([]);
   
    const [showEditPop, setShowEditPop] = useState(false);
    const [showParaffinPop, setShowParaffinPop] = useState(false);
    const [showCustomTag, setShowCustomTag] = useState(false);
    const regionData = useRef();
    const applyData = useRef();
    const filterTestNames = useRef([]);

    const tableRef = useRef();

    

    const columns = [
        {
            title: '姓名',
            dataIndex: 'name',
            width: 150
        },
        {
            title: '病理号',
            dataIndex: 'original_pathnum',
            width: 120
        },
        {
            title: '蜡块号/标本号',
            dataIndex: 'paraffinNum',
            width: 150
        },
        {
            title: '分子病理号',
            dataIndex: 'molecule_pathnum',
            width: 150
        },
        {
            title: 'DNA同分子号',
            dataIndex: 'reuse_molecule_pathnum',
            width: 160
        },
        {
            title: '检测项目',
            dataIndex: 'testsName',
            filters: filterTestNames.current.map(value=>({value,text:value}))
        },

        {
            title: '标本来源',
            dataIndex: 'sampleSource',
            width: 120,
        },
        {
            title: '标本类型',
            dataIndex: 'sampleType',
            width: 120,
        },
        {
            title: '申请人',
            dataIndex: 'apply_tech',
            width: 140
        },

        {
            title: '申请时间',
            dataIndex: 'apply_time',
            width: 200
        },
        {
            title: '状态',
            dataIndex: 'status',
            width: 100,
            filters: [
                { text: '未接收', value: 1 },
                { text: '已接收', value: 2 }
            ],
            render: value => (
                <>
                    <Dot background={{
                        0: '#BFCCD9',
                        1: '#87A1F8',
                        2: '#F4B354',
                        3: '#5D6CB2',
                        4: '#D25BF5',
                        5: '#6FC831'
                    }[value]} />
                    {{
                        0: '已登记',
                        1: '未接收',
                        2: '已接收',
                        3: '已切片',
                        4: '已取片',
                        5: '已质控'
                    }[value]}
                </>
            )
        },
        {
            title: '接收人',
            dataIndex: 'receive_tech',
            width: 140
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
                        
                        <EditButton
                            onClick={e => handleEditClick(e, record)}
                        >
                            编辑
                        </EditButton>
                        <DeleteButton
                            // disabled={canDelete}
                            onClick={e => {
                                e.stopPropagation();
                                handleDeleteClick(e, record);
                            }}
                        >
                            删除
                        </DeleteButton>
                    </>
                );
            }
        }
    ];

    /************************ api ************************/
    const [searchWords,setSearchWords] = useState('');

    const [total,setTotal] = useState(0);

    const pageNum = useRef(1);
    const pageLength = useRef(20);

    const applySort = useRef({sortKey:'apply_time',sortValue:1})
    const applyFilters = useRef({})



    const deleteApply = params => {
        api('molecule/delete_application', params).then(({ code, data }) => {
            if (code === CODE.SUCCESS) {
                let isLast = ((total % pageLength.current) === 1) && (pageNum.current === Math.ceil(total / pageLength.current));
                pageNum.current = isLast && pageNum.current !== 1? (pageNum.current - 1) : pageNum.current;
                Message.info('删除成功！');
                let param = {
                    pageNum:pageNum.current,
                    pageSize:pageLength.current,
                    filters:applyFilters.current,
                    sort:applySort.current,
                }
                getApplies(param);
            }
        });
    };

    const getApplies = ({pageNum,pageSize,filters,sort}) => {
        const {startTime,endTime,moleculePathnum,tests,status} = filters;
        const {sortKey,sortValue} = sort;
        api(`molecule/get_applications?pageNum=${pageNum}&pageSize=${pageSize}`,
            {
                apply_start_time:startTime,
                apply_end_time: endTime,
                molecule_pathnum: moleculePathnum,
                test: JSON.stringify(tests),
                status:JSON.stringify(status),
                sort_key:sortKey,
                sort_value:sortValue
            }
        ).then(({ data, code }) => {
            if (code === CODE.SUCCESS) {
                setTotal(data.total)
                
                // 合集
                let temp = data.result.map(o=>{
                    
                    o.paraffinNum = o.samples.filter(a=>!!a.sample_num).map(a=>a.sample_num).join(',');
                    o.sampleSource= [...new Set(o.samples.map(a=>({ 0: '本院', 1: '外院', 2: '会诊' }[a.sample_source])))].join(',');
                    o.sampleType = [...new Set(o.samples.map(a=>({
                        0: '蜡块',
                        1: '蜡块，外周血',
                        2: '白片',
                        3: '胸水',
                        4: 'DNA',
                        5: '外周血',
                        6: '腹水',
                        7: '血浆',
                        8: '血清',
                        9: '骨髓',
                        10: '其他'
                    }[a.sample_type])))].join(',');
                    o.testsName = o.tests.map(a=>a.test_name).join(',')

                    return o;
                })
                regionData.current = temp;

                setData(temp);
            }
        });
    };

    const getFilterTestNames = () => {
        api('molecule/get_app_rest')
        .then(({code,data})=>{
            if(code === CODE.SUCCESS){
                filterTestNames.current = data.test_name;
            }
        })
    }

    const sendApplyToNext = params => {
        api('molecule/alter_app_receive_status', params).then(
            ({ code, data }) => {
                if (code === CODE.SUCCESS) {
                    Message.info('确认成功!');
                    setSelectedApplyIds([]);
                    let param = {
                        pageNum:pageNum.current,
                        pageSize:pageLength.current,
                        filters:applyFilters.current,
                        sort:applySort.current,
                    }
                    getApplies(param);
                }
            }
        );
    };

    const getSlices = (ids)=>{
        return new Promise(resolve=>{
            api('molecule/get_slices', { apply_ids:JSON.stringify(ids) }).then(({ code, data })=>(code === CODE.SUCCESS && resolve(data)));})
    }

    const updateSliceStatus = (ids) => {
        api('molecule/alter_slice_print_status',{apply_ids:JSON.stringify(ids)})
        .then(({code,data,message})=>{
            if(code !== CODE.SUCCESS)Message.error(message);
            else console.log('打印成功')
        })
    }

    /************************ handler ************************/

    const handleEditClick = (e, record) => {
        e.stopPropagation();
        setShowEditPop(true);
        applyData.current = record;
    };

    const handleDeleteClick = (e, record) => {
        Confirm({
            content: '确认删除该申请？',
            onOk: e => {
                const params = { apply_ids: JSON.stringify([record.apply_id]) }
                deleteApply(params);
            }
        });
    };

    const handleConfirmReceive = () => {
        let temp = data.filter(o=>selectedApplyIds.includes(o.apply_id));
        if (selectedApplyIds.length ) {
            // 判断选中项目是否都填了分子病理号，没有则不让确认
            const canSave = temp.every(o => !!o.molecule_pathnum);

            if (canSave) {
                sendApplyToNext({ apply_ids: JSON.stringify(selectedApplyIds) });
            } else {
                Message.info('请先填写分子病理号!');
            }
        } else {
            Message.info('请选择未接收申请项目!');
        }
    };

    const handleSearch = () => {
        applyFilters.current.status = !searchWords.trim()? [1,2]:undefined;
        applyFilters.current.moleculePathnum = searchWords.trim();
        pageNum.current = 1;
        let param = {
            pageNum:pageNum.current,
            pageSize:pageLength.current,
            filters:applyFilters.current,
            sort:applySort.current,
        }
        getApplies(param);
        tableRef.current.jumpToFirstPage();
    };

    useEffect(() => {
        applyFilters.current.status = [1,2];
        let param = {
            pageNum:pageNum.current,
            pageSize:pageLength.current,
            filters:applyFilters.current,
            sort:applySort.current,
        }
        getApplies(param);
        getFilterTestNames();
    }, []);

    const handleTableChange = (pagination,filter,sorter) =>{
        let {current,pageSize} = pagination;
        let {testsName,status} = filter;
        
        pageNum.current = current;
        pageLength.current = pageSize;
        applyFilters.current.tests = testsName || []
        applyFilters.current.status = status && status.length ? status:[1,2];

        let param = {
            pageNum:pageNum.current,
            pageSize:pageLength.current,
            filters:applyFilters.current,
            sort:applySort.current,
        }
        getApplies(param);

    }

    const handleRangeChange = (dates,range) => {
        let beginTime = range[0];
        let endTime = range[1];
        if(dates.length){
            beginTime += ' 00:00:00';
             endTime += ' 23:59:59';
        }
        
        applyFilters.current.startTime = beginTime;
        applyFilters.current.endTime = endTime;
    }

    /************************ table ************************/

    const renderTable = () => {
        // if (!data.length) return null;

        const handleSelectChange = record => {
            if(selectedApplyIds.includes(record.apply_id)){
                setSelectedApplyIds(selectedApplyIds.filter(o=>o !== record.apply_id))
            }else{
                setSelectedApplyIds(selectedApplyIds.concat([record.apply_id]))
            }
        };
        

        return (
            <Table
                ref={tableRef}
                columns={columns}
                data={data}
                total={total}
                showPagination={true}
                rowKey={'apply_id'}
                
                onChange={handleTableChange}
               
                indentSize={12}
                onRow={record => ({
                    onClick: event => {
                        handleSelectChange(record);
                    }
                })}
                selectedRowKeys={selectedApplyIds}
                onSelectChange={ids=>setSelectedApplyIds(ids)}
                renderStatisticalBar={() => {
                    return (
                        <StatisticalBar>
                            总计{' '}
                            <span className='total'>{total}</span>
                            已勾选{' '}
                            <span className='selected'>{selectedApplyIds.length}</span>
                        </StatisticalBar>
                    );
                }}
                scroll={{ x: 2085, y: 375}}
            />
        );
    };
    
    // -------------------------------------------- 打印 -------------------------------------------------------------
    const printCode = () => {
        // 判断是否在electron环境中
        if(!remote && !ipcRenderer)return;
        // 逐条打印
        let codeFlag = remote.getGlobal('sharedObject').printMoleculeLabelStatus;
        if(codeFlag)return;
        
        // 拼接数据
        let samples = [];
        let result = [];            
        getSlices(selectedApplyIds)
        .then(res=>{
            res.forEach(o=>{samples = samples.concat(o.samples.map(s=>{s.moleculePathnum = o.molecule_pathnum;return s}))});
            
            samples.forEach(item => {
                item.slices.forEach(child => {
                    result = result.concat([
                        {
                            moleculePathnum: item.moleculePathnum,
                            resueMoleculePathnum: null,
                            samplePathnum: item.sample_pathnum,
                            paraffinNum: item.sample_num,
                            tagType: child.tag_type
                        }
                    ]);
                });
            });
            if(!result.length){
                Message.info('无内容可打印')
                return;
            }
    
            // 发送数据
            remote.getGlobal('sharedObject').moleculeLabel = result;


            // 通知electron打开HTML生成带数据的HTML
            let params = {
                message_type: 'moleculeLabelPre',
                content: 'template/molecular/barcode.html',
            }
            ipcRenderer.send('print', params);

            // 改变标签打印状态
    
            updateSliceStatus(selectedApplyIds);

        })
        


    };
 
    const printApply = () => {
        if(!remote && !ipcRenderer)return;
        
        let applyFlag = remote.getGlobal('sharedObject').printMoleculeApplicationStatus;

        if(applyFlag)return;

        if(!selectedApplyIds.length){
            Message.info('无内容可打印')
            return;
        }

        remote.getGlobal('sharedObject').moleculeApplication = selectedApplyIds;

        const params = {
            message_type: 'moleculeApplicationPre',
            content: 'template/molecular/apply.html'
        };

        ipcRenderer.send('print', params);
    };

    // ----------------------------------- render ----------------------------------------------

    return (
        <Container>
            <Header>
                <Title>
                    <img src={require('@images/list.svg')} alt='' />
                    分子申请列表
                </Title>
                <SearchBlock>
                    <span style={{fontSize:'16px',color:'rgb(98, 112, 124)'}}>申请日期：</span>
                    <RangePicker
                        onChange={handleRangeChange}
                    />
                    <Input
                        label={'分子病理号：'}
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
                <ButtonGroup>
                    <Button onClick={e=>setShowCustomTag(true)}>
                        自定义标签
                    </Button>
                    <Button onClick={printCode}>
                        打印标签
                    </Button>
                    <Button onClick={printApply}>
                        打印申请单
                    </Button>
                    <Button 
                        style={{width:'143px'}}
                        onClick={() =>setShowParaffinPop(true)}
                    >
                        打印蜡块使用记录
                    </Button>
                    <Button
                        style={{width:'80px'}}
                        onClick={handleConfirmReceive}
                    >
                        确认接收
                    </Button>
                </ButtonGroup>
            </Footer>

            {showEditPop && (
                <EditPop
                    data={applyData.current}
                    onClose={() => setShowEditPop(false)}
                    onSave={() =>getApplies({
                            pageNum:pageNum.current,
                            pageSize:pageLength.current,
                            filters:applyFilters.current,
                            sort:applySort.current,
                        })}
                    onConfirm={id => {
                        getApplies({
                            pageNum:pageNum.current,
                            pageSize:pageLength.current,
                            filters:applyFilters.current,
                            sort:applySort.current,
                        })
                        setSelectedApplyIds([]);
                        setShowEditPop(false);
                    }}
                />
            )}
            {showParaffinPop && (
                <ParaffinPop onClose={() => setShowParaffinPop(false)} />
            )}
            {showCustomTag && (<TagPop showCustomTag={showCustomTag} setShowCustomTag={e=>setShowCustomTag(e)} />)}
        </Container>
    );
}
