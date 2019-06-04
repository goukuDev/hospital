/************************ common ************************/
/**
 * 接口状态码
 */
export const CODE = {
    SUCCESS: 200,
    UNAUTHENTICATED: 400
};

// 表情过滤正则
export const EMOTION_REG = /\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F]/g;

/************************ 登记接收 ************************/
/**
 * 登记接收动作
 */
export const ACTIONS = {
    NEW: 'new',
    COPY: 'copy',
    MODIFY: 'modify'
};

export const NEW_APPLY = 'new';
export const COPY_APPLY = 'copy';
export const MODIFY_APPLY = 'modify';

export const APPLY_STATUS = {
    REGISTERED: 0,
    RECEIVED: 1
};

export const SAMPLE_STATUS = {
    RECEIVED: 0,
    REJECTED: 1
};

/************************ 取材 ************************/

/************************ 报告 ************************/
