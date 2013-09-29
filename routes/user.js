
/*
 * GET users listing.
 */

var userDAL = require('../models/user').dal;

exports.list = function(req, res){
    var matchstr = req.query.q;
    console.log(matchstr);
    var regrex = new RegExp(matchstr, "i");
    userDAL.find({name: regrex}, {name: true, _id: true, gender: true}).limit(10).toArray(function(err, users){
         res.send(users);
    });
};

exports.login = function(req, res) {
    var user = req.body;
    user._id = user.id;
    userDAL.findOne(user, function(err, dbuser) {
        if(dbuser) {
            req.session.user = dbuser;
        } else {
            console.log(user);
            userDAL.insert(user, {safe:true}, function(err, record){
                if(err){
                    res.send(500, "something going wrong. T.T");
                } else {
                    req.session.user = record;
                    res.send("OK");
                }
            })
        }
    })
}
