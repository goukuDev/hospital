import React ,{useState,useEffect} from 'react';
import style from './index.css';
import Select from 'select'
import Input from 'input';
import {api} from 'utils.js';
import {CODE} from 'myConstants.js'
import Message from 'message';

export default function Index(props){

    const [name,setName] = useState('');
    const [cloneNum,setCloneNum] = useState('');
    const [zhName,setZhName] = useState('');
    const [shortName,setShortName] = useState('');
    const [brand,setBrand] = useState('');
    const [model,setModel] = useState('');
    const [comment,setComment] = useState('');
    const [device,setDevice] = useState([]);

    const getDevice = () => {
        api('immu_manage/get_facilities')
        .then(({code,data}) => {
            if(code === CODE.SUCCESS){
                setDevice(data);
            }
        })
    }

    useEffect(()=>getDevice(),[])

    const addMark = () => {
        if(!brand.trim())return
        let data = {
            name: name.trim(),
            clone_num: cloneNum.trim(),
            zh_name: zhName.trim(),
            short_name: shortName.trim(),
            brand: brand.trim(),
            model: model.trim(),
            comment: comment.trim(),
        }
        api('immu_manage/add_marker',data)
        .then(({code}) => {
            if(code === CODE.SUCCESS){
                Message.success('新增标记物成功');
                props.onAdd();
            }else{
                Message.error('新增标记物失败');
            }
        })
    }

    const brandOptions = () => {
        return device.map(o=>({title:o.brand,value:o.brand}))
    }

    const modelOptions = () => {
        let arr = [];
        device.forEach(o => {
            arr = arr.concat(o.models)
        })
        arr = [...new Set(arr)]
        return arr.map(o => ({title:o,value:o}))
        // return device.map(o => 
    }

    return (
        <div className={style.outer}>
            <span style={{
                    color:'#F25B24',
                    fontSize: '21px',paddingTop: '8px',
                    marginRight: '3px'}}
            >*</span>
            标记物名称：
            <Input
                lineFeed={false}
                containerStyle={{width:'168px',marginRight:'8px'}}
                onChange={e=>setName(e.target.value)}
                value={name}
            ></Input>
            克隆号：
            <Input
                lineFeed={false}
                containerStyle={{width:'104px',marginRight:'8px'}}
                value={cloneNum}
                onChange={e=>setCloneNum(e.target.value)}
            ></Input>
            中文名：
            <Input
                lineFeed={false}
                containerStyle={{width:'118px',marginRight:'8px'}}
                value={zhName}
                onChange={e=>setZhName(e.target.value)}
            ></Input>
            简称：
            <Input
                lineFeed={false}
                containerStyle={{width:'88px',marginRight:'8px'}}
                value={shortName}
                onChange={e=>setShortName(e.target.value)}
            ></Input>
            品牌：
            <Select
                options={brandOptions()}
                style={{width:'102px',marginLeft:'8px',marginRight:'15px'}}
                lineFeed={false}
                value={brand}
                onChange={value=>setBrand(value)}
            ></Select>
            设备：
            <Select
                options={[]}
                style={{width:'118px',marginRight:'8px'}}
                lineFeed={false}
                value={model}
                onChange={value=>setModel(value)}
            ></Select>
            备注：
            <Input
                lineFeed={false}
                containerStyle={{width:'168px',marginRight:'8px'}}
                value={comment}
                onChange={e=>setComment(e.target.value)}
            ></Input>
            <button className={style.addBtn} onClick={addMark}>新增</button>
        </div>
    )
}