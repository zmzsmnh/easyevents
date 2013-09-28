
/*
 * GET home page.
 */

exports.index = function(req, res){

    if(req.session.user) {
        res.render('index', { title: 'Express' });
    } else {
        res.render('login');
        console.log('login');
    }
};