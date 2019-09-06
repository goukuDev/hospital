import React, {useState,useEffect,useRef} from 'react';
import style from './index.css';
import Table from 'table';
import Input from 'input';
import Detail from './detail';
import {api} from 'utils';
import {CODE} from 'myConstants';

export default function Index() {
    const tableRef = useRef();

    const columns = [
        {
            title: '姓名',
            dataIndex: 'name',
            width: 130
        },
        {
            title: '收费状态',
            dataIndex: 'charge_status',
            width: 110,
            render:text => ( <span style={{color:text === 0?'#FF4500':''}}>{{0:'欠费',1:'已收费'}[text]}</span> ),
            filters:[
                {text:'欠费',value:0},
                {text:'已收费',value:1}
            ],
            onFilter:(value,record)=>record.charge_status === value
        },
        {
            title: '性别',
            dataIndex: 'gender',
            width: 100,
            render:text=>({
                0: '女',
                1: '男',
                2: '其他'}[text])
        },
        {
            title: '年龄',
            dataIndex: 'age',
            width: 100,
        },
        {
            title: '病理诊断',
            dataIndex: 'clinical_diagnosis',
        },
        {
            title: '住院号',
            dataIndex: 'admission_num',
            width: 130
        },
        {
            title: '门诊号',
            dataIndex: 'outpatient_num' ,
            width: 130
        },
        {
            title: '送检部位',
            dataIndex: 'deliver_location',
            width: 130
        },
        {
            title: '登记时间',
            dataIndex: 'checkin_time',
            width: 180
        },
        {
            title: '送检单位',
            dataIndex: 'deliver_org',
            width: 130
        },
        {
            title: '状态',
            dataIndex: 'status',
            width: 120,
            render: text => (
                <React.Fragment>
                    <i className={style.state} style={{backgroundColor: {0: '#4DAFDB', 1: '#6FC831'}[text]}} />
                    {
                        {
                            0:'已登记',
                            1:'已发送',
                        }[text]
                    }
                </React.Fragment>
            ),
            filters:[
                {text:'已登记',value:0},
                {text:'已发送',value:1}
            ],
            
        },
        {
            title: '备注',
            dataIndex: 'comment',
            width: 130
        },
        {
            title: '操作',
            dataIndex: 'action',
            width: 140,
            fixed:'right',
            render:(text,record) => (
                <React.Fragment>
                    <button 
                        className={style['btn-table']} 
                        style={{background:'#6FC831'}}
                        onClick={e=>handleOpenDetail(record,'copy')}
                    >
                        新建
                    </button>
                    <button 
                        className={style['btn-table']}
                        onClick={e=>handleOpenDetail(record,'modify')}
                    >
                        修改
                    </button>
                </React.Fragment>
            )
        },
    ]

    const [applyList,setApplyList] = useState([]);
    const [currentApply,setCurrentApply] = useState({});
    const [searchWords , setSearchWords] = useState('');
    const [detailShow , setDetailShow] = useState(false);

    const [total,setTotal] = useState(0);

    const pageNum = useRef(1);
    const pageLength = useRef(20);
    const applySearch = useRef('');
    const applyFilters = useRef({})


    useEffect(()=>{getAllRecord({pageNum:pageNum.current,pageSize:pageLength.current})},[]);

    // -------------------------- api -------------------------------

    const getAllRecord = ({pageNum,pageSize,filterValue,filters}) => {
        let data = {
            filterValue,
            filters:JSON.stringify(filters),
        }
        return new Promise(reslove => {
            api(`immuno/get_applications?pageNum=${pageNum}&pageSize=${pageSize}`,data)
            .then(({code,data}) =>{
                if(code === CODE.SUCCESS){
                    setApplyList(data.result);
                    setTotal(data.total);
                    reslove();
                }
            })
        })
    }

    // --------------------------- methods -----------------------------

    const handleOpenDetail = (record,action) => {
        setCurrentApply({record,action});
        setDetailShow(true);
    }

    const closeDetail = async () => {
        setDetailShow(false);
        let param = {
            pageNum:pageNum.current,
            pageSize:pageLength.current,
            filterValue:applySearch.current,
            filters:applyFilters.current,
        }
        await getAllRecord(param);
        currentApply.action !== 'modify' && tableRef.current.jumpToFirstPage();
    }

    const handleSearch = async () => {
        pageNum.current = 1;
        applySearch.current = searchWords;
        let param = {
            pageNum:pageNum.current,
            pageSize:pageLength.current,
            filterValue:applySearch.current,
            filters:applyFilters.current,
        }
        await getAllRecord(param);
        tableRef.current.jumpToFirstPage();
    }

    const handleTableChange = (pagination, filters, sorter, extra) => {
        let { current, pageSize } = pagination;
        pageNum.current = current;
        pageLength.current = pageSize;
        let tmpObj = Object.assign({},filters);
        tmpObj.status = tmpObj.status && tmpObj.status.length? tmpObj.status : undefined;
        applyFilters.current = Object.assign(applyFilters.current,tmpObj);
        let param = {
            pageNum:pageNum.current,
            pageSize:pageLength.current,
            filterValue:applySearch.current,
            filters:applyFilters.current,
        }
        getAllRecord(param);
        document.querySelector('.ant-table-body').scrollTop = 0;
    }

    return (
        <div className={style.outer}>
            <div className={style.header}>
                <button className={style.checkBtn} onClick={e=>handleOpenDetail(null,'add')}>登记/接收</button>
                <div className={style.box}>     
                    <Input
                        lineFeed={false}
                        value={searchWords}
                        style={{width:'190px',margin:'0 10px',height:'34px'}}
                        onChange={e=>setSearchWords(e.target.value)}
                        onKeyUp={e=>e.keyCode === 13 && handleSearch()}
                    ></Input>
                    <button className={style.searchBtn}  onClick={handleSearch}>查询</button>
                </div>
            </div>
            <Table
                ref={tableRef}
                total={total}
                onChange={handleTableChange}
                columns={columns}
                data={applyList}
                rowKey={'apply_id'}
                style={{height: 'calc(100% - 75px)', overflowY: 'auto'}}
                scroll={{ x: 1670, y: 339 }}
                showPagination={true}
            ></Table>

            {
                detailShow && 
                <Detail
                    record={currentApply.record}
                    action={currentApply.action}
                    close={closeDetail}
                ></Detail>
            }
        </div>
    );
}
