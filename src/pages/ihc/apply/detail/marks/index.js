import React,{useState,useEffect,useRef} from 'react';
import style from './index.css';
import Panel from 'panel';
import {Checkbox} from 'antd';
import {api} from 'utils.js';
import {CODE} from 'myConstants.js';
import CheckCard from 'checkcard';
import Textarea from 'textarea';
import SelectPac from './selectpac';
import EventBus from 'eventBus';

const CheckboxGroup = Checkbox.Group;

export default function Index(props){

    const {applyId} = props;

    const [markList,setMarkList] = useState([]);
    const [checkedMarks,setCheckedMarks] = useState([]);
    const [comment,setComment] = useState('');
    const [popShow,setPopShow] = useState(false);
    const [filterKey,setFilterKey] = useState('');
    const [packages,setPackages] = useState([]);
    const pacIds = useRef([]);

    // ----------------- api --------------------------

    const getAllMarks = () => {
        api('mpf_manage/get_markers',{filter:JSON.stringify([1]),type:1})
        .then(({code,data}) => {
            if(code === CODE.SUCCESS){
                let list = data.map(o => ({label:o.short_name || o.name,value:o.marker_id}));
                setMarkList(list);
            }
        })
    }

    const getPackages = () => {
            api('mpf_manage/get_packages',{type:1})
            .then(({code,data}) => {
                if(code === CODE.SUCCESS){
                    setPackages(data);
                }
            })
        }

    const addApply = () => {
        return new Promise(resolve=>{
            let params = {
                apply_id:applyId,
                markers_id:JSON.stringify(checkedMarks),
                comment:comment.trim(),
            }
            api('immuno/add_application_slice',params)
            .then(({code,data})=>{
                code === CODE.SUCCESS && resolve();
            })
        })
    }

    useEffect(()=>{
        getAllMarks();
        getPackages()
    },[])   

    // ---------------------------- handle ------------------------
    const handleCheck = (marks) => {
        setCheckedMarks(marks);
        handlePackage(marks)
        // props.handleChange(marks);
    }

    const handleDeleteCard = (value) => {
        let marks = checkedMarks.filter(o=>o !== value);
        setCheckedMarks(marks);
        handlePackage([value])
        // props.handleChange(marks);
    }
    
    const  handlePackage = (marks) => {
        let canclePac = packages.filter(o => pacIds.current.includes(o.package_id))
        .filter(o => !o.markers.every(item => marks.includes(item)))
        .map(o => o.package_id)
        pacIds.current = pacIds.current.filter(o => !canclePac.includes(o));
    }
    const handleCheckPac = (value) => {
        pacIds.current = value;
        let marks = checkedMarks;
        packages.filter(o => value.includes(o.package_id))
                .forEach(item => {
                    marks = marks.concat(item.markers)
                })
        marks = [...new Set(marks)];
        setCheckedMarks(marks);
        // props.handleChange(marks);
    }
    // -------------------------- method -------------------------

    const cardData = (arr = markList,subarr = checkedMarks) => {
        return arr.filter(o=>subarr.includes(o.value))
    }

    const filterMarks = (arr = markList,key = filterKey) => {
        return arr.filter(o => o.label.toLowerCase().includes(key.trim().toLowerCase()));
    }

    const handleAddApply = async () =>{
        await addApply();
        EventBus.emit('addApply')
    }

    // ------------------------------ render ------------------------------

    return (
        <Panel title={'选择标记物'}>
            <div className={style.box}>
                <button className={style.addApply} onClick={handleAddApply} disabled={!checkedMarks.length || !window.sampleLength}>新增申请</button>
                <div className={style.left}>
                    <div className={style.top}>
                        <button className={style.btn} onClick={e=>setPopShow(true)}>选择套餐</button>
                        {popShow && 
                            <div className={style.pop}>
                                <SelectPac
                                    checked={pacIds.current}
                                    packages={packages.map(o => ({label:o.name,value:o.package_id}))}
                                    close={()=>setPopShow(false)}
                                    onConfirm={handleCheckPac}
                                ></SelectPac>
                            </div>
                        }
                        <div>
                            <input className={style.markSearch} type="text" onChange={e=>setFilterKey(e.target.value)}/>
                            <button className={style.btn}>查询</button>
                        </div>
                    </div>
                    <div className={style.marks}>
                        <CheckboxGroup 
                            options={filterMarks()} 
                            className={style.checkgroup}
                            onChange={handleCheck}
                            value={checkedMarks}
                        ></CheckboxGroup>
                    </div>
                </div>
                <div className={style.right}>
                    <div className = {style.top}>
                        <span>已选标记物</span>
                        <button className={style.btn} onClick={e=>setCheckedMarks([])}>清空</button>
                    </div>
                    <div className={style.checked}>
                        <CheckCard list={cardData()} clickClose={handleDeleteCard}></CheckCard>    
                        <div className={style.comment}>
                            <Textarea
                                label={'备注：'}
                                labelStyle={{color:'#434343'}}
                                containerStyle={{width:'100%',}}
                                textAreaStyle={{height:'90px'}}
                                value={comment}
                                onChange={e=>setComment(e.target.value)}
                            ></Textarea>
                        </div>
                    </div>
                </div>
            </div>
        </Panel>
    )
}