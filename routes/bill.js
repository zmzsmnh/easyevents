/**
 * Created with IntelliJ IDEA.
 * User: zmzsmnh
 * Date: 13-9-28
 * Time: 下午1:33
 * To change this template use File | Settings | File Templates.
 */

var billDAL = require('../models/bill').dal;
var userDAL = require('../models/user').dal;
var ObjectId = require('mongodb').ObjectID;

exports.claim = function(req, res) {
    var expense = req.body;
    var creditor = req.session.user._id;
    console.log(req.session.user);

    var bills = [];
    for(var i in expense.participants) {
        var bill = {};
        for(var key in expense) {
            bill[key] = expense[key];
        }
        bill.creditor = creditor;
        bill.debitor = expense.participants[i];
        if(bill.creditor == bill.debitor) {
            continue;
        }
        bill.amount = (expense.total / expense.participants.length).toFixed(2);
        bill.status = 0   //0: Created, 1: Confirmed, 2: Paid, -1: Declined
        bills.push(bill);
    }

    billDAL.insert(bills, {safe: true}, function(err, docs) {
        res.send(docs);
    });
}

exports.listclaims = function(req, res) {
    var userid = req.session.user._id;

    billDAL.find({$or: [{creditor: userid}, {debitor: userid}], status: 0}).toArray(function(err, bills) {
        var people = {};
        for (var i in bills) {
            people[bills[i].creditor] = true;
            people[bills[i].debitor] = true;
        }
        userDAL.find({_id: {$in: Object.keys(people)}}).toArray(function(err, docs) {
            console.log(docs);
            var mapping = {};
            for(var i in docs) {
                mapping[docs[i]._id] = docs[i].name;
            }
            res.send({id: userid, results: bills, mapping: mapping});
        })
    })
}

exports.verifyclaim = function(req, res) {
    var claimid = req.body.id;
    var status = parseInt(req.body.status);
    console.log(status);
    billDAL.update({_id: new ObjectId(claimid)}, {$set: {status: status}}, function(err, count) {
        res.send(count);
    });
}

exports.listbillsummary = function(req, res) {
    var userid = req.session.user._id;
    console.log(userid);
    billDAL.find({$or: [{creditor: userid, status: 1}, {debitor: userid, status: 1}]}).toArray(function(err, bills) {
        var summary = {};
        for(var i in bills) {
            if(bills[i].creditor != userid) {
                if(!(bills[i].creditor in summary)) {
                    summary[bills[i].creditor] = 0;
                }
                summary[bills[i].creditor] += bills[i].amount;
            }
            if(bills[i].debitor != userid) {
                if(!(bills[i].debitor in summary)) {
                    summary[bills[i].debitor] = 0;
                }
                summary[bills[i].debitor] -= bills[i].amount;
            }
        }
        userDAL.find({_id: {$in: Object.keys(summary)}}).toArray(function(err, docs) {
            var mapping = {};
            for(var i in docs) {
                mapping[docs[i]._id] = docs[i].name;
            }
            res.send({id: userid, results: summary, mapping: mapping});
        })
    })
}

exports.pay = function(req, res) {
    var receiver = req.body.receiver;
    var userid = req.session.user._id;

    billDAL.update({status: 1, $or: [{creditor: userid, debitor: receiver}, {debitor: userid, creditor: receiver}]}, {status: 2}, {multi: true}, function(err, count) {
        res.send(count);
    });
}

exports.relations = function(req, res) {
    var partner = req.query.p;
    var userid = req.session.user._id;

    billDAL.find({status: 1, $or: [{creditor: partner, debitor: userid}, {debitor: partner, creditor: userid}]}).toArray(function(err, docs){
        res.send(docs);
    })

}