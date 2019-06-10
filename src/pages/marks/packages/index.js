import React,{useState,useEffect} from 'react';
import style from './index.css';
import EditList from './edtlist';
import MarkList from './marklist';
import {api} from 'utils.js';
import {CODE} from 'myConstants.js';
import Message from 'message';
import Confirm from 'confirm';

export default function Index(props){

    const [packages,setPackages] = useState(null);
    const [marks,setMarks] = useState([]);
    const [packageId,setPackageId] = useState(null);

    useEffect(() => getPackages(),[])

    const getPackages = () => {
        api('immu_manage/get_packages')
        .then(({code,data}) => {
            if(code === CODE.SUCCESS){
                setPackages(data.map(o=>Object.assign({},o,{disabled:true})));
            }
        })
    }

    const modifyPackage = () => {
        if(!packageId)return;
        let item = packages.find(o=>o.package_id === packageId);
        let data = {
            package_id:item.package_id,
            name:item.name.trim(),
            markers:JSON.stringify(marks),
        }
        api('immu_manage/alter_package',data)
        .then(data => {
            if(data.code === CODE.SUCCESS){
                getPackages();
                Message.success('保存成功');
            }else{
                Message.error('保存失败');
            }
        })
    }

    const handleCurrent = (id) => {
        setMarks(packages.find(o=>o.package_id===id).markers);
        setPackageId(id);
    }
    
    const editPackageName = (id,value) => {
        let arr = packages.map(o => {
            if(o.package_id === id){
                o.name = value;
            }
            return o;
        });
        setPackages(arr);
    }

    const toggleStatus = (id,flag) => {
        let item = packages.find(o=>o.package_id === id);
        if(!item.name.trim()){
            Confirm({
                content:'套餐名称不能为空'
            })
            return false;
        };
        let arr = packages.map(o => {
            if(o.package_id === id)o.disabled = !flag;
            return o;
        })
        setPackages(arr);
    }

    const handleListChange = (value) => {
        if(value === 'delete'){
            setMarks([]);
            setPackageId(null);
        }
        getPackages();
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
                                onClik={handleCurrent}
                                onChange={handleListChange}
                                onEdit={editPackageName}
                                toggleStatus={toggleStatus}
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
                    <button className={style.confirm} disabled={!packageId} onClick={modifyPackage}>确认</button>
                </div>
            </div>
        </div>
    )
}