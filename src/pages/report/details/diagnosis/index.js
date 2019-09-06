import React, { useState, useCallback, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import style from './index.css';
import moment from 'moment';
import Select from 'select';
import DatePicker from 'datepicker';
import Message from 'message';
import Confirm from 'confirm';
import deep from 'deep';
import Reg from './reg';
import Lung from './lung';
import EventBus from 'eventBus';
import { api, userInfo } from 'utils';
import { CODE } from 'myConstants';

var ipcRenderer = window.electron && window.electron.ipcRenderer;

export default forwardRef(function Index(props, ref) {
	const docOptions = [
		{
			title: '李医生',
			value: '李医生',
		},
		{
			title: '张医生',
			value: '张医生',
		},
		{
			title: '赵医生',
			value: '赵医生',
		},
		{
			title: '王医生',
			value: '王医生',
		},
	];
	const accordOptions = [
		{
			title: '符合',
			value: 'definite',
		},
		{
			title: '不符合',
			value: 'inconformity',
		},
		{
			title: '不确定',
			value: 'uncertain',
		},
		{
			title: '无对照',
			value: 'noComparison',
		},
	];

	const [mainReportType, setMainReportType] = useState('');
	const [common, setCommon] = useState({});
	const [report, setReport] = useState({});
	const [controlObj, setControlObj] = useState({});
	const [reportId, setReportId] = useState(null);
	const content = useRef({});

	// ------------------- Initialization data ---------------
	const { reportInfo,secondLevel } = props;

	const loadReportInfo = useCallback(
		(info = reportInfo) => {
			let copy = isCopy(info);
			content.current = copy
				? Object.assign({}, content.current, info.content)
				: Object.assign({}, content.current, { report: [], common: {} });
			let type = getMainReportType(content.current.report);
			if (copy) {
				setControlObj({
					readOnly: !!info.review,
					PRINT: false,
					AUDIT: info.review,
					CANCEL: !info.review,
				});
				setReportId(info.report_id);
				setMainReportType(type);
				setReport(content.current.report.find(o => o.type === type));
				setCommon(content.current.common);
			} else {
				setControlObj({
					readOnly: false,
					AUDIT: true,
					CANCEL: true,
					PRINT: true,
				});
				setMainReportType(type);
				setReport({ type: 'reg' });
			}
		},
		[reportInfo]
	);

	useEffect(() => {
		loadReportInfo();
	}, [loadReportInfo]);

	// ------------------- methods ------------------

	const isCopy = info => {
		return Object.keys(info).length;
	};

	const getMainReportType = arr => {
		let tmpArr = (arr || []).filter(o => o.modifyDate && o).map(o => new Date(o.modifyDate).getTime());
		let recent = Math.max.apply(Math, tmpArr);
		let report = arr.find(o => new Date(o.modifyDate).getTime() === recent);
		return report && report.type ? report.type : 'reg';
	};

	const fmtDate = date => {
		return date ? moment(date, 'YYYY-MM-DD HH:mm:ss') : null;
	};

	const updateCache = () => {
		content.current = {
			common,
			report: content.current.report.filter(o => o.type !== report.type).concat([report]),
		};
	};

	const updateReport = (key, value) => {
		// debugger
		if (key === 'report') {
			setReport(value);
		} else if (key === 'common') {
			setCommon(value);
		}
		setControlObj(Object.assign({}, controlObj, { PRINT: true, AUDIT: true }));
		props.isChange(true);
	};

	const changeReportType = type => {
		updateCache();
		setMainReportType(type);
		setReport(content.current.report.find(o => o.type === type) || { type });
	};

	const save = callback => {
		let obj = {};
		let tmpReport = Object.assign({}, deep.clone(report), { modifyDate: new Date() });
		obj.report = content.current.report.filter(o => o.type !== report.type).concat([tmpReport]);
		obj.common = deep.clone(common);
		if (!common.firstDoc) obj.common = Object.assign({}, deep.clone(common), { firstDoc: userInfo().name });

		api(`report/save_report?pathnum=${props.patientInfo.pathnum}&type=0`, {
			content: JSON.stringify(obj),
		}).then(({ code, data }) => {
			if (code === CODE.SUCCESS) {
				setReportId(data);
				setControlObj(Object.assign({}, controlObj, { PRINT: false, AUDIT: false }));
				// 处理初诊医生
				if (!common.firstDoc) setCommon(Object.assign({}, common, { firstDoc: userInfo().name }));
				props.isChange(false);
				Message.success('保存成功');
				typeof callback === 'function' && callback();
			} else {
				Message.error('保存失败');
			}
		});
	};

	const print = () => {
		//调用electron
		if (ipcRenderer) {
			ipcRenderer.send('print', {
				message_type: 'report',
				type: 0,
				pathnum: props.patientInfo.pathnum,
			});
		}
	};

	const audit = flag => {
		if (common.subsequentDoc) {
			Confirm({
				content: '是否确认审核',
				onOk: e => {
					api(`report/alter_report_review?report_id=${reportId}`, { review: 1 }).then(
						({ code, message, data }) => {
							if (code === CODE.SUCCESS) {
								setControlObj(
									Object.assign({}, controlObj, {
										CANCEL: false,
										PRINT: false,
										AUDIT: true,
										readOnly: true,
									})
								);
								// 处理审核医生
								setCommon(Object.assign({}, common, { auditDoc: userInfo().name }));
								EventBus.emit('updateState')
							} else {
								Message.error('审核失败');
							}
							props.isChange(false);
						}
					);
				},
			});
		} else {
			Confirm({
				content: '请选择复诊医生',
			});
		}
	};

	const cancelAudit = () => {
		Confirm({
			content: '是否确认取消审核',
			onOk: e => {
				api(`report/alter_report_review?report_id=${reportId}`, {
					review: 0,
				}).then(({ code, message, data }) => {
					if (code === CODE.SUCCESS) {
						setControlObj(
							Object.assign({}, controlObj, {
								CANCEL: true,
								AUDIT: false,
								readOnly: false,
								PRINT: false,
							})
						);
						let tmpObj = Object.assign({}, deep.clone(common), { auditDoc: '' });
						setCommon(tmpObj);
						EventBus.emit('updateState')
						Message.success('取消审核成功');
					} else {
						Message.error('取消审核失败');
					}
					props.isChange(false);
				});
			},
		});
	};

	// ------------------- handle -------------------
	const handleSubsequentDoc = value => {
		let tmpObj = Object.assign({}, deep.clone(common), { subsequentDoc: value });
		updateReport('common', tmpObj);
	};

	const handleResult = (current, value) => {
		let tmpObj = Object.assign({}, deep.clone(common), { [current]: value });
		updateReport('common', tmpObj);
	};

	const handleDate = (obj, string) => {
		let tmpObj = Object.assign({}, deep.clone(common), { date: string });
		updateReport('common', tmpObj);
	};

	// ------------------- render DOM-----------------

	useImperativeHandle(ref, () => ({
		save,
	}));

	return (
		<div className={style.diagnosis} style={{ display: props.visible ? 'block' : 'none' }}>
			<div className={style.fl}>
				<div className={style.top}>
					<div className={style['select-box']}>
						报告模板：
						<Select
							value={mainReportType}
							options={[{ title: '一般报告', value: 'reg' }, { title: '肺癌', value: 'lung' }]}
							lineFeed={false}
							selectStyle={{ width: '136px'}}
							onChange={changeReportType}
							focused
						/>
					</div>
					<div className={style.template}>
						<Reg
							visible={mainReportType === 'reg'}
							readOnly={(secondLevel?true:controlObj.readOnly)}
							report={report}
							updateReg={value => updateReport('report', value)}
						/>
						<Lung visible={mainReportType === 'lung'} updateLung={value => updateReport('report', value)} />
					</div>
					<div className={style.footer} style={{width:`${mainReportType === 'reg'? 'calc(100% - 270px)':'100%'}`}}>
						<div className={style['input-box']}>
							初诊医生：
							<div className={`${style.text} ${(secondLevel?true:controlObj.readOnly) ? style.disable : ''}`}>
								{common.firstDoc}
							</div>
						</div>
						<div className={style['input-box']}>
							复诊医生:
							<Select
								value={common.subsequentDoc || null}
								options={docOptions}
								lineFeed={false}
								style={{ width: '90px', marginLeft: '10px' }}
								onChange={handleSubsequentDoc}
								disabled={(secondLevel?true:controlObj.readOnly)}
							/>
						</div>
						<div className={style['input-box']}>
							审核医生：
							<div className={`${style.text} ${(secondLevel?true:controlObj.readOnly) ? style.disable : ''}`}>
								{common.auditDoc}
							</div>
						</div>
						<div className={style['input-box']}>
							阴阳性：
							<Select
								options={[
									{ title: '阴性', value: 'negative' },
									{ title: '阳性', value: 'positive' },
								]}
								lineFeed={false}
								style={{ width: '90px' }}
								value={common.symptoms || null}
								onChange={value => handleResult('symptoms', value)}
								disabled={(secondLevel?true:controlObj.readOnly)}
							/>
						</div>
						<div className={style['input-box']}>
							临床符合：
							<Select
								options={accordOptions}
								lineFeed={false}
								style={{ width: '90px' }}
								value={common.clinical || null}
								onChange={value => handleResult('clinical', value)}
								disabled={(secondLevel?true:controlObj.readOnly)}
							/>
						</div>
						<div className={style['input-box']}>
							报告时间：
							<DatePicker
								lineFeed={false}
								style={{ width: '190px' }}
								onChange={handleDate}
								value={fmtDate(common.date)}
								disabled={(secondLevel?true:controlObj.readOnly)}
							/>
						</div>
						<div className={style['input-box']}>
							冰冻符合：
							<Select
								options={accordOptions}
								lineFeed={false}
								style={{ width: '90px' }}
								value={common.frozen || null}
								onChange={value => handleResult('frozen', value)}
								disabled={(secondLevel?true:controlObj.readOnly)}
							/>
						</div>
					</div>
				</div>
				
			</div>
			<div className={style.bottom}>
				<button disabled={secondLevel?true:controlObj.readOnly} onClick={save}>
					保存
				</button>
				<button disabled={secondLevel?true:controlObj.AUDIT} onClick={audit}>
					审核
				</button>
				<button disabled={secondLevel?true:controlObj.CANCEL} onClick={cancelAudit}>
					取消审核
				</button>
				<button disabled={secondLevel?true:controlObj.PRINT} onClick={print}>
					打印
				</button>
			</div>
		</div>
	);
});
