import React, { } from 'react';
import style from './index.css';


function CheckGroup(props) {
    const { list,cardStyle,clickClose,svgColor } = props;

    return (
         <div className={style.outer}>
            {
                (list || []).map(item => (
                    <div className={style.card} style={cardStyle} key={item.value}>
                        {item.label}
                        <svg
                            onClick={e=>clickClose && clickClose(item.value)}
                            style={{fill:svgColor || '#6F6F6F',cursor:'pointer',marginLeft:'10px',verticalAlign:'middle'}} 
                            xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 10 10">
                            <g id="guanbi-6" transform="translate(0 2)">
                              <path id="路径_106" data-name="路径 106" className="cls-1" d="M352.607,344.514l-3.372,3.372-3.372-3.372a.954.954,0,1,0-1.349,1.349l3.372,3.372-3.372,3.372a.954.954,0,1,0,1.349,1.349l3.372-3.372,3.372,3.372a.954.954,0,1,0,1.349-1.349l-3.372-3.372,3.372-3.372a.954.954,0,1,0-1.349-1.349Z" transform="translate(-344.235 -346.235)"/>
                            </g>
                        </svg>
                    </div>
                    )
                )
            }
        </div>
        
    )
}


export default CheckGroup