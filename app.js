const db = require('./db');
const express = require('express');
const path = require('path');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require("passport-github2").Strategy;
const LocalStrategy = require('passport-local').Strategy; 
const fileUpload = require("express-fileupload");
require('dotenv').config();


const app = express();
app.use('/htmls', express.static(path.join(__dirname, 'htmls')));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));


const registerRoutes = require('./routes/register.routes');
const loginRoutes = require('./routes/login.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const subjectRoutes =require('./routes/subject.routes')
const sessionRoutes =require('./routes/session.routes')
const discussionRoutes= require('./routes/discussion.routes')
const reportRoutes= require('./routes/report.routes')
const quizRoutes = require("./routes/quiz.routes");

function ensureAuthenticated(req, res, next) {
  const publicPaths = ['/', '/login', '/register','/auth/google','/auth/google/callback','/auth/github','/auth/github/callback'];
  if (publicPaths.includes(req.path) || req.session.isAuthenticated) {
      return next();
  }
  res.redirect('/login');
}
app.use(fileUpload());
app.use(session({
  secret: 'your-secret-key', 
  resave: false,
  saveUninitialized: true,
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "http://localhost:3001/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const user = await db.user.findUnique({
      where: { email: profile.emails[0].value }
    });

    if (!user) {
    
      const newUser = await db.user.create({
        data: {
          
          email: profile.emails[0].value,
          password: null, 
        }
      });

      newUser.isNewUser = true; 
      return done(null, newUser);
    }

    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}));

passport.use(new LocalStrategy({
    usernameField: 'email', 
    passwordField: 'password'
  },
  async (email, password, done) => {
    try {
      const user = await db.user.findUnique({
        where: { email }
      });

      if (!user) {
        return done(null, false, { message: 'Incorrect email.' });
      }

      if (!user.password) {
        return done(null, false, { message: 'No password set. Please log in with Google.' });
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return done(null, false, { message: 'Incorrect password.' });
      }

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
));

passport.use(new GitHubStrategy(
  {
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: "http://localhost:3001/auth/github/callback",
    scope: ['user:email']
  },
  async(accessToken, refreshToken, profile, done) => {
    try {

      if (!profile.emails || profile.emails.length === 0) {
        return done(new Error("GitHub profile doesn't have an email."));
      }

      const user = await db.user.findUnique({
        where: { email: profile.emails[0].value }
      });
  
      if (!user) {
      
        const newUser = await db.user.create({
          data: {
            email: profile.emails[0].value,
            password: null, 
          }
        });
  
        newUser.isNewUser = true; 
        return done(null, newUser);
      }
  
      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }
)
);

passport.serializeUser((user, done) => {
  console.log("Serializing user:", user);
  done(null, { email: user.email, id: user.id }); 
});

passport.deserializeUser(async (userData, done) => {
  console.log("Deserializing user:", userData);
  try {
    
    const user = await db.user.findUnique({ where: { email: userData.email } });
    console.log("Deserialized user:", user);
    done(null, user);
  } catch (err) {
    console.error("Error deserializing user:", err);
    done(err, null);
  }
});


app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    if (req.user) {
      req.session.userId = req.user.id; 
    req.session.email = req.user.email; 
    req.session.isAuthenticated = true; 
      if (req.user.isNewUser) {
        res.redirect('/register');
      } else {
        res.redirect('/dashboard');
      }
    } else {
      res.redirect('/login');
    }
  }
);


app.get(
  "/auth/github",
  passport.authenticate("github", { scope: ["user:email"] })
);

app.get(
  "/auth/github/callback",
  passport.authenticate("github", { failureRedirect: "/login" }),
  (req, res) => {
      if (req.user) {
        req.session.userId = req.user.id;  
        req.session.email = req.user.email; 
        req.session.isAuthenticated = true;
        res.redirect('/dashboard');
        
      } else {
        res.redirect('/login');
      }
    }
);



app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(ensureAuthenticated);

app.use('/register', registerRoutes);
app.use('/login', loginRoutes);
app.use( dashboardRoutes);
app.use(subjectRoutes);
app.use(sessionRoutes);
app.use(discussionRoutes);
app.use(reportRoutes);
app.use("/api", quizRoutes);

app.get('/', (req, res) => {
  res.redirect('/register');
});

const PORT =  3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
