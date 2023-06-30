const axios = require('axios');

function logstashAxiosAppender(config) {
  const request = axios.create({
    baseURL: config.url,
    timeout: config.timeout || 5000,
    headers: Object.assign({ 'Content-Type': 'application/json' }, config.headers),
    withCredentials: true,
  });

  return function log(event) {
    const logDataJsonStr = JSON.stringify(event.data);

    request.post('', logDataJsonStr)
      .catch((error) => {
        console.log(error.message)
      });
  };
}

function configure(config) {
  return logstashAxiosAppender(config);
}

module.exports.configure = configure;
