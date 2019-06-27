import React, {useState,} from 'react';
import style from './index.css';
import Table from 'table';
import Select from 'select';
import Input from 'input';

export default function Index() {

    const columns = [
        {
            title: '姓名',
            dataIndex: 'name',
            width: 130
        },
        {
            title: '收费状态',
            dataIndex: 'name1',
            width: 130
        },
        {
            title: '性别',
            dataIndex: 'gender',
            width: 120,
            render:text=>({
                0: '女',
                1: '男',
                2: '其他'}[text])
        },
        {
            title: '年龄',
            dataIndex: 'age',
            width: 120,
        },
        {
            title: '临床诊断',
            dataIndex: 'clinical_diagnosis',
        },
        {
            title: '送检部位',
            dataIndex: 'deliver_location',
            width: 130
        },
        {
            title: '登记日期',
            dataIndex: 'register_time',
            width: 130
        },
        {
            title: '原病理号',
            dataIndex: 'pathnum',
            width: 130
        },
        {
            title: '住院号',
            dataIndex: 'admission_num',
            width: 130
        },
        {
            title: '门诊号',
            dataIndex: 'outpatient_num',
            width: 130
        },
        {
            title: '送检医院',
            dataIndex: 'deliver_org',
            width: 130
        },
        {
            title: '送检科室',
            dataIndex: 'department',
            width: 130
        },
        {
            title: '状态',
            dataIndex: 'status',
            width: 120,
            render: text => (
                <React.Fragment>
                    <i className={style.state} style={{backgroundColor: {1: '#0B94FC', 2: '#6FC831'}[text]}} />
                    {
                        {
                            0:'已保存',
                            1:'已登记',
                            2:'已接受',
                        }[text]
                    }
                </React.Fragment>
            )
        },
        {
            title: '操作',
            dataIndex: 'action',
            width: 140,
            fixed:'right',
            render:(text,record) => (
                <React.Fragment>
                    <button className={style['btn-table']} style={{background:'#6FC831'}}>
                        新建
                    </button>
                    <button className={style['btn-table']}>
                        修改
                    </button>
                </React.Fragment>
            )
        },
    ]


    const data = [
        {
            apply_id: 1,
            name: "李芳",
            gender: 0,
            age: 64,
            clinical_diagnosis: "左乳腺癌",
            deliver_location: "左乳",
            register_time: "2018-2-22",
            admission_num: "xxxx",
            outpatient_num: "xxxx",
            deliver_org: "瑞金医院",
            department: "乳腺科",
            status: 1
        } 
    ]

    const [searchKey , setSearchKey] = useState('admission_num');
    const [searchWords , setSearchWords] = useState('');

    const filterList = (arr = data, key = searchKey , words = searchWords) => {
        return data.filter(o => o[key].includes(words))
    };



    return (
        <div className={style.outer}>
            <div className={style.header}>
                <button className={style.checkBtn}>登记/接收</button>
                <div className={style.box}>
                    <Select
                        lineFeed={false}
                        options={[
                            {title:'住院号',value:'addmissionNum'},
                            {title:'原病理号',value:'pathnum'}
                        ]}
                        value={searchKey}
                        onChange={value=>setSearchKey(value)}
                        style={{width:'122px'}}
                    ></Select>
                    <Input
                        lineFeed={false}
                        style={{width:'190px',margin:'0 10px'}}
                        onChange={e=>setSearchWords(e.target.value)}
                    ></Input>
                    <button className={style.searchBtn}>搜索</button>
                </div>
            </div>
            <Table
                columns={columns}
                data={filterList()}
                rowKey={'apply_id'}
                style={{height: 'calc(100% - 75px)', overflowY: 'auto'}}
                scroll={{ x: 1800, y: 215 }}
            ></Table>
        </div>
    );
}
