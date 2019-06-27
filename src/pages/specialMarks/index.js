import React , {useState} from 'react';
import style from './index.css';
import Page from 'page';
import Tabs from 'tabs';
import Manage from './manage';
import Package from 'multiplexPackage';

const MARK = 0;
const PACKAGE = 1;
const tabList = [
    {type:'标记物管理',value:MARK},
    {type:'标记物套餐管理',value:PACKAGE},
]

export default function Index(props){

    const [nav,setNav] = useState(MARK);

    const toggleNav = (value) => {
        setNav(value);
    }

    return (
        <Page>
            <div className={style.outer}>
                <div className={style.box}>
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
                            <Package currentType={2}></Package>
                        }
                    </Tabs>
                </div>
            </div>
        </Page>
    )
}