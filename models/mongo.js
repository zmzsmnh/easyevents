/**
 * Created with IntelliJ IDEA.
 * User: zmzsmnh
 * Date: 13-9-28
 * Time: 下午1:38
 * To change this template use File | Settings | File Templates.
 */
var mongoskin = require('mongoskin');

/**
 * Check if current environment has mongo service.
 * If has, use it, else use local mongodb
 */
if(process.env.VCAP_SERVICES){
    var env = JSON.parse(process.env.VCAP_SERVICES);
    var mongo = env['mongodb-2.0'][0]['credentials'];
}
else{
    var mongo = {
        "hostname":"localhost",
        "port":27017,
        "username":"",
        "password":"",
        "name":"",
        "db":"easyevents"
    }
}

/**
 * Generate mongodb connection url
 * @param {obj} mongo parameters object
 * @return {string} mongodb connection url
 */
var generate_mongo_url = function(obj){
    obj.hostname = (obj.hostname || 'localhost');
    obj.port = (obj.port || 27017);
    obj.db = (obj.db || 'test');

    if(obj.username && obj.password){
        return "mongodb://" + obj.username + ":" + obj.password + "@" + obj.hostname + ":" + obj.port + "/" + obj.db;
    }
    else{
        return "mongodb://" + obj.hostname + ":" + obj.port + "/" + obj.db;
    }
}

var mongourl = generate_mongo_url(mongo);
console.log("MongoDB connected: ", mongourl);

exports.db = mongoskin.db(mongourl);