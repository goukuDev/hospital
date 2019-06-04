import React, { useState } from 'react';
import style from './index.css';
import ReceiveAdvice from './receiveAdvice';
import IHCSectioning from './IHCSectioning';
import IHCStaining from './IHCStaining';
import Page from 'page';
import Tabs from 'tabs';

const tabList = [
    { type: 'IHC套餐申请', value: 'IHCApply' },
    { type: '医嘱接收', value: 'receiveAdvice' },
    { type: 'IHC制片', value: 'IHCSectioning' },
    { type: '染色', value: 'IHCStaining' },
];
export default function Index() {
    const [curCompnent, setCurCompnent] = useState('receiveAdvice');

    const switchChildren = type => {
        setCurCompnent(type);
    };
    return (
        <Page>
            <div className={style.container}>
                <Tabs curCompnent={curCompnent} tabList={tabList} switchChildren={switchChildren} />
                <div className={style.detail}>
                    {curCompnent === 'receiveAdvice' && <ReceiveAdvice />}
                    {curCompnent === 'IHCSectioning' && <IHCSectioning />}
                    {curCompnent === 'IHCStaining' && <IHCStaining />}
                </div>
            </div>
        </Page>
    );
}
