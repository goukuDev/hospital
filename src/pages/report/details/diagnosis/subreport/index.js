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

    return (
        <div className={style.other}>
            <p className={style.title}> 特殊报告 </p>
            <div className={style.box}>
                <button onClick={openReport}> 冰冻报告 </button>
                <button> 免疫组化报告 </button>
                <button> 分子病理报告 </button>
            </div>
            {
                popShow &&
                <Sabc close={closeReport}></Sabc>
            }
        </div>
    )
}