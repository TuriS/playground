const properties = require('./properties.js');
 
module.exports = function(locals) {
    locals.version = properties.version;
    locals.appName = properties.appName;
    locals.basePath = properties.basePath;
};