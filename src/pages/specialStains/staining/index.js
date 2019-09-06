import React, { useState, useEffect, useRef } from 'react';
import style from './index.css';
import { api, userInfo, getCaseRecords, changeDate, handleSearch } from 'utils';
import Workstation from 'workstation';
import Message from 'message';
import confirm from 'confirm';
import { CODE } from 'myConstants';

const texts = require('./lan/zh.js');

export default function Index(props) {
	const columns = [
		{
			title: '任务来源',
			dataIndex: 'task_src',
			render: value => texts.source[value],
			width:100
		},
		{
			title: '姓名',
			dataIndex: 'name',
			width:100
		},
		{
			title: '病理号',
			dataIndex: 'pathnum',
			width:120
		},

		{
			title: '切片号',
			dataIndex: 'slice_id',
			width:140
		},
		{
			title: '特染号',
			dataIndex: 'special_num',
			width:140
		},
		{
			title: '染色方式',
			dataIndex: 'dye_type',
			render: value => texts.sectionType[value],
			width:100
		},
		{
			title: '标记物',
			dataIndex: 'marker_id',
			width:120
		},

		{
			title: '申请医生',
			dataIndex: 'apply_doc',
			width:100
		},
		{
			title: '申请时间',
			dataIndex: 'apply_time',
			width:180
		},
		{
			title: '备注',
			dataIndex: 'comment',
		},

		{
			title: '染色技师',
			dataIndex: 'dye_tech',
			width:100
		},
		{
			title: '染色时间',
			dataIndex: 'dye_time',
			width:180
		},
		{
			title: '标签打印状态',
			dataIndex: 'tag_printed',
			width:170,
			render: value => texts.tagPrinted[value],
		},
		{
			title: '工作单打印状态',
			dataIndex: 'app_printed',
			width:170,
			render: value => texts.appPrinted[value],
		},

		{
			title: '状态',
			dataIndex: 'dye_status',
			width:120,
			render: value => (
				<React.Fragment>
					<span
						className={style.dot}
						style={{
							background: { 1: '#6FC831', 0: '#F4BB00' }[value],
						}}
					/>
					{texts.status[value]}
				</React.Fragment>
			),
			filters: [
				{
					text: '待染色',
					value: 0,
				},
				{
					text: '已染色',
					value: 1,
				},
			],
		},
	];
	
	const word = {
		rowkey: 'id',
		name: '染色列表',
		timeText: '申请日期：',
		inputText: '病理号：',
		total: '切片数总计',
		unaccomplished: '未染色：',
		finishText: '确认染色完成',
		printTab: '打印标签',
		printSheet: '打印工作单',
		status: 'dye_status',
		scrollX:1990,
		scrollY:375
	};

	const paraffinList = useRef();

	const [waxId, setWaxId] = useState([]);

	const [dateRange, setDateRange] = useState([]);
	const [inputValue, setInputValue] = useState('');
	const [searchList, setSearchList] = useState([]);
	const [filters, setFilters] = useState({});

	useEffect(() => {
		const init = async e => {
			paraffinList.current = await getCaseRecords('special/search_special_dye', {}, 'dye_status');
			setSearchList(paraffinList.current);
		};
		init();
	}, []);

	const finish = () => {
		if (!waxId.length) return;
		confirm({
			content: '确认确认染色完成？',
			onOk: async e => {
				api('special/finish_special_dye', {
					special_id: JSON.stringify(waxId),
					dye_tech: userInfo().username,
				}).then(data => {
					if (CODE.SUCCESS === data.code) {
						Message.success('染色完成');
						setWaxId([]);
						const reload = async e => {
							paraffinList.current = await getCaseRecords('special/search_special_dye', {}, 'dye_status');
							setSearchList(
								handleSearch(
									filters,
									dateRange,
									inputValue,
									paraffinList.current,
									'apply_time',
									'pathnum'
								)
							);
						};
						reload();
					} else {
						Message.error(data.message);
					}
				});
			},
		});
	};

	return (
		<div className={style.outerbg}>
			{paraffinList.current && (
				<Workstation
					searchList={searchList}
					columns={columns}
					word={word}
					finish={finish}
					waxId={waxId}
					checkList={e => setWaxId(e)}
					saveFilter={e => setFilters(e)}
					filter={filters}
					dateRange={dateRange}
					changeTimeVal={e => setDateRange(changeDate(e))}
					inputValue={inputValue}
					changeInputVal={value => setInputValue(value)}
					handleSearch={e =>
						setSearchList(
							handleSearch(e, dateRange, inputValue, paraffinList.current, 'apply_time', 'pathnum')
						)
					}
				/>
			)}
		</div>
	);
}
