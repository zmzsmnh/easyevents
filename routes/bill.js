/**
 * Created with IntelliJ IDEA.
 * User: zmzsmnh
 * Date: 13-9-28
 * Time: 下午1:33
 * To change this template use File | Settings | File Templates.
 */

var billDAL = require('../models/bill').dal;

exports.claim = function(req, res) {
    var expense = req.body;
    var creditor = req.session.user[0]._id;
    console.log(req.session.user);

    var bills = [];
    for(var i in expense.participants) {
        var bill = {};
        for(var key in expense) {
            bill[key] = expense[key];
        }
        bill.creditor = creditor;
        bill.debitor = expense.participants[i];
        bill.amount = expense.total / expense.participants.length;
        bill.status = 0   //0: Created, 1: Confirmed, 2: Paid, -1: Declined
        bills.push(bill);
    }

    billDAL.insert(bills, {safe: true}, function(err, docs) {
        res.send(docs);
    });
}

exports.listclaims = function(req, res) {
    var userid = req.session.user[0]._id;

    billDAL.find({$or: [{creditor: userid}, {debitor: userid}]}).toArray(function(err, bills) {
        res.send({id: userid, results: bills});
    })
}