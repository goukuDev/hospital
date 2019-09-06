import React, { useState, useEffect, useRef } from 'react';
import style from './index.css';
import { api, changeDate,fmtDate } from 'utils';
import ExpandTable from 'expandTable';
import Message from 'message';
import { CODE } from 'myConstants';
import Input from 'input';
import TextArea from 'textarea';
import { Radio } from 'antd';

const source = {
    0: '本院',
    1: '外院',
    2: '会诊',
};
const sampleType={
    0 :'蜡块',
    1 : '蜡块，外周血',
    2 : '白片',
    3 : '胸水',
    4 : 'DNA',
    5 : '外周血',
    6 : '腹水',
    7 : '血浆',
    8 : '血清',
    9 : '骨髓',
    10 : '其他'
}

const result = {
    0: '合格',
    1: '不合格',
};
const labelStyle = {
    width: '204px',
    display: 'inline-block',
    textAlign: 'right',
    fontSize: '15px',
    color: '#525F7F',
    verticalAlign: 'top',
    paddingTop:'3px'
};

var ipcRenderer = window.electron && window.electron.ipcRenderer;

export default function Index(props) {
    const columns = [
        {
            title: '分子病理号',
            dataIndex: 'molecule_pathnum',
            width: 140,
        },
        {
            title: '病理号',
            dataIndex: 'original_pathnum',
            width: 120,
        },
        {
            title: '蜡块号',
            dataIndex: 'sample_num',
            width: 120,
        },

        {
            title: '肿瘤细胞数（个）',
            dataIndex: 'tumor_count',
            width: 160,
        },
        {
            title: '肿瘤细胞比例(%)',
            dataIndex: 'tumor_ratio',
            width: 150,
        },
        {
            title: '核酸浓度（ng/ul）',
            dataIndex: 'nucleic_acid_concentration',
            width: 160,
        },
        {
            title: '260/280',
            dataIndex: 'rate',
            width: 100,
        },
        {
            title: '稀释DNA原液+ddH2O体积',
            dataIndex: 'volume',
            width: 140,
        },
        {
            title: '上样浓度',
            dataIndex: 'sample_concentration',
            width: 100,
        },

        {
            title: 'DNA质控',
            dataIndex: 'dna_evaluation',
            width: 140,
            render: value => <span style={{ color: value === 0 ? '#66b72e' : '#ff4500' }}>{result[value]}</span>,
            filters: [
                {
                    text: '合格',
                    value: 0,
                },
                {
                    text: '不合格',
                    value: 1,
                },
            ],
        },
        {
            title: '实验室质控',
            dataIndex: 'lab_evaluation',
            width: 140,
            render: value => <span style={{ color: value === 0 ? '#66b72e' : '#ff4500' }}>{result[value]}</span>,
            filters: [
                {
                    text: '合格',
                    value: 0,
                },
                {
                    text: '不合格',
                    value: 1,
                },
            ],
        },
        {
            title: '结果',
            dataIndex: 'result',
            width: 120,
        },
        {
            title: '备注',
            dataIndex: 'remark',
        },
        {
            title: '操作人',
            dataIndex: 'evaluation_doc',
            width: 120,
        },
        {
            title: '操作时间',
            dataIndex: 'evaluation_time',
            width: 180,
        },

        {
            title: '操作',
            dataIndex: 'option',
            fixed: 'right',
            width: 200,
            render: (text, record) => {
                return (
                    <React.Fragment>
                        <span className={style.delete} onClick={e => hanleClick(e, record)}>
                        DNA质控
                        </span>
                        <span className={`${style.delete} ${style.lab}` } onClick={e => hanleClick(e, record)}>
                        实验室质控
                        </span>
                    </React.Fragment>
                );
            },
        },
    ];
    const radioStyle = {
        display: 'block',
        height: '26px',
        lineHeight: '26px',
    };
    const word = {
        rowkey: 'id',
        name: '实验质控列表',
        inputText: '分子病理号：',
        total: '质控数总计',
        unaccomplished: '未质控',
        printSheet: '打印质控工单',
        status: 0,
        scrollX: 2370,
        scrollY: 375,
        timeText: '操作时间：',
    };

    const pageNum = useRef(1);
    const pageLength = useRef(20);

    const [waxId, setWaxId] = useState([]);
    const [total, setTotal] = useState(0);
    const [dateRange, setDateRange] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [searchList, setSearchList] = useState([]);
    const [filters, setFilters] = useState({});
    const [showEditPop, setShowEditPop] = useState(false);
    const [showLabPop, setShowLabPop] = useState(false);
    const [rowMessage, setRowMessage] = useState({});
    const [dnaInput, setDnaInput] = useState({
        deviceName: 'SMA4000',
        reagent: '',
        reagentCompany: '',
        nucleicAcidConcentration:'',
        rate:'',
        evaluation:0
    });
    const [labInput, setLabInput] = useState({
        reagent: '',
        reagentCompany: '',
        volume:'',
        sampleConcentration:'',
        evaluation:0
    });
    
    const dnaReset = useRef(dnaInput)
    const labReset = useRef(labInput)

    const [deviceName, setDeviceName] = useState();
    const [nucleicAcidConcentration, setNucleicAcidConcentration] = useState('');
    const [rate, setRate] = useState('');
    const [volume, setVolume] = useState('');
    const [sampleConcentration, setSampleConcentration] = useState('');
    const [evaluation, setEvaluation] = useState(0);
    const [testResult, setTestResult] = useState(0);
    const [remark, setRemark] = useState(0);

    const getCaseRecords = ({ pageNum, pageSize, data }) => {
        return api(`molecule/get_dna_applications?pageNum=${pageNum}&pageSize=${pageSize}`, data).then(
            ({ code, data, message }) => {
                if (CODE.SUCCESS === code) {
                    setTotal(data.total);
                    setSearchList(data.data);
                } else {
                    Message.error(message);
                }
            }
        );
    };
    useEffect(() => {
        getCaseRecords({
            pageNum: pageNum.current,
            pageSize: pageLength.current,
        });
    }, []);

    const hanleClick = (e, record) => {
        if (e) e.stopPropagation();
        setRowMessage({
            id: record.id,
            molecule_pathnum: record.molecule_pathnum,
            test_names: record.test_names,
            sampleSource:source[record.sample_source],
            sampleType:sampleType[record.sample_type],
        });
        setDeviceName(record.device_name ? record.device_name : 'SMA4000');
        setNucleicAcidConcentration(record.nucleic_acid_concentration);
        setRate(record.rate);
        setVolume(record.volume);
        setSampleConcentration(record.sample_concentration);
        setEvaluation(record.evaluation);
        setTestResult(record.result);
        setRemark(record.remark);

        setShowEditPop(true);
    };
    const evaluat = () => {
        let curId = rowMessage.id;
        let data = {
            id: curId,
            device_name: deviceName,
            //nucleic_acid_concentration: isNotNull(count) ? count : null,
            nucleic_acid_concentration: nucleicAcidConcentration,
            rate: rate,
            sample_concentration: sampleConcentration,
            evaluation: evaluation,
            result: testResult,
            remark: remark,
            volume: volume,
        };

        api('molecule/alter_dna_quality', data).then(data => {
            if (CODE.SUCCESS === data.code) {
                Message.success('质控完成');
                setRowMessage({});
                setDeviceName('SMA4000');
                setNucleicAcidConcentration('');
                setRate('');
                setVolume('');
                setSampleConcentration('');
                setEvaluation(0);
                setTestResult('');
                setRemark('');
                handleSearch({current:pageNum.current}, filters);
                setShowEditPop(false);
            } else {
                Message.error(data.message);
            }
        });
    };

    const handleSearch = (pagination, filters) => {
        let { current, pageSize } = pagination;
        let {  dna_evaluation,lab_evaluation} = filters;
        console.log(filters)
        pageNum.current = current || 1;
        pageLength.current = pageSize || pageLength.current;
        let data = {
            //status: status && status.length ? JSON.stringify(status) : JSON.stringify([0, 1]),
            molecule_pathnum: inputValue.trim(),
            dna_evaluation: JSON.stringify(dna_evaluation),
            lab_evaluation: JSON.stringify(lab_evaluation),
            evaluation_start_time: fmtDate(dateRange[0]),
            evaluation_end_time: fmtDate(dateRange[1]),
        };
        getCaseRecords({
            pageNum: pageNum.current,
            pageSize: pageLength.current,
            data,
        });
        document.querySelector('.ant-table-body').scrollTop = 0;
    };

    const printSheet = () => {
        if (ipcRenderer && waxId.length) {
            const params = {
                message_type: 'moleculeHe',
                apply_ids: waxId,
            };

            ipcRenderer.send('print', params);
        }
    };

    const uploadFile = files => {
        api('molecule/upload_dna_quality_records', files).then(({ code,data }) => {
            if (code === CODE.SUCCESS) {
                handleSearch('',filters)
            }
            else {
                Message.error(data.message);
            }
        });
    };

    const addFile = e => {
        let files = e.target.files;
        let fd = new FormData();
        for (let i = 0; i < files.length; i++) {
            fd.append('file', files[i]);
        }
        uploadFile(fd);
    };
    const changeDnaInput =(type,value)=>{
        let curInfo = Object.assign({},dnaInput)
        curInfo[type]=value;
        setDnaInput(curInfo)
    }
    const changeLabInput =(type,value)=>{
        let curInfo = Object.assign({},labInput)
        curInfo[type]=value;
        setLabInput(curInfo)
    }
    return (
        <div className={style.outerbg}>
            <div className={style.importBtn}>
                导入
                <input
                     onChange={addFile}
                    type='file'
                    multiple
                    name=''
                    value=''
                    id=''
                />
            </div>
            <ExpandTable
                searchList={searchList}
                total={total}
                columns={columns}
                word={word}
                waxId={waxId}
                checkList={e => setWaxId(e)}
                saveFilter={e => setFilters(e)}
                filter={filters}
                dateRange={dateRange}
                changeTimeVal={e => setDateRange(changeDate(e))}
                inputValue={inputValue}
                changeInputVal={value => setInputValue(value)}
                hanleDbClick={e => hanleClick('', e)}
                handleSearch={(pagination, filters) => handleSearch(pagination, filters)}
                printSheet={printSheet}
            />
            {showEditPop && (
                <div className={style.addSampleDialogWrap} >
                    <div className={style.addSampleDialog}>
                        <div className={style.addSampleHeader}>
                            <span>DNA质控</span>
                            <img
                                src={require('@images/dialog_close.svg')}
                                alt=""
                                className={style.close}
                                onClick={e => setShowEditPop(false)}
                            />
                        </div>
                        <div className={style.center}>
                            <p>分子病例号：{rowMessage.molecule_pathnum}</p>
                            <p><span>标本来源：{rowMessage.test_names}</span><span>标本来源：{rowMessage.test_names}</span></p>
                            <p>申请项目：{rowMessage.test_names}</p>
                        </div>
                        <div className={style.addSampleContent}>
                            <div className={style.row}>
                                <Input
                                    lineFeed={false}
                                    label="核酸检验仪器："
                                    containerStyle={{ marginTop: '12px' }}
                                    labelStyle={labelStyle}
                                    inputStyle={{
                                        width: '240px',
                                        height: '30px',
                                    }}
                                    value={dnaInput.deviceName}
                                    onChange={e => 
                                        changeDnaInput('deviceName',e.target.value)
                                    }
                                />
                            </div>
                            <div className={style.row}>
                                <Input
                                    lineFeed={false}
                                    label="提取试剂名称："
                                    labelStyle={labelStyle}
                                    inputStyle={{
                                        width: '240px',
                                        height: '30px',
                                    }}
                                    value={dnaInput.reagent}
                                    onChange={e =>changeDnaInput('reagent',e.target.value)}
                                />
                            </div>
                            <div className={style.row}>
                                <Input
                                    lineFeed={false}
                                    label="试剂厂家："
                                    labelStyle={labelStyle}
                                    inputStyle={{
                                        width: '240px',
                                        height: '30px',
                                    }}
                                    value={dnaInput.reagentCompany}
                                    onChange={e =>changeDnaInput('reagentCompany',e.target.value)}
                                />
                            </div>
                            <div className={style.row}>
                                <Input
                                    lineFeed={false}
                                    label="核酸浓度（ng/ul）："
                                    labelStyle={labelStyle}
                                    inputStyle={{
                                        width: '240px',
                                        height: '30px',
                                    }}
                                    value={dnaInput.nucleicAcidConcentration}
                                    onChange={e =>changeDnaInput('nucleicAcidConcentration',e.target.value)}
                                />
                            </div>
                            <div className={style.row}>
                                <Input
                                    lineFeed={false}
                                    label="260/280："
                                    labelStyle={labelStyle}
                                    inputStyle={{
                                        width: '240px',
                                        height: '30px',
                                    }}
                                    value={dnaInput.rate}
                                    onChange={e =>changeDnaInput('rate',e.target.value)}
                                />
                            </div>
                            <div className={style.row}>
                                <span style={labelStyle}>质控是否合格：</span>
                                <div className={style.qualified}>
                                <Radio.Group onChange={e =>changeDnaInput('evaluation',e.target.value)} value={dnaInput.evaluation}>
                                    <Radio value={0} style={radioStyle}>合格</Radio>
                                    <Radio value={1} style={radioStyle}>不合格</Radio>
                                </Radio.Group>
                                <Radio.Group onChange={e =>changeDnaInput('evaluation',e.target.value)} style={{display:'block',paddingLeft:'22px'}} value={dnaInput.evaluation}>
                                    <Radio value={0} style={radioStyle}>DNA浓度过低，建议重切</Radio>
                                    <Radio value={1} style={radioStyle}>DNA浓度过低，建议换标本</Radio>
                                    <Radio value={1} style={radioStyle}>DNA无法建库，建议重切</Radio>
                                    <Radio value={1} style={radioStyle}>DNA无法建库，建议换标本</Radio>
                                    <Radio value={1} style={radioStyle}>其他不合格原因</Radio>
                                </Radio.Group>
                                </div>
                            </div>
                            <div className={style.row}>
                                <TextArea
                                    lineFeed={false}
                                    labelStyle={labelStyle}
                                    disabled={true}
                                    textAreaStyle={{
                                        width: '188px',
                                        height: '39px',
                                        verticalAlign: 'top',
                                        marginBottom: '12px',
                                        marginTop: '-8px',
                                        marginLeft:'40px'
                                    }}
                                    value={remark}
                                    onChange={e => setRemark(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className={style.footer}>
                            <div className={style.addSamplebtnGroup}>
                                <span onClick={e => setShowEditPop(false)}>取消</span>
                                <span className={style.canAddSample} onClick={e => evaluat()}>
                                    确认
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {showLabPop && (
                <div className={style.addSampleDialogWrap} >
                    <div className={style.addSampleDialog}>
                        <div className={style.addSampleHeader}>
                            <span>实验室质控</span>
                            <img
                                src={require('@images/dialog_close.svg')}
                                alt=""
                                className={style.close}
                                onClick={e => setShowEditPop(false)}
                            />
                        </div>
                        <div className={style.center}>
                            <p>分子病例号：{rowMessage.molecule_pathnum}</p>
                            <p><span>标本来源：{rowMessage.test_names}</span><span>标本来源：{rowMessage.test_names}</span></p>
                            <p>申请项目：{rowMessage.test_names}</p>
                        </div>
                        <div className={style.addSampleContent}>
                            <div className={style.row}>
                                <Input
                                    lineFeed={false}
                                    disabled={true}
                                    label="核酸浓度（ng/ul）："
                                    labelStyle={labelStyle}
                                    inputStyle={{
                                        width: '240px',
                                        height: '30px',
                                    }}
                                    value={dnaInput.nucleicAcidConcentration}
                                    onChange={e =>changeDnaInput('nucleicAcidConcentration',e.target.value)}
                                />
                            </div>
                            <div className={style.row}>
                                <Input
                                    lineFeed={false}
                                    disabled={true}
                                    label="260/280："
                                    labelStyle={labelStyle}
                                    inputStyle={{
                                        width: '240px',
                                        height: '30px',
                                    }}
                                    value={dnaInput.rate}
                                    onChange={e =>changeDnaInput('rate',e.target.value)}
                                />
                            </div>
                            <div className={style.row}>
                                <Input
                                    lineFeed={false}
                                    label="提取试剂名称："
                                    labelStyle={labelStyle}
                                    inputStyle={{
                                        width: '240px',
                                        height: '30px',
                                    }}
                                    value={labInput.reagent}
                                    onChange={e =>changeLabInput('reagent',e.target.value)}
                                />
                            </div>
                            <div className={style.row}>
                                <Input
                                    lineFeed={false}
                                    label="试剂厂家："
                                    labelStyle={labelStyle}
                                    inputStyle={{
                                        width: '240px',
                                        height: '30px',
                                    }}
                                    value={labInput.reagentCompany}
                                    onChange={e =>changeLabInput('reagentCompany',e.target.value)}
                                />
                            </div>
                            <div className={style.row}>
                                <Input
                                    lineFeed={false}
                                    label="稀释DNA原液+ddH2O体积："
                                    labelStyle={labelStyle}
                                    inputStyle={{
                                        width: '240px',
                                        height: '30px',
                                    }}
                                    value={labInput.volume}
                                    onChange={e =>changeLabInput('volume',e.target.value)}
                                />
                            </div>
                            <div className={style.row}>
                                <Input
                                    lineFeed={false}
                                    label="上样浓度（ng/ul）："
                                    labelStyle={labelStyle}
                                    inputStyle={{
                                        width: '240px',
                                        height: '30px',
                                    }}
                                    value={labInput.sampleConcentration}
                                    onChange={e =>changeLabInput('sampleConcentration',e.target.value)}
                                />
                            </div>
                            <div className={style.row}>
                                <span style={labelStyle}>质控是否合格：</span>
                                <div className={style.qualified}>
                                <Radio.Group onChange={e =>changeLabInput('evaluation',e.target.value)} value={dnaInput.evaluation}>
                                    <Radio value={0} style={radioStyle}>合格</Radio>
                                    <Radio value={1} style={radioStyle}>不合格</Radio>
                                </Radio.Group>
                                <Radio.Group onChange={e =>changeLabInput('evaluation',e.target.value)} style={{display:'block',paddingLeft:'22px'}} value={dnaInput.evaluation}>
                                    <Radio value={0} style={radioStyle}>DNA浓度过低，建议重切</Radio>
                                    <Radio value={1} style={radioStyle}>DNA浓度过低，建议换标本</Radio>
                                    <Radio value={1} style={radioStyle}>DNA无法建库，建议重切</Radio>
                                    <Radio value={1} style={radioStyle}>DNA无法建库，建议换标本</Radio>
                                    <Radio value={1} style={radioStyle}>其他不合格原因</Radio>
                                </Radio.Group>
                                </div>
                            </div>
                            <div className={style.row}>
                                <TextArea
                                    lineFeed={false}
                                    labelStyle={labelStyle}
                                    disabled={true}
                                    textAreaStyle={{
                                        width: '188px',
                                        height: '39px',
                                        verticalAlign: 'top',
                                        marginBottom: '12px',
                                        marginTop: '-8px',
                                        marginLeft:'40px'
                                    }}
                                    value={remark}
                                    onChange={e => setRemark(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className={style.footer}>
                            <div className={style.addSamplebtnGroup}>
                                <span onClick={e => setShowEditPop(false)}>取消</span>
                                <span className={style.canAddSample} onClick={e => evaluat()}>
                                    确认
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
