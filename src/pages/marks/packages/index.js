import React,{useState,useEffect} from 'react';
import style from './index.css';
import EditList from './edtlist';
import MarkList from './marklist';
import {api} from 'utils.js';
import {CODE} from 'myConstants.js';

export default function Index(props){

    const [packages,setPackages] = useState(null);
    const [marks,setMarks] = useState([]);

    useEffect(() => getPackages(),[])

    const getPackages = () => {
        api('immu_manage/get_packages')
        .then(({code,data}) => {
            if(code === CODE.SUCCESS){
                setPackages(data);
            }
        })
    }

    const addPackage = () => {
        api('immu_manage/add_package')
        .then(data => data.code === CODE.SUCCESS && 1)
    }
    


    return (
        <div className={style.outer}>
            <div className={style.package}>
                <div className={style.zone}>
                    <div className={style.fl}>
                        <p className={style.title} >套餐类别：</p>
                        {
                            packages && 
                            <EditList 
                                packages={packages}
                                outStyle={{height:'calc(100% - 48px)'}}
                                onClik={id=>setMarks(packages.find(o=>o.package_id===id).markers)}
                            ></EditList>
                        }
                    </div>
                    <div className={style.fr}>
                        <p className={style.title}>套餐内容</p>
                        <div className={style.marks}>
                            <MarkList 
                                checked={marks} 
                                handleChange={value=>setMarks(value)}
                            ></MarkList>
                        </div>
                    </div>
                </div>
                <div className={style.btnBox}>
                    <button className={style.confirm} onClick={addPackage}>确认</button>
                </div>
            </div>
        </div>
    )
}