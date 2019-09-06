import React, { useState, useEffect } from 'react';
import style from './index.css';
import Input from 'input';
import Select from 'select';
import Table from 'table';
import CommonWords from 'commonWords';
import { api, userInfo } from 'utils';
import { CODE } from 'myConstants';
import confirm from 'confirm';
import Message from 'message';

const texts = require('./lan/zh.js');
export default function Index(props) {
    const getColumns = () => {
        let total = 0;
        props.wax.waxList.forEach(o => {
            total += Number(o.quantity);
        });
        const column = [
            {
                title: '任务来源',
                width: 100,
                dataIndex: 'source',
                render: value => texts.source[value],
            },
            {
                title: '标本类型',
                dataIndex: 'sample_type',
                width: 100,
                render: value => texts.sampleType[value],
            },
            {
                title: '序号',
                dataIndex: 'index',
                width: 60,
                render: (text, record, index) => index + 1,
            },
            {
                title: '蜡块号',
                dataIndex: 'paraffin_num',
                width: 140,
                count: props.wax.waxList.length,
            },
            {
                title: '组织名称',
                dataIndex: 'name',
                width: 120,
            },
            {
                title: '材块数',
                dataIndex: 'quantity',
                count: total,
                width: 160,
            },
            {
                title: '取材时间',
                dataIndex: 'receive_time',
                width: 180,
            },
            {
                title: '取材医生',
                dataIndex: 'doctor',
                width: 100,
            },
            {
                title: '记录员',
                dataIndex: 'recorder',
                width: 100,
            },
            {
                title: '备注',
                dataIndex: 'remark',
            },
            {
                title: '操作',
                dataIndex: 'option',
                width: 100,
                fixed: 'right',
                render: (text, record, index) => (
                    <React.Fragment>
                        <span
                            className={`${style.deleteBtn} ${
                                record.editable === 0 || !props.editable ? style.disable : ''
                            }`}
                            onClick={
                                record.editable === 0 || !props.editable
                                    ? e => e
                                    : e => props.deleteWax(index, record.paraffin_id)
                            }
                        >
                            删除
                        </span>
                    </React.Fragment>
                ),
            },
        ];
        return column;
    };
    const labelStyle = {
        width: '150px',
        display: 'inline-block',
        textAlign: 'right',
    };

    const {
        wax,
        handleSeenChange,
        add,
        changeCurList,
        curList,
        editable,
        multiClick,
        save,
        finish,
        showAddParaffin,
        changeAddParaffin,
    } = props;

    useEffect(() => {
        if (showAddParaffin) {
            const element = document.getElementById('addParaffin');
            element.onkeydown = e => {
                if (e.keyCode === 13 && curList.name.trim() && curList.quantity) {
                    add(curList);
                } else if (e.keyCode === 27) {
                    changeAddParaffin(false);
                }
            };
            return () => {
                element.onkeydown = null;
            };
        }
    }, [showAddParaffin, add, curList, changeAddParaffin]);

    useEffect(() => {
        if (showAddParaffin) {
            // 默认聚焦标本号
            document
                .getElementById('paraffin_id')
                .querySelector('input')
                .focus();
        }
    }, [showAddParaffin]);

    /* 常用词相关功能开始 */

    const [initialWords, setInitialWords] = useState(null);
    const getWords = () => {
        api('report/get_high_freq', {
            user_id: userInfo().user_id,
            type:0
        }).then(({ code, data }) => {
            if (CODE.SUCCESS === code) {
                setInitialWords(data.res);
            }
        });
    };
    useEffect(() => getWords(), []);

    const resetWords = () => {
        confirm({
            content: '确定重置吗？',
            onOk: e => {
                api('report/del_high_freq', {
                    user_id: userInfo().user_id,
                    type:0
                }).then(({ code }) => {
                    if (CODE.SUCCESS === code) {
                        getWords();
                        localStorage.expandedKeys='';
                    }
                });
            },
        });
    };

    const fetchUpdate = pureTree => {
        api('report/update_high_freq', {
            content: JSON.stringify(pureTree),
            user_id: userInfo().user_id,
            type:0
        }).then(({ code, message }) => {
            if (CODE.SUCCESS !== code) {
                Message.error(message);
            }
        });
    };

    /* 常用词相关功能结束 */

    return (
        <div className={style.meta}>
            {showAddParaffin && (
                <div className={style.addSampleDialogWrap} id="addParaffin">
                    <div className={style.addSampleDialog}>
                        <div className={style.addSampleHeader}>
                            <span>新增蜡块</span>
                            <img
                                src={require('@images/dialog_close.svg')}
                                alt=""
                                className={style.close}
                                onClick={e => changeAddParaffin(false)}
                            />
                        </div>
                        <div className={style.addSampleContent}>
                            <div className={style.row} id="paraffin_id">
                                <Input
                                    required
                                    lineFeed={false}
                                    label="组织名称："
                                    containerStyle={{ marginTop: '15px' }}
                                    labelStyle={labelStyle}
                                    inputStyle={{ width: '240px' }}
                                    value={curList ? curList.name : ''}
                                    onChange={e => changeCurList(e, 'name')}
                                />
                            </div>
                            <div className={style.row}>
                                <Input
                                    required
                                    lineFeed={false}
                                    label="材块数："
                                    labelStyle={labelStyle}
                                    inputStyle={{ width: '240px' }}
                                    value={curList ? curList.quantity : ''}
                                    validate={value => {
                                        value = value.replace(/^(0+)|[^\d]/g, '');
                                        return value;
                                    }}
                                    onChange={e => changeCurList(e, 'quantity')}
                                />
                            </div>
                            <div className={style.row}>
                                <Select
                                    label="任务来源："
                                    lineFeed={false}
                                    options={[
                                        { title: '正常', value: 0 },
                                        { title: '冰冻', value: 1 },
                                        { title: '补取', value: 2 },
                                    ]}
                                    value={curList ? curList.source || '正常' : ''}
                                    onChange={e => changeCurList(e, 'source')}
                                    labelStyle={labelStyle}
                                    selectStyle={{
                                        width: '240px',
                                    }}
                                />
                            </div>
                            <div className={style.row}>
                                <Select
                                    label="取材医生："
                                    lineFeed={false}
                                    options={[
                                        { title: 'A', value: 'A' },
                                        { title: 'B', value: 'B' },
                                        { title: 'C', value: 'C' },
                                    ]}
                                    value={curList ? curList.doctor : ''}
                                    onChange={e => changeCurList(e, 'doctor')}
                                    labelStyle={labelStyle}
                                    selectStyle={{
                                        width: '240px',
                                    }}
                                />
                            </div>
                            <div className={style.row}>
                                <Select
                                    label="标本类型："
                                    lineFeed={false}
                                    options={[
                                        { title: '请选择', value: '' },
                                        { title: '大标本', value: 0 },
                                        { title: '小标本', value: 1 },
                                    ]}
                                    value={curList ? curList.sample_type : null}
                                    onChange={e => changeCurList(e, 'sample_type')}
                                    labelStyle={labelStyle}
                                    selectStyle={{
                                        width: '240px',
                                    }}
                                />
                            </div>
                            <div className={style.row}>
                                <Input
                                    lineFeed={false}
                                    label="备注："
                                    containerStyle={{ marginBottom: '5px' }}
                                    labelStyle={labelStyle}
                                    inputStyle={{ width: '240px' }}
                                    value={curList ? curList.remark : ''}
                                    onChange={e => changeCurList(e, 'remark')}
                                />
                            </div>
                        </div>
                        <div className={style.footer}>
                            <div className={style.addSamplebtnGroup}>
                                <span onClick={e => changeAddParaffin(false)}>取消</span>
                                <span
                                    className={
                                        curList && curList.quantity && curList.name.trim().length > 0
                                            ? style.canAddSample
                                            : ''
                                    }
                                    onClick={
                                        curList && curList.quantity && curList.name.trim().length && multiClick > 0
                                            ? e => {
                                                  add(curList);
                                              }
                                            : e => e
                                    }
                                >
                                    新增
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className={style.tabbox}>
                <div className={style.left}>
                    <div className={style.seen}>
                        <h2>
                            肉眼所见 <span className={style.photo} style={{background:`url(${require("@images/photo.svg")}) no-repeat 12px center #fff`}}>拍照</span>
                            <span className={style.voice} style={{background:`url(${require("@images/voice.svg")}) no-repeat 10px center #fff`}}>语音输入</span>
                        </h2>
                        <textarea
                            placeholder="文字描述"
                            value={wax.seen || ''}
                            onChange={e => handleSeenChange(e, 'seen')}
                        />
                    </div>
                    <div className={style.bottom}>
                        <div className={style.list}>
                            <h3>蜡块列表</h3>
                            <button
                                className={!editable ? style.disable : null}
                                disabled={!editable || !multiClick ? true : false}
                                onClick={e => changeAddParaffin(true)}
                            >
                                新增
                            </button>
                        </div>
                        <Table columns={getColumns()} data={wax.waxList} rowKey={'paraffin_num'} scroll={{ x: 1260 }} />
                    </div>
                </div>

                {editable && (
                    <div className={style.right}>
                        {initialWords && (
                            <CommonWords
                                tree={initialWords}
                                dbclick={e => handleSeenChange(e, 'seen','common')}
                                resetWords={resetWords}
                                fetchUpdate={fetchUpdate}
                            />
                        )}
                    </div>
                )}
            </div>
            <div className={style.bottons}>
                <div className={style.box}>
                    <Input lineFeed={false} label="包埋盒：" inputStyle={{ width: '38px', marginRight: '5px',height:'34px' }} />
                    ~
                    <Input lineFeed={false} inputStyle={{ width: '38px', marginLeft: '5px',height:'34px' }} />
                    <button className={!editable ? style.disable : null} disabled={!editable}>
                        打印包埋盒
                    </button>
                    <Select
                        label="标本处理记录："
                        lineFeed={false}
                        selectStyle={{ width: '124px', marginLeft: '6px' }}
                        options={[
                            { title: '常规保留', value: 0 },
                            { title: '已取完', value: 1 },
                            { title: '永久保留', value: 2 },
                            { title: '教学标本', value: 3 },
                            { title: '科研标本', value: 4 },
                        ]}
                        value={wax.record || 0}
                        onChange={e => handleSeenChange(e, 'record')}
                    />
                </div>
                <div className={style.btn}>
                    <button
                        className={style.fr + ' ' + style.w100 + ' ' + (editable ? '' : style.disable)}
                        disabled={!editable}
                    >
                        打印取材记录
                    </button>
                    <button
                        className={style.fr + ' ' + style.w100 + ' ' + (editable ? '' : style.disable)}
                        disabled={!editable}
                    >
                        打印冰冻标签
                    </button>
                    <button
                        className={style.fr + ' ' + (editable && wax.waxList.length ? '' : style.disable)}
                        onClick={e => save(finish, 1)}
                        disabled={!editable || !wax.waxList.length}
                    >
                        完成取材
                    </button>
                    <button
                        className={style.fr + ' ' + (editable ? '' : style.disable)}
                        onClick={e => save(null, 0)}
                        disabled={!editable}
                    >
                        保存
                    </button>
                </div>
            </div>
        </div>
    );
}
