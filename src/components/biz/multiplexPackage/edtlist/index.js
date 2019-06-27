import React ,{useState} from 'react';
import style from './index.css';
import Input from 'input';
import {api} from 'utils.js';
import {CODE} from 'myConstants.js';

export default function Index(props){
    const {packages,onChange,onEdit,toggleStatus,currentType} = props;
    const [index,setIndex] = useState(null);
    const [pacName,setPacName] = useState('');

    const handleClick = (id) => {
        props.onClik(id);
        setIndex(id);
    }

    const addPackage = () => {
        if(!pacName.trim())return;
        let data = {
            type:currentType,
            name: pacName.trim(),
            markers:JSON.stringify([]),
        }
        api('mpf_manage/add_package',data)
        .then(data => {
            if(data.code === CODE.SUCCESS){
                onChange('add');
                setPacName('');
            };
        })
    }

    const deletePackage = (id) => {
        api(`mpf_manage/delete_package?package_id=${id}`)
        .then(data => {
            data.code === CODE.SUCCESS && onChange('delete');
        })
    }

    return (
        <div className={style.outer} style={props.outStyle}>
            <div className={style.list}>
                <ul>
                    {
                        packages.map(({package_id,name,disabled}) => 
                            (
                                <li 
                                    className={`${index === package_id? style.active:''}`} 
                                    key={package_id}
                                    onClick={e=>handleClick(package_id)}    
                                >   
                                    {disabled && name}
                                    {!disabled && 
                                        <Input
                                            lineFeed={false}
                                            value={name}
                                            inputStyle={{height:'27px'}}
                                            onChange={e=>onEdit(package_id,e.target.value)}
                                        ></Input>
                                    }
                                    <span>
                                        <svg
                                            onClick={e=>toggleStatus(package_id,disabled)}
                                            style={{
                                                fill:'#fff',
                                                display:`${!disabled?'inline-block':'none'}`,
                                                cursor:'pointer',
                                                marginRight:'12px'
                                            }} 
                                            xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12">
                                          <g id="save" transform="translate(-192 -192)">
                                            <path id="路径_161" data-name="路径 161" className="cls-1" d="M202.2,192h-8.4a1.8,1.8,0,0,0-1.8,1.8v8.4a1.8,1.8,0,0,0,1.8,1.8h8.4a1.8,1.8,0,0,0,1.8-1.8v-8.4A1.8,1.8,0,0,0,202.2,192Zm-1.8,1.2v2.4H198v-2.4Zm1.2,10.2h-7.2v-4.8h7.2Zm1.8-1.2a1.2,1.2,0,0,1-1.2,1.2V198h-8.4v5.4a1.2,1.2,0,0,1-1.2-1.2v-8.4a1.2,1.2,0,0,1,1.2-1.2h.6v4.2h7.2v-4.2h.6a1.2,1.2,0,0,1,1.2,1.2Z"/>
                                            <path id="路径_162" data-name="路径 162" className="cls-1" d="M384,608h6.769v.846H384Zm0,2.538h6.769v.846H384Z" transform="translate(-189.384 -409)"/>
                                          </g>
                                        </svg>

                                        <svg 
                                            onClick={e=>toggleStatus(package_id,disabled)}
                                            style={{
                                                fill:`${index === package_id?'#fff':'#6f6f6f'}`,
                                                display:`${disabled?'inline-block':'none'}`,
                                                cursor:'pointer',
                                                marginRight:'12px'
                                            }} 
                                            xmlns="http://www.w3.org/2000/svg" width="12" height="11.473" viewBox="0 0 12 11.473">
                                            <g id="bianji-3" transform="translate(-67.008 -65.344)">
                                            <path id="路径_160" data-name="路径 160" className="cls-1" d="M72.83,70Zm-2.259,6.182-3.564.633.718-3.366Zm5.591-10.841L74.885,66.57,77.73,69.3l1.277-1.226Zm-7.8,7.494,2.845,2.734,5.883-5.654-2.845-2.735Z"/>
                                            <rect id="矩形_1495" data-name="矩形 1495" className="cls-1" width="5" height="1" transform="translate(73.229 75.344)"/>
                                            </g>
                                        </svg>
                                        <svg
                                            onClick={e=>deletePackage(package_id)}
                                            style={{fill:`${index === package_id?'#fff':'#6f6f6f'}`,cursor:'pointer'}} 
                                            xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 10 10">
                                            <g id="guanbi-6" transform="translate(0 2)">
                                              <path id="路径_106" data-name="路径 106" className="cls-1" d="M352.607,344.514l-3.372,3.372-3.372-3.372a.954.954,0,1,0-1.349,1.349l3.372,3.372-3.372,3.372a.954.954,0,1,0,1.349,1.349l3.372-3.372,3.372,3.372a.954.954,0,1,0,1.349-1.349l-3.372-3.372,3.372-3.372a.954.954,0,1,0-1.349-1.349Z" transform="translate(-344.235 -346.235)"/>
                                            </g>
                                        </svg>
                                
                                    </span>
                                </li> 
                            )
                        )
                    }
                                                      
                </ul>
            </div>
            <div className={style.addBox}>
                <Input 
                    style={{width:'205px'}} 
                    lineFeed={false} 
                    placeholder="输入套餐名称"
                    value={pacName}
                    onChange={e=>setPacName(e.target.value)}
                ></Input>
                <button className={style.addBtn} disabled={!pacName.trim()} onClick={addPackage}>增加</button>
            </div>
        </div>
    )
}