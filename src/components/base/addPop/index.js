import React from 'react';
import style from './index.css';

export default function Index(props){
    const {
        title,
        confirmButtonText = '新增',
        cancleButtonText = '取消',
        onConfirm,
        onCancle,
        onClose,
        confirmButtonDisabled = false,
    } = props;

    return (
        <div className={style.fix}>
            <div className={style.addSampleDialog}>
                <div className={style.addSampleHeader}>
                    <span>{title}</span>
                    <img
                        src={require('@images/dialog_close.svg')}
                        alt=''
                        className={style.close}
                        onClick={onClose}
                    />
                </div>
                <div className={style.addSampleContent}>
                    {props.children}
                </div>
                <div className={style.footer}>
                    <div className={style.addSamplebtnGroup}>
                        <span className={style.cancelAdd} onClick={onCancle}>
                            {cancleButtonText}
                        </span>
                        <span
                            className={confirmButtonDisabled?'':style.canAddSample}
                            onClick={onConfirm}
                        >
                            {confirmButtonText}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}