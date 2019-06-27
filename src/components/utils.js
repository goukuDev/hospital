import axios from 'axios';
import qs from 'qs';
import { CODE } from 'myConstants';
import Moment from 'moment';
import Message from 'message';

var CancelToken = axios.CancelToken;

export function api(
    url,
    data,
    config = { headers: {}, onUploadProgress: undefined }
) {
    //相对地址的url，自动添加前缀
    if (!url.startsWith('/')) url = '/pis/api/' + url;

    var source = CancelToken.source();
    config.cancelToken = source.token;

    var res;
    if (data instanceof FormData)
        res = axios.post(url, data, config).then(data => data.data);
    else
        res = axios({
            method: 'post',
            onUploadProgress: config.onUploadProgress,
            url,
            data: qs.stringify(data)
        }).then(data => {
            if (CODE.UNAUTHENTICATED === data.data.code) {
                localStorage.userInfo = '';
                window.location.href = '/#/login';
            }
            if (data.data.code !== 0) {
                // throw(data.data)
            }
            return data.data;
        });

    res.cancel = function() {
        source.cancel('取消');
    };
    return res;
}

export function userInfo() {
    try {
        return JSON.parse(localStorage.userInfo);
    } catch (error) {
        return {};
    }
}

export function getRoles() {
    try {
        return JSON.parse(localStorage.roles).map(role => role.rolename);
    } catch (error) {
        console.error('无权访问');
        return [];
    }
}

export function fmtDate(date, fmt = 'YYYY-MM-DD HH:mm:ss') {
    return isNotNull(date) ? Moment(date).format(fmt) : '';
}

export function getCookie(name) {
    var arr,
        reg = new RegExp('(^| )' + name + '=([^;]*)(;|$)');

    if ((arr = document.cookie.match(reg))) return unescape(arr[2]);
    else return null;
}

export function isNotNull(value) {
    return (
        typeof value !== 'undefined' &&
        value !== null &&
        value.toString().trim() !== ''
    );
}

export function hasProperty(obj) {
    for (let item in obj) {
        return true;
    }
    return false;
}

export function debounce(func, wait, immediate) {
    let timer, result;

    const debounced = function() {
        const that = this;
        const args = arguments;

        if (timer) clearTimeout(timer);

        if (immediate) {
            const callNow = !timer;
            timer = setTimeout(function() {
                timer = null;
            }, wait);
            if (callNow) result = func.apply(that, args);
        } else {
            timer = setTimeout(function() {
                func.apply(that, args);
            }, wait);
        }
        return result;
    };

    debounced.cancel = function() {
        clearTimeout(timer);
        timer = null;
    };

    return debounced;
}

/* 工作站组件公用方法 */
export function getCaseRecords(url, data, status) {
    return api(url, data).then(({ code, data, message }) => {
        if (CODE.SUCCESS === code) {
            return data.res.map(o => {
                if (o[status] === 1) {
                    return Object.assign({}, o, { disabled: true });
                }
                return o;
            });
        } else {
            Message.error(message);
        }
    });
}
export function changeDate(dateRange) {
    if (dateRange.length) {
        let start = new Date(dateRange[0]);

        start.setHours(0);
        start.setMinutes(0);
        start.setSeconds(0);

        let end = new Date(dateRange[1]);
        end.setHours(23);
        end.setMinutes(59);
        end.setSeconds(59);
        return [start, end];
    } else {
        return [];
    }
}
export function handleSearch(
    filters,
    dateRange,
    inputValue,
    paraffinList,
    timeType,
    inputType
) {
    const keys = Object.keys(filters);
    return paraffinList.filter(
        o =>
            (!dateRange.length ||
                new Date(o[timeType]) > dateRange[0] ||
                new Date(o[timeType]) === dateRange[0]) &&
            (!dateRange.length ||
                new Date(o[timeType]) < dateRange[1] ||
                new Date(o[timeType]) === dateRange[1]) &&
            (!inputValue ||
                o[inputType]
                    .toLowerCase()
                    .indexOf(inputValue.trim().toLowerCase()) >= 0) &&
            (!Object.keys(filters).length ||
                keys.every(key => {
                    const values = filters[key];
                    return !values.length || values.includes(o[key]);
                }))
    );
}
