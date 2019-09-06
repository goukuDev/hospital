import React ,{useState} from 'react';
import style from './index.css';
import Select from 'select'
import Input from 'input';
import {api} from 'utils.js';
import {CODE} from 'myConstants.js'
import Message from 'message';
import AddPop from 'addPop';
import TextArea from 'textarea';

export default function Index(props){
    const {device,onClose,onCancel,onAdd} = props;

    const [name,setName] = useState('');
    const [cloneNum,setCloneNum] = useState('');
    const [zhName,setZhName] = useState('');
    const [shortName,setShortName] = useState('');
    const [brand,setBrand] = useState('');
    const [model,setModel] = useState('');
    const [comment,setComment] = useState('');

    const addMark = () => {
        if(!name.trim() || !brand || !model)return
        let data = {
            type:1,
            name: name.trim(),
            clone_num: cloneNum.trim(),
            zh_name: zhName.trim(),
            short_name: shortName.trim(),
            brand: brand,
            equip_id: model,
            comment: comment.trim(),
        }
        api('mpf_manage/add_marker',data)
        .then(({code}) => {
            if(code === CODE.SUCCESS){
                Message.success('新增标记物成功');
                setName('');
                setCloneNum('');
                setZhName('');
                setShortName('');
                setBrand(null);
                setModel(null);
                setComment('');
                onAdd();
                onClose();
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

    const labelStyle = {
        width: '160px',
        display: 'inline-block',
        textAlign: 'right'
    };



    return (
        <div>
            <AddPop
                title={'新增标本'}
                onClose={onClose}
                onCancel={onCancel}
                confirmButtonDisabled={!name.trim() || !brand || !model}
                onConfirm={addMark}
            >
                <div className={style.row}>
                    <Input
                        label={'标记物名称：'}
                        required={true}
                        lineFeed={false}
                        containerStyle={{marginTop:'10px'}}
                        inputStyle={{ width: '240px' }}
                        onChange={e=>setName(e.target.value)}
                        labelStyle={labelStyle}
                        value={name}
                    ></Input>
                </div>
                <div className={style.row}>
                    <Select
                        options={brandOptions()}
                        label={'品牌：'}
                        required={true}
                        style={{width:'240px'}}
                        lineFeed={false}
                        labelStyle={labelStyle}
                        value={brand}
                        onChange={value=>{setBrand(value);setModel(null)}}
                    ></Select>
                </div>
                <div className={style.row}>
                    <Select
                        label={'型号：'}
                        required={true}
                        labelStyle={labelStyle}
                        options={modelOptions()}
                        style={{width:'240px'}}
                        lineFeed={false}
                        value={model}
                        onChange={value=>setModel(value)}
                    ></Select>
                </div>
                <div className={style.row}>
                    <Input
                        lineFeed={false}
                        label={'克隆号：'}
                        inputStyle={{ width: '240px' }}
                        value={cloneNum}
                        labelStyle={labelStyle}
                        onChange={e=>setCloneNum(e.target.value)}
                    ></Input>
                </div>
                <div className={style.row}>
                    <Input
                        label={'中文名：'}
                        lineFeed={false}
                        inputStyle={{ width: '240px' }}
                        value={zhName}
                        labelStyle={labelStyle}
                        onChange={e=>setZhName(e.target.value)}
                    ></Input>

                </div>
                <div className={style.row}>
                    <Input
                        label={'简称：'}
                        lineFeed={false}
                        inputStyle={{ width: '240px' }}
                        value={shortName}
                        labelStyle={labelStyle}
                        onChange={e=>setShortName(e.target.value)}
                    ></Input>
                </div>
                <div className={style.row}>
                    <TextArea
                        lineFeed={false}
                        label={'备注：'}
                        textAreaStyle={{width:'240px',height:'56px'}}
                        labelStyle={{
                            width: '160px',
                            display: 'inline-block',
                            textAlign: 'right',
                            verticalAlign:'top',
                        }}
                        value={comment}
                        onChange={e=>setComment(e.target.value)}
                    ></TextArea>
                </div>
            </AddPop>
        </div>
    )
}