# logstash-axios
Based on the logstash-http extension package, with more powerful scalability, support for high concurrency processing

**npm**
> npm install logstash-axios

**pnpm**
> pnpm install logstash-axios


# Configuration
- `type`: `logstash-axios`
- `url`: `string`(optional) - Log collector address
- `timeout` - `number`(optional, defaults to 5000ms) - the timeout for the HTTP request.
- `headers` - `object`(optional, defaults to `{'Content-type': 'application/json'}`) axios header Configuration
- `MAX_QUEUE_LENGTH` - `number`(optional, defaults to 100) Maximum number of logs to be piled
- `ONCE_UPLOAD_LENGTH` - `number`(optional, defaults to 10) Number of items reported once
- `SEND_TIME` - `number`(optional, defaults to 60000) Reporting interval

# Example

```javacript
log4js.configure({
    appenders: {
        reportApi: {
            type: 'logstash-axios',
            url: 'http://127.0.0.1:3000',
            SEND_TIME: 10000,
            transformRequest: [function (data) {
                let pushData = '';
                data.forEach(element => {
                    pushData+= `${JSON.stringify(element)}\n`
                });
                return pushData;
            }]
        },
    },
    categories: {
      default: { appenders: ['reportApi'], level: 'ALL' }
    }
});

const logger = log4js.getLogger();
logger.info('some interesting log message');
logger.error('something has gone wrong');
```
This example reports the log information to port 127.0.0.1:3000 every 10 seconds.