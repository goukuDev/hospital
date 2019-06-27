import React from 'react';
import style from './index.css';
import Table from 'table';

const texts = require('./lan/zh.js');

export default function Index(props) {
    const columns = [
        {
            title: '医嘱类别',
            dataIndex: 'tech_order_type',
            render: value => texts.type[value],
        },
        {
            title: '申请医生',
            dataIndex: 'pre_doc',
        },

        {
            title: '医嘱状态',
            dataIndex: 'status',
            render: value => (
                <React.Fragment>
                    <span
                        className={style.dot}
                        style={{
                            background: { 1: '#F4BB00', 2: '#6FC831' }[value],
                        }}
                    />
                    {texts.status[value]}
                </React.Fragment>
            ),
        },
        {
            title: '申请时间',
            dataIndex: 'apply_time',
        },
        {
            title: '备注',
            dataIndex: 'comment',
        },
    ];
    return (
        <div className={style.info}>
            <div className={style.title}><div className={style.bg}>技术医嘱（{props.adviceList.length}）</div></div>
            <div className={style.list}>
                <Table columns={columns} data={props.adviceList} showBorder={false} rowKey={'tech_order_id'} />
            </div>
        </div>
    );
}
