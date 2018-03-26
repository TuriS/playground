module.exports = (Schema) => {
    return new Schema({
        name : {
            type : String,
            unique : true,
            required: true
        },
        password : String,
        salt: String,
        roles: [{
            type: String,
            enum: require("../roles.json")
        }]
    }, {
        versionKey : false
    });
};