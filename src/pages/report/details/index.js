import React, { useState, useEffect, useRef, useCallback } from 'react';
import style from './index.css';
import Diagnosis from './diagnosis';
import Application from 'application';
import { api } from 'utils';
import Confirm from 'confirm';
import { CODE } from 'myConstants';
import Paraffin from 'paraffin';
import DoctorAdvice from './doctoradvice';
import SubReport from './subreport';
import Patient from 'patient';

const APPLY_INFO = 0;
const PRETREATMENT = 1;
const SANMLE_RECORD = 2;
const PATHOLOGIC_DIAGNOSIS = 3;

export default function Index(props) {
    const { secondLevel=false } = props;
    const [nav, setNav] = useState(PATHOLOGIC_DIAGNOSIS);
    const [applyInfo, setApplyInfo] = useState({});
    const [reportInfo, setReportInfo] = useState(null);
    const [patientInfo, setPatientInfo] = useState(null);
    const [reportChange, setReportChange] = useState(false);
    const [wax, setWax] = useState({});
    const diagnosis = useRef();

    const getMainReport = useCallback(() => {
        api(`report/get_report?pathnum=${props.record.pathnum}&type=0`).then(data => {
            if (data.code === CODE.SUCCESS) {
                setReportInfo(data.data);
            }
        });
    }, [props]);

    const getApplicationInfo = useCallback(() => {
        api('records/get_appli', {
            pis_apply_id: props.record.pis_apply_id,
        }).then(data => {
            if (data.code === CODE.SUCCESS) {
                let tmp = {
                    id: data.data.basicMessage.identify_id,
                    pathnum: props.record.pathnum,
                };
                setApplyInfo(data.data);
                setPatientInfo(tmp);
            }
        });
    }, [props]);

    const getSampleRecord = useCallback(() => {
        api('records/get_case', { pathnum: props.record.pathnum }).then(({ code, message, data }) => {
            if (code === CODE.SUCCESS) {
                setWax(data);
                window.seen = data.seen;
            }
        });
    }, [props]);

    useEffect(() => {
        getMainReport();
        getApplicationInfo();
        getSampleRecord();
        return () => {};
    }, [getMainReport, getApplicationInfo, getSampleRecord]);

    const close = (change = reportChange) => {
        if (change) {
            Confirm({
                type: 'close',
                onNotSave: props.close,
                onSave: e => diagnosis.current.save(props.close),
            });
        } else {
            props.close();
        }
    };

    const toggleNav = tag => {
        setNav(tag);
    };

    const isChange = value => {
        setReportChange(value);
    };

    return (
        <div className={style.detail}>
            <div className={style.header}>
                报告
                <div className={style.close} onClick={e => close()}>
                    <img src={require('@images/close.png')} width="20" alt="" />
                </div>
            </div>
            <div style={{width:'calc(100% - 32px)',height:'60px',margin:'0px auto',marginBottom:'10px',borderRadius:'4px'}}>
                {
                    patientInfo && 
                    <Patient id={patientInfo.id} secondLevel={secondLevel} pathnum={patientInfo.pathnum}></Patient>
                }
            </div>
            <div className={style.zone}>
                <div style={{float:'left'}}>
                    {
                        patientInfo && 
                        <DoctorAdvice secondLevel={secondLevel} patientInfo={patientInfo}></DoctorAdvice>
                    }
                </div>
                <div style={{float:'right'}}>
                    <SubReport></SubReport>
                </div>
            </div>
            <div className={style.part}>
                <div
                    className={`${style.tab} ${nav === PATHOLOGIC_DIAGNOSIS ? style.active : ''}`}
                    onClick={e => toggleNav(PATHOLOGIC_DIAGNOSIS)}
                >
                    病理诊断

                </div>
                <div
                    className={`${style.tab} ${nav === APPLY_INFO ? style.active : ''}`}
                    style={{ left: '160px' }}
                    onClick={e => toggleNav(APPLY_INFO)}
                >
                    申请信息

                </div>
                <div
                    className={`${style.tab} ${nav === PRETREATMENT ? style.active : ''}`}
                    style={{ left: '310px' }}
                    onClick={e => toggleNav(PRETREATMENT)}
                >
                    预处理记录

                </div>
                <div
                    className={`${style.tab} ${nav === SANMLE_RECORD ? style.active : ''}`}
                    style={{ left: '460px' }}
                    onClick={e => toggleNav(SANMLE_RECORD)}
                >
                    取材记录
                </div>
                <div className={style.content}>
                    {nav === APPLY_INFO && (
                        <div className={style['app-box']}>
                            <Application appli={applyInfo} />
                        </div>
                    )}
                    {reportInfo && patientInfo && (
                        <Diagnosis
                            ref={diagnosis}
                            reportInfo={reportInfo}
                            patientInfo={patientInfo}
                            visible={nav === PATHOLOGIC_DIAGNOSIS}
                            isChange={isChange}
                            secondLevel={secondLevel}
                        />
                    )}
                    {nav === SANMLE_RECORD && (
                        <div className={style['app-box']}>
                            <Paraffin
                                changeCurList={e => e}
                                wax={wax}
                                handleSeenChange={e => e}
                                editable={false}
                            />
                        </div>
                    )}
                    {nav === PRETREATMENT && <div className={style['app-box']} />}
                </div>
            </div>
            
        </div>
    );
}
