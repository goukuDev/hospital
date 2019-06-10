import React, { useState, useEffect, useCallback } from 'react';
import style from './index.css';
import { api } from 'utils';
import { CODE } from 'myConstants';

const gender = {
	0: '女',
	1: '男',
	2: '其他',
};
export default function Index(props) {
	const [curCase, setCurCase] = useState({});
	const [caseList, setCaseList] = useState([]);
	const [isClose, setIsClose] = useState(false);

	const getHistory = useCallback(() => {
		api('records/case_history', {
			identify_id: props.id,
			pathnum: props.pathnum,
		}).then(({ code, data }) => {
			if (CODE.SUCCESS === code) {
				setCurCase(data.cur_case);
				setCaseList(data.other_case);
			}
		});
	}, [props.id, props.pathnum]);

	useEffect(() => {
		getHistory();
	}, [getHistory]);

	const toogleMore = () => {
		setIsClose(!isClose);
	};

	return (
		<div className={style.info}>
			<div className={style.title}>当前患者</div>
			<div className={style.scroll}>
				<div className={style.base}>
					<p className={style.bold}>{curCase.name}</p>
					<p className={style.bold}>病理号：{curCase.pathnum}</p>
					<p>
						<span>性别：{gender[curCase.gender]}</span>
						年龄：{curCase.age}
					</p>
					<p>住院号：{curCase.admission_num}</p>
					<p>床号：{curCase.bed_num}</p>
					<p>送检部位：{curCase.sampling_location}</p>
					<p>临床诊断：{curCase.clinical_diagnosis}</p>
				</div>
				<div className={style.other}>
					<p
						onClick={toogleMore}
						className={!isClose ? style.open + ' ' + style.bold : style.close + ' ' + style.bold}
					>
						其他检查
					</p>
					{isClose && (
						<div>
							{caseList.map(curCase => (
								<div className={style.box} key={curCase.pathnum}>
									<p className={style.bold}>病理号：{curCase.pathnum}</p>
									<p>送检日期：{curCase.deliver_date}</p>
									<p>送检部位：{curCase.sampling_location}</p>
									<p>免疫组化：{`(` + curCase.order_fin_ratio + `)`}</p>
									<p>分子病理：(0/0)</p>
								</div>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
