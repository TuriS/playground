const passport = require('passport');
const auth = require('passport-local-authenticate');
const jwt = require('jsonwebtoken');
const Collections = require('./dbToolkit').Collections;
const properties = require('../../conf/properties.js');

const JwtStrategy = require('passport-jwt').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

const loginPath = properties.basePath + '/login';
const cookieName = 'remember_me';
const maxAge = 604800000; // 7 days
const secretKey = 'jqbDNl3boF';

const getUserData = function(user) {
    return {
        id: user._id,
        username: user.name,
        password: user.password,
        admin: user.roles.indexOf("admin") > -1,
        salt: user.salt
    };
};
/* jshint ignore: start */
const findUserById = async (id) => {
    return await Collections.user.findOne({"_id" : id});
};

const findUserByUsername = async (username) => {
    return await Collections.user.findOne({"name" : username});
};

const getUserRoles = function(user) {
    return user.roles;
};

const getRoleName = function(role) {
    return role.name;
};

const isRememberMeChecked = function(req) {
    return req.body.rememberMe === 'on';
};

const isSecureSession = function(req) {
    return req.body.secureSession === 'on';
};

const authenticate = function(app, user) {
    let userData = getUserData(user);
    
    app.locals.authenticatedUser = {
        id: userData.id,
        username: userData.username,
        admin: userData.admin
    };
    
    app.locals.authenticated = true;
};

const deauthenticate = function(app) {
    app.locals.authenticated = false;
    
    delete app.locals.authenticatedUser;
};

const createToken = function(user, device) {
    let payload = {
        id: getUserData(user).id,
        expirationDate: new Date().getTime() + maxAge
    };
    
    if (device) {
        payload.device = device;
    }
    
    return jwt.sign(payload, secretKey);
};

const createDeviceFingerprint = function(req) {
    let fingerprint = req.headers['user-agent'];
    
    if (isSecureSession(req)) {
        fingerprint += req.connection.remoteAddress;
    }
    
    return fingerprint;
};

const isValidPassword = function(user, password) {
    let userData = getUserData(user);
    let hashed = { hash: userData.password, salt: userData.salt };
    
    return new Promise((resolve, reject) => {
        auth.verify(password, hashed, function(err, verified) {
            if (verified) {
                resolve(verified);
            } else {
                reject(err);
            }
        });
    });
};
//https://www.npmjs.com/package/passport-local-authenticate
const createHashKey = (password) => {
    return new Promise((resolve, reject) => {
        auth.hash(password, (err, hashed) => {
            resolve({"hash": hashed.hash, "salt": hashed.salt});
        });
    });
}

module.exports.init = function(app) {
    passport.use(new JwtStrategy({
        
        jwtFromRequest: ExtractJwt.fromExtractors([function(req) {
            let token = null;
            if (req && req.cookies) {
                token = req.cookies[cookieName];
            }
            return token;
        }]),
        secretOrKey: secretKey,
        passReqToCallback: true
    }, function(req, jwtPayload, done) {
        findUserById(jwtPayload.id).then((user) => {
            if (user && 
                    Number(jwtPayload.expirationDate) > new Date().getTime() && 
                    (!jwtPayload.device || jwtPayload.device === createDeviceFingerprint(req))) {
                authenticate(app, user);
                
                return done(null, user);
            }
            
            return done(null, false);
        });
    }));
    
    passport.use(new LocalStrategy(
        function(username, password, done) {
            findUserByUsername(username).then((user) => {
                if (!user) {
                    return done(null, false, { message: 'Incorrect username.' });
                }
                isValidPassword(user, password).then(() => {
                    authenticate(app, user);
                    
                    return done(null, user);
                }).catch((error) => {
                    return done(null, false, { message: 'Incorrect password.' });
                });
            });
        }
    ));
    
    passport.serializeUser(function(user, done) {
        done(null, getUserData(user).id);
    });

    passport.deserializeUser(function(id, done) {
        findUserById(id).then((user) => {
            let err;
            
            if (!user) {
                err = "User not found";
            }
            
            done(err, user);
        });
    });

    app.use(passport.initialize());
    app.use(passport.session());
};

module.exports.hash = auth.hash;
module.exports.isValidPassword = isValidPassword;

// Middleware

module.exports.secured = function(roles) {
    return function(req, res, next) {
        if (req.isAuthenticated()) {
            let hasRole = false;
            
            if (roles) {
                getUserRoles(req.user).forEach((role) => {
                    if ((Array.isArray(role) && roles.contains(getRoleName(role))) ||
                            getRoleName(role) === roles) {
                        hasRole = true;
                        
                        return;
                    }
                });
            } else {
                hasRole = true;
            }
            
            if (hasRole) {
                return next();
            }
        }
        passport.authenticate([ 'local', 'jwt' ], {
            failureRedirect: loginPath
        })(req, res, next);
    };
};

module.exports.login = [
    passport.authenticate('local', { failureRedirect: loginPath, failureFlash: true }),
    function(req, res, next) {
        // Issue a remember me cookie if the option was checked
        // if (isRememberMeChecked(req)) {
            let token = createToken(req.user, createDeviceFingerprint(req));
            
            res.cookie(cookieName, token, { path: properties.basePath + '/', httpOnly: true, maxAge: maxAge });
            
            return next();
        // } else {
        //     return next();
        // }
    }
];

module.exports.logout = function(req, res, next) {
    deauthenticate(req.app);
    
    res.clearCookie(cookieName, { path: properties.basePath + '/' });
    req.logOut();
    
    next();
};

