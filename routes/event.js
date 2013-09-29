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
    var userid = req.session.user[0]._id;
    eventDAL.find({"participants._id": userid}).limit(10).toArray(function(err, events) {
        res.send(events);
    });
}