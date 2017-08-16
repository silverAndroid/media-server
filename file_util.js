const fs = require('fs');

module.exports.existsFile = path => new Promise((resolve) => {
    fs.access(path, fs.F_OK, exists => resolve(!exists));
});
