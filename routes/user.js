
/*
 * GET users listing.
 */

var userDAL = require('../models/user').dal;

exports.list = function(req, res){
  res.send("respond with a resource");
};

exports.login = function(req, res) {
    var user = req.body.user;
    userDAL.save(user, {}, function(err, record){
        if(err){
            res.send(500, "something going wrong. T.T");
        } else {
            req.session.user = record;
            res.send("OK");
        }
    })
}