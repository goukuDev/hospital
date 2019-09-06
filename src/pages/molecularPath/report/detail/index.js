import React ,{ useState, useEffect,useCallback} from 'react';
import style from './index.css';
import {api,userInfo} from 'utils';
import {CODE} from 'myConstants'
import confirm from 'confirm';
import CommonWords from 'commonWords';
import Message from 'message';
import CommonReport from './commonReport';
import FishReport from './fishReport';
import deep from 'deep'
import Confirm from 'confirm';

export default function Index(props){
    const [samples,setSamples]=useState([])
    const [reportDetail,setReportDetail]=useState({report:{}})
    const [reportType,setReportType]=useState(0)
    const [users,setUsers]=useState([])
    const [reviewStatus,setSeviewStatus]=useState(0)
    const [focused,setFocused] = useState(null);
    
    const [content,setContent] =useState({
        diagnosis:'',
        projects:'',
        methods:'',
        qualityControl:'',
        result:'',
        remark:'',
        time:'',
        firstDoc:'',
        sencendDoc:'',
        finalDoc:'',
    })
    const gender = {
        0: '女',
        1: '男',
        2: '其他',
    };

    const [oldReportDetail,setOldReportDetail]=useState(content)
    
    // ------------------------- api -------------------------
    const getReport = useCallback(() => {
        return api(`molecule/get_app_report`,{apply_id:props.applyId}).then(
            ({ code, data, message }) => {
                if (CODE.SUCCESS === code) {
                    setReportDetail(data);
                    setReportType(data.molecule_pathnum.substring(0,1).toLowerCase()==='f'?1:0)
                    setSamples(data.samples)
                    if(Object.keys(data.report).length&&Object.keys(data.report.content).length){
                        setContent(JSON.parse(data.report.content))
                        setOldReportDetail(JSON.parse(data.report.content))
                        setSeviewStatus(data.report.review_status)
                    }
                        
                } else {
                    Message.error(message);
                }
            }
        );
    },[props.applyId])

    const getUsers = ()=>{
        api('user/get_users').then(({ code, data }) => {
            if (CODE.SUCCESS === code) {
                setUsers(data.map(e=>Object.assign({},{'title':e.user_name,'value':e.user_name})));
            }
        });
    }
   
    // -------------------------- methods ----------------------
    useEffect(() => {
        getReport();
        getUsers();
    }, [getReport]);
   
    const changed = !deep.equals(oldReportDetail, content);

    const handleClose = () => {
        if(changed){
            Confirm({
                type:'close',
                onNotSave:props.close,
                onSave:async e=>{
                    await save(reviewStatus);
                    props.close();
                }
            })
        }else{
            props.close();
        }
    }

    const save =(reviewStatus,verify)=> {
        let errorMessage = '审核失败'
        let successMessage = '审核成功'
        let curContent = Object.assign({},content);
        curContent.firstDoc=userInfo().name;
        curContent.finalDoc=userInfo().name;
        if(reviewStatus===0) {
            curContent.finalDoc='';
            errorMessage = '取消审核失败'
            successMessage = '取消审核成功'
        }
        setContent(curContent)
        let apis ='molecule/add_app_report';
        let data = {
            apply_id: props.applyId,
            type:reportType,
            review_status:reviewStatus,
            content:JSON.stringify(curContent)
        }
        if(Object.keys(reportDetail.report).length){
            apis='molecule/alter_app_report';
            data = {
                report_id: reportDetail.report.report_id,
                type:reportType,
                review_status:reviewStatus,
                content:JSON.stringify(curContent)
            }
        }
        api(apis, data).then(({ code, data }) => {
            if (CODE.SUCCESS === code) {
                getReport();
                Message.success('保存成功');
                if(verify) {
                    Message.success(successMessage);
                }
            }
            else {
                if(verify) {
                    Message.error(errorMessage);
                }
                
            }
        });
    }

    const verify = e=>{
        let messages = '是否确认审核'
        if(e===0) {
            messages = '是否确认取消审核'
        }
        if (content.sencendDoc) {
			Confirm({
				content: messages,
				onOk: e => {
                    reviewStatus===1?save(0,'verify'):save(1,'verify')
				},
			});
		} else {
            Message.error('请选择复诊医生')
		}
        
    }

     /* 常用词相关功能开始 */
    const [initialWords, setInitialWords] = useState(null);
    const getWords = () => {
        api('report/get_high_freq', {
            user_id: userInfo().user_id,
            type:1
        }).then(({ code, data }) => {
            if (CODE.SUCCESS === code) {
                setInitialWords(data.res);
            }
        });
    };
    useEffect(() => getWords(), []);
 
    const resetWords = () => {
        confirm({
            content: '确定重置吗？',
            onOk: e => {
                api('report/del_high_freq', {
                    user_id: userInfo().user_id,
                    type:1
                }).then(({ code }) => {
                    if (CODE.SUCCESS === code) {
                        getWords();
                        localStorage.expandedKeys='';
                    }
                });
            },
        });
    };
 
    const fetchUpdate = pureTree => {
        api('report/update_high_freq', {
            content: JSON.stringify(pureTree),
            user_id: userInfo().user_id,
            type:1
        }).then(({ code, message }) => {
            if (CODE.SUCCESS !== code) {
                Message.error(message);
            }
        });
    };
    const handleDbclick =e=>{
        if(!focused||reviewStatus) return
        else{
            let curContent = Object.assign({},content);
            curContent[focused] = `${curContent[focused]}${e}`
            setContent(curContent)
        }
    }
 
     /* 常用词相关功能结束 */
     
    const  verifiable = Object.keys(reportDetail.report).length&&reviewStatus===0;
    
    return (
        <div className={style.outer}>
            <div className={style.title}>
                <span>报告</span>
                <img 
                    src={require('@images/close.png')}
                    width='20'
                    style={{cursor:'pointer',boxShadow:'0px 4px 6px rgba(50,50,93,0.11)',}} 
                    alt=""
                    onClick={handleClose}
                />
            </div>
            {Object.keys(reportDetail).length!==0&&(<div className={style.patient}>
                <div style={{ position: 'relative' }}>
                    <div className={style.info}>
                        <span className={style.bold}>
                            当前病人：{reportDetail.molecule_pathnum}
                        </span>
                        <span>{reportDetail.name}</span>
                        <span>{gender[reportDetail.gender]}</span>
                        <span>{reportDetail.age}岁</span>
                        <span>住院号：{reportDetail.admission_num}</span>
                        <span>床号：{reportDetail.bed_num}</span>
                        <span>送检部位：{reportDetail.deliver_location}</span>
                        <span>临床诊断：{reportDetail.clinical_diagnosis}</span>
                    </div>
                </div>
            </div>)}
            <div className={style.content}>
                <div className={style.inner}>
                    <div className={style.left}>
                        {reportType===0&&<CommonReport content={content} users={users} reviewStatus={reviewStatus} changeContent={e=>setContent(e)} samples={samples} focused={e=>setFocused(e)}/>}
                        {reportType===1&&<FishReport content={content} users={users} reviewStatus={reviewStatus} changeContent={e=>setContent(e)} samples={samples} focused={e=>setFocused(e)} />}
                    </div>
                    <div className={style.right}>
                        {initialWords && (
                            <CommonWords
                                tree={initialWords}
                                dbclick={e =>handleDbclick(e)}
                                resetWords={resetWords}
                                fetchUpdate={fetchUpdate}
                            />
                        )}
                    </div>
                </div>
                <div className={style.footer}>
                    <span className={Object.keys(reportDetail.report).length?'':style.disabled}>打印</span>
                    <span className={reviewStatus===1?'':style.disabled} style={{width:'100px'}} onClick={reviewStatus===1?e=>verify(0):e=>e}>取消审核</span>
                    <span className={verifiable?'':style.disabled} onClick={verifiable?e=>verify(1):e=>e}>审核</span>
                    <span className={reviewStatus===1?style.disabled:''} onClick={ reviewStatus===1?e=>e:e=>save(reviewStatus)}>保存</span>
                </div>
            </div>
        </div>
    )
}