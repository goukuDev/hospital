import React from 'react';
import style from './index.css';
import Panel from 'panel';
import Input from 'input';
import Select from 'select';
import TextArea from 'textarea';
import DatePicker from 'datepicker';
import Moment from 'moment';
import deep from 'deep';
import { isNotNull } from 'utils';

export default function ApplyInfo(props) {
    const { applyMessage } = props;

    const handleChange = (key, value) => {
        const applyMessageCopy = deep.clone(applyMessage);
        applyMessageCopy[key] = isNotNull(value) ? value : null;
        props.updateState(applyMessageCopy);
    };

    const fmtDate = date => (date ? Moment(date) : null);

    const containerStyle = {
        width: '100%'
    };

    const createInput = (label, key) => (
        <Input
            label={label}
            value={applyMessage[key]}
            onChange={e => handleChange(key, e.target.value)}
            containerStyle={containerStyle}
            inputStyle={{ width: '100%' }}
        />
    );

    const createSelect = (label, key, options) => (
        <Select
            label={label}
            value={applyMessage[key]}
            options={options}
            onChange={value => handleChange(key, value)}
            containerStyle={containerStyle}
            selectStyle={{ width: '100%' }}
        />
    );

    const createDatePicker = (label, key, restProps) => (
        <DatePicker
            label={label}
            value={fmtDate(applyMessage[key])}
            onChange={(date, dateString) => handleChange(key, dateString)}
            containerStyle={containerStyle}
            datePickerStyle={{ width: '100%', minWidth: '120px' }}
            suffixIcon={<span />}
            {...restProps}
        />
    );

    const createTextArea = (label, key, containerStyle) => (
        <TextArea
            label={label}
            value={applyMessage[key]}
            onChange={e => handleChange(key, e.target.value)}
            containerStyle={Object.assign({}, containerStyle, {
                width: '100%'
            })}
            textAreaStyle={{
                width: '100%',
                height: '106px'
            }}
        />
    );

    return (
        <Panel
            icon={require('@images/apply.svg')}
            title='本次申请信息'
            className={style.applyPanel}
        >
            <div className={style.panelContentWrap}>
                {createInput('申请单号', 'his_apply_id')}
                {createDatePicker('登记时间', 'checkin_time')}
                {createSelect('患者来源', 'source', [
                    { title: '住院', value: 0 },
                    { title: '门诊', value: 1 }
                ])}
                {createInput('送检单位', 'deliver_org')}
                {createInput('送检科室', 'deliver_did')}
                {createInput('送检医生', 'deliver_doc')}
                {createInput('取样部位', 'sampling_location')}
                {createInput('门诊号', 'outpatient_num')}
                {createInput('住院号', 'admission_num')}
                {createInput('病区', 'district')}
                {createInput('床号', 'bed_num')}
                {createInput('手术室电话', 'operating_room_tele')}
                {createInput('手术名称', 'surgery_name')}
                {createDatePicker('标本采集时间', 'sampling_time')}
                {createDatePicker('送检日期', 'deliver_date', {
                    format: 'YYYY-MM-DD',
                    showTime: false
                })}
                {createInput('月经史', 'menstrual_history')}
                {createInput('生育史', 'childbearing_history')}
                {createInput('外院病理号', 'outercourt_pathnum')}
                {createTextArea('临床病史', 'clinical_history', {
                    gridColumn: '1 / 3'
                })}
                {createTextArea('临床诊断', 'clinical_diagnosis', {
                    gridColumn: '3 / 5'
                })}
                {createTextArea('外院病理诊断', 'outercourt_pathdiag', {
                    gridColumn: '5 / 7'
                })}
            </div>
        </Panel>
    );
}
