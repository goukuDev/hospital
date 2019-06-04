import React, { useState } from 'react';
import style from './index.css';
import Select from 'select';
import Input from 'input';
import { api } from 'utils';
import { CODE } from 'myConstants';
import Message from 'message';
import confirm from 'confirm';

export default function Index(props) {
    const { checkedList, facilityList, slideList, reload, listUnchecked } = props;

    const [showDialog, setShowDialog] = useState(false);
    const [immuneNum, setImmuneNum] = useState('');

    const getImmuneNum = () => {
        setShowDialog(true);
        api('immune/get_immune_num').then(({ code, data }) => {
            if (CODE.SUCCESS === code) {
                setImmuneNum(data.immune_num);
            }
        });
    };
    const assign = () => {
        api('immune/assign_ihc_slice', { ihc_id: JSON.stringify(checkedList), immune_num: immuneNum }).then(
            ({ code, message }) => {
                if (CODE.SUCCESS === code) {
                    Message.success('分配成功');
                    setShowDialog(false);
                    reload();
                    listUnchecked();
                } else {
                    Message.error(message);
                }
            }
        );
    };
    const assignImmuneNum = () => {
        const immuneNums = slideList.map(o => o.immune_num).filter(o => o);
        if (immuneNums.includes(immuneNum)) {
            confirm({
                content: '该免疫号已使用，是否将所选切片并入该免疫号',
                onOk: assign,
            });
        } else {
            assign();
        }
    };

    return (
        <div className={style.buts}>
            <Select
                label="分配设备："
                lineFeed={false}
                selectStyle={{ width: '156px', marginLeft: '4px', marginRight: '8px' }}
                options={facilityList}
                value={''}
                onChange={e => e}
            />
            <button>增加对照</button>
            <button>合并切片</button>
            <button
                className={checkedList.length ? '' : style.disabled}
                onClick={e => (checkedList.length ? getImmuneNum() : e)}
            >
                分配免疫号
            </button>

            {showDialog && (
                <div className={style.dialogWrap}>
                    <div className={style.dialogTitle}>分配免疫号</div>
                    <div className={style.dialogContent}>
                        <Input
                            label="免疫号："
                            lineFeed={false}
                            value={immuneNum}
                            onChange={e => setImmuneNum(e.target.value)}
                            inputStyle={{ width: '263px' }}
                        />
                    </div>
                    <div className={style.dialogBtns}>
                        <span className={style.cancel} onClick={e => setShowDialog(false)}>
                            取消
                        </span>
                        <span className={style.ok} onClick={assignImmuneNum}>
                            确定
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}
