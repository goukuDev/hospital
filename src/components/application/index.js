import React, { Component } from 'react';
import style from './index.css';
import Input from 'input';
import TextArea from 'textarea';
import Table from 'table';

const texts = require('./lan/zh.js');

export default class Index extends Component {
    columns = [
        {
            title: '标本号',
            dataIndex: 'sample_id',
        },
        {
            title: '标本类型',
            dataIndex: 'sample_type',
            render: value => texts.sampleType[value],
        },
        {
            title: '采集部位',
            dataIndex: 'sampling_location',
        },
        {
            title: '标本名称',
            dataIndex: 'sample_name',
        },
        {
            title: '离体时间',
            dataIndex: 'separate_time',
        },
        {
            title: '接收时间',
            dataIndex: 'receive_time',
        },
        {
            title: '接收员',
            dataIndex: 'receiver',
        },
        {
            title: '申请类别',
            dataIndex: 'apply_type',
            render: value => texts.applyType[value],
        },
        {
            title: '病理号',
            dataIndex: 'pathnum',
        },
        {
            title: '标本状态',
            dataIndex: 'status',
            render: value => (
                <React.Fragment>
                    <span
                        className={style.dot}
                        style={{
                            background: { 0: '#4DAFDB', 1: '#F2B324' }[value],
                        }}
                    />
                    {texts.sampleStatus[value]}
                </React.Fragment>
            ),
        },
        {
            title: '标签状态',
            dataIndex: 'tag_printed',
            render: value => texts.tagPrinted[value],
        },
        {
            title: '申请单状态',
            dataIndex: 'app_printed',
            render: value => texts.appPrinted[value],
        },
    ];
    leftStyle = {
        containerStyle: {
            width: '50%',
            marginTop: '6px',
            paddingLeft: '17px',
        },
        inputStyle: {
            color: '#79858F',
        },
    };
    leftStyleDouble = {
        containerStyle: {
            width: '100%',
            marginTop: '6px',
            paddingLeft: '17px',
        },
        inputStyle: {
            color: '#79858F',
        },
    };
    rightStyle = {
        containerStyle: {
            width: '16.666666667%',
            marginTop: '6px',
            paddingLeft: '17px',
        },
        inputStyle: {
            color: '#79858F',
        },
    };

    textStyle = {
        containerStyle: {
            width: '33.333333333%',
            marginTop: '6px',
            paddingLeft: '17px',
        },
        textAreaStyle: { width: '100%', height: '104px', color: '#79858F' },
    };
    render() {
        const { applyMessage, basicMessage, sample_info } = this.props.appli;
        return (
            <div className={style.container}>
                <div className={style.inputs}>
                    <div className={style.left}>
                        <Input label="患者识别号" {...this.leftStyleDouble} readOnly value={basicMessage.identify_id} />
                        <Input label="姓名" {...this.leftStyle} readOnly value={basicMessage.name} />
                        <Input label="性别" {...this.leftStyle} readOnly value={texts.gender[basicMessage.gender]} />
                        <Input label="年龄" {...this.leftStyle} readOnly value={basicMessage.age} />
                        <Input label="联系人手机" {...this.leftStyle} readOnly value={basicMessage.contact_phone} />
                        <Input label="联系人" {...this.leftStyle} readOnly value={basicMessage.contact} />
                        <Input label="联系人关系" {...this.leftStyle} readOnly value={basicMessage.relationship} />
                        <Input label="地址" {...this.leftStyleDouble} readOnly value={basicMessage.address} />
                    </div>
                    <div className={style.right}>
                        <Input label="申请单号" {...this.rightStyle} readOnly value={applyMessage.his_apply_id} />
                        <Input label="登记时间" {...this.rightStyle} readOnly value={applyMessage.checkin_time} />
                        <Input
                            label="患者来源"
                            {...this.rightStyle}
                            readOnly
                            value={texts.source[applyMessage.source]}
                        />
                        <Input label="送检单位" {...this.rightStyle} readOnly value={applyMessage.deliver_org} />
                        <Input label="送检科室" {...this.rightStyle} readOnly value={applyMessage.deliver_did} />
                        <Input label="送检医生" {...this.rightStyle} readOnly value={applyMessage.deliver_doc} />
                        <Input label="取样部位" {...this.rightStyle} readOnly value={applyMessage.sampling_location} />
                        <Input label="门诊号" {...this.rightStyle} readOnly value={applyMessage.outpatient_num} />
                        <Input label="住院号" {...this.rightStyle} readOnly value={applyMessage.admission_num} />
                        <Input label="病区" {...this.rightStyle} readOnly value={applyMessage.district} />
                        <Input label="床号" {...this.rightStyle} readOnly value={applyMessage.bed_num} />
                        <Input
                            label="手术室电话"
                            {...this.rightStyle}
                            readOnly
                            value={applyMessage.operating_room_tele}
                        />
                        <Input label="手术名称" {...this.rightStyle} readOnly value={applyMessage.surgery_name} />
                        <Input label="标本采集时间" {...this.rightStyle} readOnly value={applyMessage.sampling_time} />
                        <Input label="送检日期" {...this.rightStyle} readOnly value={applyMessage.deliver_date} />
                        <Input label="月经史" {...this.rightStyle} readOnly value={applyMessage.menstrual_history} />
                        <Input label="生育史" {...this.rightStyle} readOnly value={applyMessage.childbearing_history} />
                        <Input
                            label="外院病理号"
                            {...this.rightStyle}
                            readOnly
                            value={applyMessage.outercourt_pathnum}
                        />
                        <TextArea label="临床病史" {...this.textStyle} readOnly value={applyMessage.clinical_history} />
                        <TextArea
                            label="临床诊断"
                            {...this.textStyle}
                            readOnly
                            value={applyMessage.clinical_diagnosis}
                        />
                        <TextArea
                            label="外院病理诊断"
                            {...this.textStyle}
                            readOnly
                            value={applyMessage.outercourt_pathdiag}
                        />
                    </div>
                </div>
                <div className={style.sample}>
                    <div className={style.title}>手术所见</div>
                    <div className={style.seen}>{applyMessage.surgery_message}</div>
                </div>
                <div className={style.bottom}>
                    <div className={style.list}>
                        <h3>标本列表</h3>
                    </div>
                    <Table columns={this.columns} data={sample_info} rowKey={'sample_id'} />
                </div>
            </div>
        );
    }
}
