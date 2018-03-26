const appMetadata = require('../package.json');

module.exports = {
    version: appMetadata.version,
    appName: appMetadata.name,
    basePath: process.env.NODE_BASE_PATH || ""
};