const express = require('express');
const { errorLog, errorHandlerNotify } = require('express-error-handle');
const app = express();
const cors = require('cors');
// const dbConnecting = require('./config/db');
const port = process.env.PORT || 3000;
//middleware
app.use(express.json());
app.use(cors())
app.get('/', (req, res) => {
    res.send('request sending...')
});

var passport = require('passport');
var LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
const { CLIENT_ID_LINKEDIN, CLIENT_SECRET_LINKEDIN, REDIRECT_URI } = process.env;
// linkedin app settings
var LINKEDIN_CLIENT_ID = CLIENT_ID_LINKEDIN;
var LINKEDIN_CLIENT_SECRET = CLIENT_SECRET_LINKEDIN;
var Linkedin = require('node-linkedin')(LINKEDIN_CLIENT_ID, LINKEDIN_CLIENT_SECRET);

passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (obj, done) {
    done(null, obj);
});

passport.use(new LinkedInStrategy({
    clientID: CLIENT_ID_LINKEDIN,
    clientSecret: CLIENT_SECRET_LINKEDIN,
    callbackURL: REDIRECT_URI,
    scope: ['r_emailaddress', 'r_basicprofile', 'rw_company_admin'],
    passReqToCallback: true
},
    function (req, accessToken, refreshToken, profile, done) {
        req.session.accessToken = accessToken;
        process.nextTick(function () {
            return done(null, profile);
        });
    }));

// for auth

app.get('/auth/linkedin',
    passport.authenticate('linkedin', { state: 'SOME STATE' }),
    function (req, res) {
        // The request will be redirected to LinkedIn for authentication, so this
        // function will not be called.
    });

// for callback

app.get('/auth/linkedin/callback', passport.authenticate('linkedin', { failureRedirect: '/' }),
    function (req, res) {
        res.redirect('/');
    });

app.listen(port, () => {
    console.log('listening on port', port)
})
app.use(errorLog, errorHandlerNotify)