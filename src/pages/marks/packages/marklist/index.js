import React ,{useState,useEffect} from 'react';
import style from './index.css';
import {Checkbox} from 'antd';
import CheckCard from 'checkcard';
import {api} from 'utils.js';
import {CODE} from 'myConstants.js';
import Input from 'input';

const CheckboxGroup  = Checkbox.Group;


export default function Index(props){
    const {checked,handleChange} = props;
    const [markList,setMarkList] = useState([]);
    const [keySearch,setKeySearch] = useState('');
    const [list,setList] = useState([]);
    
    useEffect(()=>getAllMarks(),[]);

    const getAllMarks = () => {
        api('immu_manage/get_markers',{filter:JSON.stringify([1])})
        .then(({code,data}) => {
            if(code === CODE.SUCCESS){
                setMarkList(data.map(o => ({label:o.short_name || o.name,value:o.marker_id})));
                setList(data.map(o => ({label:o.short_name || o.name,value:o.marker_id})))
            }
        })
    }

    const deleteCard = (value) => {
        let marks = checked.filter(o=>o !== value);
        handleChange(marks);
    }

    const cardData = (arr = markList,subarr = checked) => {
        return arr.filter(o=>subarr.includes(o.value))
    }

    const searchList = () => {
        let arr = markList.filter(o=>o.label.toLowerCase().includes(keySearch.toLowerCase()));
        setList(arr)
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
                        <Input
                            lineFeed={false}
                            style={{width:'189px',marginRight:'10px'}}
                            onChange={e=>setKeySearch(e.target.value.trim())}
                            onKeyUp={e=>e.keyCode === 13 && searchList()}
                        ></Input>
                        <button onClick={searchList}>搜索</button>
                    </div>
                </div>
                <div className={style.boxs}>
                    <CheckboxGroup
                        options={list} 
                        className={style.checkgroup}
                        onChange={value=>handleChange([...new Set(value)])}
                        value={checked}    
                    ></CheckboxGroup>
                </div>
            </div>
        </div>
    )
}