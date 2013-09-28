/**
 * Created with IntelliJ IDEA.
 * User: zmzsmnh
 * Date: 13-9-28
 * Time: 下午2:16
 * To change this template use File | Settings | File Templates.
 */

var collectionName = 'event';
var db = require('./mongo').db;
var dal = db.collection(collectionName);

/**
 * Bind extra functions to dal
 * Format: {function name: function}
 * Example: {save: function(event){...}}
 */
db.bind(collectionName, {
});

exports.dal = dal;