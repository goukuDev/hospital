import React, { useState, useEffect, useCallback } from 'react';
import style from './index.css';
import { api } from 'utils';
import { CODE } from 'myConstants';
import ReportDetails from 'report/details';
import EventBus from 'eventBus';

const gender = {
    0: '女',
    1: '男',
    2: '其他',
};
const status = {
    0: '待取材',
    1: '已取材',
    2: '待补取',
    3: '已包埋',
    4: '已切片',
    5: '已染色',
    6: '诊断中',
    7: '已审核',
};
const color = {
    0: '#F5CD5D',
    1: '#509EE0',
    2: '#F5CD5D',
    3: '#87A1F8',
    4: '#ACAEB5',
    5: '#D25BF5',
    6: '#24BEF7',
    7: '#9DD93B',
};
export default function Index(props) {
	
	const { secondLevel=false } = props;
	const [curCase, setCurCase] = useState({});
	const [caseList, setCaseList] = useState([]);
	const [isClose, setIsClose] = useState(false);
	const [reportShow,setReportShow] = useState(false);
	const [currentRecord,setCurrentRecord] = useState(null);

    const getHistory = useCallback(() => {
        api('records/case_history', {
            identify_id: props.id,
            pathnum: props.pathnum,
        }).then(({ code, data }) => {
            if (CODE.SUCCESS === code) {
                setCurCase(data.cur_case);
                setCaseList(data.other_case);
            }
        });
    }, [props.id, props.pathnum]);

    useEffect(() => {
        getHistory();
    }, [getHistory]);

    const toogleMore = () => {
        setIsClose(!isClose);
    };

	const update = () => {
		api('records/case_history', {
			identify_id: props.id,
			pathnum: props.pathnum,
		}).then(({ code, data }) => {
			if (CODE.SUCCESS === code) {
				setCurCase(data.cur_case);
				setCaseList(data.other_case);
			}
		});
    }
    
    EventBus.addListener('updateState',update)

	const openReport = (pathnum,pis_apply_id) => {
		setCurrentRecord({pathnum,pis_apply_id})
		setReportShow(true);
	}

    return (
        <div style={{ position: 'relative' }}>
            <div className={style.info}>
                <span className={style.bold}>
                    <i className={style.title}>当前病人：</i>
                    <em style={{ background: color[curCase.status] }}>
                        {curCase.pathnum}（{status[curCase.status]}）
                    </em>
                </span>
                <span>{curCase.name}</span>
                <span>{gender[curCase.gender]}</span>
                <span>{curCase.age}岁</span>
                <span>住院号：{curCase.admission_num}</span>
                <span>床号：{curCase.bed_num}</span>
                <span>送检部位：{curCase.sampling_location}</span>
                <span>临床诊断：{curCase.clinical_diagnosis}</span>
            </div>
            {!secondLevel &&  (
                <div className={style.other} onClick={toogleMore}>
                    其他检查
                </div>
            )}
            {isClose && (
                <div className={style.others}>
                    <h2>
                        其他检查
                        <img src={require('@images/close_patient.svg')} onClick={e => setIsClose(false)} alt="关闭" width="12" />
                    </h2>
                    <div className={style.boxcontainer}>
                        {caseList.map(curCase => (
                            <div className={style.box} key={curCase.pathnum}>
                                <h3>
                                    病理号：
                                    <span
                                        onClick={e => openReport(curCase.pathnum, curCase.pis_apply_id)}
                                        className={style.pathnum}
                                    >
                                        {curCase.pathnum}
                                    </span>
                                    <em style={{ background: color[curCase.status] }}>{status[curCase.status]}</em>
                                </h3>
                                <p>送检日期：{curCase.deliver_date}</p>
                                <p>送检部位：{curCase.sampling_location}</p>
                                <p>免疫组化：{`(` + curCase.order_fin_ratio + `)`}</p>
                                <p>分子病理：(0/0)</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {reportShow && (
                <ReportDetails record={currentRecord} secondLevel={true} close={e => setReportShow(false)} />
            )}
        </div>
    );
}
