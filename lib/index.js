const axios = require('axios');

// 日志队列
let logQueue = [];
// 队列最大长度，过多则剔除
let MAX_QUEUE_LENGTH = 1000;
// 一次上报条数
let ONCE_UPLOAD_LENGTH = 10;
// 上报间隔
let SEND_TIME = 60000;

/**
 * 加入日志队列
 * @param {object} log 
 */
const addLogQueue = (log) => {
    if (logQueue.length >= MAX_QUEUE_LENGTH) {
        logQueue.shift();
    }
    logQueue = logQueue.concat(log);
}
let timer = null;

/**
 * 获取axios数据上传
 * @param {object} config 
 * @returns 
 */
const transformRequest = (config) => {
    if(config && config.transformRequest && Array.isArray(config.transformRequest)) {
        return config.transformRequest;
    } else {
        return null;
    }
}

/**
 * 判断是否为数字，包括字符串数字
 * @param {string|number} num 
 * @returns 
 */
const isNumber = num => !isNaN(parseFloat(num));

/**
 * 获取配置中数字项
 * @param {object} config 
 * @param {string} fields 
 * @param {*} _default 
 * @returns 
 */
const getConfigNumber = (config, fields, _default) => {
    if(!config[fields]) {
        return _default;
    }

    return isNumber(config[fields]) ? Number(config[fields]) : _default;
}

/**
 * 开启上报脚本
 * @param {object} request 
 * @param {object} config
 */
const start = (request, config) => {
    if (timer) {
        clearInterval(timer);
        timer = null;
    }
    timer = setInterval(() => {
        if (logQueue.length === 0) {
            return;
        }
        // 上传的数据
        const reportData = logQueue.splice(0, ONCE_UPLOAD_LENGTH);

        if(reportData.length === 0) {
            return;
        }
        // axios 参数
        const axiosOptions = {
            method: 'post',
            data: reportData,
            url: '',
        }
        // 如果需要transformRequest则传入
        const transformRequestOption = transformRequest(config);
        if(transformRequestOption) {
            axiosOptions.transformRequest = transformRequestOption;
        }

        request(axiosOptions)
        .catch((error) => {
            console.warn(error)
        });
    }, SEND_TIME);
}

const logstashAxiosAppender = config => {
    const request = axios.create({
        baseURL: config.url,
        timeout: config.timeout || 5000,
        headers: Object.assign({
            'Content-Type': 'application/json'
        }, config.headers),
        withCredentials: true,
    });
    MAX_QUEUE_LENGTH = getConfigNumber(config, 'MAX_QUEUE_LENGTH', MAX_QUEUE_LENGTH);
    ONCE_UPLOAD_LENGTH = getConfigNumber(config, 'ONCE_UPLOAD_LENGTH', ONCE_UPLOAD_LENGTH);
    SEND_TIME = getConfigNumber(config, 'SEND_TIME', SEND_TIME);

    start(request, config);

    return function log(event) {
        addLogQueue(event.data);
    };
}

const configure = config => logstashAxiosAppender(config);

module.exports.configure = configure;