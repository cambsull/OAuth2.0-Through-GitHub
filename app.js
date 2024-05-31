//Imports
const path = require("path");
require('dotenv').config();
const express = require('express');
const partials = require('express-partials');
const session = require('express-session');

const app = express();

//Constant vars
const PORT = 3000;
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

//Configure Passport
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;

passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: 'http://localhost:3000/auth/github/callback'
},
  (accessToken, refreshToken, profile, done) => {
    done(null, profile);
}))

//Handle serialization callback requirements
passport.serializeUser((user, done) => {
  done(null, user);
})

passport.deserializeUser((user, done) => {
  done(null, user);
})

//Configure Express
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(partials());
app.use(express.json());
app.use(express.static(__dirname + '/public'));
app.use(session({
  secret: 'codecademy',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

//Express routing
app.get('/', (req, res) => {
  res.render('index', { user: req.user });
})

app.get('/account', ensureAuthenticated, (req, res) => {
  res.render('account', { user: req.user });
});

app.get('/login', (req, res) => {
  res.render('login', { user: req.user });
})

app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

app.get('/auth/github', passport.authenticate('github', {
  scope: ['user']
}))

app.get('/auth/github/callback', passport.authenticate('github', {
  failureRedirect: '/login',
  successRedirect: '/'
}))

//CB func to check authentication
function ensureAuthenticated (req, res, next){
  if(req.isAuthenticated()) { //Provided via Passport library from authenticate method
    return next();
  }
  res.redirect('/login')
}


//Initialize server

app.listen(PORT, () => console.log(`Listening on ${PORT}`));