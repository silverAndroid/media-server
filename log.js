const winston = require('winston');

module.exports.logger = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)({
            colorize: true,
            timestamp: true,
        }),
        new (winston.transports.File)({
            maxsize: 320000,
            level: 'debug',
            json: false,
            filename: 'file-listen.log',
            handleExceptions: true,
            humanReadableUnhandledException: true,
        }),
    ],
});
