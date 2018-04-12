
const db = require('../db/mongoProvider'),
    Collections = db.Models,
    auth = require('./authToolkit');
//TODO: documentation


/* jshint ignore: start*/
/**
 * To improve performance, this method crawls an array of search criteria and creates an 
 * array for all IDs since the "$or" operator which is used to search for all criteria
 * is very slow for a big amount of criteria
 */

let createHash = (password) => {
    return new Promise((resolve, reject) => {
        auth.hash(password, (err, hash) => {
            resolve({"hash": hash.hash, "salt": hash.salt});
        });
    });
};

let initDatabase = () => {
    return new Promise(async (resolve, reject) => {
        console.log("Initializing Database");
        let user = {
            name : "admin"
        };
        
        let credentials = await createHash("admin");
        Collections.user.findOneAndUpdate({name: user.name}, {name: user.name, password: credentials.hash, salt: credentials.salt, roles: ["admin","user"]}, {new : true, upsert : true})
            .then(() => { console.log("Done");}).catch(e => { reject(e); });
    });
};

let drop = (handler) => {
    db.connection.db.dropDatabase(function(err, res) {
        handler(err, res);
    });
};

let addUser = (name, password) => {
    return new Promise(async (resolve, reject) => {
        try {
            
            if(!name || !password) {
                throw new Error("Not enough information to create user.");
            }
            if((await Collections.user.findOne({name: name}))) {
                throw new Error("User already existant");
            }
            let credentials = await createHash(password);
            let user = await Collections.user.create({name: name, password: credentials.hash, salt: credentials.salt, roles: ["user"]});
            resolve({success: "Created user " + user.name});
        } catch (e) {
            console.error(e);
            reject(e);
        }
    });
};

let removeUser = (name) => {
    return new Promise(async (resolve, reject) => {
        try {
            if(!name || !(await Collections.user.findOne({name: name}))) {
                throw new Error("Can't find user.");
            }
            await Collections.user.remove({name: name});
            resolve({success: "Removed user " + name});
        } catch (e) {
            console.error(e);
            reject(e);
        }
    });
};

let setPassword = (name, newPassword) => {
    return new Promise(async (resolve, reject) => {
        try {
            if(!name || !(await Collections.user.findOne({name: name}))) {
                reject(new Error("Can't find user."));
            }
            if(!newPassword) {
                reject(new Error("Can't set no password"));
            }
            let credentials = await createHash(newPassword);
            let update = await Collections.user.update({name: name}, {$set:{password: credentials.hash, salt: credentials.salt}});
            if(update.nModified === 0) {
                reject(new Error("Could not change password"));
            }
            resolve({success: "Changed password for " + name});
        } catch (e) {
            console.error(e);
            reject(e);
        }
    });
};



module.exports.addUser = addUser;
module.exports.drop = drop;
module.exports.initDatabase = initDatabase;
module.exports.removeUser = removeUser;
module.exports.setPassword = setPassword;
module.exports.Collections = Collections;
module.exports.ObjectId = db.ObjectId;

Collections.user.findOne({name:"admin"}).then( admin => {
    if(!admin) {
        initDatabase();
    }
});