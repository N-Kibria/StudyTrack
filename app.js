const express = require('express');
const path = require('path');
const session = require('express-session');
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
  const publicPaths = ['/', '/login', '/register'];
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



app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(ensureAuthenticated);
// Routes
app.use('/register', registerRoutes);
app.use('/login', loginRoutes);
app.use( dashboardRoutes);
app.use(subjectRoutes);
app.use(sessionRoutes);
app.use(discussionRoutes);
app.use(reportRoutes);
app.use("/api", quizRoutes);
// Root route to redirect to login page
app.get('/', (req, res) => {
  res.redirect('/register');
});

const PORT =  3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
