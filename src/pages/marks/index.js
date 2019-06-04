import React ,{useState} from 'react';
import style from './index.css';
import Page from 'page';
import Tabs from 'tabs';
import Device from './device';
import Package from './packages';
import Manage from './manage';

const MARK = 0;
const PACKAGE = 1;
const DEVICE = 2;
const tabList = [
    {type:'标记物管理',value:MARK},
    {type:'标记物套餐管理',value:PACKAGE},
    {type:'免疫组化设备管理',value:DEVICE},
]

export default function Index(props){

    const [nav,setNav] = useState(PACKAGE);

    const toggleNav = (value) => {
        setNav(value);
    }

    return (
        <Page>
            <div className={style.outer}>
                <Tabs
                        curCompnent={nav}
                        tabList={tabList}
                        switchChildren={toggleNav}
                        editable={true}
                    >
                    {
                        nav === MARK && 
                        <Manage></Manage>
                    }
                    {
                        nav === PACKAGE &&
                        <Package></Package>
                    }
                    {
                        nav === DEVICE &&
                        <Device></Device>
                    }
                </Tabs>
            </div>
        </Page>
    )
}