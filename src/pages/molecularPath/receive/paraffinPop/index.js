import AddPop from 'addPop';
import { DatePicker } from 'antd';
import React, { useState } from 'react';
import Select from 'select';
import styled from 'styled-components';

import style from './index.css';

const { RangePicker } = DatePicker;

const Container = styled.div`
    width: 100%;
    height: 100%;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 100;
    background: rgba(0, 0, 0, 0.5);
`;

var ipcRenderer = window.electron  && window.electron.ipcRenderer;
var remote = window.electron && window.electron.remote;

export default function Index(props) {

    const { onClose } = props;

    const [source, setSource] = useState(0);
    const [dateRange,setDateRange] = useState([]);

    const handleClose = () => {
        onClose();
    };
    const handleRange = (range,dateArr) => {
        setDateRange(dateArr);
    }
    const handleConfirm = () => {
        if(!remote && !ipcRenderer)return;
        let sampleFlag = remote.getGlobal('sharedObject').printMoleculeSampleStatus;
        if(sampleFlag)return;


        const result = {
            apply_start_time: dateRange[0],
            apply_end_time: dateRange[1],
            sample_source: !source? [source]:[1,2],
        
        };

        remote.getGlobal('sharedObject').moleculeSample = result;

        const params = {
            message_type: 'moleculeSamplePre',
            content: 'template/molecular/paraffin.html'
        };

        ipcRenderer.send('print', params);

        handleClose();
    };

    const lineStyle = {
        marginBottom:'10px',
    }
    const labelStyle = {
        color:'#525F7F',
        fontSize:'15px',
        display:'inline-block',
        width:'160px',
        textAlign:'right'
    }

    return (
        <Container>
            <AddPop
                title='蜡块使用记录表'
                confirmButtonText='打印'
                onClose={handleClose}
                onCancel={handleClose}
                onConfirm={handleConfirm}
                confirmButtonDisabled={!dateRange.length}
                popStyle={{width:'600px'}}
            >
                <div style={lineStyle}>
                    <Select
                        label='来源：'
                        labelStyle={labelStyle}
                        value={source}
                        options={[
                            { title: '本院', value: 0 },
                            { title: '外院及会诊', value: 1 }
                        ]}
                        onChange={value => setSource(value)}
                        containerStyle={{
                            marginTop:'25px'
                        }}
                        selectStyle={{ width: '350px',}}
                        lineFeed={false}
                    />
                </div>
                <div style={Object.assign({},lineStyle,{marginBottom:'90px'})}>
                    <span style={labelStyle}>申请日期：</span>
                    <RangePicker 
                        showTime={true} 
                        onChange={handleRange} 
                        className={style.range}
                        style={{width:'350px',height:'36px'}}
                    />
                </div>
            </AddPop>
        </Container>
    );
}
