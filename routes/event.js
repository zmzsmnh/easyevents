/**
 * Created with IntelliJ IDEA.
 * User: zmzsmnh
 * Date: 13-9-28
 * Time: 下午1:32
 * To change this template use File | Settings | File Templates.
 */

var eventDAL = require('../models/event').dal;

exports.add = function(req, res) {
    var event = req.body;
    eventDAL.insert(event,{safe: true}, function(err, doc) {
        console.log(doc);
        res.send(doc);
    });
}

exports.listmine = function(req, res) {
    var user = req.session.user;
    console.log(user);
    if(req.session.user instanceof Array) {
        user = req.session.user[0];
    }
    var userid = user._id;
    console.log(req.session);
    eventDAL.find({"participants._id": userid}).limit(10).toArray(function(err, events) {
        res.send(events);
    });
}