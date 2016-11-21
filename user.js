
/*
 * GET users listing.
 */

var User = require('../models/user');
exports.list = function(req, res){
    res.send("respond with a resource");
};

exports.login = function(req, res){
    res.render('login.html',{});
};
exports.signup = function(req, res){
    res.render('singup.html',{});
};
exports.logout = function(req, res){

    req.logout();
    res.redirect('/login');

};
exports.save = function(req, res){

    var body = req.body;
    var newUser = new User({name:body.name, username : body.username, password : body.password});
    User.findOne({username:newUser.username},function(err,user){
        if(err){
            res.redirect('/singup');
        }
        else if(user == null){
            console.log('User has been registered');
            newUser.save(function(err,user){
                res.redirect('/login');
            });
        }
        else{
            res.redirect('/singup');
        }
    });
};