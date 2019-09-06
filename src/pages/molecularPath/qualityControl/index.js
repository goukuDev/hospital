import React, { useState, useEffect, useRef } from 'react';
import style from './index.css';
import { api, changeDate, isNotNull, fmtDate } from 'utils';
import ExpandTable from 'expandTable';
import Message from 'message';
import { CODE } from 'myConstants';
import Input from 'input';
import TextArea from 'textarea';

const status = {
    0: '已登记',
    1: '已发送',
    2: '未切片',
    3: '未取片',
    4: '未质控',
    5: '已质控',
};
const color = {
    0: '#BFCCD9',
    1: '#87A1F8',
    2: '#F4B354',
    3: '#5D6CB2',
    4: '#D25BF5',
    5: '#6FC831',
};
const result = {
    0: '合格',
    1: '不合格',
};
const labelStyle = {
    width: '204px',
    display: 'inline-block',
    textAlign: 'right',
    fontSize: '15px',
    color: '#525F7F',
};

var ipcRenderer = window.electron && window.electron.ipcRenderer;

export default function Index(props) {
    const [tectFilters, setTectFilters] = useState([]);
    const [evaluateDoc, setEvaluateDoc] = useState([]);
    const columns = [
        {
            title: '姓名',
            dataIndex: 'name',
            width: 100,
        },
        {
            title: '病理号',
            dataIndex: 'original_pathnum',
            width: 120,
        },
        {
            title: '蜡块号',
            dataIndex: 'samples',
            render: (text, record) => {
                return record.samples.length
                    ? record.samples
                          .filter(o => o.sample_num)
                          .map(o => o.sample_num)
                          .join()
                    : '';
            },
            width: 120,
        },
        {
            title: '检测项目',
            dataIndex: 'tests',
            render: (text, record) => {
                return record.tests.length ? record.tests.map(o => o.test_name).join(',') : '';
            },
            width: 140,
        },
        {
            title: '分子病理号',
            dataIndex: 'molecule_pathnum',
            width: 140,
        },
        {
            title: '肿瘤细胞比例(%)',
            dataIndex: 'tumor_ratio',
            width: 150,
        },

        {
            title: '肿瘤细胞数量',
            dataIndex: 'tumor_count',
            width: 140,
        },
        {
            title: '评价结果',
            dataIndex: 'evaluation',
            width: 140,
            render: value => <span style={{ color: value === 0 ? '#66b72e' : '#ff4500' }}>{result[value]}</span>,
            filters: [
                {
                    text: '合格',
                    value: 0,
                },
                {
                    text: '不合格',
                    value: 1,
                },
            ],
        },
        {
            title: '质控状态',
            dataIndex: 'status',
            width: 120,
            render: value => (
                <React.Fragment>
                    <span
                        className={style.dot}
                        style={{
                            background: color[value],
                        }}
                    />
                    {status[value]}
                </React.Fragment>
            ),
            filters: [
                {
                    text: '未质控',
                    value: 4,
                },
                {
                    text: '已质控',
                    value: 5,
                },
            ],
        },

        {
            title: '取片人',
            dataIndex: 'take_tech',
            width: 120,
            filters: tectFilters,
        },
        {
            title: '取片时间',
            dataIndex: 'take_time',
            width: 180,
        },
        {
            title: '质控人',
            dataIndex: 'evaluate_doc',
            width: 120,
            filters: evaluateDoc,
        },
        {
            title: '质控时间',
            dataIndex: 'evaluate_time',
            width: 180,
        },
        {
            title: '备注',
            dataIndex: 'evaluation_comment',
        },
        {
            title: '操作',
            dataIndex: 'option',
            fixed: 'right',
            width: 80,
            render: (text, record) => {
                return (
                    <React.Fragment>
                        <span className={style.delete} onClick={e => hanleClick(e, record)}>
                            质控
                        </span>
                    </React.Fragment>
                );
            },
        },
    ];

    const word = {
        rowkey: 'apply_id',
        name: 'HE切片评价列表',
        timeText: '取片日期：',
        inputText: '分子病理号：',
        total: '质控数总计',
        unaccomplished: '未质控',
        printSheet: '打印质控工单',
        status: 4,
        scrollX: 2010,
        scrollY: 375,
    };

    const pageNum = useRef(1);
    const pageLength = useRef(20);
    const sliceStatus = useRef([4, 5]);

    const [waxId, setWaxId] = useState([]);
    const [total, setTotal] = useState(0);
    const [dateRange, setDateRange] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [searchList, setSearchList] = useState([]);
    const [filters, setFilters] = useState({});
    const [showEditPop, setShowEditPop] = useState(false);
    const [rowMessage, setRowMessage] = useState({
        name: '',
        num: '',
        apply_id: null,
    });
    const [rate, setRate] = useState(null);
    const [count, setCount] = useState(null);
    const [comment, setComment] = useState(null);
    const [evaluationResult, setEvaluationResult] = useState(0);

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
                setTectFilters(data.take_tech.map(item => (item = { text: item, value: item })));
                setEvaluateDoc(data.evaluate_doc.map(item => (item = { text: item, value: item })));
            } else {
                Message.error(message);
            }
        });
    };

    useEffect(() => {
        let data = {
            status: JSON.stringify(sliceStatus.current),
            sort_key: 'take_time',
            sort_value: 1,
        };
        getCaseRecords({
            pageNum: pageNum.current,
            pageSize: pageLength.current,
            data,
        });
        extraFilter();
    }, []);

    const hanleClick = (e, record) => {
        if (e) e.stopPropagation();
        setRowMessage({
            name: record.name,
            num: record.molecule_pathnum,
            apply_id: record.apply_id,
        });
        setComment(record.evaluation_comment);
        setRate(record.tumor_ratio);
        setCount(record.tumor_count);
        setEvaluationResult(record.evaluation || 0);
        setShowEditPop(true);
    };
    const evaluat = next => {
        let curId = rowMessage.apply_id;
        let data = {
            apply_id: curId,
            tumor_ratio: isNotNull(rate) ? rate : null,
            tumor_count: isNotNull(count) ? count : null,
            evaluation_comment: comment,
            evaluation: evaluationResult,
        };

        api('molecule/alter_app_evaluation_status', data).then(data => {
            if (CODE.SUCCESS === data.code) {
                Message.success('质控完成');
                setRowMessage({ name: '', num: '', apply_id: null });
                setEvaluationResult(0);
                setRate(null);
                setCount(null);
                setComment(null);
                handleSearch({current:pageNum.current}, filters);
                if (!next) {
                    setShowEditPop(false);
                } else {
                    let newList = searchList.filter(item => item.apply_id !== curId && item.status === 4);
                    if (newList.length) {
                        setRowMessage({
                            name: newList[0].name,
                            num: newList[0].molecule_pathnum,
                            apply_id: newList[0].apply_id,
                        });
                    } else setShowEditPop(false);
                }
            } else {
                Message.error(data.message);
            }
        });
    };

    const handleSearch = (pagination, filters) => {
        //setWaxId([]);
        let { current, pageSize } = pagination;
        let { evaluate_doc, status, take_tech, evaluation } = filters;
        pageNum.current = current || 1;
        pageLength.current = pageSize || pageLength.current;
        
        let data = {
            status:
                status && status.length
                    ? JSON.stringify(status)
                    : inputValue
                    ? '[]'
                    : JSON.stringify(sliceStatus.current),
            take_tech: JSON.stringify(take_tech),
            evaluate_doc: JSON.stringify(evaluate_doc),
            take_start_time: fmtDate(dateRange[0]),
            take_end_time: fmtDate(dateRange[1]),
            molecule_pathnum: inputValue.trim(),
            evaluation: JSON.stringify(evaluation),
            sort_key: 'take_time',
            sort_value: 1,
        };
        getCaseRecords({
            pageNum: pageNum.current,
            pageSize: pageLength.current,
            data,
        });
        document.querySelector('.ant-table-body').scrollTop = 0;
    };

    const printSheet = () => {
        if (ipcRenderer && waxId.length) {
            const params = {
                message_type: 'moleculeHe',
                apply_ids: waxId,
            };

            ipcRenderer.send('print', params);
        }
    };

    return (
        <div className={style.outerbg}>
            <ExpandTable
                searchList={searchList}
                total={total}
                columns={columns}
                word={word}
                waxId={waxId}
                checkList={e => setWaxId(e)}
                saveFilter={e => setFilters(e)}
                filter={filters}
                dateRange={dateRange}
                changeTimeVal={e => setDateRange(changeDate(e))}
                inputValue={inputValue}
                changeInputVal={value => setInputValue(value)}
                hanleDbClick={e => hanleClick('', e)}
                handleSearch={(pagination, filters) => handleSearch(pagination, filters)}
                printSheet={printSheet}
            />
            {showEditPop && (
                <div className={style.addSampleDialogWrap} id="evaluation">
                    <div className={style.addSampleDialog}>
                        <div className={style.addSampleHeader}>
                            <span>
                                {rowMessage.name}
                                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;分子病理号：
                                {rowMessage.num}
                            </span>
                            <img
                                src={require('@images/dialog_close.svg')}
                                alt=""
                                className={style.close}
                                onClick={e => setShowEditPop(false)}
                            />
                        </div>
                        <div className={style.addSampleContent}>
                            <div className={style.row} id="rate">
                                <Input
                                    lineFeed={false}
                                    label="肿瘤细胞比例(%)："
                                    containerStyle={{ marginTop: '25px' }}
                                    labelStyle={labelStyle}
                                    inputStyle={{
                                        width: '240px',
                                        height: '30px',
                                    }}
                                    value={rate}
                                    onChange={e => setRate(e.target.value)}
                                />
                                <div className={style.ratebutton}>
                                    <span
                                        className={rate === 90 ? style.actived : null}
                                        onClick={e => {
                                            setRate(90);
                                        }}
                                    >
                                        90%
                                    </span>
                                    <span className={rate === 80 ? style.actived : null} onClick={e => setRate(80)}>
                                        80%
                                    </span>
                                    <span className={rate === 60 ? style.actived : null} onClick={e => setRate(60)}>
                                        60%
                                    </span>
                                    <span className={rate === 40 ? style.actived : null} onClick={e => setRate(40)}>
                                        40%
                                    </span>
                                </div>
                            </div>
                            <div className={style.row}>
                                <Input
                                    lineFeed={false}
                                    label="肿瘤细胞数量："
                                    labelStyle={labelStyle}
                                    inputStyle={{
                                        width: '240px',
                                        height: '30px',
                                    }}
                                    value={count}
                                    onChange={e => setCount(e.target.value)}
                                />
                                <div className={style.ratebutton}>
                                    <span
                                        className={`${style.w56} ${count === '>1000' ? style.actived : null}`}
                                        onClick={e => {
                                            setCount('>1000');
                                        }}
                                    >
                                        >1000
                                    </span>
                                    <span
                                        className={`${style.w56} ${count === '≈1000' ? style.actived : null}`}
                                        onClick={e => setCount('≈1000')}
                                    >
                                        ≈1000
                                    </span>
                                    <span
                                        className={`${style.w56} ${count === '>800' ? style.actived : null}`}
                                        onClick={e => setCount('>800')}
                                    >
                                        >800
                                    </span>
                                    <span
                                        className={`${style.w56} ${count === '≈800' ? style.actived : null}`}
                                        onClick={e => setCount('≈800')}
                                    >
                                        ≈800
                                    </span>
                                    <span
                                        className={`${style.w56} ${count === '≈500' ? style.actived : null}`}
                                        onClick={e => setCount('≈500')}
                                    >
                                        ≈500
                                    </span>
                                </div>
                            </div>
                            <div className={style.row}>
                                <TextArea
                                    lineFeed={false}
                                    label="备注："
                                    labelStyle={labelStyle}
                                    textAreaStyle={{
                                        width: '240px',
                                        height: '56px',
                                        verticalAlign: 'top',
                                        marginBottom: '6px',
                                    }}
                                    value={comment}
                                    onChange={e => setComment(e.target.value)}
                                />
                            </div>
                            <div className={style.row}>
                                <span style={labelStyle}>评估结果：</span>
                                <div className={style.qualified}>
                                    <span
                                        className={!evaluationResult ? style.checked : ''}
                                        onClick={e => setEvaluationResult(0)}
                                    >
                                        合格
                                    </span>
                                    <span
                                        className={evaluationResult ? style.red : ''}
                                        onClick={e => setEvaluationResult(1)}
                                    >
                                        不合格
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className={style.footer}>
                            <div className={style.addSamplebtnGroup}>
                                <span onClick={e => setShowEditPop(false)}>取消</span>
                                <span className={style.canAddSample} onClick={e => evaluat()}>
                                    确认
                                </span>
                                <span className={`${style.w98} ${style.canAddSample}`} onClick={e => evaluat('next')}>
                                    确认并下一个
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
