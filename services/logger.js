const {
    createLogger,
    transports,
    format,
} = require('winston');
const {
    combine,
    timestamp,
    printf,
    colorize
} = format;

const myFormat = printf(({
    level,
    message,
    timestamp
}) => {
    return `${timestamp} ${level}: ${message}`;
});

const logger = createLogger({

    transports: [
        new transports.Console({
            level: 'info',
            format: combine(
                colorize({
                    level: true
                }),
                timestamp({
                    format: new Date().toLocaleString()
                }),
                myFormat)
        })
    ]
});

module.exports = logger;