import React, { useRef } from 'react';
import style from './index.css';
import Table from 'table';
import Input from 'input';
import { DatePicker } from 'antd';
import { findRecord } from 'utils';
const { RangePicker } = DatePicker;

export default function Index(props) {
    const tableRef = useRef();
    const {
        columns,
        finish,
        waxId,
        checkList,
        word,
        saveFilter,
        filter,
        changeTimeVal,
        changeInputVal,
        inputValue,
        expandedRowKeys,
        setExpandedRowKeys,
        handleSearch,
        searchList,
        printCode
    } = props;

    const handleKeyDown = e => {
        if (e.keyCode === 13) {
            handleSearch(filter);
            tableRef.current.jumpToFirstPage();
        }
    };
    const clickHandler = record => {
        if (record.children) {
            if (waxId.includes(record[word.rowkey])) {
                checkList(
                    waxId.filter(applyId => applyId !== record[word.rowkey])
                );
            } else {
                checkList(
                    [...new Set(waxId.concat([record[word.rowkey]]))]
                );
            }
        } 
    };
   
    return (
        <div className={style.container} onKeyDown={handleKeyDown}>
            <div className={style.applyTblWrap}>
                <div className={style.titleWrap}>
                    <span
                        className={style.title}
                        style={{
                            background: `url(${require('@images/list.svg')}) no-repeat 0 center`
                        }}
                    >
                        {word.name}
                    </span>
                    <div className={style.search}>
                        <span className={style.timeRangeLabel}>
                            {word.timeText}
                        </span>
                        <RangePicker
                            onChange={dateRange => changeTimeVal(dateRange)}
                        />
                        {word.inputText && (
                            <Input
                                label={word.inputText}
                                lineFeed={false}
                                inputStyle={{ width: '188px', height: '34px' }}
                                containerStyle={{ marginLeft: '18px' }}
                                value={inputValue}
                                onChange={e => changeInputVal(e.target.value)}
                            />
                        )}
                        <span
                            className={style.hunt}
                            onClick={e => {
                                checkList([]);
                                handleSearch(filter);
                                tableRef.current.jumpToFirstPage();
                            }}
                        >
                            查询
                        </span>
                    </div>
                </div>
                <Table
                    ref={tableRef}
                    columns={columns}
                    data={searchList}
                    rowKey={word.rowkey}
                    showPagination
                    selectedRowKeys={waxId}
                    rowSelection={{
                        selectedRowKeys: waxId,
                        onSelect: record => clickHandler(record),
                        onSelectAll: (selected, selectedRows) =>
                            checkList(selectedRows.map(o => o[word.rowkey]))
                    }}
                    expandedRowKeys={expandedRowKeys}
                    onExpand={(expanded, record) => {
                        if (expanded) {
                            setExpandedRowKeys(
                                [...expandedRowKeys].concat([record[word.rowkey]])
                            );
                        } else {
                            setExpandedRowKeys([
                                ...expandedRowKeys.filter(
                                    id => id !== record[word.rowkey]
                                )
                            ]);
                        }
                    }}
                    indentSize={12}
                    scroll={{ x: word.scrollX, y: word.scrollY }}
                    onRow={record => {
                        return {
                            onClick: event => {
                                clickHandler(record);
                            }
                        };
                    }}
                    renderStatisticalBar={e => {
                        return searchList.length ? (
                            <div className={style.statistics}>
                                <div className={style.count}>
                                    {word.total}
                                    <i>{searchList.length}</i>
                                    {word.unaccomplished}
                                    <span>{searchList.filter(o => o[word.status]===0).length}</span>
                                    已勾选
                                    <span>{searchList.filter(o => waxId.includes(o[word.rowkey])).length}</span>
                                </div>
                                {props.btnGroup ? <props.btnGroup /> : null}
                            </div>
                        ) : (
                            ''
                        );
                    }}
                    onChange={(pagination, filters) => {
                        saveFilter(filters);
                        handleSearch(filters);
                    }}
                />
            </div>

            {searchList.length > 0 && (
                <div className={style.buttons}>
                    {word.printTab && (
                        <span onClick={printCode}>
                            {word.printTab}
                        </span>
                    )}
                    {word.printSheet && (
                        <span>
                            {word.printSheet}
                        </span>
                    )}
                    <span
                        className={
                            !waxId.length || waxId.filter(id=>
                                findRecord(searchList, id, word.rowkey) ? findRecord(searchList, id, word.rowkey)[word.status]:true
                            ).length ? 
                            style.disabled:
                            '' }
                        onClick={
                            !waxId.length || waxId.filter(id=>
                                findRecord(searchList, id, word.rowkey) ? findRecord(searchList, id, word.rowkey)[word.status]:true
                            ).length ? 
                            e => e : 
                            e => finish() 
                        }
                    >
                        {word.finishText}
                    </span>
                </div>
            )}
        </div>
    );
}
