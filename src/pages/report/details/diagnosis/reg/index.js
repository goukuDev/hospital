import React from 'react';
import style from './index.css';
import deep from 'deep';
import {api} from 'utils.js';

export default function Index(props){
    const uploadData = new Map();

    const handleUpdate = (key,value) => {
        props.updateReg(Object.assign({},deep.clone(props.report),{[key]:value}))
    }

    const extractSeen = () => {        
        if(props.readOnly || !window.seen)return
        let value = `${props.report.eye ?props.report.eye:''}${window.seen}`;
        handleUpdate('eye',value);
    }

    const upload = (file) => {
        var data = uploadData.get(file);
        api('common/upload_img',data)
        .then(data=>{
            if(data.code === 200  || data.code === 0){
                handleUpdate('images',(props.report.images || []).concat([data.data]))
            }
        })
    }

    const addImgs = (e) => {
        var files = e.target.files;
        for(var file of files){
            let data = new FormData();
            data.append('file',file);
            uploadData.set(file,data);
            upload(file);
        }
    }

    const deleteImg = (ele) => {
        if(props.readOnly)return
        let arr = props.report.images.filter(o=>o !== ele);
        handleUpdate('images',arr);
    }

    return (
        <div className={style.reg} style={{display:props.visible?'block':'none'}}>
            <div className={style['text-box']}>
                <div className={`${style.title} ${props.readOnly?style.disable:''}`}>肉眼所见：<p onClick={extractSeen}>提取内容</p></div>
                <textarea name="" id="" cols="30" rows="10" 
                    maxLength="1000" 
                    onChange={e=>{handleUpdate('eye',e.target.value.replace(/\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F]/g, ''))}} 
                    value={props.report.eye}
                    disabled={props.readOnly}
                ></textarea>
            </div>
            <div className={style['text-box']}>
                <div className={`${style.title} ${props.readOnly?style.disable:''}`}>镜下所见：</div>
                <textarea name="" id="" cols="30" rows="10" maxLength="1000"
                    onChange={e=>{handleUpdate('microscopic',e.target.value.replace(/\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F]/g, ''))}} 
                    value={props.report.microscopic}
                    disabled={props.readOnly}
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
                ></textarea>
            </div>
        </div>
    )
};