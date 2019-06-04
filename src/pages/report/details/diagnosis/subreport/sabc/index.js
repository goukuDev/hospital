import React, { Component } from 'react';
import style from './index.css';
import DatePicker from "datepicker";

class index extends Component {
    render() {
        return (
            <div className={style.sabc}>
                <div className={style.mask}></div>
                <div className={style.content}>
                    <div className={style.title}>
                        <p>免疫组化报告</p>
                        <div className={style.close} onClick={this.props.close}></div>
                    </div>
                    <div className={style.space}>
                        <div style={{overflow:"hidden"}}>
                            <div className={style.fl}>
                                <p className={style.subtitle}>免疫组化报告<span className={style.tip}>提取标记物</span></p>
                                <textarea cols="30" rows="10"></textarea>
                            </div>
                            <div className={style.fr}>
                                <p className={style.subtitle}>病理号</p>
                                <ul>
                                    <li className={style.active}>F2019-012346 <img src={require("./imgs/shanchu-3.png")} alt=""/></li>
                                    <li>F2019-012346 <img src={require("./imgs/shanchu-3.png")} alt=""/></li>
                                    <li>F2019-012346 <img src={require("./imgs/shanchu-3.png")} alt=""/></li>
                                </ul>
                            </div>
                        </div>
                        <div style={{marginTop:"20px",overflow:'hidden'}}>
                            <div className={style["input-box"]}>
                                报告时间：
                                <DatePicker
                                    lineFeed={false}
                                    style={{width: "221px"}}
                                />
                            </div>
                            <div className={style["input-box"]}>
                                报告医生：
                                <div className={`${style.text}`}>{}</div>
                            </div>
                            <div className={style["input-box"]}>
                                审核医生：
                                <div className={`${style.text}`}>{}</div>
                            </div>
                        </div>
                        <div style={{overflow:'hidden'}}>
                            
                        </div>
                    </div>
                    <button className={style.btns}>编辑</button>
                    <button className={style.btns}>打印</button>
                    <button className={style.btns}>取消审核</button>
                    <button className={style.btns}>审核</button>
                    <button className={style.btns}>保存</button>
                </div>
            </div>
        );
    }
}

export default index;