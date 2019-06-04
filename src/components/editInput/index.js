import React from 'react';
import style from './index.css';

export default function index(props){
    const { value,onChange,disabled } = props;

    return (
        <div>
            <input 
                type="text" 
                className={style.editInput}
                onChange={e=>onChange && onChange(e)}
                value={value || ''}
                disabled={disabled}
            />
        </div>
    )
}