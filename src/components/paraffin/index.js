import React from 'react';
import style from './index.css';
import Input from 'input';
import Select from 'select';
import Table from 'table';

const texts = require('./lan/zh.js');
export default function Index(props) {
    const getColumns = () => {
        let total = 0;
        props.wax.waxList.forEach(o => {
            total += Number(o.quantity);
        });
        return [
            {
                title: '任务来源',
                dataIndex: 'source',
                render: value => texts.source[value],
            },
            {
                title: '标本类型',
                dataIndex: 'sample_type',
                render: value => texts.sampleType[value],
            },
            {
                title: '序号',
                dataIndex: 'index',
                render: (text, record, index) => index + 1,
            },
            {
                title: '蜡块号',
                dataIndex: 'paraffin_num',
                count: props.wax.waxList.length,
            },
            {
                title: '组织名称',
                dataIndex: 'name',
            },
            {
                title: '材块数',
                dataIndex: 'quantity',
                count: total,
            },
            {
                title: '取材时间',
                dataIndex: 'receive_time',
            },
            {
                title: '取材医生',
                dataIndex: 'doctor',
            },
            {
                title: '记录员',
                dataIndex: 'recorder',
            },
            {
                title: '备注',
                dataIndex: 'remark',
            },
            {
                title: '操作',
                dataIndex: 'option',
                render: (text, record, index) => (
                    <React.Fragment>
                        <span
                            className={`${style.deleteBtn} ${
                                record.editable === 0 || !props.editable ? style.disable : ''
                            }`}
                            onClick={
                                record.editable === 0 || !props.editable
                                    ? e => e
                                    : e => props.deleteWax(index, record.paraffin_id)
                            }
                        >
                            删除
                        </span>
                    </React.Fragment>
                ),
            },
        ].map(column => {
            column.width = 100;
            return column;
        });
    };
    const { wax, handleSeenChange, add, changeCurList, curList, editable, multiClick, save, finish } = props;
    return (
        <div className={style.meta}>
            <div className={style.seen}>
                <h2>
                    肉眼所见 <span className={style.photo}>拍照</span> <span className={style.voice}>语音输入</span>
                </h2>
                <textarea placeholder="文字描述" value={wax.seen || ''} onChange={e => handleSeenChange(e, 'seen')} />
            </div>
            <div className={style.bottom}>
                <div className={style.list}>
                    <h3>蜡块列表</h3>
                    <div className={style.add}>
                        <Input
                            required
                            lineFeed={false}
                            label="组织名称:"
                            inputStyle={{ width: '168px', marginLeft: '4px' }}
                            value={curList ? curList.name : ''}
                            onChange={e => changeCurList(e, 'name')}
                        />
                        <Input
                            required
                            lineFeed={false}
                            label="材块数:"
                            inputStyle={{ width: '64px', appearance: 'textfield', marginLeft: '4px' }}
                            value={curList ? curList.quantity : ''}
                            validate={value => {
                                value = value.replace(/^(0+)|[^\d]/g, '');
                                return value;
                            }}
                            onChange={e => changeCurList(e, 'quantity')}
                        />
                        <Select
                            label="任务来源:"
                            lineFeed={false}
                            selectStyle={{ width: '124px', marginLeft: '4px' }}
                            options={[
                                { title: '正常', value: 0 },
                                { title: '冰冻', value: 1 },
                                { title: '补取', value: 2 },
                            ]}
                            value={curList ? curList.source || '正常' : ''}
                            onChange={e => changeCurList(e, 'source')}
                        />
                        <Select
                            label="标本类型:"
                            lineFeed={false}
                            selectStyle={{ width: '104px', marginLeft: '4px' }}
                            options={[
                                { title: '请选择', value: '' },
                                { title: '大标本', value: 0 },
                                { title: '小标本', value: 1 },
                            ]}
                            value={curList ? curList.sample_type : null}
                            onChange={e => changeCurList(e, 'sample_type')}
                        />
                        <Select
                            label="取材医生:"
                            lineFeed={false}
                            selectStyle={{ width: '104px', marginLeft: '4px' }}
                            options={[
                                { title: 'A', value: 'A' },
                                { title: 'B', value: 'B' },
                                { title: 'C', value: 'C' },
                            ]}
                            value={curList ? curList.doctor : ''}
                            onChange={e => changeCurList(e, 'doctor')}
                        />
                        <Input
                            lineFeed={false}
                            label="备注:"
                            inputStyle={{ width: '168px', marginLeft: '4px' }}
                            value={curList ? curList.remark : ''}
                            onChange={e => changeCurList(e, 'remark')}
                        />
                        <button
                            className={
                                !curList || !curList.quantity || curList.name.trim().length === 0 || !editable
                                    ? style.disable
                                    : null
                            }
                            disabled={
                                !curList ||
                                !curList.quantity ||
                                curList.name.trim().length === 0 ||
                                !editable ||
                                !multiClick
                                    ? true
                                    : false
                            }
                            onClick={e => {
                                add(curList);
                            }}
                        >
                            新增
                        </button>
                    </div>
                </div>
                <Table columns={getColumns()} data={wax.waxList} rowKey={'paraffin_num'} scroll={{ y: 750 }} />
                <div className={style.box}>
                    <Input lineFeed={false} label="包埋盒：" inputStyle={{ width: '38px', marginRight: '5px' }} />
                    ~
                    <Input lineFeed={false} inputStyle={{ width: '38px', marginLeft: '5px' }} />
                    <button className={!editable ? style.disable : null} disabled={!editable}>
                        打印包埋盒
                    </button>
                    <Select
                        label="标本处理记录"
                        lineFeed={false}
                        selectStyle={{ width: '124px', marginLeft: '6px' }}
                        options={[
                            { title: '常规保留', value: 0 },
                            { title: '已取完', value: 1 },
                            { title: '永久保留', value: 2 },
                            { title: '教学标本', value: 3 },
                            { title: '科研标本', value: 4 },
                        ]}
                        value={wax.record || 0}
                        onChange={e => handleSeenChange(e, 'record')}
                    />
                </div>
            </div>

            <div className={style.bottons}>
                <button
                    className={style.fr + ' ' + (editable && wax.waxList.length ? '' : style.disable)}
                    onClick={e => save(finish, 1)}
                    disabled={!editable || !wax.waxList.length}
                >
                    完成取材
                </button>
                <button
                    className={style.fr + ' ' + (editable ? '' : style.disable)}
                    onClick={e => save(null, 0)}
                    disabled={!editable}
                >
                    保存
                </button>
                <button
                    className={style.fr + ' ' + style.w105 + ' ' + (editable ? '' : style.disable)}
                    disabled={!editable}
                >
                    打印取材记录
                </button>
                <button
                    className={style.fr + ' ' + style.w105 + ' ' + (editable ? '' : style.disable)}
                    disabled={!editable}
                >
                    打印冰冻标签
                </button>
            </div>
        </div>
    );
}
