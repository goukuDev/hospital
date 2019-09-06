import React, { useState, useEffect, useRef } from 'react';
import style from './index.css';
import { api, changeDate, fmtDate } from 'utils';
import ExpandTable from 'expandTable';
import Message from 'message';
import confirm from 'confirm';
import { CODE } from 'myConstants';

const texts = {
    status: {
        0: '已登记',
        1: '已发送',
        2: '未切片',
        3: '未取片',
        4: '已取片',
        5: '已质控',
    },
    color: {
        0: '#BFCCD9',
        1: '#87A1F8',
        2: '#F4B354',
        3: '#5D6CB2',
        4: '#D25BF5',
        5: '#6FC831',
    },
};

export default function Index(props) {
    const [projectsFilters, setProjectsFilters] = useState([]);
    const columns = [
        {
            title: '姓名',
            dataIndex: 'name',
            width: 100,
        },

        {
            title: '分子病理号',
            dataIndex: 'molecule_pathnum',
            width: 140,
        },
        {
            title: 'DNA同分子号',
            dataIndex: 'reuse_molecule_pathnum',
            width: 140,
        },
        {
            title: '蜡块号/标本号',
            dataIndex: 'samples',
            render: (text, record) => {
                return record.samples.length
                    ? record.samples
                          .filter(o => o.sample_num)
                          .map(o => o.sample_num)
                          .join()
                    : '';
            },
            width: 140,
        },
        {
            title: '质控片数',
            dataIndex: 'he_num',
            width: 100,
        },
        {
            title: '白片数',
            dataIndex: 'blank_num',
            width: 100,
        },
        {
            title: '检测项目',
            dataIndex: 'tests',
            render: (text, record) => {
                return record.tests.length ? record.tests.map(o => o.test_name).join() : '';
            },
            filters: projectsFilters,
        },

        {
            title: '状态',
            dataIndex: 'status',
            width: 120,
            render: value => (
                <React.Fragment>
                    <span
                        className={style.dot}
                        style={{
                            background: texts.color[value],
                        }}
                    />
                    {texts.status[value]}
                </React.Fragment>
            ),
            filters: [
                {
                    text: '未取片',
                    value: 3,
                },
                {
                    text: '已取片',
                    value: 4,
                },
            ],
        },
        {
            title: '切片人',
            dataIndex: 'slice_tech',
            width: 120,
        },
        {
            title: '切片时间',
            dataIndex: 'slice_time',
            width: 180,
        },

        {
            title: '取片人',
            dataIndex: 'take_tech',
            width: 120,
        },
        {
            title: '取片时间',
            dataIndex: 'take_time',
            width: 180,
        },
    ];
    const word = {
        rowkey: 'apply_id',
        name: '取片列表',
        timeText: '切片日期：',
        inputText: '分子病理号：',
        total: '切片数总计',
        unaccomplished: '未取片：',
        finishText: '确认取片',
        cancleText: '取消取片',
        status: 3,
        scrollX: 1760,
        scrollY: 375,
    };

    const pageNum = useRef(1);
    const pageLength = useRef(20);
    const sliceStatus = useRef([3, 4]);

    const [waxId, setWaxId] = useState([]);
    const [total, setTotal] = useState(0);
    const [dateRange, setDateRange] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [searchList, setSearchList] = useState([]);
    const [filters, setFilters] = useState({});

    const getCaseRecords = ({ pageNum, pageSize, data }) => {
        return api(`molecule/get_applications?pageNum=${pageNum}&pageSize=${pageSize}`, data).then(
            ({ code, data, message }) => {
                if (CODE.SUCCESS === code) {
                    setTotal(data.total);
                    setSearchList(data.result);
                } else {
                    Message.error(message);
                }
            }
        );
    };
    const extraFilter = e => {
        return api('molecule/get_app_rest').then(({ code, data, message }) => {
            if (CODE.SUCCESS === code) {
                setProjectsFilters(data.test_name.map(item => (item = { text: item, value: item })));
            } else {
                Message.error(message);
            }
        });
    };

    useEffect(() => {
        let data = {
            status: JSON.stringify(sliceStatus.current),
            sort_key: 'slice_time',
            sort_value: 1,
        };
        getCaseRecords({
            pageNum: pageNum.current,
            pageSize: pageLength.current,
            data,
        });
        extraFilter();
    }, []);

    const changeApplyStatus = type => {
        let content = '确认取片完成？';
        let tips = '取片成功';
        if (type === 'cancle') {
            content = '确认取消取片？';
            tips = '取消成功';
        }
        confirm({
            content: content,
            onOk: async e => {
                api(`molecule/alter_app_take_status`, {
                    apply_ids: JSON.stringify(waxId),
                }).then(data => {
                    if (CODE.SUCCESS === data.code) {
                        Message.success(tips);
                        setWaxId([]);
                        handleSearch({current:pageNum.current}, filters);
                    } else {
                        Message.error(data.message);
                    }
                });
            },
        });
    };
    const handleSearch = (pagination, filters) => {
        //setWaxId([]);
        let { current, pageSize } = pagination;
        let { tests, status } = filters;
        pageNum.current = current || 1;
        pageLength.current = pageSize || pageLength.current;
        let data = {
            status:
                status && status.length
                    ? JSON.stringify(status)
                    : inputValue
                    ? '[]'
                    : JSON.stringify(sliceStatus.current),
            test: JSON.stringify(tests),
            slice_start_time: fmtDate(dateRange[0]),
            slice_end_time: fmtDate(dateRange[1]),
            molecule_pathnum: inputValue.trim(),
            sort_key: 'slice_time',
            sort_value: 1,
        };
        getCaseRecords({
            pageNum: pageNum.current,
            pageSize: pageLength.current,
            data,
        });
        document.querySelector('.ant-table-body').scrollTop = 0;
    };

    return (
        <div className={style.outerbg}>
            <ExpandTable
                searchList={searchList}
                total={total}
                columns={columns}
                word={word}
                changeApplyStatus={changeApplyStatus}
                waxId={waxId}
                checkList={e => setWaxId(e)}
                saveFilter={e => setFilters(e)}
                filter={filters}
                dateRange={dateRange}
                changeTimeVal={e => setDateRange(changeDate(e))}
                inputValue={inputValue}
                changeInputVal={value => setInputValue(value)}
                handleSearch={(pagination, filters) => handleSearch(pagination, filters)}
            />
        </div>
    );
}
