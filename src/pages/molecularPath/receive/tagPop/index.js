import React, { useState } from 'react';
import Input from 'input';
import style from './index.css';

var ipcRenderer = window.electron && window.electron.ipcRenderer;
var remote = window.electron && window.electron.remote;

export default function Index(props) {
    const { setShowCustomTag } = props;
    const [moleculePathnum, setMoleculePathnum] = useState('');
    const [pathNum, setPathNum] = useState('');
    const [paraffinOrderNum, setParaffinOrderNum] = useState('');
    const [lableType, setLableType] = useState('');
    const [copy, setCopy] = useState('1');
    const labelStyle = {
        width: '150px',
        display: 'inline-block',
        textAlign: 'right',
    };

    const printCode = () => {
        if (!(copy * 1)) return;

        if (!remote && !ipcRenderer) return;
        let codeFlag = remote.getGlobal('sharedObject').printMoleculeLabelStatus;
        if (codeFlag) return;

        let result = [];

        for (let i = 0; i < copy * 1; i++) {
            result = result.concat([
                {
                    moleculePathnum: moleculePathnum.trim(),
                    resueMoleculePathnum: null,
                    samplePathnum: pathNum.trim(),
                    paraffinNum: paraffinOrderNum.trim(),
                    tagType: lableType.trim(),
                },
            ]);
        }

        remote.getGlobal('sharedObject').moleculeLabel = result;

        let params = {
            message_type: 'moleculeLabelPre',
            content: 'template/molecular/barcode.html',
        };
        ipcRenderer.send('print', params);
    };
    return (
        <div className={style.addSampleDialogWrap}>
            <div className={style.addSampleDialog}>
                <div className={style.addSampleHeader}>
                    <span>自定义标签</span>
                    <img
                        src={require('@images/dialog_close.svg')}
                        alt=""
                        className={style.close}
                        onClick={e => setShowCustomTag(false)}
                    />
                </div>
                <div className={style.addSampleContent}>
                    <div className={style.row} id="paraffin_id">
                        <Input
                            lineFeed={false}
                            label="分子病理号："
                            containerStyle={{ marginTop: '15px' }}
                            labelStyle={labelStyle}
                            inputStyle={{ width: '240px' }}
                            value={moleculePathnum}
                            onChange={e => setMoleculePathnum(e.target.value)}
                        />
                    </div>
                    <div className={style.row}>
                        <Input
                            lineFeed={false}
                            label="病理号："
                            labelStyle={labelStyle}
                            inputStyle={{ width: '240px' }}
                            value={pathNum}
                            onChange={e => setPathNum(e.target.value)}
                        />
                    </div>
                    <div className={style.row}>
                        <Input
                            lineFeed={false}
                            label="蜡块序号："
                            labelStyle={labelStyle}
                            inputStyle={{ width: '240px' }}
                            value={paraffinOrderNum}
                            onChange={e => setParaffinOrderNum(e.target.value)}
                        />
                    </div>
                    <div className={style.row}>
                        <Input
                            lineFeed={false}
                            label="标签类型："
                            labelStyle={labelStyle}
                            inputStyle={{ width: '240px' }}
                            value={lableType}
                            onChange={e => setLableType(e.target.value)}
                        />
                    </div>
                    <div className={style.row}>
                        <Input
                            lineFeed={false}
                            label="份数："
                            labelStyle={labelStyle}
                            inputStyle={{ width: '240px' }}
                            value={copy}
                            onChange={e => setCopy(e.target.value)}
                        />
                    </div>
                </div>
                <div className={style.footer}>
                    <div className={style.addSamplebtnGroup}>
                        <span onClick={e => setShowCustomTag(false)}>取消</span>
                        <span className={style.print} onClick={printCode}>
                            打印标签
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
