import React from 'react';
import style from './index.css';

export default function Index(props) {
    const {
        title,
        confirmButtonText = '新增',
        cancelButtonText = '取消',
        onConfirm,
        onCancel,
        onClose,
        confirmButtonDisabled = false,
        popStyle = {},
        renderCustomButtons = () => {}
    } = props;

    return (
        <div className={style.fix}>
            <div className={style.addSampleDialog} style={popStyle}>
                <div className={style.addSampleHeader}>
                    <span>{title}</span>
                    <img
                        src={require('@images/dialog_close.svg')}
                        alt=''
                        className={style.close}
                        onClick={onClose}
                    />
                </div>
                <div className={style.addSampleContent}>{props.children}</div>
                <div className={style.footer}>
                    <div className={style.addSamplebtnGroup}>
                        <span className={style.cancelAdd} onClick={onCancel}>
                            {cancelButtonText}
                        </span>
                        <span
                            className={
                                confirmButtonDisabled ? '' : style.canAddSample
                            }
                            onClick={()=>{!confirmButtonDisabled && onConfirm()}}
                        >
                            {confirmButtonText}
                        </span>
                        {renderCustomButtons()}
                    </div>
                </div>
            </div>
        </div>
    );
}
