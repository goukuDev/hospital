import React, { useState, useEffect, useRef } from 'react';
import style from './index.css';
import Table from 'table';
import Input from 'input';
import Detail from './detail';
import { api } from 'utils';
import { CODE } from 'myConstants';

export default function Index() {
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
            render: text => (
                <span style={{ color: text === 0 ? '#FF4500' : '' }}>
                    {{ 0: '欠费', 1: '已收费' }[text]}
                </span>
            ),
            filters: [{ text: '欠费', value: 0 }, { text: '已收费', value: 1 }]
        },
        {
            title: '分子病理号',
            dataIndex: 'molecule_pathnum',
            width: 140
        },
        {
            title: '病理号',
            dataIndex: 'original_pathnum',
            width: 130
        },
        {
            title: '性别',
            dataIndex: 'gender',
            width: 100,
            render: text =>
                ({
                    0: '女',
                    1: '男',
                    2: '其他'
                }[text])
        },
        {
            title: '年龄',
            dataIndex: 'age',
            width: 100
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
            title: '送检医院',
            dataIndex: 'deliver_org',
            width: 130
        },
        {
            title: '送检科室',
            dataIndex: 'department',
        },
       
        {
            title: '状态',
            dataIndex: 'report_status',
            width: 120,
            render: text => (
                <React.Fragment>
                    <i
                        className={style.state}
                        style={{
                            backgroundColor: {
                                0: '#F4BB00',
                                1: '#0B8FF4',
                                2: '#6FC831',
                            }[text]
                        }}
                    />
                    {
                        {
                            0: '待诊断',
                            1: '诊断中',
                            2: '已审核',
                        }[text]
                    }
                </React.Fragment>
            ),
            filters: [
                { text: '待诊断', value: 0 },
                { text: '诊断中', value: 1 },
                { value: 2, text: '已审核' },
            ]
        },
        {
            title: '操作',
            dataIndex: 'action',
            width: 80,
            fixed: 'right',
            render: (text, record) => (
                <React.Fragment>
                    <button
                        className={style['btn-table']}
                        style={{ background: '#0B94FC' }}
                        onClick={e => handleOpenDetail(record)}
                    >
                        诊断
                    </button>
                </React.Fragment>
            )
        }
    ];

    const [applyList, setApplyList] = useState([]);
    const [currentApply, setCurrentApply] = useState({});
    const [detailShow, setDetailShow] = useState(false);

    const [searchWords, setSearchWords] = useState('');
    const [total, setTotal] = useState(0);

    const pageNum = useRef(1);
    const pageLength = useRef(20);
    const applySort = useRef({ sortKey: 'checkin_time', sortValue: 1 });
    const applyFilters = useRef({report_status:[0,1,2]});
    const applyStatus = useRef([2,3,4,5]);

    const tableRef = useRef();

    useEffect(() => {
        let param = {
            pageNum: pageNum.current,
            pageSize: pageLength.current,
            filters: applyFilters.current,
            sort: applySort.current
        };
        getAllRecord(param);
    }, []);

    // -------------------------- api -------------------------------

    const getAllRecord = ({ pageNum, pageSize, filters, sort }) => {
        const { searchWords, chargeStatus, report_status } = filters;
        const { sortKey, sortValue } = sort;
        
        return new Promise(reslove => {
            api(
                `molecule/get_applications?pageNum=${pageNum}&pageSize=${pageSize}`,
                {
                    molecule_pathnum: searchWords,
                    charge_status: JSON.stringify(chargeStatus),
                    report_status: JSON.stringify(report_status),
                    status:JSON.stringify(applyStatus.current),
                    sort_key: sortKey,
                    sort_value: sortValue
                }
            ).then(({ code, data }) => {
                if (code === CODE.SUCCESS) {
                    setApplyList(data.result);
                    setTotal(data.total);
                    reslove();
                }
            });
        });
    };

    // --------------------------- methods -----------------------------

    const handleOpenDetail = (record) => {
        setCurrentApply({ record });
        setDetailShow(true);
    };

    const closeDetail = () => {
        setDetailShow(false);
        let param = {
            pageNum: pageNum.current,
            pageSize: pageLength.current,
            filters: applyFilters.current,
            status:JSON.stringify(applyStatus),
            sort: applySort.current
        };
        getAllRecord(param);
    };

    const handleSearch = async () => {
        pageNum.current = 1;
        applyFilters.current.searchWords = searchWords;
        let param = {
            pageNum: pageNum.current,
            pageSize: pageLength.current,
            filters: applyFilters.current,
            status:JSON.stringify(applyStatus.current),
            sort: applySort.current
        };
        await getAllRecord(param);
        tableRef.current.jumpToFirstPage();
    };

    const handleTableChange = (pagination, filters, sorter, extra) => {
        let { charge_status, report_status } = filters;
        let { current, pageSize } = pagination;

        pageNum.current = current;
        pageLength.current = pageSize;
        applyFilters.current.chargeStatus = charge_status || [];
        applyFilters.current.report_status =
        report_status && report_status.length ? report_status : [0,1,2];

        let param = {
            pageNum: pageNum.current,
            pageSize: pageLength.current,
            filters: applyFilters.current,
            status:JSON.stringify(applyStatus.current),
            sort: applySort.current
        };
        getAllRecord(param);
        document.querySelector('.ant-table-body').scrollTop = 0;
    };

   
    return (
        <div className={style.outer}>
            <div className={style.header}>
                <div>
                    <span
                        className={style.title}
                        style={{
                            background: `url(${require('@images/list.svg')}) no-repeat 0 center`,
                        }}
                    >
                        报告列表
                    </span>
                </div>
                <div className={style.box}>
                    <Input
                        label={'分子病理号：'}
                        lineFeed={false}
                        value={searchWords}
                        style={{
                            width: '188px',
                            margin: '0 10px 0 0',
                            height: '34px'
                        }}
                        onChange={e => setSearchWords(e.target.value)}
                        onKeyUp={e => e.keyCode === 13 && handleSearch()}
                    />
                    <button className={style.searchBtn} onClick={handleSearch}>
                        查询
                    </button>
                </div>
            </div>
            <Table
                ref={tableRef}
                onChange={handleTableChange}
                columns={columns}
                data={applyList}
                total={total}
                rowKey={'apply_id'}
                style={{ height: 'calc(100% - 75px)', overflowY: 'auto' }}
                scroll={{ x: 1580, y: 339 }}
                showPagination={true}
                renderStatisticalBar={e => {
                    return total &&
                        (
                            <div className={style.statistics}>
                                <div className={style.count}>
                                    报告总计
                                    <i>{total}</i>
                                </div>
                            </div>
                        ) 
                }}
            />
            {detailShow && (
                <Detail
                    applyId={currentApply.record.apply_id}
                    action={currentApply.action}
                    close={closeDetail}
                />
            )}
        </div>
    );
}
