import React, { forwardRef, useState, useEffect, useImperativeHandle } from 'react';
import { Table } from 'antd';
import style from './index.css';
import { useForceUpdate } from '@hooks';
import { debounce } from 'utils';

const { Column } = Table;

export default forwardRef((props, ref) => {
    const {
        columns = [],
        data = [],
        showPagination,
        selectedRowKeys,
        onSelectChange,
        renderStatisticalBar,
        scroll = {},
        ...otherProps
    } = props;

    const [pageNumber, setPageNumber] = useState(1);
    const forceUpdate = useForceUpdate();

    const pageSizeOptions = ['50', '100'];

    useEffect(() => {
        const handleWindowResize = debounce(forceUpdate, 100);

        window.addEventListener('resize', handleWindowResize);

        return () => window.removeEventListener('resize', handleWindowResize);
    }, [forceUpdate]);

    const getRowClassName = (record, index) => {
        return index % 2 === 1 ? style.darkRow : style.lightRow;
    };

    const onChange = selectedRowKeys => {
        props.onSelectChange(selectedRowKeys);
    };

    const getCheckboxProps = record => {
        return {
            disabled: record.disabled,
        };
    };

    const calcScroll = scroll => {
        if (scroll.y) {
            const y = +String(scroll.y).replace(/([^\d]|100)/g, '');
            return {
                scroll: Object.assign({}, scroll, {
                    y: `calc(100vh - ${window.innerWidth >= 1920 ? y : y + 15}px)`,
                }),
            };
        }
        return { scroll };
    };

    useImperativeHandle(ref, () => ({
        jumpToFirstPage: e => setPageNumber(1),
    }));

    return (
        <div className={style.container}>
            <Table
                {...(onSelectChange
                    ? { rowSelection: { selectedRowKeys, onChange: onChange, getCheckboxProps: getCheckboxProps } }
                    : {})}
                {...calcScroll(scroll)}
                {...otherProps}
                dataSource={data}
                pagination={
                    showPagination
                        ? {
                              current: pageNumber,
                              showSizeChanger: true,
                              pageSizeOptions: pageSizeOptions,
                              defaultPageSize: Number(pageSizeOptions[0]),
                              onChange: pageNumber => setPageNumber(pageNumber),
                          }
                        : false
                }
                rowClassName={getRowClassName}
                className={style.table}
            >
                {columns.map(({ title, dataIndex, count, render, ...params }) => (
                    <Column
                        title={
                            isNaN(count) ? (
                                title
                            ) : (
                                <div>
                                    {title}
                                    <span className={style.count}>{count}</span>
                                </div>
                            )
                        }
                        dataIndex={dataIndex}
                        key={dataIndex}
                        render={(text, record, index) => (
                            <div style={{ wordWrap: 'break-word', wordBreak: 'break-all' }}>
                                {render ? render(text, record, index) : text}
                            </div>
                        )}
                        {...params}
                    />
                ))}
            </Table>
            {data.length && typeof renderStatisticalBar === 'function' ? (
                <div className={style.statistics}>{renderStatisticalBar()}</div>
            ) : (
                ''
            )}
        </div>
    );
});
