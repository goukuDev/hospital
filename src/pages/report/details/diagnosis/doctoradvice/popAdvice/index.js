import React, { useState } from 'react';
import style from './index.css';
import Patient from 'patient';
import Tabs from 'tabs';
import Technology from './technology';
import Sabc from './sabc';

const TECHNOLOGY = 0;
const SABC = 1;
const MOLECULAR_PATHOLOGY = 2;
const WARTHIN_STARRY = 3;

export default function Index(props){

    const { patientInfo,close,kind } = props;
    const tabList = [
        {type:'技术医嘱',value:TECHNOLOGY},
        {type:'免疫组化医嘱',value:SABC},
        {type:'分子病理医嘱',value:MOLECULAR_PATHOLOGY},
        {type:'特殊染色医嘱',value:WARTHIN_STARRY},
    ]

    const [nav,setNav] = useState(kind);

    const toggleNav = (nav) => {
        switch (nav){
            case TECHNOLOGY:
                setNav(nav);
                break;
            case SABC:
                setNav(nav);
                break;
            case MOLECULAR_PATHOLOGY:
                setNav(nav);
                break;
            case WARTHIN_STARRY:
                setNav(nav);
                break;
            default :
                return;
        }
    }

    return (
        <div className={style.advice}> 
            <div
                className={style.close}
                onClick={close}>
                <img src={require('./imgs/guanbi-3@2x.png')} width="20" alt="" />
            </div>
            <div className={style.fl}>
                <Tabs
                    curCompnent={nav}
                    tabList={tabList}
                    switchChildren={toggleNav}
                    editable={true}
                >
                    {
                        nav === TECHNOLOGY && 
                        <Technology
                            pathnum={patientInfo.pathnum}
                        ></Technology>
                    }
                    {
                        nav === SABC &&
                        <Sabc
                            pathnum={patientInfo.pathnum}
                        ></Sabc>
                    }
                </Tabs>
            </div>
            
            <div className={style.fr}>
                {
                    Object.keys(patientInfo).length &&
                    <Patient
                        id={patientInfo.id}
                        pathnum={patientInfo.pathnum}
                    ></Patient>
                }
            </div>
        </div>
    )
};