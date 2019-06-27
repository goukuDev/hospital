import React,{useState,useEffect} from 'react';
import style from './index.css';
import deep from 'deep';
import {api,userInfo} from 'utils.js';
import CommonWords from 'commonWords';
import {CODE} from 'myConstants';
import  Confirm from 'confirm';
import Message from 'message';

export default function Index(props){

    const [initialWords, setInitialWords] = useState(null);
    const [focused,setFocused] = useState(null);

    // ------------------------------- 常用词条 ---------------------------------
    const getWords = () => {
        api('report/get_high_freq', {
            user_id: userInfo().user_id,
            type:1,
        }).then(({ code, data }) => {
            if (CODE.SUCCESS === code) {
                setInitialWords(data.res);
            }
        });
    };
    useEffect(() => getWords(), []);

    const resetWords = data => {
        Confirm({
            content: '确定重置吗？',
            onOk: e => {
                api('report/del_high_freq', {
                    user_id: userInfo().user_id,
                    type:1,
                }).then(({ code }) => {
                    if (CODE.SUCCESS === code) {
                        getWords();
                        // localStorage.expandedKeys='';
                    }
                });
            },
        });
    };

    const fetchUpdate = pureTree => {
        api('report/update_high_freq', {
            content: JSON.stringify(pureTree),
            user_id: userInfo().user_id,
            type:1,
        }).then(({ code, message }) => {
            if (CODE.SUCCESS !== code) {
                Message.error(message);
            }
        });
    };
    
    const handleDoubleClick = (value) => {
        if(!focused)return
        fillText(focused,value)
    }

    // ------------------------------ 一般报告相关 -------------------------------------

    const handleUpdate = (key,value) => {
        props.updateReg(Object.assign({},deep.clone(props.report),{[key]:value}))
    }

    const fillText = (orign,text) => {
        if(props.readOnly || !text)return
        let value = `${props.report[orign] ?props.report[orign]:''}${text}`;
        handleUpdate(orign,value);
    }

    const upload = (files) => {
        api('common/upload_img',files)
        .then(data=>{
            if(data.code === 200  || data.code === 0){
                let arr = (props.report.images || []).concat(data.data);
                handleUpdate('images',arr)
            }
        })
    }

    const addImgs = (e) => {
        var files = e.target.files;
        let fd = new FormData();
        for(let i = 0; i < files.length; i++){
            fd.append('file', files[i]);
        }
        upload(fd)
    }

    const deleteImg = (ele) => {
        if(props.readOnly)return
        let arr = props.report.images.filter(o=>o !== ele);
        handleUpdate('images',arr);
    }

    return (
        <div className={style.reg} style={{display:props.visible?'block':'none'}}>
            <div className={style.regbox}>
                <div className={style['text-box']}>
                    <div className={`${style.title} ${props.readOnly?style.disable:''}`}>肉眼所见：<p onClick={e=>fillText('eye',window.seen)}>提取内容</p></div>
                    <textarea name="" id="" cols="30" rows="10" 
                        maxLength="1000" 
                        onChange={e=>{handleUpdate('eye',e.target.value.replace(/\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F]/g, ''))}} 
                        value={props.report.eye}
                        disabled={props.readOnly}
                        onFocus={e=>setFocused('eye')}
                    ></textarea>
                </div>
                <div className={style['text-box']}>
                    <div className={`${style.title} ${props.readOnly?style.disable:''}`}>镜下所见：</div>
                    <textarea name="" id="" cols="30" rows="10" maxLength="1000"
                        onChange={e=>{handleUpdate('microscopic',e.target.value.replace(/\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F]/g, ''))}} 
                        value={props.report.microscopic}
                        disabled={props.readOnly}
                        onFocus={e=>setFocused('microscopic')}
                    ></textarea>
                </div>
                <div className={style['text-box']}>
                    <div className={`${style.title} ${props.readOnly?style.disable:''}`}>
                        图像显示：
                        <p className={style['input-img']}> 
                            插入图像
                            <input 
                                type="file"
                                multiple
                                accept="image/*" name="" id="" 
                                onChange={addImgs}
                                className={style.file}
                                disabled={props.readOnly}
                                title="" 
                                value=""
                            />
                        </p>
                    </div>
                    <div className={style['img-box']}>
                        {
                            props.report.images && 
                            props.report.images.map((o,i)=>(
                                <div className={style.image} key={o}>
                                    <img height="117" src={"/pis/api/common/get_img?img_id="+o} alt="" />
                                    <i className={`${style.delete} ${props.readOnly?style.disable:''}`}  onClick={e=>deleteImg(o)}></i>
                                </div>
                                )
                            )
                        }
                    </div>
                </div>
                <div className={style['text-box']}>
                    <div className={`${style.title} ${props.readOnly?style.disable:''}`}>
                        特殊检查：
                        <p>提取标记物</p>
                    </div>
                    <textarea name="" id="" cols="30" rows="10" maxLength="1000"
                        onChange={e=>{handleUpdate('special',e.target.value.replace(/\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F]/g, ''))}} 
                        value={props.report.special}
                        disabled={props.readOnly}
                        onFocus={e=>setFocused('special')}
                    ></textarea>
                </div>
                <div className={style['text-box']}>
                    <div className={`${style.title} ${props.readOnly?style.disable:''}`}>
                        病理诊断：
                        <p>提取标记物</p>
                    </div>
                    <textarea name="" id="" cols="30" rows="10" maxLength="1000"
                        onChange={e=>{handleUpdate('pathologic',e.target.value.replace(/\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F]/g, ''))}} 
                        value={props.report.pathologic}
                        disabled={props.readOnly}
                        onFocus={e=>setFocused('pathologic')}
                    ></textarea>
                </div>
                <div className={style['text-box']}>
                    <div className={`${style.title} ${props.readOnly?style.disable:''}`}>
                        备注：
                    </div>
                    <textarea name="" id="" cols="30" rows="10" maxLength="1000"
                        onChange={e=>{handleUpdate('remark',e.target.value.replace(/\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F]/g, ''))}} 
                        value={props.report.remark}
                        disabled={props.readOnly}
                        onFocus={e=>setFocused('remark')}
                    ></textarea>
                </div>
            </div>
            <div className={style.words}>
                {
                    initialWords && 
                    <CommonWords 
                        tree={initialWords} 
                        resetWords={resetWords} 
                        dbclick={handleDoubleClick}
                        fetchUpdate={fetchUpdate}
                    />
                }
            </div>
        </div>
    )
};