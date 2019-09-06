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
        3: '已切片',
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

var ipcRenderer = window.electron && window.electron.ipcRenderer;
var remote = window.electron && window.electron.remote;

export default function Index(props) {
    const [projectsFilters, setProjectsFilters] = useState([]);
    const [sliceTech, setSliceTech] = useState([]);
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
            title: '病理号',
            dataIndex: 'original_pathnum',
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
                    text: '未切片',
                    value: 2,
                },
                {
                    text: '已切片',
                    value: 3,
                },
            ],
        },

        {
            title: '接收人',
            dataIndex: 'receive_tech',
            width: 120,
        },
        {
            title: '接收时间',
            dataIndex: 'receive_time',
            width: 180,
        },
        {
            title: '切片人',
            dataIndex: 'slice_tech',
            width: 120,
            filters: sliceTech,
        },
        {
            title: '切片时间',
            dataIndex: 'slice_time',
            width: 180,
        },
    ];
    const word = {
        rowkey: 'apply_id',
        name: '切片列表',
        timeText: '接收日期：',
        inputText: '分子病理号：',
        total: '切片数总计',
        unaccomplished: '未切片：',
        cancleText: '取消切片',
        finishText: '确认切片完成',
        printTab: '打印切片标签',
        status: 2,
        scrollX: 1760,
        scrollY: 375,
    };
    const pageNum = useRef(1);
    const pageLength = useRef(20);
    const sliceStatus = useRef([2, 3]);

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
                setSliceTech(data.slice_tech.map(item => (item = { text: item, value: item })));
            } else {
                Message.error(message);
            }
        });
    };

    useEffect(() => {
        let data = {
            status: JSON.stringify(sliceStatus.current),
            sort_key: 'receive_time',
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
        let content = '确认切片完成？';
        let tips = '切片成功';
        if (type === 'cancle') {
            content = '确认取消切片？';
            tips = '取消成功';
        }
        confirm({
            content: content,
            onOk: async e => {
                api(`molecule/alter_app_slice_status`, {
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
        let { tests, status, slice_tech } = filters;
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
            slice_tech: JSON.stringify(slice_tech),
            receive_start_time: fmtDate(dateRange[0]),
            receive_end_time: fmtDate(dateRange[1]),
            molecule_pathnum: inputValue.trim(),
            sort_key: 'receive_time',
            sort_value: 1,
        };

        getCaseRecords({
            pageNum: pageNum.current,
            pageSize: pageLength.current,
            data,
        });
        document.querySelector('.ant-table-body').scrollTop = 0;
    };

    // ------------------------------------------------------------ 打印标签 ------------------------------------------------------------------------------

    const getSlices = ids => {
        return new Promise(resolve => {
            api('molecule/get_slices', { apply_ids: JSON.stringify(ids) }).then(
                ({ code, data }) => code === CODE.SUCCESS && resolve(data)
            );
        });
    };
    const updateSliceStatus = ids => {
        api('molecule/alter_slice_print_status', {
            apply_ids: JSON.stringify(ids),
        }).then(({ code, data, message }) => {
            if (code !== CODE.SUCCESS) Message.error(message);
            else handleSearch('', filters);
        });
    };

    const printCode = () => {
        if (!remote && !ipcRenderer) return;
        let codeFlag = remote.getGlobal('sharedObject').printMoleculeLabelStatus;
        if (codeFlag) return;

        let samples = [];
        let result = [];
        getSlices(waxId).then(res => {
            res.forEach(o => {
                samples = samples.concat(
                    o.samples.map(s => {
                        s.moleculePathnum = o.molecule_pathnum;
                        return s;
                    })
                );
            });

            samples.forEach(item => {
                item.slices.forEach(child => {
                    result = result.concat([
                        {
                            moleculePathnum: item.moleculePathnum,
                            resueMoleculePathnum: null,
                            samplePathnum: item.sample_pathnum,
                            paraffinNum: item.sample_num,
                            tagType: child.tag_type,
                        },
                    ]);
                });
            });
            if (!result.length) {
                Message.info('无内容可打印');
                return;
            }

            remote.getGlobal('sharedObject').moleculeLabel = result;

            let params = {
                message_type: 'moleculeLabelPre',
                content: 'template/molecular/barcode.html',
            };
            ipcRenderer.send('print', params);

            updateSliceStatus(waxId);
        });
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
                printCode={printCode}
                handleSearch={(pagination, filters) => handleSearch(pagination, filters)}
            />
        </div>
    );
}
