import React, {useState} from 'react';
import style from './index.css';
import {Checkbox} from 'antd';

const CheckboxGroup = Checkbox.Group;

export default function Index(props){
    const {packages,onConfirm,close,checked} = props;
    const [checkedList,setCheckedList] = useState(checked);

    const confirm = () => {
        onConfirm(checkedList);
        close();
    }
    
    return (
        <div className={style.outer} >
            <p className={style.header}>选择套餐</p>
            <div className={style.content}>
                <CheckboxGroup
                    className={style.checkgroup}
                    options={packages}
                    onChange={values => setCheckedList(values)}
                    defaultValue={checked}
                ></CheckboxGroup>
            </div>
            <div className={style.btns}>
                <button className={style.cancle} onClick={close}>取消</button>
                <button className={style.confirm} onClick={confirm}>确定</button>
            </div>
        </div>
    )
}