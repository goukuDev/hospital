import React, {} from 'react';
import style from './index.css';
import Advice from 'multiplexAdvice';

export  default function Index(props){


    return (
        <div className={style.specil}>
            <Advice
                pathnum={props.pathnum}
                currentType={2}
            ></Advice>
        </div>
    )
}