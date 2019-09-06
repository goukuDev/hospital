import React,{useState} from 'react';
import style from './index.css';
import Sabc from './sabc';

export default function Index(){

    const [popShow,setPopShow] = useState(false);

    const openReport = () => {
        setPopShow(true);
    }
    
    const closeReport = () => {
        setPopShow(false);
    }

    const bg = {background:`rgba(245,248,250,1) url(${require('@images/baogao.png')}) no-repeat 12px center`}

    return (
        <div className={style.other}>
            {/* <p className={style.title}> 特殊报告 </p> */}
            <div className={style.box}>
                <div style={bg} className={style.button} onClick={openReport}> 冰冻报告 </div>
                <div style={bg} className={style.button}> 免疫组化报告 </div>
                <div style={Object.assign({},bg,{marginRight:'0px'})} className={style.button}> 分子病理报告 </div>
            </div>
            {
                popShow &&
                <Sabc close={closeReport}></Sabc>
            }
        </div>
    )
}