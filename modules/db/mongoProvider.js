const mongoose = require('mongoose'),
    fs = require('fs'),
    path = require('path');
const Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    DB_ADDRESS =  require("../../config.json").dataBaseUrl;

mongoose.Promise = global.Promise;

mongoose.connect(DB_ADDRESS, {
    useMongoClient : true
}, function(err, res) {
    if (err) {
        console.error(err);
    } else {
        console.log("Database connection established.");
    }
});


let Schemas = fs.readdirSync(path.join(__dirname, "Schemas"), "utf8").map(fileName => {
    return {name: fileName.substring(0, fileName.lastIndexOf(".")), schema: require("./Schemas/" + fileName)(mongoose.Schema)};
}).reduce((acc, cur) => {
    acc[cur.name] = cur.schema;
    return acc;
}, {});

let Models = {};
Object.keys(Schemas).forEach(key => {
    Models[key] = mongoose.model(key, Schemas[key]);
});

module.exports.Models       = Models;

module.exports.model = (name) => {
    return Models[name];
};

module.exports.close = () => {
    mongoose.disconnect().then(function(){
        console.log("Database connection terminated.");
    });
};

module.exports.connection = mongoose.connection;
module.exports.mongo = mongoose.mongo;
module.exports.ObjectId = mongoose.Types.ObjectId;
