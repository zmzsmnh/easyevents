
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var event = require('./routes/event');
var expense = require('./routes/bill');
var http = require('http');
var path = require('path');
var engine = require('ejs-locals');
var MongoStore = require('connect-mongo')(express);
//var db = require('./models/mongo').db;

var app = express();

// all environments
app.set('port', process.env.PORT || 80)
app.set('views', __dirname + '/views');
app.engine('ejs', engine);
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('easyevents'));
app.use(express.session({
    secret: 'easyevents',
    store: new MongoStore({
        db: 'session'
    })
}));
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.post('/user/login', user.login);
app.get('/user/logout', user.logout);
app.get('/user/list', user.list);
app.post('/event/add', event.add);
app.get('/event/me', event.listmine);
app.post('/expense/claim', expense.claim);
app.get('/expense/check', expense.listclaims);
app.post('/expense/verify', expense.verifyclaim);
app.get('/expense/summary', expense.listbillsummary);
app.post('/expense/pay', expense.pay);
app.get('/expense/detail', expense.relations);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
