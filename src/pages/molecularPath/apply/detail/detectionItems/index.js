import React, {useState,useEffect,useCallback} from 'react';
import Panel from 'panel';
import style from './index.css';
import {Checkbox} from 'antd';
import {Items} from './items';
import {Radio} from 'antd';
import deep from 'deep';
import Input from 'input';

const RadioGroup = Radio.Group;

const itemsAction = (item,arr) => {
    arr = arr || ['F','P','S','G','D'];
    return arr.some(o=>item.includes(o));
}

const getOptions = (arr,higherLevel) => {

    return arr.map(o => {
        let temp = o.split(' ');
        let last = temp.pop();
        last = itemsAction(last)? <strong>{last}</strong> : last;
        let str = temp.join(" ");
        return ({label:<span>{str} {last}</span> ,value:`${higherLevel}|${o}`})
    });
}

const NSCLC_Options = getOptions(Items.NSCLC,'非小细胞癌')
const CrC_options = getOptions(Items.CrC,'结直肠癌')
const Thyroid_Options = getOptions(Items.Thyroid,'甲状腺癌')
const BreastGastric_Options = getOptions(Items.BreastGastric,'乳腺癌，胃癌');
const Gist_Options = getOptions(Items.Gist,'胃肠道间质瘤');
const FGT_Options = getOptions(Items.FGT,'女性生殖系统肿瘤');
const Urinary_Options = getOptions(Items.Urinary,'泌尿系统肿瘤');
const SoftTissue_Options = getOptions(Items.SoftTissue,'软组织肿瘤');
const CNS_Tumors_Options = getOptions(Items.CNS_Tumors,'中枢神经系统肿瘤');
const OtherItems_Options = getOptions(Items.OtherItems,'其他检测项目');
const LH_Tumors_Options = getOptions(Items.LH_Tumors.items,'淋巴造血系统肿瘤')
const LH_SubItems = [
    {title:'三打击：',options:getOptions(Items.LH_Tumors.threeStrikes,'淋巴造血系统肿瘤|三打击')},
    {title:'小B细胞：',options:getOptions(Items.LH_Tumors.Bcell,'淋巴造血系统肿瘤|小B细胞')},
    {title:'套细胞：',options:getOptions(Items.LH_Tumors.amphicyte,'淋巴造血系统肿瘤|套细胞')},
    {title:'结外边缘区：',options:getOptions(Items.LH_Tumors.extranodalMarginZone,'淋巴造血系统肿瘤|结外边缘区')},
    {title:'其他：',options:getOptions(Items.LH_Tumors.other,'淋巴造血系统肿瘤|其他')},
    {title:'淋巴瘤联合基因检测：',options:getOptions(Items.LH_Tumors.LCGD,'淋巴造血系统肿瘤|淋巴瘤联合基因检测')},
]

function Row(props){

    const {
        values = [],
        crosshead,
        options = [],
        subItems = null,
        onChange,
        renderAddInput = ()=>{}
    } = props;

    return(
        <div className={style.rowBox}>
            <div className={style.left}>
                {crosshead}
            </div>
            <div className={style.right}>
                {props.children}
                {
                    options.map(o=>{
                        let isContain = values.find(item=>item.test_key === o.value);
                        return (
                            <Checkbox 
                                key={o.value} 
                                checked={(!!isContain) && isContain.state} 
                                value={o.value}
                                onChange={e=>onChange(e.target.checked,e.target.value)}
                                // disabled={!!(isContain && values.status && isContain.test_id)}
                            >{o.label}</Checkbox>
                        )
                    })
                }
                {
                    subItems && subItems.map(o => (
                        <div key={o.title}>
                            <span style={{color:'#434343'}}>{o.title}</span>
                            {
                                o.options.map(sub => {
                                    let isContain = values.find(item=>item.test_key === sub.value);
                                    return (
                                        <Checkbox 
                                            key={sub.value} 
                                            checked={(!!isContain) && isContain.state} 
                                            value={sub.value}
                                            onChange={e=>onChange(e.target.checked,e.target.value)}
                                            // disabled={!!(isContain && values.status && isContain.test_id)}
                                        >{sub.label}</Checkbox>
                                    )
                                })
                            }
                        </div>
                    ))
                }
                {renderAddInput()}
            </div>
        </div>
    )
}

const itemsArr = [
    {crosshead:'结直肠癌',options:CrC_options},
    {crosshead:'甲状腺癌',options:Thyroid_Options},
    {crosshead:'乳腺癌，胃癌',options:BreastGastric_Options},
    {crosshead:'胃肠道间质瘤',options:Gist_Options},
    {crosshead:'女性生殖系统肿瘤',options:FGT_Options},
    {crosshead:'泌尿系统肿瘤',options:Urinary_Options},
    {crosshead:'淋巴造血系统肿瘤',options:LH_Tumors_Options,subItems:LH_SubItems},
    {crosshead:'软组织肿瘤',options:SoftTissue_Options},
    {crosshead:'中枢神经系统肿瘤',options:CNS_Tumors_Options},
    //{crosshead:'其他检测项目',options:OtherItems_Options},
]

export default function Index(props){

    const {
            detectionItems,
            updateItemsState,
            baseInfo,
            updateBaseState,
        } = props;

    const [newItem,setNewItem] = useState('');
    const [newOption,setNewOption] = useState(OtherItems_Options);

    const deleteCustomItem = useCallback(
        (e,value) => {
            e.stopPropagation();
            let arr = deep.clone(detectionItems);
            arr = arr.filter(o=>o.test_key !== value);
            arr.status = detectionItems.status;
            
            updateItemsState(arr)
        }
    ,[detectionItems,updateItemsState])

    const handleLoop = useCallback(
        ()=>{
            // 清空当前其他选项中的自定义检测项
            setNewOption(n=>OtherItems_Options);

            // 找出自定义检测项
            let customItems = detectionItems.filter(item=>getItemName(item.test_key,'level') === '自定义');

            customItems = customItems.map(o=>({
                label:<span>
                    {o.test_name} 
                    <span 
                        style={{
                            background:`url(${require('@images/delete_item.png')}) no-repeat center`,
                            display:'inline-block',
                            verticalAlign:'text-top',
                            width:'15px',
                            height:'15px',
                            marginLeft:'10px',
                            position: 'relative',
                            top: '2px'
                        }}
                        onClick={e=>{deleteCustomItem(e,o.test_key)}}
                    ></span></span>,
                value:o.test_key
            }))

            customItems.length && setNewOption(n=>n.concat(customItems))
        }
        ,[detectionItems,deleteCustomItem])
    

    useEffect(()=>{
        handleLoop()
        
    },[handleLoop])

    const getItemName = (key,location = 'name') => {
        let  arr = key.split('|');
        switch(location){
            case 'name':
                return arr[arr.length-1];
            case 'level':
                return arr[0];
            default :
                break;
        }
    }

    const handleChange = (checked,value) => {
        let arr = deep.clone(detectionItems);
        if(checked){
            let flag = false;
            arr.forEach(o=>o.test_key === value && (flag = true))
            arr = !flag?
                arr.concat([{test_key:value,test_name:getItemName(value),state:true}]):
                arr.map(o=>{o.test_key === value && (o.state = true);return o})
        }else if(!checked) arr = arr.map(o=>{o.test_key === value && (o.state = false);return o})
        arr.status = detectionItems.status;
        
        updateItemsState(arr)

    }

    const handleRadio = (key,value) => {
        let baseClone = deep.clone(baseInfo);
        baseClone[key] = value;
        updateBaseState(baseClone);
    }

    const addItem = () => {
        if(!newItem.trim())return;
        let item = getOptions([newItem.trim()],'自定义')[0];
        setNewItem('');
        handleChange(true,item.value);
    }

    

    return (
        <Panel title={'检测项目'}>
            <div className={style.contanier}>
                <Row 
                    crosshead={"非小细胞癌"} 
                    options={NSCLC_Options} 
                    values={detectionItems} 
                    onChange={handleChange}
                >
                    <div style={{marginBottom:'8px'}}>
                        <span style={{color:'#434343'}}>TKI耐药史：</span>
                        <RadioGroup
                            value={baseInfo.tki_flag}
                            options={[
                                {label:'有',value:1},
                                {label:'无',value:0}
                            ]}
                            onChange={e=>handleRadio('tki_flag',e.target.value)}
                        ></RadioGroup>
                    </div>
                </Row>
                {
                    itemsArr.map(o=>{
                        return(
                            <Row 
                                values={detectionItems}
                                key={o.crosshead}
                                crosshead={o.crosshead} 
                                options={o.options} 
                                subItems={o.subItems}
                                onChange={handleChange}
                            ></Row>
                        )
                    })
                }
                <Row
                    crosshead={'其他检查项目'}
                    options={newOption}
                    values={detectionItems}
                    onChange={handleChange}
                    renderAddInput={()=>{
                        return(
                            <div style={{marginBottom:'10px'}}>
                                <Input
                                    lineFeed={false}
                                    inputStyle={{width:'180px'}}
                                    value={newItem}
                                    onChange={e=>setNewItem(e.target.value)}
                                ></Input>
                                <button className={style.addItem} onClick={addItem}>新增</button>
                            </div>
                        )
                    }}
                ></Row>
            </div>
        </Panel>
    )
}