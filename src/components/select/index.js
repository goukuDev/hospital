import React, { Component } from 'react';
import { Select } from 'antd';
import style from './index.css';

const { Option } = Select;

export default class index extends Component {
	render() {
		const {
			label,
			lineFeed = true,
			containerStyle,
			selectStyle,
			options,
			onChange = e => e,
			...otherProps
		} = this.props;

		return (
			<div className={style.container} style={containerStyle}>
				<span className={lineFeed ? style.lineFeed : ''}>
					<span className={style.label}>{label}</span>
				</span>
				<Select className={style.select} style={selectStyle} {...otherProps} onChange={onChange}>
					{(options || []).map(({ title, value,disabled=false }) => (
						<Option key={value} value={value} disabled={disabled}>
							{title}
						</Option>
					))}
				</Select>
			</div>
		);
	}
}
