var http = require('http');
var mongoose = require('mongoose')
var express = require('express')
var app = express();
var path = require('path');
mongoose.connect('mongodb://localhost:27017/login');
var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy;
var flash = require('connect-flash');
var session = require('express-session');
var Schema = mongoose.Schema;



/*app.use(express.static(path.join(__dirname, '/')));*/

var userSchema = new Schema({
    name: String,
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    admin: Boolean
});

var User = mongoose.model('User', userSchema);
module.exports = User;
var obj = {
    username: 'naomi@gmail.com',
    name: 'Naomi',
    password: 'blablabla',
    admin: true
}

User(obj).save((err, result) => {
    if (err) return console.log(err)
    console.log('my NEW name is ' + result);
    res.send('successfully added to DB');
});

User.find({ name: 'Naomi' }, (err, result) => {
    if (err) return console.log(err)

    var naomi = result[0];

    console.log('my current name is ' + naomi);

    naomi.name = 'Nooooooooooooooooomi';
    naomi.save((err, result2) => {
        if (err) return console.log(err)

        console.log('New result is ' + result2);
    });
});


passport.use(new LocalStrategy(
    function(username, password, done) {
        User.findOne({ username: username }, function(err, user) {
            if (err) {
                return done(err);
            }
            if (!user) {
                return done(null, false, { message: 'Incorrect username.' });
            }
            if (!user.validPassword(password)) {
                return done(null, false, { message: 'Incorrect password.' });
            }
            return done(null, user);
        });
    }
));


app.get('/', function(req, res) {
    res.sendFile(__dirname + "/login.html");
});


app.post('/login',
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/login',

    })
);


app.listen(8080)
console.log("Running on port 8080");
