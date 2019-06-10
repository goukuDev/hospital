import React, { useState, useEffect, useRef } from 'react';
import style from './index.css';
import { api, userInfo, getCaseRecords, changeDate, handleSearch } from 'utils';
import PublicComp from 'workstation';
import Message from 'message';
import Transition from 'transition';
import Detail from 'caseDetail';
import confirm from 'confirm';
import { CODE } from 'myConstants';
import Page from 'page';

const texts = require('./lan/zh.js');

export default function Index(props) {
	const columns = [
		{
			title: '任务来源',
			dataIndex: 'task_src',
			render: value => texts.source[value],
		},
		{
			title: '姓名',
			dataIndex: 'name',
		},
		{
			title: '病理号',
			dataIndex: 'pathnum',
		},
		{
			title: '蜡块号',
			dataIndex: 'paraffin_num',
		},
		{
			title: '标本类型',
			dataIndex: 'sample_type',
			render: value => texts.sampleType[value],
			filters: [
				{
					text: '大标本',
					value: 0,
				},
				{
					text: '小标本',
					value: 1,
				},
			],
		},
		{
			title: '组织名称',
			dataIndex: 'tissue',
		},
		{
			title: '取材医生',
			dataIndex: 'sampling_doc',
		},
		{
			title: '取材时间',
			dataIndex: 'sampling_time',
		},
		{
			title: ' 包埋技师',
			dataIndex: 'embed_technician',
		},
		{
			title: '包埋时间',
			dataIndex: 'embed_time',
		},
		{
			title: '包埋盒打印状态',
			dataIndex: 'embed_print',
			render: value => texts.embeddingPrint[value],
		},
		{
			title: '工作单打印状态',
			dataIndex: 'sheet_print',
			render: value => texts.sheetPrint[value],
		},

		{
			title: '包埋状态',
			dataIndex: 'status',
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
					text: '待包埋',
					value: 0,
				},
				{
					text: '已包埋',
					value: 1,
				},
			],
		},
		{
			title: '备注',
			dataIndex: 'comment',
		},
		{
			title: '操作',
			dataIndex: 'option',
			render: (text, record) => (
				<React.Fragment>
					<span onClick={e => openDetail(e, record.pathnum)} className={style.updateBtn}>
						{'取材记录'}
					</span>
				</React.Fragment>
			),
		},
	].map(column => {
		column.width = 120;
		return column;
	});
	const word = {
		rowkey: 'paraffin_num',
		name: '包埋列表',
		timeText: '取材日期：',
		inputText: '蜡块号：',
		total: '蜡块数总计',
		unaccomplished: '待包埋',
		finishText: '完成包埋',
		printTab: '打印包埋盒',
		printSheet: '打印工作单',
	};

	const paraffinList = useRef();

	const [showDetail, setShowDetail] = useState(false);
	const [waxId, setWaxId] = useState([]);
	const [waxMessage, setWaxMessage] = useState({});
	const [applyMessage, setApplyMessage] = useState({});
	const [pathnum, setPathnum] = useState(null);

	const [dateRange, setDateRange] = useState([]);
	const [inputValue, setInputValue] = useState('');
	const [searchList, setSearchList] = useState([]);
	const [filters, setFilters] = useState({});

	useEffect(() => {
		const init = async e => {
			paraffinList.current = await getCaseRecords('records/search_paraffin', {}, 'status');

			setSearchList(paraffinList.current);
		};
		init();
	}, []);

	const openDetail = (e, pathnum) => {
		e.stopPropagation();
		api('records/get_case', { pathnum: pathnum }).then(({ code, data, message }) => {
			if (CODE.SUCCESS === code) {
				setWaxMessage(data);
				setPathnum(pathnum);
				api('records/get_appli', { pis_apply_id: data.pis_apply_id }).then(({ code, data }) => {
					if (CODE.SUCCESS === code) {
						setApplyMessage(data);
						setShowDetail(true);
					}
				});
			} else {
				Message.error(message);
			}
		});
	};

	const finish = () => {
		if (!waxId.length) return;
		confirm({
			content: '确认完成包埋？',
			onOk: async e => {
				api('records/accomplish_paraffin', {
					paraffin_num: JSON.stringify(waxId),
					embed_technician: userInfo().username,
				}).then(data => {
					if (CODE.SUCCESS === data.code) {
						Message.success('包埋成功');
						setWaxId([]);
						const reload = async e => {
							paraffinList.current = await getCaseRecords('records/search_paraffin', {}, 'status');
							setSearchList(
								handleSearch(
									filters,
									dateRange,
									inputValue,
									paraffinList.current,
									'sampling_time',
									'paraffin_num'
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
		<Page>
			<div className={style.outerbg}>
				{paraffinList.current && (
					<PublicComp
						searchList={searchList}
						columns={columns}
						openDetail={openDetail}
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
								handleSearch(
									e,
									dateRange,
									inputValue,
									paraffinList.current,
									'sampling_time',
									'paraffin_num'
								)
							)
						}
					/>
				)}
				{showDetail && (
					<Transition>
						<div className={style.detail}>
							<Detail
								editable={false}
								wax={waxMessage}
								appli={applyMessage}
								pathnum={pathnum}
								closeDetail={e => setShowDetail(false)}
							/>
						</div>
					</Transition>
				)}
			</div>
		</Page>
	);
}
