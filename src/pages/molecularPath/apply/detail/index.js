import React ,{ useState, useRef,useEffect} from 'react';
import style from './index.css';
import {api,fmtDate} from 'utils';
import {CODE} from 'myConstants'
import Select from 'select';
import Input from 'input';
import BaseInfo from './baseInfo';
import ApplyInfo from './applyInfo';
import SampleInfo from './sampleInfo';
import DetectionItems from './detectionItems';
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
    const oldRecord = useRef({});
    const [baseInfo,setBaseInfo] = useState({});
    const [applyInfo,setApplyInfo] = useState({});
    const [sampleInfo,setSampleInfo] = useState({});
    const [detectionItems,setDetectionItems] = useState([]);
    const [his_apply_type,setHisType] = useState(0);
    const [his_apply_id,setHisNum] = useState(null);
    const [molecule_pathnum,setMolecularPathnum] = useState('');
    const [original_pathnum,setOriginalPathnum] = useState('');

    // ------------------------- api -------------------------

    const getApply = (id) => {
        return  new Promise(resolve => {
            api(`molecule/get_application`,{apply_id:id})
            .then(({code,data}) => {
                if(code === CODE.SUCCESS){
                    resolve(data)
                }
            })
        })
    }

    const addApply = (flag) => {
        return new Promise(resolve=>{
            let data = {
                save_flag:flag,
                his_apply_id:(his_apply_id || '').trim(),
                his_apply_type: his_apply_type,
                molecule_pathnum:(molecule_pathnum || '').trim(),
                original_pathnum:(original_pathnum || '').trim(),
                name: baseInfo.name.trim(),
                gender: baseInfo.gender,
                age: baseInfo.age,
                identify_num: (baseInfo.identify_num || '').trim(),
                checkin_time: applyInfo.checkin_time,
                admission_num: (applyInfo.admission_num || '').trim(),
                outpatient_num: (applyInfo.outpatient_num || '').trim(),
                deliver_org: (applyInfo.deliver_org || '').trim(),
                department: (applyInfo.department || '').trim(),
                district: (applyInfo.district || '').trim(),
                charge_status:  applyInfo.charge_status,
                bed_num: (applyInfo.bed_num || '').trim(),
                tel_num: (applyInfo.tel_num || '').trim(),
                pathologic_diagnosis: (applyInfo.pathologic_diagnosis || '').trim(),
                clinical_diagnosis: (applyInfo.clinical_diagnosis || '').trim(),
                sample_source:  sampleInfo.sample_source,
                sample_source_detail: sampleInfo.sample_source_detail,
                deliver_location: (sampleInfo.deliver_location || '').trim(),
                deliver_location_detail: sampleInfo.deliver_location_detail,
                samples:JSON.stringify(sampleInfo.samples),
                tki_flag:  baseInfo.tki_flag,
                tests:JSON.stringify(detectionItems.filter(o=>o.state)),
            }

            if(record && action === 'modify'){
                data.apply_id = record.apply_id;
                api('molecule/alter_application',data)
                .then(({code,data}) => {
                    if(code === CODE.SUCCESS){
                        flag === APPLY.SAVE && Message.success('保存成功');
                        oldRecord.current = {baseInfo,applyInfo,sampleInfo,detectionItems,his_apply_type,his_apply_id};
                        props.close();
                        resolve();
                    }else{
                        flag === APPLY.SAVE && Message.error('保存失败');
                        flag === APPLY.SEND && Message.error('发送失败');
                    }
                })
            }else{
                
                api('molecule/add_application',data)
                .then(({code,data}) => {
                    if(code === CODE.SUCCESS){
                        flag === APPLY.SAVE && Message.success('保存成功');
                        oldRecord.current = {baseInfo,applyInfo,sampleInfo,detectionItems,his_apply_type,his_apply_id};
                        props.close();
                        resolve();
                    }else{
                        flag === APPLY.SAVE && Message.error('保存失败');
                        flag === APPLY.SEND && Message.error('发送失败');
                    }
                })

            }
        })
    }

    // -------------------------- methods ----------------------

    const initRecord = () => {
        let checkin_time = fmtDate(new Date());

        return {
            his_apply_id:'',
            his_apply_type:0,
            molecule_pathnum:'',
            original_pathnum:'',
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
                department:'',
                district:'',
                bed_num:'',
                tel_num:'',
                pathologic_diagnosis:'',
                clinical_diagnosis:'',
                charge_status:null,
            },
            sampleInfo:{
                sample_source: null,
                sample_source_detail: '[]',
                deliver_location: '',
                deliver_location_detail: '[]',
                samples:[],
            },
            detectionItems:[]
        }
    }

    useEffect(()=>{
        async function getDetailApply() {

            let {baseInfo,applyInfo,sampleInfo,detectionItems,his_apply_type,his_apply_id,molecule_pathnum,original_pathnum} = initRecord();
            let data = record &&  await getApply(record.apply_id);
            switch (action) {
                case 'add':
                    baseInfo.gender = 1;
                    applyInfo.charge_status = 1;
                    sampleInfo.sample_type = 0;
                    sampleInfo.sample_source = 0;
                    sampleInfo.sample_source_detail = '[{"checkbox":"外科手术标本"}]';
                    break;
                case 'copy':
                    baseInfo = {
                        name:data.name,
                        gender:data.gender,
                        age:data.age,
                        identify_num: data.identify_num
                    }
                    applyInfo.charge_status = 1;
                    sampleInfo.sample_type = 0;
                    sampleInfo.sample_source = 0;
                    sampleInfo.sample_source_detail = '[{"checkbox":"外科手术标本"}]';
                    his_apply_id = data.his_apply_id;
                    his_apply_type = data.his_apply_type || 0;
                    original_pathnum = data.original_pathnum;
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
                        department:data.department,
                        district:data.district,
                        bed_num:data.bed_num,
                        tel_num:data.tel_num,
                        pathologic_diagnosis:data.pathologic_diagnosis,
                        clinical_diagnosis:data.clinical_diagnosis,
                        charge_status:data.charge_status,
                    };
                    sampleInfo = {
                        sample_source:  data.sample_source || 0,
                        sample_source_detail: data.sample_source_detail || '[{"checkbox":"外科手术标本"}]',
                        deliver_location: data.deliver_location,
                        deliver_location_detail: data.deliver_location_detail,
                        samples : data.samples,
                    }
                    detectionItems = data.tests;
                    detectionItems.status = record.status;
                    his_apply_id = data.his_apply_id;
                    his_apply_type = data.his_apply_type || 0;
                    molecule_pathnum = data.molecule_pathnum;
                    original_pathnum = data.original_pathnum;
                    
                    break;
                default:
                    console.log('error action');
                    break;
            }

            detectionItems = detectionItems.map(o=>{o.state = true; return o});

            setBaseInfo(baseInfo);
            setApplyInfo(applyInfo);
            setSampleInfo(sampleInfo);
            setDetectionItems(detectionItems);
            setHisType(his_apply_type);
            setHisNum(his_apply_id);
            setMolecularPathnum(molecule_pathnum);
            setOriginalPathnum(original_pathnum);
            oldRecord.current = {baseInfo,applyInfo,sampleInfo,detectionItems,his_apply_type,his_apply_id,original_pathnum,molecule_pathnum}
        }

        getDetailApply()
    },[action,record])


    const handleClose = () => {
        let changed = (!deep.equals(baseInfo,oldRecord.current.baseInfo) || 
                        !deep.equals(applyInfo,oldRecord.current.applyInfo) ||
                        !deep.equals(sampleInfo,oldRecord.current.sampleInfo) || 
                        !deep.equals(detectionItems.filter(o=>o.state),oldRecord.current.detectionItems) ||
                        !deep.equals(his_apply_type,oldRecord.current.his_apply_type) ||
                        !deep.equals(his_apply_id,oldRecord.current.his_apply_id) ||
                        !deep.equals(original_pathnum,oldRecord.current.original_pathnum) ||
                        !deep.equals(molecule_pathnum,oldRecord.current.molecule_pathnum)
                    )
        if(changed){
            Confirm({
                type:'close',
                onNotSave:props.close,
                onSave:async e=>{
                    await addApply(APPLY.SAVE);
                    // props.close();
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
                    <div>
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

                    <div>
                        <Input
                            label={'分子病理号：'}
                            value={molecule_pathnum}
                            onChange={e=>setMolecularPathnum(e.target.value)}
                            lineFeed={false}
                            labelStyle={{color:'#333C48',fontWeight:'600'}}
                            containerStyle={{marginRight:'10px'}}
                            inputStyle={{width:'167px'}}
                        ></Input>
                        <Input
                            label={'病理号：'}
                            value={original_pathnum}
                            onChange={e=>setOriginalPathnum(e.target.value)}
                            lineFeed={false}
                            labelStyle={{color:'#333C48',fontWeight:'600'}}
                            inputStyle={{width:'167px'}}
                        ></Input>
                    </div>
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
                            sampleInfo={sampleInfo}
                            updateState={value=>setSampleInfo(value)}
                        ></SampleInfo>
                    </div>
                    <div className={style.row}>
                        <DetectionItems
                            baseInfo={baseInfo}
                            updateBaseState={value=>setBaseInfo(value)}
                            detectionItems={detectionItems}
                            updateItemsState={value=>setDetectionItems(value)}
                        ></DetectionItems>
                    </div>
                </div>
            </div>
            <div className={style.bottom}>
                <button className={style.btn} disabled={!detectionItems.filter(o=>o.state).length} onClick={e=>addApply(APPLY.SEND)} style={{marginRight:'16px'}}>确认发送申请</button>
                <button className={style.btn} onClick={e=>addApply(APPLY.SAVE)} >保存</button>
            </div>
        </div>
    )
}