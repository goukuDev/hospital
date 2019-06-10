import React ,{useState,useEffect} from 'react';
import style from './index.css';
import Select from 'select'
import Input from 'input';
import {api} from 'utils.js';
import {CODE} from 'myConstants.js'
import Message from 'message';

export default function Index(props){
    const {device} = props;

    const [name,setName] = useState('');
    const [cloneNum,setCloneNum] = useState('');
    const [zhName,setZhName] = useState('');
    const [shortName,setShortName] = useState('');
    const [brand,setBrand] = useState('');
    const [model,setModel] = useState('');
    const [comment,setComment] = useState('');

    useEffect(()=>setBrand(device[0].brand),[device])

    const addMark = () => {
        if(!name.trim() || !brand || !model)return
        let data = {
            name: name.trim(),
            clone_num: cloneNum.trim(),
            zh_name: zhName.trim(),
            short_name: shortName.trim(),
            brand: brand,
            equip_id: model,
            comment: comment.trim(),
        }
        api('immu_manage/add_marker',data)
        .then(({code}) => {
            if(code === CODE.SUCCESS){
                Message.success('新增标记物成功');
                setName('');
                setCloneNum('');
                setZhName('');
                setShortName('');
                setBrand(device[0].brand);
                setModel(null);
                setComment('');
                props.onAdd();
            }else{
                Message.error('新增标记物失败');
            }
        })
    }

    const brandOptions = () => {
        return device.map(o=>({title:o.brand,value:o.brand}))
    }

    const modelOptions = (key = brand) => {
        let current = device.find(o => o.brand === key);
        if(current){
            let arr = Object.entries(current.models).map(o => ({title:o[1],value:o[0]}));
            return arr;
        }else{
            return [];
        }
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
            <span style={{
                    color:'#F25B24',
                    fontSize: '21px',paddingTop: '8px',
                    marginRight: '3px'}}
            >*</span>
            品牌：
            <Select
                options={brandOptions()}
                style={{width:'102px',marginLeft:'8px',marginRight:'15px'}}
                lineFeed={false}
                value={brand}
                onChange={value=>{setBrand(value);setModel(null)}}
            ></Select>
            <span style={{
                    color:'#F25B24',
                    fontSize: '21px',paddingTop: '8px',
                    marginRight: '3px'}}
            >*</span>
            型号：
            <Select
                options={modelOptions()}
                style={{width:'118px',marginRight:'8px'}}
                lineFeed={false}
                value={model}
                onChange={value=>setModel(value)}
            ></Select>
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
            
            备注：
            <Input
                lineFeed={false}
                containerStyle={{width:'168px',marginRight:'8px'}}
                value={comment}
                onChange={e=>setComment(e.target.value)}
            ></Input>
            <button className={style.addBtn} disabled={!name.trim() || !brand || !model} onClick={addMark}>新增</button>
        </div>
    )
}