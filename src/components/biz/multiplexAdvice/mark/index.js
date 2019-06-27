import React, { useState,useEffect,useRef,useCallback } from 'react';
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
    

    // ----------------- api --------------------------

    const getAllMarks = useCallback(() => {
        api('mpf_manage/get_markers',{filter:JSON.stringify([1]),type:props.currentType})
        .then(({code,data}) => {
            if(code === CODE.SUCCESS){
                let list = data.map(o => ({label:o.short_name || o.name,value:o.marker_id}));
                setMarkList(list);
            }
        })
    },[props.currentType])

    const getPackages = useCallback(
        () => {
            api('mpf_manage/get_packages',{type:props.currentType})
            .then(({code,data}) => {
                if(code === CODE.SUCCESS){
                    setPackages(data);
                }
            })
        }
    ,[props.currentType])

    useEffect(()=>{getAllMarks();getPackages()},[getAllMarks,getPackages])    

    // --------------- methods --------------------------

    const deleteCard = (value) => {
        let marks = checkedMarks.filter(o=>o !== value);
        setCheckedMarks(marks);
        handlePackage([value])
        props.handleChange(marks);
    }

    const handleCheck = (marks) => {
        setCheckedMarks(marks);
        handlePackage(marks)
        props.handleChange(marks);
    }

    const cardData = (arr = markList,subarr = checkedMarks) => {
        return arr.filter(o=>subarr.includes(o.value))
    }

    const clearMarks = () => {
        if(checkedMarks.length){
            setCheckedMarks([]);
            pacIds.current = [];
            props.handleChange([]) ;
        }  
    }

    const  handlePackage = (marks) => {
        let canclePac = packages.filter(o => pacIds.current.includes(o.package_id))
                        .filter(o => !o.markers.every(item => marks.includes(item)))
                        .map(o => o.package_id)
        pacIds.current = pacIds.current.filter(o => !canclePac.includes(o));
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
        return arr.filter(o => o.label.toLowerCase().includes(key.trim().toLowerCase()));
    }

    return (
        <div className={style.outer}>
            <div className={style.fl}>
                <div className={style.action}>
                    {popShow && 
                        <div className={style.pop}>
                            <SelectPac
                                checked={pacIds.current}
                                packages={packages.map(o => ({label:o.name,value:o.package_id}))}
                                close={()=>setPopShow(false)}
                                onConfirm={checkPac}
                            ></SelectPac>
                        </div>
                    }
                    <div>
                        <span>标记物</span>
                        <button 
                            className={style.btn} 
                            style={{marginLeft:'22px'}}
                            onClick={e=>setPopShow(true)}
                        >选择套餐</button>
                    </div>
                    <div>
                        <Input 
                            style={{width:'189px',marginRight:'8px'}}
                            lineFeed={false}
                            onChange={e=>setFilterKey(e.target.value)}
                        ></Input>
                        <button className={style.btn} style={{marginRight:'16px',height:'36px'}}>搜索</button>
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
                <div className={style.checkedMarks}>
                    <span style={{color:'#585D68'}}>已选标记物：</span>
                    <button 
                        className={style.btn} 
                        style={{marginRight:'8px',marginBottom:'2px'}} 
                        onClick={clearMarks}
                    >清空</button>
                    <div className={style.cards}>
                        <CheckCard list={cardData()} clickClose={deleteCard}></CheckCard>
                    </div>
                </div>
                <div className={style.remark}>
                    {props.children}
                </div>
            </div>
        </div>
    )
};