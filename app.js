const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');
const auth = require("./modules/toolkits/authToolkit");
const flash = require('connect-flash');

const engineConf = require('./conf/engine');
const localsConf = require('./conf/locals');

const app = express();

localsConf(app.locals);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('.hbs', engineConf(app));

// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public','images', 'cerberus_ico_small.png')));
app.use(logger('dev'));

app.use(bodyParser.json({limit: '5mb'}));
app.use(bodyParser.urlencoded({ limit: '5mb', extended: false }));
app.use(cookieParser());

app.use(session({
    key: 'user_sid',
    secret: 'PqbpsUcGYDA9AAQN6rLF',
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: 600000
    }
}));
app.use((req, res, next) => {
    if (req.cookies.user_sid && !req.session.user) {
        res.clearCookie('user_sid');
    }
    next();
});
app.use(express.static(path.join(__dirname, 'public')));
app.use(flash());
auth.init(app);




module.exports = app;
