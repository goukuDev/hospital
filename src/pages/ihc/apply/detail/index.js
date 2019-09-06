import React ,{ useState, useRef,useEffect} from 'react';
import style from './index.css';
import {api,fmtDate} from 'utils';
import {CODE} from 'myConstants'
import Select from 'select';
import Input from 'input';
import BaseInfo from './baseInfo';
import ApplyInfo from './applyInfo';
import SampleInfo from './sampleInfo';
import Marks from './marks';
import ApplyList from './applyList';
import Confirm from 'confirm';
import deep from 'deep';
import Message from 'message';

const APPLY = {SAVE:0,SEND:1}
const hisOptions = [
    {title:'住院号',value:0},
    {title:'门诊号',value:1},
    {title:'卡号',value:2},
    {title:'申请号',value:3},
    {title:'体检条码号',value:4},
    {title:'原病理号',value:5},
]

export default function Index(props){

    const {record,action} = props;
    const [applyId,setApplyId] = useState(record && action === 'modify' && record.apply_id);
    const oldRecord = useRef({});
    const [baseInfo,setBaseInfo] = useState({});
    const [applyInfo,setApplyInfo] = useState({});
    const [his_apply_type,setHisType] = useState(0);
    const [his_apply_id,setHisNum] = useState(null)

    // ------------------------- api -------------------------

    const getApply = (id) => {
        return  new Promise(resolve => {
            api(`immuno/get_application`,{apply_id:id})
            .then(({code,data}) => {
                if(code === CODE.SUCCESS){
                    resolve(data)
                }
            })
        })
    }

    useEffect(()=>{
        async function getDetailApply() {

            let {baseInfo,applyInfo,his_apply_type,his_apply_id} = initRecord();
            let data = record &&  await getApply(record.apply_id);
            switch (action) {
                case 'add':
                    baseInfo.gender = 1;
                    applyInfo.charge_status = 1;
                    
                    break;
                case 'copy':
                    baseInfo = {
                        name:data.name,
                        gender:data.gender,
                        age:data.age,
                        identify_num: data.identify_num
                    }
                    applyInfo.charge_status = 1;
                    
                    his_apply_id = data.his_apply_id;
                    his_apply_type = data.his_apply_type;
                    break;
                case 'modify':
                    
                    baseInfo = {
                        name:data.name,
                        gender:data.gender,
                        age:data.age,
                        identify_num: data.identify_num,
                        tki_flag: data.tki_flag,
                    };
                    applyInfo = {
                        checkin_time:data.checkin_time,
                        admission_num:data.admission_num,
                        outpatient_num:data.outpatient_num,
                        deliver_org:data.deliver_org,
                        deliver_location:data.deliver_location,
                        tel_num:data.tel_num,
                        comment:data.comment,
                        clinical_diagnosis:data.clinical_diagnosis,
                        charge_status:data.charge_status,
                    };
                    break;
                default:
                    console.log('error action');
                    break;
            }

            setBaseInfo(baseInfo);
            setApplyInfo(applyInfo);
            setHisType(his_apply_type);
            setHisNum(his_apply_id);
            oldRecord.current = {baseInfo,applyInfo,his_apply_type,his_apply_id}
        }

        getDetailApply()
    },[action,record])

    // -------------------------- methods ----------------------

    const initRecord = () => {
        let checkin_time = fmtDate(new Date());

        return {
            his_apply_id:null,
            his_apply_type:0,
            baseInfo:{ 
                name:'',
                gender:null,
                age:'',
                identify_num: '',
                tki_flag: null,
             },
            applyInfo:{
                checkin_time,
                admission_num:'',
                outpatient_num:'',
                deliver_org:'',
                deliver_location:'',
                tel_num:'',
                comment:'',
                clinical_diagnosis:'',
                charge_status:null,
            },
        }
    }

    const getApplyData = (flag) => {
        return {
            save_flag:flag,
            his_apply_id: his_apply_id,
            his_apply_type: his_apply_type,
            name: baseInfo.name.trim(),
            gender: baseInfo.gender,
            age:baseInfo.age,
            identify_num: baseInfo.identify_num.trim(),
            checkin_time: applyInfo.checkin_time,
            admission_num: applyInfo.admission_num.trim(),
            outpatient_num: applyInfo.outpatient_num.trim(),
            deliver_org: applyInfo.deliver_org.trim(),
            deliver_location: applyInfo.deliver_location.trim(),
            charge_status:  applyInfo.charge_status,
            tel_num: applyInfo.tel_num.trim(),
            comment: applyInfo.comment.trim(),
            clinical_diagnosis: applyInfo.clinical_diagnosis.trim(),
        }
    }

    const handleApply = (flag,isClose) => {
        let data = getApplyData(flag);
        if(applyId){
            data.apply_id = applyId;
            return new Promise(resolve=>{
                api('immuno/alter_application',data)
                    .then(({code,data}) => {
                        if(code === CODE.SUCCESS){
                            flag === APPLY.SAVE && Message.success('保存成功');
                            oldRecord.current = {baseInfo,applyInfo,his_apply_type,his_apply_id};
                            props.close();
                            resolve();
                        }else{
                            flag === APPLY.SAVE && Message.error('保存失败');
                            flag === APPLY.SEND && Message.error('发送失败');
                        }            
                    })
            })
        }else{
            return new Promise(resolve=>{
                api('immuno/add_application',data)
                    .then(({code,data}) => {
                        if(code === CODE.SUCCESS){
                            (flag === APPLY.SAVE && !isClose) && Message.success('保存成功');
                            oldRecord.current = {baseInfo,applyInfo,his_apply_type,his_apply_id};
                            !isClose && props.close();
                            isClose && setApplyId(data);
                            resolve(data);
                        }else{
                            flag === APPLY.SAVE && Message.error('保存失败');
                            flag === APPLY.SEND && Message.error('发送失败');
                        }

                    })
            })
        }
       
    }

    const handleClose = () => {
        let changed = (!deep.equals(baseInfo,oldRecord.current.baseInfo) || 
                        !deep.equals(applyInfo,oldRecord.current.applyInfo) ||
                        !deep.equals(his_apply_type,oldRecord.current.his_apply_type) ||
                        !deep.equals(his_apply_id,oldRecord.current.his_apply_id)
                    )
        if(changed){
            Confirm({
                type:'close',
                onNotSave:props.close,
                onSave: e=>{
                    handleApply(APPLY.SAVE);
                }
            })
        }else{
            props.close();
        }
    }

    return (
        <div className={style.outer}>
            <div className={style.title}>
                <span>登记/接收</span>
                <img 
                    src={require('@images/close.png')}
                    width='20'
                    style={{cursor:'pointer',boxShadow:'0px 4px 6px rgba(50,50,93,0.11)',}} 
                    alt=""
                    onClick={handleClose}
                />
            </div>
            <div className={style.content}>
                <div className={style.his}>
                    <Select
                        value={his_apply_type}
                        onChange={value=>setHisType(value)}
                        lineFeed={false}
                        options={hisOptions}
                        style={{width:'140px',marginRight:'10px'}}
                    ></Select>
                    <Input
                        value={his_apply_id}
                        onChange={e=>setHisNum(e.target.value)}
                        lineFeed={false}
                        inputStyle={{width:'235px',marginRight:'10px'}}
                        placeholder={'HIS识别号'}
                    ></Input>
                    <button>提取</button>
                </div>
                <div className={style.main}>
                    <div className={style.row}>
                        <div className={style.base}>
                            <BaseInfo 
                                baseInfo={baseInfo}
                                updateState={value=>setBaseInfo(value)}
                            ></BaseInfo>
                        </div>
                        <div className={style.apply}>
                            <ApplyInfo 
                                applyInfo={applyInfo}
                                updateState={value=>setApplyInfo(value)}
                            ></ApplyInfo>
                        </div>
                    </div>
                    <div className={style.row}>
                        <SampleInfo 
                            applyId={applyId}
                            saveAction={handleApply}
                        ></SampleInfo>
                    </div>
                    <div className={style.row}>
                        <Marks
                            applyId={applyId}
                        ></Marks>
                    </div>
                    <div className={style.row}>
                        <ApplyList
                            applyId={applyId}
                        ></ApplyList>
                    </div>

                </div>
            </div>
            <div className={style.bottom}>
                <button className={style.btn} onClick={e=>handleApply(APPLY.SEND)} style={{marginRight:'16px'}}>确认发送申请</button>
                <button className={style.btn} onClick={e=>handleApply(APPLY.SAVE)} >保存</button>
                <button className={style.btn}>打印申请单</button>
            </div>
        </div>
    )
}