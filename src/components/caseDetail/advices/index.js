import React, { useState, useEffect, useCallback } from 'react';
import style from './index.css';
import Table from 'table';
import { api } from 'utils';
import { CODE } from 'myConstants';

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

    const [caseList, setCaseList] = useState([]);

    const list = useCallback(() => {
        api(`order/get_tech_orders_detail`, {
            filter: JSON.stringify([1, 2]),
            pathnum: props.pathnum,
        }).then(({ code, data }) => {
            if (CODE.SUCCESS === code) {
                setCaseList(data);
            }
        });
    }, [props.pathnum]);

    useEffect(() => {
        list();
    }, [list]);

    return (
        <div className={style.info}>
            <div className={style.title}>技术医嘱</div>
            {caseList.length > 0 && (
                <div className={style.list}>
                    <Table columns={columns} data={caseList} rowKey={'tech_order_id'} />
                </div>
            )}
        </div>
    );
}
