import React ,{useState,useEffect} from 'react';
import style from './index.css';
import {Checkbox} from 'antd';
import CheckCard from 'checkcard';
import {api} from 'utils.js';
import {CODE} from 'myConstants.js';

const CheckboxGroup  = Checkbox.Group;


export default function Index(props){
    const {checked,handleChange} = props;
    const [markList,setMarkList] = useState([]);
    
    useEffect(()=>getAllMarks(),[]);

    const getAllMarks = () => {
        api('immu_manage/get_markers')
        .then(({code,data}) => code === CODE.SUCCESS &&  setMarkList(data.map(o => ({label:o.short_name,value:o.marker_id}))))
    }

    const deleteCard = (value) => {
        let marks = checked.filter(o=>o !== value);
        handleChange(marks);
    }

    const cardData = (arr = markList,subarr = checked) => {
        return arr.filter(o=>subarr.includes(o.value))
    }

    return (
        <div className={style.outer}>
            <div className={style.cards}>
                <CheckCard
                    list={cardData()} clickClose={deleteCard}
                    cardStyle={{
                        background:'#54B2F7',
                        border:'none',
                        color:'#fff',
                    }}
                    svgColor={'#fff'}
                ></CheckCard>
            </div>
            <div className={style.marks}>
                <div className={style.title}>
                    标记物列表
                    <div className={style.filter}>
                        <input type="text"/>
                        <button>搜索</button>
                    </div>
                </div>
                <div className={style.boxs}>
                    <CheckboxGroup
                        options={markList} 
                        className={style.checkgroup}
                        onChange={value=>handleChange(value)}
                        value={checked}    
                    ></CheckboxGroup>
                </div>
            </div>
        </div>
    )
}