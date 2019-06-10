import React, { useRef } from 'react';
import style from './index.css';
import Table from 'table';
import Input from 'input';
import { DatePicker } from 'antd';

const { RangePicker } = DatePicker;

export default function Index(props) {
	const jump = useRef();
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
	const handleKeyDown = e => {
		if (e.keyCode === 13) {
			handleSearch(filter);
			jump.current.jumpToFirstPage();
		}
	};

	const scrollY = word.rowkey === 'id' ? 426 : 364;
	return (
		<div className={style.container} onKeyDown={handleKeyDown}>
			<div className={style.applyTblWrap}>
				<div className={style.titleWrap}>
					<span className={style.title}>{word.name}</span>
					<div className={style.search}>
						<span style={{ fontSize: '14px', color: '#62707c' }}>{word.timeText}</span>
						<RangePicker onChange={dateRange => changeTimeVal(dateRange)} />
						<Input
							label={word.inputText}
							lineFeed={false}
							inputStyle={{ width: '188px', textIndent: '10px', height: '34px' }}
							containerStyle={{ marginLeft: '18px' }}
							value={inputValue}
							onChange={e => changeInputVal(e.target.value)}
						/>
						<span
							className={style.hunt}
							onClick={e => {
								checkList([]);
								handleSearch(filter);
								jump.current.jumpToFirstPage();
							}}
						>
							查询
						</span>
					</div>
				</div>
				<Table
					ref={jump}
					columns={columns}
					data={searchList}
					rowKey={word.rowkey}
					showPagination
					selectedRowKeys={waxId}
					onSelectChange={waxId => checkList(waxId)}
					scroll={{ y: scrollY }}
					onRow={record => {
						return {
							onClick: event => {
								if (waxId.includes(record[word.rowkey])) {
									checkList(waxId.filter(id => id !== record[word.rowkey]));
								} else {
									if (!record.disabled) checkList(waxId.concat([record[word.rowkey]]));
								}
							},
							onDoubleClick: e => (word.name === '包埋列表' ? openDetail(e, record.pathnum) : e),
						};
					}}
					renderStatisticalBar={e => {
						return searchList.length ? (
							<div className={style.statistics}>
								<div className={style.count}>
									{word.total}
									<i>{searchList.length}</i>
									{word.unaccomplished}
									<span>{searchList.filter(o => o.status === 0).length}</span>
									已勾选
									<span>{searchList.filter(item => waxId.includes(item[word.rowkey])).length}</span>
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

			<div className={style.buttons}>
				<span>{word.printTab}</span>
				<span>{word.printSheet}</span>
				<span className={waxId.length ? '' : style.disabled} onClick={finish}>
					{word.finishText}
				</span>
			</div>
		</div>
	);
}
