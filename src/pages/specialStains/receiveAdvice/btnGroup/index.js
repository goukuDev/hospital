import React, { useState } from 'react'
import style from './index.css'
import Input from 'input'
import { api } from 'utils'
import { CODE } from 'myConstants'
import Message from 'message'
import confirm from 'confirm'

export default function Index (props) {
  	const { checkedList, slideList, reload } = props
  	const [showDialog, setShowDialog] = useState(false)
  	const [specialNum, setSpecialNum] = useState('')

	const getImmuneNum = () => {
		setShowDialog(true)
		api('special/get_special_num').then(({ code, data }) => {
			if (CODE.SUCCESS === code) {
				setSpecialNum(data.special_num)
			}
		})
	}
	const assign = () => {
		api('special/assign_special_slice', { special_id: JSON.stringify(checkedList), special_num: specialNum }).then(
		({ code, message }) => {
			if (CODE.SUCCESS === code) {
				Message.success('分配成功')
				setShowDialog(false);
				reload()
			} 
			else {
				Message.error(message)
			}
		})
	}
	const assignImmuneNum = () => {
		const specialNums = slideList.map(o => o.immune_num).filter(o => o)
		if (specialNums.includes(specialNum)) {
			confirm({
				content: '该特染号已使用，是否将所选切片并入该特染号',
				onOk: assign
			})
		} else {
			assign()
		}
	}

	return (
		<div className={style.buts}>
			<button className={checkedList.length ? '' : style.disabled} onClick={e => (checkedList.length ? getImmuneNum() : e)}>
				分配特染号
			</button>
		{showDialog && (
		<div className={style.dialogWrap}>
			<div className={style.dialogTitle}>
			分配特染号
			</div>
			<div className={style.dialogContent}>
			<Input
				label='特染号：'
				lineFeed={false}
				value={specialNum}
				onChange={e => setSpecialNum(e.target.value)}
				inputStyle={{ width: '263px' }} />
			</div>
			<div className={style.dialogBtns}>
				<span className={style.cancel} onClick={e => setShowDialog(false)}>取消</span>
				<span className={style.ok} onClick={assignImmuneNum}>确定</span>				
			</div>
		</div>
		)}
		</div>
	)
}
