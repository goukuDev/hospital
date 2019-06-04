import React ,{useState,useEffect} from 'react';
import style from './index.css';
import EditInput from 'editInput';
// #6F6F6F

export default function Index(props){
    const {packages} = props;
    const [pacList,setPacList] = useState([]);

    useEffect(() =>{
        let arr = packages.map(({package_id,name})=>({value:package_id,title:name,disabled:true}))
        setPacList(arr);
    },[packages])

    const handleClick = (id) => {
        props.onClik(id);
    }

    return (
        <div className={style.outer} style={props.outStyle}>
            <div className={style.list}>
                <ul>
                    {
                        pacList.map(({value,title,disabled}) => 
                            (
                                <li 
                                    className={`${!disabled? style.active:''}`} 
                                    key={value}
                                    onClick={e=>handleClick(value)}    
                                >           
                                    <EditInput
                                        value={title}
                                        disabled={disabled}
                                    ></EditInput>
                                    <span>
                                        <svg 
                                            onClick={e=>console.log('svg')}
                                            style={{fill:'#6f6f6f',cursor:'pointer',marginRight:'12px'}} 
                                            xmlns="http://www.w3.org/2000/svg" width="12" height="11.473" viewBox="0 0 12 11.473">
                                            <g id="bianji-3" transform="translate(-67.008 -65.344)">
                                            <path id="路径_160" data-name="路径 160" className="cls-1" d="M72.83,70Zm-2.259,6.182-3.564.633.718-3.366Zm5.591-10.841L74.885,66.57,77.73,69.3l1.277-1.226Zm-7.8,7.494,2.845,2.734,5.883-5.654-2.845-2.735Z"/>
                                            <rect id="矩形_1495" data-name="矩形 1495" className="cls-1" width="5" height="1" transform="translate(73.229 75.344)"/>
                                            </g>
                                        </svg>
                                        <svg
                                            style={{fill:`${disabled?'#6f6f6f':'#fff'}`,cursor:'pointer'}} 
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
                <input className={style.addname} type="text" placeholder="输入套餐名称"/>
                <button className={style.addBtn}>增加</button>
            </div>
        </div>
    )
}