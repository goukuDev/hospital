import React, { useState, useRef } from 'react';
import style from './index.css';
import Panel from 'panel';
import Input from 'input';
import Select from 'select';
import DatePicker from 'datepicker';
import Table from 'table';
import Moment from 'moment';
import confirm from 'confirm';
import { userInfo, isNotNull } from 'utils';
import { EMOTION_REG } from 'myConstants';
import Message from 'message';

const texts = require('../../lan/zh.js');

function TableHeader(props) {
    const { identifyId, applyId } = props;
    const [sample, setSample] = useState({
        sample_id: '',
        sample_name: null,
        sample_type: 0,
        sampling_location: null,
        separate_time: null
    });

    const handleChange = newState =>
        setSample(prevState => ({ ...prevState, ...newState }));

    const {
        sample_id,
        sample_name,
        sample_type,
        sampling_location,
        separate_time
    } = sample;
    // 新增按钮是否激活(标本号和患者识别号都不能为空)
    const canAdd = isNotNull(sample_id) && isNotNull(identifyId);

    const addSample = e =>
        props.addSample(
            Object.assign({}, sample, {
                pis_apply_id: applyId,
                receive_time: Moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
                status: 0,
                tag_printed: 0,
                app_printed: 0,
                receiver: userInfo().name
            })
        );

    return (
        <div className={style.listHeader}>
            <img src={require('@images/list.svg')} alt='' />
            <span className={style.listTitle}>标本列表</span>

            <div className={style.operations}>
                <Input
                    required
                    label='标本号：'
                    lineFeed={false}
                    value={sample_id}
                    onChange={e => handleChange({ sample_id: e.target.value })}
                    inputStyle={{ width: '100px' }}
                />
                <Select
                    label='标本类型：'
                    lineFeed={false}
                    options={[
                        { title: '手术标本', value: 0 },
                        { title: '冰冻标本', value: 1 },
                        { title: '活检标本', value: 2 }
                    ]}
                    value={sample_type}
                    onChange={value => handleChange({ sample_type: value })}
                    containerStyle={{
                        marginTop: '8px',
                        marginLeft: '10px'
                    }}
                    selectStyle={{
                        width: '121px'
                    }}
                />
                <Input
                    label='采集部位：'
                    lineFeed={false}
                    value={sampling_location}
                    onChange={e =>
                        handleChange({ sampling_location: e.target.value })
                    }
                    containerStyle={{ marginLeft: '10px' }}
                    inputStyle={{ width: '138px' }}
                />
                <Input
                    label='标本名称：'
                    lineFeed={false}
                    value={sample_name}
                    onChange={e =>
                        handleChange({ sample_name: e.target.value })
                    }
                    containerStyle={{ marginLeft: '10px' }}
                    inputStyle={{ width: '142px' }}
                />
                <DatePicker
                    label='离体时间：'
                    lineFeed={false}
                    value={separate_time ? Moment(separate_time) : null}
                    onChange={(date, dateString) =>
                        handleChange({ separate_time: dateString })
                    }
                    containerStyle={{ marginLeft: '10px' }}
                    inputStyle={{ width: '145px' }}
                />
                <span
                    className={`${style.addBtn} ${canAdd ? style.active : ''}`}
                    onClick={canAdd ? addSample : e => e}
                >
                    新增
                </span>
            </div>
        </div>
    );
}

function RejectDialog(props) {
    const [reason, setReason] = useState('');
    const { visible, sampleId, close } = props;

    const rejectSample = () => {
        if (isNotNull(reason)) {
            props.rejectSample({ id: sampleId, reason: reason });
            close();
        } else {
            Message.info('请输入拒收原因！');
        }
    };

    return visible ? (
        <div className={style.rejectWrap}>
            <div className={style.rejectContent}>
                <span className={style.rejectHeader}>
                    拒收标本
                    <img
                        src={require('@images/close_dialog.svg')}
                        alt=''
                        className={style.rejectClose}
                        onClick={close}
                    />
                </span>
                <div className={style.contentWrap}>
                    <span className={style.label}>拒收原因：</span>
                    <textarea
                        className={style.reason}
                        value={reason}
                        onChange={e => e}
                        onInput={e =>
                            setReason(e.target.value.replace(EMOTION_REG, ''))
                        }
                    />
                </div>
                <div className={style.footerWrap}>
                    <span className={style.cancel} onClick={close}>
                        取消
                    </span>
                    <span className={style.ok} onClick={rejectSample}>
                        确定
                    </span>
                </div>
            </div>
        </div>
    ) : null;
}

function TableFooter(props) {
    const { sampleIds, setSampleIds, sampleInfo, getPathNum, applyId } = props;
    const [applyType, setApplyType] = useState(0);
    const [pathNum, setPathNum] = useState('');
    const [showDialog, setShowDialog] = useState(false);
    // 是否可以分配病理号
    const canAssign = sampleIds.length > 0;

    const assignSample = () => {
        // 判断是否与当前申请单中的病理号重复
        const pathNums = sampleInfo.map(o => o.pathnum).filter(o => o);
        const ids = sampleInfo
            .filter(sample => sampleIds.includes(sample.id))
            .map(sample => ({ [sample.sample_id]: sample.sample_id }));

        const assign = e => {
            const params = {
                apply_type: applyType,
                pathnum: pathNum,
                pis_apply_id: applyId,
                sample_id: JSON.stringify(Object.assign({}, ...ids))
            };

            props.assignSample(params);
            setShowDialog(false);
        };

        if (pathNums.includes(pathNum)) {
            confirm({
                content: '该病理号已属于本申请，是否将所选标本并入该病理号',
                onOk: assign
            });
        } else {
            assign();
            setSampleIds([]); // 清空勾选的标本
        }
    };

    const handleAssignBtnClick = async e => {
        if (canAssign) {
            setPathNum(await getPathNum());
            setShowDialog(true);
        }
    };

    return (
        <div className={style.btnGroup}>
            <Select
                label='申请类别：'
                lineFeed={false}
                options={[
                    { title: '常规病理', value: 0 },
                    { title: '外院会诊', value: 1 },
                    { title: '术中冰冻', value: 2 },
                    { title: '细胞学', value: 3 }
                ]}
                value={applyType}
                onChange={value => setApplyType(value)}
                containerStyle={{
                    marginTop: '8px',
                    marginLeft: '22px'
                }}
                selectStyle={{
                    width: '121px'
                }}
            />
            <div className={style.btnWrap}>
                <span
                    className={`${style.btn} ${
                        canAssign ? '' : style.disabledBtn
                    }`}
                    onClick={handleAssignBtnClick}
                >
                    分配病理号
                </span>
                {showDialog && (
                    <div className={style.dialogWrap}>
                        <div className={style.dialogTitle}>分配病理号</div>
                        <div className={style.dialogContent}>
                            <Input
                                label='病理号：'
                                lineFeed={false}
                                value={pathNum}
                                onChange={e => setPathNum(e.target.value)}
                                inputStyle={{ width: '263px' }}
                            />
                        </div>
                        <div className={style.dialogBtns}>
                            <span
                                className={style.cancel}
                                onClick={e => setShowDialog(false)}
                            >
                                取消
                            </span>
                            <span className={style.ok} onClick={assignSample}>
                                确定
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function TableWrap(props) {
    const currentSampleId = useRef(null);
    const columns = [
        {
            title: '标本号',
            dataIndex: 'sample_id'
        },
        {
            title: '标本类型',
            dataIndex: 'sample_type',
            render: value => texts.sampleType[value]
        },
        {
            title: '标本采集部位',
            dataIndex: 'sampling_location'
        },
        {
            title: '送检标本名称',
            dataIndex: 'sample_name'
        },
        {
            title: '离体时间',
            dataIndex: 'separate_time'
        },
        {
            title: '接收时间',
            dataIndex: 'receive_time'
        },
        {
            title: '接收员',
            dataIndex: 'receiver'
        },
        {
            title: '申请类别',
            dataIndex: 'apply_type',
            render: value => texts.applyType[value]
        },
        {
            title: ' 病理号',
            dataIndex: 'pathnum'
        },
        {
            title: '标本状态',
            dataIndex: 'status',
            render: value => (
                <>
                    <span
                        className={style.dot}
                        style={{
                            background: { 0: '#4DAFDB', 1: '#F2B324' }[value]
                        }}
                    />
                    {texts.sampleStatus[value]}
                </>
            )
        },
        {
            title: '标签状态 ',
            dataIndex: 'tag_printed',
            render: value => texts.tagPrinted[value]
        },
        {
            title: '申请单状态',
            dataIndex: 'app_printed',
            render: value => texts.appPrinted[value]
        },
        {
            title: '拒收原因',
            dataIndex: 'reject_reason'
        },
        {
            title: '操作',
            dataIndex: 'option',
            render: (text, record) => {
                const { isRejected } = record;

                return (
                    <div onClick={e => e.stopPropagation()}>
                        <span
                            className={`${style.btn1} ${
                                isRejected ? style.disabled : ''
                            }`}
                            onClick={
                                isRejected
                                    ? e => e
                                    : e => deleteSample(record.id)
                            }
                        >
                            删除
                        </span>
                        <span
                            className={`${style.btn2} ${
                                isRejected ? style.disabled : ''
                            }`}
                            onClick={
                                isRejected
                                    ? e => e
                                    : e => {
                                          currentSampleId.current = record.id;
                                          setShowRejectDialog(true);
                                          setSampleIds(
                                              sampleIds.filter(
                                                  id => id !== record.id
                                              )
                                          );
                                      }
                            }
                        >
                            拒收
                        </span>
                        <span className={style.btn3}>打印标签</span>
                        <span
                            className={`${style.btn4} ${
                                isRejected || !record.pathnum
                                    ? style.disabled
                                    : ''
                            }`}
                            onClick={
                                isRejected || !record.pathnum
                                    ? e => e
                                    : e => {
                                          printApply(record.pathnum);
                                      }
                            }
                        >
                            打印申请单
                        </span>
                    </div>
                );
            }
        }
    ];

    const {
        basicMessage,
        applyMessage = {},
        sampleInfo,
        addSample,
        rejectSample,
        assignSample,
        getPathNum
    } = props;
    const { identify_id: identifyId } = basicMessage;
    const { pis_apply_id: applyId } = applyMessage;
    const [sampleIds, setSampleIds] = useState([]);
    const [showRejectDialog, setShowRejectDialog] = useState(false);

    const printApply = pathnum => {
        let ipcRenderer = window.electron && window.electron.ipcRenderer;
        if (ipcRenderer) {
            ipcRenderer.send('print', {
                message_type: 'apply',
                pis_apply_id: applyMessage.pis_apply_id,
                pathnum: pathnum
            });
        }
    };

    const deleteSample = sample_id => {
        confirm({
            content: '确认删除标本？',
            onOk: e => {
                setSampleIds(sampleIds.filter(id => id !== sample_id));
                props.deleteSample({ id: sample_id });
            }
        });
    };

    return (
        <div className={style.listWrap}>
            <TableHeader
                identifyId={identifyId}
                applyId={applyId}
                addSample={addSample}
            />
            <Table
                columns={columns}
                data={sampleInfo}
                rowKey={'id'}
                onRow={record => ({
                    onClick: event => {
                        // "已拒收" 状态直接返回
                        if (record.isRejected) return;

                        const { id } = record;

                        if (sampleIds.includes(id)) {
                            setSampleIds(
                                sampleIds.filter(sampleId => sampleId !== id)
                            );
                        } else {
                            setSampleIds(sampleIds.concat([id]));
                        }
                    }
                })}
                selectedRowKeys={sampleIds}
                onSelectChange={sampleIds => setSampleIds(sampleIds)}
                style={{
                    width: '100%'
                }}
            />
            <RejectDialog
                visible={showRejectDialog}
                sampleId={currentSampleId.current}
                rejectSample={rejectSample}
                close={() => setShowRejectDialog(false)}
            />
            <TableFooter
                sampleIds={sampleIds}
                setSampleIds={setSampleIds}
                sampleInfo={sampleInfo}
                applyId={applyId}
                getPathNum={getPathNum}
                assignSample={assignSample}
            />
        </div>
    );
}

export default function SampleInfo(props) {
    const { applyMessage, updateState } = props;

    return (
        <Panel
            icon={require('@images/list.svg')}
            title='标本信息'
            className={style.panel}
        >
            <div className={style.content}>
                <span className={style.title}>手术所见</span>
                <textarea
                    value={applyMessage.surgery_message || ''}
                    onChange={e => e}
                    onInput={e =>
                        updateState({
                            surgery_message: e.target.value.replace(
                                EMOTION_REG,
                                ''
                            )
                        })
                    }
                />
            </div>
            <TableWrap {...props} />
        </Panel>
    );
}
