import React, { useState } from 'react';
import style from './index.css';
import { Radio,Checkbox } from 'antd';
import Select from 'select';

const CheckboxGroup = Checkbox.Group;
const RadioGroup = Radio.Group;

const distanceOptions = [
    {label:'阴性',value:'negative'},
    {label:'阳性',value:'positive'}
]
const invasionOptions = [
    {label:'无',value:'no'},
    {label:'有',value:'have'},
    {label:'不确定',value:'uncertain'},
]
const malignantOptions = [
    {title:'鳞状细胞癌',value:'鳞状细胞癌'},
]
const benignOptions = [
    {title:'乳头状瘤',value:'乳头状瘤'},
]
const mesenchymeOptions = [
    {title:'血管瘤',value:'血管瘤'},
]
const lymphOptions = [
    {title:'MALT型边缘区B细胞淋巴瘤',value:'MALT型边缘区B细胞淋巴瘤'},
]
const heterozygousOptions = [
    {title:'错构瘤',value:'错构瘤'}
]
const samples = [
    {label:'肿块切除',value:'肿块切除'},
    {label:'肺段切除',value:'肺段切除'},
    {label:'肺叶切除',value:'肺叶切除'},
    {label:'全肺',value:'全肺'},
]
const stations = [
    {label:'左肺上叶',value:'左肺上叶'},
    {label:'左肺下叶',value:'左肺下叶'},
    {label:'右肺上叶',value:'右肺上叶'},
    {label:'右肺中叶',value:'右肺中叶'},
    {label:'右肺下叶',value:'右肺下叶'},
    {label:'右肺门',value:'右肺门'},
]
const shapes = [
    {label:'管内型',value:'管内型'},
    {label:'管壁浸润型',value:'管壁浸润型'},
    {label:'球型',value:'球型'},
    {label:'块型',value:'块型'},
    {label:'中央型',value:'中央型'},
    {label:'周围型',value:'周围型'},
    {label:'弥漫浸润型',value:'弥漫浸润型'},
]
const diffs = [
    {label:'高分化',value:'高分化'},   
    {label:'中分化',value:'中分化'},   
    {label:'低分化',value:'低分化'},   
    {label:'未分化',value:'未分化'},   
    {label:'不适用',value:'不适用'},   
    {label:'无法评估',value:'无法评估'},   
]

export default function Index(props){

    const [dvalue1,setDvalue1] = useState('');
    const [dvalue2,setDvalue2] = useState('');
    const [dvalue3,setDvalue3] = useState('');
    const [dvalue4,setDvalue4] = useState('');
    const [dvalue5,setDvalue5] = useState('');
    const [ivalue1,setIvalue1] = useState('');
    const [ivalue2,setIvalue2] = useState('');

    const onChange1=(e)=>{
        setDvalue1(e.target.value);
    }
    const onChange2=(e)=>{
        setDvalue2(e.target.value);
    }
    const onChange3=(e)=>{
        setDvalue3(e.target.value);
    }
    const onChange4=(e)=>{
        setDvalue4(e.target.value);
    }
    const onChange5=(e)=>{
        setDvalue5(e.target.value);
    }
    const onChange6=(e)=>{
        setIvalue1(e.target.value);
    }
    const onChange7=(e)=>{
        setIvalue2(e.target.value);
    }
    const checkChange=(value)=>{
        // console.log(value)
    }

    return (
        <div className={style.lung} style={{display:props.visible?'block':'none'}}>
            <div className={style['input-box']}>
                <div className={style.title}>标本类型：</div>
                <div className={style.right}>
                    <input type="text" style={{width:'334px'}} />
                    <div>
                        <CheckboxGroup options={samples}  onChange={checkChange} />
                    </div>
                </div>
            </div>
            <div className={style['input-box']}>
                <div className={style.title}>肿瘤所在位置：</div>
                <div className={style.right}>
                    <input type="text" style={{width:'334px'}} />
                    <div>
                        <CheckboxGroup options={stations}  />
                    </div>
                </div>
            </div>
            <div className={style['input-box']}>
                <div className={style.title}>大体类型：</div>
                <div className={style.right}>
                    <input type="text" style={{width:'334px'}} />
                    <div>
                        <CheckboxGroup options={shapes}  />
                    </div>
                </div>
            </div>
            <div className={style['input-box']}>
                <div className={style.title}>肿瘤大小：</div>
                <div className={style.right}>
                    <input type="text" style={{width:'56px',marginRight:'5px'}} />
                    cm X
                    <input type="text" style={{width:'56px',margin:'0px 5px'}} />
                    cm X
                    <input type="text" style={{width:'56px',margin:'0px 5px'}} />
                    cm
                </div>
            </div>
            <div className={style['input-box']}>
                <div className={style.title}>组织学类型：</div>
                <div className={style.right}>
                    <input type="text" style={{marginBottom:'6px',width:'334px'}} />
                    <div>
                        恶性上皮性肿瘤：
                        <Select
                            options={malignantOptions}
                            lineFeed={false}
                            style={{width:'295px'}}
                            defaultValue={'鳞状细胞癌'}
                        ></Select>
                    </div>
                    <div>
                        良性上皮性肿瘤：
                        <Select
                            options={benignOptions}
                            lineFeed={false}
                            style={{width:'295px'}}
                            defaultValue={'乳头状瘤'}
                        ></Select>
                    </div>
                    <div>
                        间叶肿瘤：
                        <Select
                            options={mesenchymeOptions}
                            lineFeed={false}
                            style={{width:'295px'}}
                            defaultValue={'血管瘤'}
                        ></Select>
                    </div>
                    <div>
                        淋巴瘤：
                        <Select
                            options={lymphOptions}
                            lineFeed={false}
                            style={{width:'295px'}}
                            defaultValue={'MALT型边缘区B细胞淋巴瘤'}
                        ></Select>
                    </div>
                    <div>
                        杂类肿瘤：
                        <Select
                            options={heterozygousOptions}
                            lineFeed={false}
                            style={{width:'295px'}}
                            defaultValue={'错构瘤'}
                        ></Select>
                    </div>
                </div>
            </div>
            <div className={style['input-box']}>
                <div className={style.title}>组织学分级：</div>
                <div className={style.right}>
                    <input type="text" style={{width:'334px'}} />
                    <div>
                        <CheckboxGroup options={diffs}  />
                    </div>
                </div>
            </div>
            <div className={style['input-box']}>
                <span className={style.title}>肿瘤距肺实质切缘的距离：</span>
                <div className={style.right}>
                    <input type="text" style={{width:'56px'}} /> cm
                    <span style={{marginLeft:'30px',fontSize:'15px'}}>
                        切缘:
                        <RadioGroup options={distanceOptions} onChange={onChange1} value={dvalue1} />
                    </span>
                </div>
            </div>
            <div className={style['input-box']}>
                <span className={style.title}>肿瘤距支气管切缘：</span>
                <div className={style.right}>
                    <input type="text" style={{width:'56px'}} /> cm
                    <span style={{marginLeft:'77px',fontSize:'15px'}}>
                        切缘:
                        <RadioGroup options={distanceOptions} onChange={onChange2} value={dvalue2} />
                    </span>
                </div>
            </div>
            <div className={style['input-box']}>
                <span className={style.title}>肿瘤距血管切缘：</span>
                <div className={style.right}>
                    <input type="text" style={{width:'56px'}} /> cm
                    <span style={{marginLeft:'93px',fontSize:'15px'}}>
                        切缘:
                        <RadioGroup options={distanceOptions} onChange={onChange3} value={dvalue3} />
                    </span>
                </div>
            </div>
            <div className={style['input-box']}>
                <span className={style.title}>肿瘤距胸膜：</span>
                <div className={style.right}>
                    <input type="text" style={{width:'56px'}} /> cm
                    <span style={{marginLeft:'124px',fontSize:'15px'}}>
                        切缘:
                        <RadioGroup options={distanceOptions} onChange={onChange4} value={dvalue4} />
                    </span>
                </div>
            </div>
            <div className={style['input-box']}>
                <span className={style.title}>其他切缘：</span>
                <div className={style.right}>
                    <input type="text" style={{width:'56px'}} /> cm
                    <span style={{marginLeft:'140px',fontSize:'15px'}}>
                        切缘:
                        <RadioGroup options={distanceOptions} onChange={onChange5} value={dvalue5} />
                    </span>
                </div>
            </div>
            <div className={style['input-box']}>
                <span className={style.title}>脉管侵犯：</span>
                <RadioGroup options={invasionOptions} onChange={onChange6} value={ivalue1} />
            </div><div className={style['input-box']}>
                <span className={style.title}>神经侵犯：</span>
                <RadioGroup options={invasionOptions} onChange={onChange7} value={ivalue2} />
            </div>
            <div className={style['input-box']}>
                <span className={style.title}>淋巴结转移情况：</span><input type="text" style={{width:'334px'}} />
            </div>
            <div className={style['input-box']}>
               <span className={style.title}>TNM 分期：</span><input type="text" style={{width:'334px'}} />
            </div>
            <div className={style['input-box']}>
                <span className={style.title}>免疫组织化学染色项目及结果：</span><input type="text" style={{width:'334px'}} />
            </div>
            <div className={style['input-box']}>
                <span className={style.title}>分子生物学检查结果或建议：</span><input type="text" style={{width:'334px'}} />
            </div>
            <div className={style['input-box']}>
                <span className={style.title}>诊断备注：</span><input type="text" style={{width:'334px'}} />
            </div>
        </div>
    )
}