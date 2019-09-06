import React, { useState, useEffect, useRef } from 'react';
import style from './index.css';
import Table from 'table';
import Input from 'input';
import Detail from './detail';
import { api } from 'utils';
import { CODE } from 'myConstants';
import Message from 'message';
import Confirm from 'confirm';

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
            title: '临床诊断',
            dataIndex: 'clinical_diagnosis'
        },
        {
            title: '分子病理号',
            dataIndex: 'molecule_pathnum',
            width: 140
        },
        {
            title: '原病理号',
            dataIndex: 'original_pathnum',
            width: 130
        },
        {
            title: '住院号',
            dataIndex: 'admission_num',
            width: 130
        },
        {
            title: '门诊号',
            dataIndex: 'outpatient_num',
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
            title: '送检医院',
            dataIndex: 'deliver_org',
            width: 130
        },
        {
            title: '送检科室',
            dataIndex: 'department',
            width: 130
        },
        {
            title: '状态',
            dataIndex: 'status',
            width: 120,
            render: text => (
                <React.Fragment>
                    <i
                        className={style.state}
                        style={{
                            backgroundColor: {
                                0: '#BFCCD9',
                                1: '#87A1F8',
                                2: '#F4B354',
                                3: '#5D6CB2',
                                4: '#D25BF5',
                                5: '#6FC831'
                            }[text]
                        }}
                    />
                    {
                        {
                            0: '已登记',
                            1: '已发送',
                            2: '已接收',
                            3: '已切片',
                            4: '已取片',
                            5: '已质控'
                        }[text]
                    }
                </React.Fragment>
            ),
            filters: [
                { text: '已登记', value: 0 },
                { text: '已发送', value: 1 },
                { value: 2, text: '已接收' },
                { value: 3, text: '已切片' },
                { value: 4, text: '已取片' },
                { value: 5, text: '已质控' }
            ]
        },
        {
            title: '操作',
            dataIndex: 'action',
            width: 200,
            fixed: 'right',
            render: (text, record) => (
                <React.Fragment>
                    <button
                        className={style['btn-table']}
                        style={{ background: '#6FC831' }}
                        onClick={e => handleOpenDetail(record, 'copy')}
                    >
                        新建
                    </button>
                    <button
                        className={style['btn-table']}
                        onClick={e => handleOpenDetail(record, 'modify')}
                    >
                        修改
                    </button>
                    <span
                        className={style['btn-table']}
                        style={{
                            background:'#F25B24',
                            display:'inline-block',
                            textAlign:'center',
                            lineHeight:'24px',
                        }}
                        onClick={e => handleDeleteApply(record.apply_id)}
                    >
                        删除
                    </span>
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
    const applyFilters = useRef({});

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
        const { searchWords, chargeStatus, status } = filters;
        const { sortKey, sortValue } = sort;
        return new Promise(reslove => {
            api(
                `molecule/get_applications?pageNum=${pageNum}&pageSize=${pageSize}`,
                {
                    filter: searchWords,
                    charge_status: JSON.stringify(chargeStatus),
                    status: JSON.stringify(status),
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

    const uploadFile = files => {
        api('molecule/upload_application', files).then(({ code }) => {
            if (code === CODE.SUCCESS) {
                let param = {
                    pageNum: pageNum.current,
                    pageSize: pageLength.current,
                    filters: applyFilters.current,
                    sort: applySort.current
                };
                getAllRecord(param);
            }
        });
    };

    const deleteApply = id => {
        api('molecule/delete_application',{apply_ids:JSON.stringify([id])})
        .then(({code,data})=>{
            if(code === CODE.SUCCESS){
                let isLast = ((total % pageLength.current) === 1) && (pageNum.current === Math.ceil(total / pageLength.current));
                pageNum.current = isLast && pageNum.current !== 1? (pageNum.current - 1) : pageNum.current;
                let param = {
                    pageNum: pageNum.current,
                    pageSize: pageLength.current,
                    filters: applyFilters.current,
                    sort: applySort.current
                };
                getAllRecord(param);
                
                Message.info('删除成功！');
            }else{
                Message.error('删除失败')
            }
        })
    }

    const handleDeleteApply = id => {
        Confirm({
            content:'确认删除该申请？',
            onOk:()=>deleteApply(id)
        })
        
    }

    // --------------------------- methods -----------------------------

    const handleOpenDetail = (record, action) => {
        setCurrentApply({ record, action });
        setDetailShow(true);
    };

    const closeDetail = () => {
        setDetailShow(false);
        currentApply.action !== 'modify' && (pageNum.current = 1);

        let param = {
            pageNum: pageNum.current,
            pageSize: pageLength.current,
            filters: applyFilters.current,
            sort: applySort.current
        };
        getAllRecord(param);
        currentApply.action !== 'modify' && tableRef.current.jumpToFirstPage();
    };

    const handleSearch = async () => {
        pageNum.current = 1;
        applyFilters.current.searchWords = searchWords;
        let param = {
            pageNum: pageNum.current,
            pageSize: pageLength.current,
            filters: applyFilters.current,
            sort: applySort.current
        };
        await getAllRecord(param);
        tableRef.current.jumpToFirstPage();
    };

    const handleTableChange = (pagination, filters, sorter, extra) => {
        let { charge_status, status } = filters;
        let { current, pageSize } = pagination;

        pageNum.current = current;
        pageLength.current = pageSize;
        applyFilters.current.chargeStatus = charge_status || [];
        applyFilters.current.status =
            status && status.length ? status : undefined;

        let param = {
            pageNum: pageNum.current,
            pageSize: pageLength.current,
            filters: applyFilters.current,
            sort: applySort.current
        };
        getAllRecord(param);
        document.querySelector('.ant-table-body').scrollTop = 0;
    };

    const addFile = e => {
        let files = e.target.files;
        let fd = new FormData();
        for (let i = 0; i < files.length; i++) {
            fd.append('file', files[i]);
        }
        uploadFile(fd);
    };

    return (
        <div className={style.outer}>
            <div className={style.header}>
                <div>
                    <button
                        className={style.checkBtn}
                        onClick={e => handleOpenDetail(null, 'add')}
                    >
                        登记/接收
                    </button>
                    <div className={style.importBtn}>
                        导入
                        <input
                            onChange={addFile}
                            type='file'
                            multiple
                            name=''
                            value=''
                            id=''
                        />
                    </div>
                </div>
                <div className={style.box}>
                    <Input
                        lineFeed={false}
                        value={searchWords}
                        style={{
                            width: '190px',
                            margin: '0 10px',
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
                scroll={{ x: 2000, y: 339 }}
                showPagination={true}
            />

            {detailShow && (
                <Detail
                    record={currentApply.record}
                    action={currentApply.action}
                    close={closeDetail}
                />
            )}
        </div>
    );
}
