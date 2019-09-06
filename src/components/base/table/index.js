import React, {
    forwardRef,
    useState,
    useEffect,
    useImperativeHandle
} from 'react';
import { Table } from 'antd';
import style from './index.css';
import { useForceUpdate } from '@hooks';
import { debounce } from 'utils';
import classNames from 'classnames/bind';

const cx = classNames.bind(style);

const { Column } = Table;

export default forwardRef((props, ref) => {
    const {
        columns = [],
        data = [],
        showBorder = true,
        showPagination,
        selectedRowKeys,
        pageSizeOptions,
        onSelectChange,
        rowSelection,
        renderStatisticalBar,
        scroll = {},
        ...otherProps
    } = props;

    const total = props.total || data.length;

    const [pageNumber, setPageNumber] = useState(1);
    const forceUpdate = useForceUpdate();

    const defaultPageSizeOptions = ['20', '50', '100'];

    useEffect(() => {
        const handleWindowResize = debounce(forceUpdate, 100);

        window.addEventListener('resize', handleWindowResize);

        return () => window.removeEventListener('resize', handleWindowResize);
    }, [forceUpdate]);

    const getRowClassName = (record, index) => {
        return index % 2 === 1 ? style.darkRow : style.lightRow;
    };

    const onChange = (selectedRowKeys, selectedRows) => {
        props.onSelectChange(selectedRowKeys, selectedRows);
    };

    const getCheckboxProps = record => {
        return {
            disabled: record.disabled
        };
    };

    const calcScroll = scroll => {
        if (scroll.y) {
            const y = +String(scroll.y).replace(/([^\d]|100)/g, '');
            return {
                scroll: Object.assign({}, scroll, {
                    y: `calc(100vh - ${y}px)`
                })
            };
        }
        return { scroll };
    };

    useImperativeHandle(ref, () => ({
        jumpToFirstPage: e => setPageNumber(1)
    }));

    const getRowSelection = () => {
        if (rowSelection) {
            return { rowSelection: { ...rowSelection, getCheckboxProps } };
        } else if (onSelectChange) {
            return {
                rowSelection: {
                    selectedRowKeys,
                    getCheckboxProps,
                    onChange: onChange
                }
            };
        }
        return {};
    };

    return (
        <div
            className={cx({
                container: true,
                noBorder: !showBorder
            })}
        >
            <Table
                {...getRowSelection()}
                {...calcScroll(scroll)}
                {...otherProps}
                dataSource={data}
                pagination={
                    showPagination
                        ? {
                              current: pageNumber,
                              total: total,
                              showSizeChanger: true,
                              pageSizeOptions:
                                  pageSizeOptions || defaultPageSizeOptions,
                              defaultPageSize: pageSizeOptions
                                  ? Number(pageSizeOptions[0])
                                  : Number(defaultPageSizeOptions[0]),
                              onShowSizeChange: (current, size) => {
                                  // pageSize 改变后，回到首页
                                  setPageNumber(1);
                              },
                              onChange: pageNumber => {
                                  setPageNumber(pageNumber);
                              }
                          }
                        : false
                }
                rowClassName={getRowClassName}
                className={style.table}
            >
                {columns.map(
                    ({ title, dataIndex, count, render, ...params }) => (
                        <Column
                            title={
                                isNaN(count) ? (
                                    title
                                ) : (
                                    <div>
                                        {title}
                                        <span className={style.count}>
                                            {count}
                                        </span>
                                    </div>
                                )
                            }
                            dataIndex={dataIndex}
                            key={dataIndex}
                            render={(text, record, index) => (
                                <div
                                    style={{
                                        wordWrap: 'break-word',
                                        wordBreak: 'break-all',
                                        display: 'inline-block'
                                    }}
                                >
                                    {render
                                        ? render(text, record, index)
                                        : text}
                                </div>
                            )}
                            {...params}
                        />
                    )
                )}
            </Table>
            {data.length && typeof renderStatisticalBar === 'function' ? (
                <div className={style.statistics}>{renderStatisticalBar()}</div>
            ) : (
                ''
            )}
        </div>
    );
});
