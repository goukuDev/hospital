import React, { useState, useEffect, useRef } from 'react';
import style from './index.css';
import { api, changeDate, fmtDate } from 'utils';
import IhcTable from 'expandTable';
import Message from 'message';
import confirm from 'confirm';
import { CODE } from 'myConstants';
import { Switch } from 'antd';

var ipcRenderer = window.electron && window.electron.ipcRenderer;
var remote = window.electron && window.electron.remote;
const status = {
    0: '已登记',
    1: '已发送',
    2: '未切片',
    3: '已切片',
    4: '已取片',
};

export default function Index(props) {
    const columns = [
        {
            title: '任务来源',
            dataIndex: 'task_src',
            width: 100,
            render: () => '免疫组化',
        },
        {
            title: '免疫号',
            dataIndex: 'immu_num',
            width: 140,
        },
        {
            title: '姓名',
            dataIndex: 'name',
            width: 100,
        },
        {
            title: '切片号',
            dataIndex: 'slice_num',
            width: 140,
        },

        {
            title: '蜡块号',
            dataIndex: 'samples',
            width: 140,
            render: (text, record) => {
                return record.samples.length
                    ? record.samples
                          .filter(o => o.sample_num)
                          .map(o => o.sample_num)
                          .join()
                    : '';
            },
        },
        {
            title: '标记物（克隆号）',
            dataIndex: 'marker_clone_num',
            width: 170,
            render:(text,record)=>`${record.marker_name}${text?'('+text+')':''}`
        },
        {
            title: '对照',
            dataIndex: 'contrast_status',
            width: 100,
            render: (text, record) => (
                <Switch
                    onChange={(checked, e) => handleContrastClick(record)}
                    onClick={(checked, e) => e.stopPropagation()}
                    checkedChildren="是"
                    unCheckedChildren="否"
                    checked={text === 1}
                />
            ),
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
                            background: { 3: '#6FC831', 2: '#F4BB00' }[value],
                        }}
                    />
                    {status[value]}
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
            title: '接收医生',
            dataIndex: 'receive_tech',
            width: 120,
        },
        {
            title: '接收时间',
            dataIndex: 'receive_time',
            width: 180,
        },

        {
            title: '备注',
            dataIndex: 'comment',
        },
        {
            title: '设备型号',
            dataIndex: 'equip_model',
            width: 130,
            //filters: equipFilters,
            render:(text,record)=>`${text? record.equip_brand+' '+text :''}`
        },
        {
            title: '切片技师',
            dataIndex: 'slice_tech',
            width: 120,
        },
        {
            title: '切片时间',
            dataIndex: 'slice_time',
            width: 180,
        },
    ];
    const word = {
        rowkey: 'slice_id',
        name: 'IHC切片列表',
        timeText: '接收日期：',
        inputText: '免疫号：',
        total: '切片数总计',
        unaccomplished: '未切片',
        finishText: '确认切片完成',
        printTab: '打印标签',
        printSheet: '打印工作单',
        scrollX: 1860,
        scrollY: 375,
        status: 2,
        tab: 'ihc',
    };

    const [waxId, setWaxId] = useState([]);

    // const [equipFilters, setEquipFilters] = useState([]);

    const [dateRange, setDateRange] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [searchList, setSearchList] = useState([]);
    const [filters, setFilters] = useState({ status: [2, 3] });
    const [total, setTotal] = useState(0);
    const [unfinished,setUnfinished] = useState(0);
    const pageNum = useRef(1);
    const pageLength = useRef(20);

    const getFacilities = e => {
        return api('immuno/get_slices_equip', { status: JSON.stringify([2,3]) }).then(({ code, data, message }) => {
            if (CODE.SUCCESS === code) {
                // let list = [];
               /*  data.map(o =>
                    Object.values(o.models)
                        .map(item => item)
                        .map(o => list.push(o))
                );
                setEquipFilters(Array.from(new Set(list)).map(item => (item = { text: item, value: item }))); */
            } else {
                Message.error(message);
            }
        });
    };
    const getCaseRecords = ({ pageNum, pageSize, data }) => {
        api(`immuno/get_slices?pageNum=${pageNum}&pageSize=${pageSize}`, data).then(({ code, data, message }) => {
            if (code === CODE.SUCCESS) {
                setTotal(data.total);
                setUnfinished(data.unfinished);
                setSearchList(data.result);
            } else {
                Message.error(message);
            }
        });
    };

    useEffect(() => {
        let data = {
            filters: JSON.stringify({ status: [2, 3] }),
            sort_key:'receive_time',
            sort_value:'1'
        };
        getCaseRecords({
            pageNum: pageNum.current,
            pageSize: pageLength.current,
            data,
        });
        getFacilities();
    }, []);

    const handleContrastClick = record => {
        api('immuno/alter_slice_contrast_status', {
            slices_id: JSON.stringify([record.slice_id]),
        }).then(({ code }) => {
            if (code === CODE.SUCCESS) {
                handleSearch('', filters);
            }
        });
    };

    const changeApplyStatus = () => {
        confirm({
            content: '确认切片完成？',
            onOk: async e => {
                api('immuno/alter_slice_status', {
                    slices_id: JSON.stringify(waxId),
                    status: 3,
                }).then(data => {
                    if (CODE.SUCCESS === data.code) {
                        Message.success('切片完成');
                        setWaxId([]);
                        handleSearch({current:pageNum.current}, filters);
                    } else {
                        Message.error(data.message);
                    }
                });
            },
        });
    };

    const printCode = () => {
        if (!remote && !ipcRenderer) return;
        let codeFlag = remote.getGlobal('sharedObject').printMoleculeLabelStatus;
        if (codeFlag) return;

        let tilingData = [];
        searchList.forEach(parent => {
            parent.children.forEach(child => {
                tilingData = tilingData.concat([child]);
            });
        });

        let result = waxId
            .map(o => tilingData.find(e => e.id === o))
            .filter(o => o && o)
            .map(res => ({
                moleculePathnum: res.sample_pathnum,
                resueMoleculePathnum: null,
                samplePathnum: res.sample_pathnum,
                paraffinNum: res.sample_num,
                tagType: res.tag_type,
            }));

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

        api('molecule/alter_slice_print_status', { slice_ids: JSON.stringify(waxId) }).then(({ code, message }) => {
            if (code === CODE.SUCCESS) handleSearch('', filters);
            else Message.error(message);
        });
    };

    const handleSearch = (pagination, filters) => {
        //setWaxId([]);
        let { current, pageSize } = pagination;
        let { status } = filters;
        pageNum.current = current || 1;
        pageLength.current = pageSize || pageLength.current;
        if (dateRange.length) {
            filters.receive_time = [fmtDate(dateRange[0]), fmtDate(dateRange[1])];
        } else {
            if (filters.receive_time) delete filters.receive_time;
        }

        if (inputValue) {
            filters.immu_num = inputValue.trim();
        } else {
            if (filters.immu_num) delete filters.immu_num;
        }
        filters.status = status && status.length ? status : inputValue ? '[]' : [2, 3];
        let data = {
            filters: JSON.stringify(filters),
            sort_key:'receive_time',
            sort_value:'1',
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
            <IhcTable
                searchList={searchList}
                total={total}
                unfinishedLength={unfinished}
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
