var express = require('express');
var exphbs = require('express-handlebars');
var app = express();
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var mongoose = require('mongoose');
var Schema = mongoose.Schema
mongoose.Promise = global.Promise;


app.connect = function connect(opts) {
    mongoose.Promise = global.Promise;
    mongoose.connect(`mongodb://${opts.server}:${opts.port}/${opts.db}`);
    return mongoose.connection;
};

var userSchema = new Schema({
    name: String,
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    admin: Boolean
});

var priceSchema = new Schema({
    price: { type: String, required: true },
    product: { type: String, required: true },
    amount: { type: String, required: true },
    admin: Boolean
});

var User = mongoose.model('User', userSchema);
var listItem = mongoose.model('listItem', priceSchema);

//DO NOT CHANGE - HANDLEBARS!
app.engine('handlebars', exphbs({
    defaultLayout: 'main',
    layoutsDir: './views/layout'
}));
app.set('view engine', 'handlebars');
app.set('views', __dirname + "/views");
app.use(bodyParser.urlencoded({
    extended: false
}));

mongoose.connect('mongodb://localhost/login');

// Create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })

app.use(express.static('public'));
app.get('/budget.html', function(req, res) {
    res.sendFile(__dirname + "/" + "budget.html");
})

app.post('/budget', urlencodedParser, function(req, res) {
    var list = new listItem({
        amount: req.body.amount,
        product: req.body.product,
        price: req.body.price,
        admin: true
    })

    list.save((err) => {
        if (err) throw err;
    });
    console.log(req.body);
    res.render('login', {
        firstlogin: false,
        amount: req.body.amount,
        product: req.body.product,
        price: req.body.price,
        totalprice: req.body.amount * req.body.price,
        fname: req.body.fname,
        lname: req.body.lname

    });
})

app.post('/display', urlencodedParser, function(req, res) {
    // Prepare output in JSON format
    response = {
        first_name: req.body.username,
        last_name: req.body.password
    };
    console.log(response);


    var user = new User({
        username: req.body.username,
        password: req.body.password,
        admin: true
    });



    user.save((err) => {
        if (err) {
        
           return res.redirect('./');


        };
    });
    res.render('login', {
        fname: req.body.username,
        lname: req.body.password,
        firstlogin: true

    });
})


var server = app.listen(8081, function() {
    var host = server.address().address
    var port = server.address().port

    console.log("Example app listening at http://%s:%s", host, port)

})
