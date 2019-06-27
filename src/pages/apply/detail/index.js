import React, { useState, useRef, useEffect } from 'react';
import style from './index.css';
import BasicInfo from './basicInfo';
import ApplyInfo from './applyInfo';
import SampleInfo from './sampleInfo';
import deep from 'deep';
import Message from 'message';
import { ACTIONS, CODE, SAMPLE_STATUS } from 'myConstants';
import { api, isNotNull, fmtDate } from 'utils';
import confirm from 'confirm';
import Transition from 'transition';

export default function Detail(props) {
    const [basicMessage, setBasicMessage] = useState({});
    const [applyMessage, setApplyMessage] = useState({});
    const [sampleInfo, setSampleInfo] = useState([]);
    const compareData = useRef({}); // 缓存初识数据，用于关闭时判断数据是否有改变
    const canSave = isNotNull(basicMessage.identify_id);
    const { regionApplyId, applyId, action, close } = props;

    /************************ api ************************/

    const getApplyData = pis_apply_id =>
        new Promise(resolve =>
            api('records/get_appli', { pis_apply_id }).then(
                ({ code, data }) => {
                    if (CODE.SUCCESS === code) {
                        data.sampleInfo = data.sample_info;
                        resolve(data);
                    }
                }
            )
        );

    const addSample = async (params, callback) => {
        // 新建状态，第一次添加标本时，需要先保存基本信息
        if (
            [ACTIONS.NEW, ACTIONS.COPY].includes(action) &&
            sampleInfo.length === 0
        ) {
            await save({ showSuccessMessage: false });
        }
        api('records/add_sample', params).then(({ code, data, message }) => {
            if (CODE.SUCCESS === code) {
                loadSampleData();
                callback && callback();
            } else {
                Message.error(message);
            }
        });
    };

    const deleteSample = params => {
        api('records/del_sample', params).then(({ code, data, message }) => {
            if (CODE.SUCCESS === code) {
                loadSampleData();
            } else {
                Message.error(message);
            }
        });
    };

    const rejectSample = params => {
        api('records/reject_sample', params).then(({ code, data, message }) => {
            if (CODE.SUCCESS === code) {
                loadSampleData();
            } else {
                Message.error(message);
            }
        });
    };

    const assignSample = params => {
        api('records/assign_sample', params).then(({ code, data, message }) => {
            if (CODE.SUCCESS === code) {
                loadSampleData();
            } else {
                Message.error(message);
            }
        });
    };

    const loadSampleData = async () => {
        const applyData = await getApplyData(applyId);
        const { sample_info: sampleInfo } = applyData;
        setSampleInfo(handleSampleData(sampleInfo));
    };

    // 获取病理号
    const getPathNum = () => {
        return new Promise((resolve, reject) => {
            api('records/get_pathnum').then(({ code, data }) => {
                if (CODE.SUCCESS === code) {
                    resolve(data.pathnum);
                }
            });
        });
    };

    /************************ handler ************************/

    const getDefaultData = () => {
        const currentTime = fmtDate(new Date());

        return {
            basicMessage: {},
            applyMessage: {
                checkin_time: currentTime,
                source: 0,
                sampling_time: currentTime,
                deliver_date: currentTime
            },
            sampleInfo: []
        };
    };

    useEffect(() => {
        async function fetchData() {
            // 复制时需要获取父本的基本信息
            const pis_apply_id =
                ACTIONS.COPY === action ? regionApplyId : applyId;
            const applyData = await getApplyData(pis_apply_id);
            let { basicMessage, applyMessage, sampleInfo } = getDefaultData();

            switch (action) {
                case ACTIONS.NEW:
                    basicMessage.gender = 1;
                    applyMessage.pis_apply_id = applyId;
                    break;
                case ACTIONS.COPY:
                    basicMessage = applyData.basicMessage;
                    applyMessage.pis_apply_id = applyId;
                    break;
                case ACTIONS.MODIFY:
                    basicMessage = applyData.basicMessage;
                    applyMessage = applyData.applyMessage;
                    sampleInfo = handleSampleData(applyData.sampleInfo);
                    break;
                default:
                    console.error('action 不存在');
                    break;
            }

            setBasicMessage(basicMessage);
            setApplyMessage(applyMessage);
            setSampleInfo(sampleInfo);
            compareData.current = { basicMessage, applyMessage, sampleInfo };
        }
        fetchData();
    }, [regionApplyId, applyId, action]);

    const handleSampleData = (data = []) => {
        return data.map(o => {
            if (o.status === SAMPLE_STATUS.REJECTED) {
                return Object.assign({}, o, {
                    isRejected: true,
                    disabled: true
                });
            }
            return o;
        });
    };

    const save = ({ showSuccessMessage = true } = {}) =>
        new Promise((resolve, reject) => {
            const params = {
                basicMessage,
                applyMessage,
                sample_info: sampleInfo,
                pis_apply_id: applyId
            };

            api('records/save_appli', { record: JSON.stringify(params) }).then(
                ({ code, data }) => {
                    if (CODE.SUCCESS === code) {
                        compareData.current = { basicMessage, applyMessage };
                        showSuccessMessage && Message.success('保存成功');
                        resolve();
                    }
                }
            );
        });

    const handleClose = () => {
        const changed =
            (!deep.equals(basicMessage, compareData.current.basicMessage) ||
                !deep.equals(applyMessage, compareData.current.applyMessage)) &&
            isNotNull(basicMessage.identify_id);

        if (changed) {
            confirm({
                type: 'close',
                onNotSave: close,
                onSave: async e => {
                    await save({ showSuccessMessage: false });
                    close();
                }
            });
        } else {
            close();
        }
    };

    return (
        <Transition>
            <div className={style.container}>
                <div className={style.title}>登记/接收</div>
                <img
                    src={require('@images/close.png')}
                    alt=''
                    className={style.close}
                    onClick={handleClose}
                />
                <div className={style.contentWrap}>
                    <div className={style.content}>
                        <BasicInfo
                            action={action}
                            basicMessage={basicMessage}
                            updateState={value => setBasicMessage(value)}
                        />
                        <ApplyInfo
                            applyMessage={applyMessage}
                            updateState={value => setApplyMessage(value)}
                        />
                        <SampleInfo
                            basicMessage={basicMessage}
                            applyMessage={applyMessage}
                            sampleInfo={sampleInfo}
                            addSample={addSample}
                            deleteSample={deleteSample}
                            rejectSample={rejectSample}
                            assignSample={assignSample}
                            getPathNum={getPathNum}
                            updateState={newState =>
                                setApplyMessage({
                                    ...applyMessage,
                                    ...newState
                                })
                            }
                        />
                    </div>
                    <div
                        className={`${style.saveBtn} ${
                            canSave ? style.active : ''
                        }`}
                        onClick={canSave ? e => save() : e => e}
                    >
                        保存
                    </div>
                </div>
            </div>
        </Transition>
    );
}
