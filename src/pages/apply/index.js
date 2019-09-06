import React, { useState, useEffect, useRef } from 'react';
import Page from 'page';
import style from './index.css';
import Table from 'table';
import Detail from './detail';
import Select from 'select';
import Input from 'input';
import { NEW_APPLY, COPY_APPLY, MODIFY_APPLY, CODE } from 'myConstants';
import { api } from 'utils';

const texts = require('./lan/zh.js');

function Header(props) {
    return (
        <div className={style.topWrap}>
            <span className={style.btn} onClick={props.handleAddApply}>
                登记/接收
            </span>
        </div>
    );
}

function Search(props) {
    const [searchType, setSearchType] = useState('all');
    const [keyWords, setKeyWords] = useState('');
    const handleSearch = () => {
        props.onSearch(searchType, keyWords);
    };

    const handleSearchAll = () => {
        setSearchType('all');
        setKeyWords('');
        props.onSearch();
    };

    return (
        <div className={style.searchWrap}>
            <Select
                label=''
                lineFeed={false}
                options={[
                    { title: '全部', value: 'all' },
                    { title: '申请单号', value: 'his_apply_id' },
                    { title: '住院号', value: 'admission_num' },
                    { title: '门诊号', value: 'outpatient_num' },
                    { title: '姓名', value: 'name' },
                    { title: '患者识别号', value: 'identify_id' }
                ]}
                value={searchType}
                onChange={value => setSearchType(value)}
                containerStyle={{
                    marginLeft: '22px',
                    marginRight: '9px'
                }}
                selectStyle={{
                    width: '142px'
                }}
            />
            <Input
                label=''
                lineFeed={false}
                value={keyWords}
                onChange={e => setKeyWords(e.target.value)}
                onKeyDown={e => e.keyCode === 13 && handleSearch()}
                inputStyle={{ fontSize: '14px', color: '#2E3134' }}
            />
            <span className={style.all} onClick={handleSearchAll}>
                全部信息
            </span>
            <span className={style.search} onClick={handleSearch}>
                查询
            </span>
            
        </div>
    );
}

export default function Index(props) {
    const columns = [
        {
            title: '申请单号',
            dataIndex: 'his_apply_id',
            width: 140
        },
        {
            title: '患者识别号',
            dataIndex: 'identify_id',
            width: 180
        },
        {
            title: '姓名',
            dataIndex: 'name',
            width: 110
        },
        {
            title: '性别',
            dataIndex: 'gender',
            width: 110,
            render: value => texts.gender[value]
        },
        {
            title: '年龄',
            dataIndex: 'age',
            width: 110
        },
        {
            title: '临床诊断',
            dataIndex: 'clinical_diagnosis',
            width: 200
        },
        {
            title: '申请类别',
            dataIndex: 'apply_type',
            width: 110,
            render: values =>
                values ? values.map(o => texts.applyType[o]).join('，') : ''
        },
        {
            title: '取样部位',
            width: 110,
            dataIndex: 'sampling_location'
        },
        {
            title: '登记时间',
            dataIndex: 'checkin_time',
            width: 200
        },
        {
            title: '患者来源',
            dataIndex: 'source',
            width: 110,
            render: value => texts.source[value]
        },
        {
            title: '住院号',
            width: 140,
            dataIndex: 'admission_num'
        },
        {
            title: '门诊号',
            width: 140,
            dataIndex: 'outpatient_num'
        },
        {
            title: '送检科室',
            width: 110,
            dataIndex: 'deliver_did'
        },
        {
            title: '送检医生',
            width: 110,
            dataIndex: 'deliver_doc'
        },
        {
            title: '状态',
            dataIndex: 'sample_status',
            render: value => (
                <>
                    <span
                        className={style.dot}
                        style={{
                            background: { 0: '#6FC831', 1: '#4DAFDB' }[value]
                        }}
                    />
                    {texts.applyStatus[value]}
                </>
            )
        },
        {
            title: '操作',
            fixed: 'right',
            dataIndex: 'option',
            width: 150,
            render: (value, { pis_apply_id }) => (
                <>
                    <span
                        className={style.newBtn}
                        onClick={e =>
                            handleOpenDetail(pis_apply_id, COPY_APPLY)
                        }
                    >
                        新建
                    </span>
                    <span
                        className={style.updateBtn}
                        onClick={e =>
                            handleOpenDetail(pis_apply_id, MODIFY_APPLY)
                        }
                    >
                        修改
                    </span>
                </>
            )
        }
    ];

    const [applyList, setApplyList] = useState([]);
    const [showDetail, setShowDetail] = useState(false);
    // 缓存查询条件，在详情页关闭时，需要根据之前的查询条件进行数据刷新
    const searchCondition = useRef();
    // 记录进入的详情数据
    const currentApply = useRef({
        originApplyId: '',
        applyId: '',
        action: ''
    });

    useEffect(() => fetchData(), []);

    /************************ api ************************/

    const fetchData = (type = 'all', value = '') => {
        api('records/search_appli', { type, value }).then(({ code, data }) => {
            if (CODE.SUCCESS === code) {
                setApplyList(data.appli_info);
            }
        });
    };

    const getNewApplyId = () => {
        return new Promise(resolve =>
            api('records/add_appli').then(({ code, data }) => {
                if (CODE.SUCCESS === code) {
                    resolve(data.pis_apply_id);
                }
            })
        );
    };

    /************************ handler ************************/

    const handleOpenDetail = async (applyId, action) => {
        switch (action) {
            case NEW_APPLY:
                currentApply.current = {
                    applyId: await getNewApplyId(),
                    action
                };
                break;
            case COPY_APPLY:
                currentApply.current = {
                    originApplyId: applyId,
                    applyId: await getNewApplyId(),
                    action
                };
                break;
            case MODIFY_APPLY:
                currentApply.current = { applyId, action };
                break;
            default:
                throw new Error('action not found.');
        }
        setShowDetail(true);
    };

    const handleSearch = (searchType, keyWords) => {
        searchCondition.current = { searchType, keyWords };
        fetchData(searchType, keyWords);
    };

    const handleCloseDetail = () => {
        setShowDetail(false);
        const { searchType, keyWords } = searchCondition.current || {};
        fetchData(searchType, keyWords);
    };

    return (
        <Page>
            <div className={style.container}>
                <Header
                    handleAddApply={() => handleOpenDetail('', NEW_APPLY)}
                />

                <div className={style.applyTblWrap}>
                    <div className={style.titleWrap}>
                        <span
                            className={style.title}
                            style={{
                                backgroundImage: `url(${require('@images/list.svg')})`
                            }}
                        >
                            申请表
                        </span>
                        <Search onSearch={handleSearch} />
                    </div>
                    <Table
                        columns={columns}
                        data={applyList}
                        rowKey={'pis_apply_id'}
                        onRow={({ pis_apply_id }) => ({
                            onDoubleClick: event =>
                                handleOpenDetail(pis_apply_id, MODIFY_APPLY)
                        })}
                        scroll={{ x: 2120, y: 253 }}
                    />
                </div>

                {showDetail && (
                    <Detail
                        regionApplyId={currentApply.current.originApplyId}
                        applyId={currentApply.current.applyId}
                        action={currentApply.current.action}
                        close={handleCloseDetail}
                    />
                )}
            </div>
        </Page>
    );
}
