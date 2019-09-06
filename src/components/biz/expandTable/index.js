import React, { useRef } from 'react';
import style from './index.css';
import Table from 'table';
import Input from 'input';
import Message from 'message';
import { DatePicker } from 'antd';
const { RangePicker } = DatePicker;


export default function Index(props) {
    const tableRef = useRef();
    const {
        columns,
        changeApplyStatus,
        waxId,
        checkList,
        word,
        saveFilter,
        changeTimeVal,
        changeInputVal,
        inputValue,
        handleSearch,
        filter,
        searchList,
        printCode,
        total,
        unfinishedLength,
        hanleDbClick,
        printSheet,
    } = props;

    const handleKeyDown = async (e) => {
        if (e.keyCode === 13) {
            await handleSearch({}, filter);
            tableRef.current.jumpToFirstPage();
        }
    };

    const clickHandler = record => {
        if (waxId.includes(record[word.rowkey])) {
            checkList(waxId.filter(id => id !== record[word.rowkey]));
        } else {
            if (!record.disabled) checkList(waxId.concat([record[word.rowkey]]));
        }
    };

    return (
        <div className={style.container} onKeyDown={handleKeyDown}>
            <div className={style.applyTblWrap}>
                <div className={style.titleWrap}>
                    <span
                        className={style.title}
                        style={{
                            background: `url(${require('@images/list.svg')}) no-repeat 0 center`,
                        }}
                    >
                        {word.name}
                    </span>
                    <div className={style.search}>
                    {word.timeText&&(<span className={style.timeRangeLabel}>{word.timeText}</span>)}
                        {word.time !=='noTime'&&(<RangePicker onChange={dateRange => changeTimeVal(dateRange)} />)}
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
                            onClick={async (e) => {
                                await handleSearch({}, filter);
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
                    total={total}
                    selectedRowKeys={waxId}
                    rowSelection={{
                        selectedRowKeys: waxId,
                        onSelect: record => clickHandler(record),
                        onSelectAll: (selected, selectedRows) => checkList(selectedRows.map(o => o[word.rowkey])),
                    }}
                    indentSize={12}
                    scroll={{ x: word.scrollX, y: word.scrollY }}
                    onRow={record => {
                        return {
                            onClick: event => {
                                clickHandler(record);
                            },
                            onDoubleClick: e => {
                                if (word.name === 'HE切片评价列表' || word.name === 'DNA质控列表') {
                                    hanleDbClick(record);
                                }
                            },
                        };
                    }}
                    renderStatisticalBar={e => {
                        return total &&
                            (word.name === 'HE切片评价列表' || word.name === 'DNA质控列表' || word.tab === 'ihc') ? (
                            <div className={style.statistics}>
                                <div className={style.count}>
                                    {word.total}
                                    <i>{total}</i>
                                    {word.unaccomplished}
                                    <i>{unfinishedLength}</i>
                                    已勾选
                                    <span>{waxId.length}</span>
                                </div>
                                {props.btnGroup ? <props.btnGroup /> : null}
                            </div>
                        ) : (
                            ''
                        );
                    }}
                    onChange={(pagination, filters) => {
                        saveFilter(filters);
                        handleSearch(pagination, filters);
                    }}
                />
            </div>

            {total > 0 && (
                <div className={style.buttons}>
                    {word.printTab && <span onClick={printCode}>{word.printTab}</span>}
                    {word.cancleText && (
                        <span
                           
                            onClick={
                                !waxId.length
                                ? e =>Message.error('未勾选切切片')
                                : e =>changeApplyStatus('cancle')
                            }
                        >
                            {word.cancleText}
                        </span>
                    )}
                    {word.printSheet && <span onClick={printSheet}>{word.printSheet}</span>}
                    {word.finishText && (
                        <span
                          
                            onClick={
                                !waxId.length
                                    ? e =>Message.error('未勾选切切片')
                                    : e => changeApplyStatus()
                            }
                        >
                            {word.finishText}
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}
