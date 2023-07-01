const axios = require('axios');

// 日志队列
let logQueue = [];
// 队列最大长度，过多则剔除
let MAX_QUEUE_LENGTH = 1000;
// 一次上报条数
let ONCE_UPLOAD_LENGTH = 10;
// 上报间隔
let SEND_TIME = 10000;

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
 * 开启上报脚本
 * @param {*} request 
 */
const start = (request) => {
    if (timer) {
        clearInterval(timer);
        timer = null;
    }
    timer = setInterval(() => {
        if (logQueue.length === 0) {
            return;
        }
        // 转换为字符串上报
        const reportData = logQueue.splice(0, ONCE_UPLOAD_LENGTH).reduce((str, curr) => str + JSON.stringify(curr), '');

        request.post('', reportData)
            .catch((error) => {
                console.log(error.message)
            });
    }, SEND_TIME);
}

function logstashAxiosAppender(config) {
    const request = axios.create({
        baseURL: config.url,
        timeout: config.timeout || 5000,
        headers: Object.assign({
            'Content-Type': 'application/json'
        }, config.headers),
        withCredentials: true,
    });
    start(request);

    return function log(event) {
        addLogQueue(event.data);
    };
}

function configure(config) {
    return logstashAxiosAppender(config);
}

module.exports.configure = configure;