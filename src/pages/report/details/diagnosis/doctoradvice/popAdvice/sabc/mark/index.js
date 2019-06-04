import React, { useState,useEffect,useRef } from 'react';
import style from './index.css';
import {Checkbox} from 'antd';
import {api} from 'utils.js';
import {CODE} from 'myConstants.js';
import CheckCard from 'checkcard';
import SelectPac from './selectpac';
import Input from 'input';

const CheckboxGroup = Checkbox.Group;

export default function Index(props){

    const [markList,setMarkList] = useState([]);
    const [checkedMarks,setCheckedMarks] = useState([]);
    const [popShow,setPopShow] = useState(false);
    const [filterKey,setFilterKey] = useState('');
    const [packages,setPackages] = useState([]);
    const pacIds = useRef([]);
    
    useEffect(()=>{getAllMarks();getPackages()},[])

    // ----------------- api --------------------------

    const getAllMarks = () => {
        api('immu_manage/get_markers',{filter:JSON.stringify([1])})
        .then(({code,data}) => {
            if(code === CODE.SUCCESS){
                let list = data.map(o => ({label:o.short_name,value:o.marker_id}));
                setMarkList(list);
            }
        })
    }

    const getPackages = () => {
        api('immu_manage/get_packages')
        .then(({code,data}) => {
            if(code === CODE.SUCCESS){
                setPackages(data);
            }
        })
    }

    // --------------- methods --------------------------

    const deleteCard = (value) => {
        let marks = checkedMarks.filter(o=>o !== value);
        setCheckedMarks(marks);
        props.handleChange(marks);
    }

    const handleCheck = (marks) => {
        setCheckedMarks(marks);
        props.handleChange(marks);
    }

    const cardData = (arr = markList,subarr = checkedMarks) => {
        return arr.filter(o=>subarr.includes(o.value))
    }

    const clearMarks = () => {
        if(checkedMarks.length){
            setCheckedMarks([]);
            props.handleChange([]) ;
        }  
    }

    const checkPac = (value) => {
        pacIds.current = value;
        let marks = checkedMarks;
        packages.filter(o => value.includes(o.package_id))
                .forEach(item => {
                    marks = marks.concat(item.markers)
                })
        marks = [...new Set(marks)];
        setCheckedMarks(marks);
        props.handleChange(marks);
    }

    const filterMarks = (arr = markList,key = filterKey) => {
        return arr.filter(o => o.label.toLowerCase().includes(key.toLowerCase()));
    }

    return (
        <div className={style.outer}>
            <div className={style.fl}>
                <div className={style.action}>
                    {popShow && 
                        <div className={style.pop}>
                            <SelectPac
                                checked={pacIds.current}
                                packages={packages}
                                close={()=>setPopShow(false)}
                                onConfirm={checkPac}
                            ></SelectPac>
                        </div>
                    }
                    <button 
                        className={style.btn} 
                        style={{float:'left',marginLeft:'22px'}}
                        onClick={e=>setPopShow(true)}
                    >选择套餐</button>
                    <div>
                        <Input 
                            style={{width:'189px',marginRight:'8px'}}
                            lineFeed={false}
                            onChange={e=>setFilterKey(e.target.value)}
                        ></Input>
                        <button className={style.btn} style={{marginRight:'16px'}}>筛选</button>
                    </div>
                </div>
                <div className={style.group}>
                    <CheckboxGroup 
                        options={filterMarks()} 
                        className={style.checkgroup}
                        onChange={handleCheck}
                        value={checkedMarks}
                    ></CheckboxGroup>
                </div>
            </div>
            <div className={style.fr}>
                <div className={style.action}>
                    <span style={{marginLeft:'16px',color:'#585D68'}}>已选标记物：</span>
                    <button 
                        className={style.btn} 
                        style={{marginRight:'8px'}} 
                        onClick={clearMarks}
                    >清空</button>
                </div>
                <div className={style.cards}>
                    <CheckCard list={cardData()} clickClose={deleteCard}></CheckCard>
                </div>
                <div className={style.remark}>
                    {props.children}
                </div>
            </div>
        </div>
    )
};