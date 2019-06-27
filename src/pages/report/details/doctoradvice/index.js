import React, { useState,useEffect,useCallback } from 'react';
import style from './index.css';
import PopAdvice from './popAdvice';
import {api} from 'utils';
import {CODE} from 'myConstants';
// import EventBus from 'eventBus';

const TECHNOLOGY = 0;
const SABC = 1;
const MOLECULAR_PATHOLOGY = 2;
const WARTHIN_STARRY = 3;


export default function Index(props){
    const { adviceStyle,patientInfo,secondLevel } = props;
    const pathnum = patientInfo.pathnum;

    const [popShow,setPopShow] = useState(false);
    const [adviceNum,setAdviceNum] = useState({});
    const [adviceKind,setAdviceKind] = useState('');


    const getAdviceNum = useCallback(() => {
        api(`order/get_orders_num?pathnum=${pathnum}`)
        .then(({ code, message, data }) => {
                if (code === CODE.SUCCESS) {
                    let col = {};
                    Object.entries({0: 'tech', 1: 'sabc',2:'specil'}).map(([key, value])=>{
                        const item = data.find(item=>item.order_type === parseInt(key));
                        col[value] = item;
                        return item;
                    });
                    setAdviceNum(col);

                }
            })
    },[pathnum,setAdviceNum])

    useEffect(()=>getAdviceNum(),[getAdviceNum])

    const openAdvice = (kind) => {
        setPopShow(true);
        setAdviceKind(kind);
    }

    const closeAdvice = () => {
        setPopShow(false);
        // EventBus.emit('updateState');
        getAdviceNum();
    }

    return (
        <div className={style.advice} style={adviceStyle}>
            <p className={style.title}> 医嘱 </p>
            <div className={style.box}>
                <div className={style.button} onClick={e => openAdvice(TECHNOLOGY)}>
                    技术医嘱（
                    {(adviceNum.tech && adviceNum.tech.finished) || 0}/
                    {(adviceNum.tech && adviceNum.tech.total) || 0}）
                </div>
                <div className={style.button} onClick={e => openAdvice(SABC)}>
                    免疫组化医嘱（
                    {(adviceNum.sabc && adviceNum.sabc.finished) || 0}/
                    {(adviceNum.sabc && adviceNum.sabc.total) || 0}）
                </div>
                <div className={style.button} onClick={e => openAdvice(MOLECULAR_PATHOLOGY)}>
                    分子病理医嘱（0/0）
                </div>
                <div className={style.button}
                    onClick={e => openAdvice(WARTHIN_STARRY)}
                >    
                    特殊染色医嘱（
                    {(adviceNum.specil && adviceNum.specil.finished) || 0}/
                    {(adviceNum.specil && adviceNum.specil.total) || 0}）
                </div>
            </div>
            {
                popShow && 
                <PopAdvice
                    patientInfo={patientInfo}
                    kind={adviceKind}
                    close={closeAdvice}
                    secondLevel={secondLevel}
                ></PopAdvice>
            }
        </div>
    )
};