import React, { useState } from 'react';
import style from './index.css';
import ReceiveAdvice from './receiveAdvice';
import Sectioning from './sectioning';
import Staining from './staining';
import Page from 'page';
import Tabs from 'tabs';

const tabList = [
	{ type: '医嘱接收', value: 'receiveAdvice' },
	{ type: '切片', value: 'sectioning' },
	{ type: '染色', value: 'staining' },
];
export default function Index() {
	const [curCompnent, setCurCompnent] = useState('receiveAdvice');

	const switchChildren = type => {
		setCurCompnent(type);
	};
	return (
		<Page>
			<div className={style.container}>
				<Tabs curCompnent={curCompnent} tabList={tabList} switchChildren={switchChildren}>
					{curCompnent === 'receiveAdvice' && <ReceiveAdvice />}
					{curCompnent === 'sectioning' && <Sectioning />}
					{curCompnent === 'staining' && <Staining />}
				</Tabs>
				
			</div>
		</Page>
	);
}
