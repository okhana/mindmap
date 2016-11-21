/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');

var user = require('./routes/user');
var projects = require('./routes/projects');

var http = require('http');
var path = require('path');
var flash = require('connect-flash');
var ejs = require('ejs');

var dbConnect = require('./config/database');
dbConnect(process.env.MONGOLAB_URI || 'mongodb://localhost/MindMap');

var passport = require('./config/passport');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.engine('.html', ejs.renderFile);
app.set('view engine','ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(express.static(path.join(__dirname, 'public')));
app.use(function(req,res,next){
    if (req.isAuthenticated() || req.url == '/login' || req.url == '/signup' ){
        return next();
    } else {
        res.redirect('/login');
    }
});
app.use(app.router);

if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

app.get('/', routes.index);

app.get('/login', user.login);
app.get('/signup', user.signup);
app.post('/signup', user.save);
app.post('/login',
    passport.authenticate('local', { successRedirect: '/projects/new',
        failureRedirect: '/login',
        failureFlash: true })
);
app.get('/logout', user.logout);

app.get('/projects', projects.list);
app.get('/projects/new', projects.newProject);
app.get('/projects/:id', projects.findById);
app.post('/projects', projects.save);
app.put('/projects/:id', projects.update);
app.delete('/projects/:id', projects.deleteById);


http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});
