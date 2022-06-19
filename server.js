const express = require('express');
const bcrypt = require('bcrypt-nodejs')
const app = express();
const cors = require('cors');
const knex = require('knex');
const signin = require ('./controllers/signin');
const register = require ('./controllers/register');
const profile = require ('./controllers/profile');
const image = require ('./controllers/image');
const signout = require ('./controllers/signout');
const root = require ('./controllers/root');
const session = require('express-session');

const devFront = "http://localhost:3000"
const deployFront = "https://big-brain-smart.herokuapp.com"

// db settings when developing
const devDb = {
  client: 'pg',
  connection: {
    host : '127.0.0.1',
    port : 5432,
    user : 'postgres',
    password : 'test',
    database : 'smart-brain'
  }
}
// deployment db settings
const deployDb ={
  client: 'pg',
  connection: {
    connectionString : process.env.DATABASE_URL,
    ssl: {
    rejectUnauthorized: false
  }
  },
};

// the database
const db = knex(devDb);

//
app.use(express.json());
app.use(express.urlencoded({extended: true}));
//

app.use(cors({
    origin: devFront,
    credentials: true,
}))
  

//secure false on deploy
const oneDay = 1000 * 60 * 60 * 24;
app.use(session({
  secret: '8B2ABEF6E81349189910F011A7FF11FB',
  resave: false,
  proxy: true,
  saveUninitialized: true,
  cookie: { maxAge: oneDay}
}))

//Checks if user was previously signed in and logs them in if they were
app.get('/',(req,res) => {root.handleSession(req,res,session,db)})
app.delete('/signout', (req,res) => {signout.handleSignout(req,res,session)})
app.post('/signin',(req,res) => {signin.handleSignin(req,res,db,bcrypt,session)})
app.post('/register', (req,res) => {register.handleRegister(req,res,db,bcrypt,session)})
app.get('/profile/:id',(req,res) => { profile.handleProfileGet(req,res,db)})
app.put('/image',(req,res) =>{ image.handleImage(req,res,db)})
app.post('/imageurl',(req,res) =>{ image.handleApiCall(req,res)})




const PORT = 3001 ;
app.listen(PORT , ()=>{
	console.log(`app is running on port ${PORT}`);
})

