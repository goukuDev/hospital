import React, { useRef } from 'react';
import style from './index.css';
import Table from 'table';
import Input from 'input';
import { DatePicker } from 'antd';

const { RangePicker } = DatePicker;

export default function Index(props) {
    const tableRef = useRef();

    const {
        columns,
        openDetail,
        finish,
        waxId,
        checkList,
        word,
        saveFilter,
        filter,
        changeTimeVal,
        changeInputVal,
        inputValue,
        handleSearch,
        searchList,
    } = props;

    const handleKeyDown = async (e) => {
        if (e.keyCode === 13) {
            await handleSearch(filter);
            tableRef.current.jumpToFirstPage();
        }
    };
    return (
        <div className={style.container} onKeyDown={handleKeyDown}>
            <div className={style.applyTblWrap}>
                <div className={`${ style.titleWrap} ${word.noTableWrap ? style.borderTitle:''}`}>
                    <span
                        className={style.title}
                        style={
                            word.noTableWrap ? 
                            {background: `url(${require('@images/list.svg')}) no-repeat 16px center`,
                            paddingLeft: '44px'}:
                            {background: `url(${require('@images/list.svg')}) no-repeat 14px center`,
                                paddingLeft: '42px'}
                        }  
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
                        <Input
                            label={word.inputText}
                            lineFeed={false}
                            inputStyle={{ width: '188px', height: '34px' }}
                            containerStyle={{ marginLeft: '18px' }}
                            value={inputValue}
                            onChange={e => changeInputVal(e.target.value)}
                        />
                        <span
                            className={style.hunt}
                            onClick={async (e) => {
                                checkList([]);
                                await handleSearch(filter);
                                tableRef.current.jumpToFirstPage();
                            }}
                        >
                            查询
                        </span>
                    </div>
                </div>
                <div className={word.noTableWrap ? '':style.tableWrap}>
                    <Table
                        ref={tableRef}
                        columns={columns}
                        data={searchList}
                        rowKey={word.rowkey}
                        showPagination
                        selectedRowKeys={waxId}
                        onSelectChange={ waxId => checkList(waxId)}
                        scroll={{ x: word.scrollX, y: word.scrollY }}
                        onRow={record => {
                            return {
                                onClick: event => {
                                    if (waxId.includes(record[word.rowkey])) {
                                        checkList(
                                            waxId.filter(
                                                id => id !== record[word.rowkey]
                                            )
                                        );
                                    } else {
                                        if (!record.disabled)
                                            checkList(
                                                waxId.concat([record[word.rowkey]])
                                            );
                                    }
                                },
                                onDoubleClick: e =>{
                                    
                                    if(word.name === '包埋列表') openDetail(e, record.pathnum)
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
                                        <i>
                                            {
                                                searchList.filter(
                                                    o => o[word.status] === 0
                                                ).length
                                            }
                                        </i>
                                        
                                        已勾选
                                        <span>
                                            {
                                                searchList.filter(item =>
                                                    waxId.includes(
                                                        item[word.rowkey]
                                                    )
                                                ).length
                                            }
                                        </span>
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
            </div>

            <div className={style.buttons}>
                {word.printTab&&<span>{word.printTab}</span>}
                { word.printSheet && <span>{word.printSheet}</span>}
                { finish &&<span
                    className={waxId.length ? '' : style.disabled}
                    onClick={finish}
                >
                    {word.finishText}
                </span>
                }
            </div>
        </div>
    );
}
