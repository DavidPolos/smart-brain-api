const express = require('express');
const bcrypt = require('bcrypt-nodejs')
const app = express();
const cors = require('cors');
const knex = require('knex');
const signin = require ('./controllers/signin');
const register = require ('./controllers/register');
const profile = require ('./controllers/profile');
const image = require ('./controllers/image');
const session = require('express-session');



const db = knex({
  client: 'pg',
  connection: {
    connectionString : process.env.DATABASE_URL,
    ssl: {
    rejectUnauthorized: false
  }
  },
});

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use(cors({
    origin: 'https://big-brain-smart.herokuapp.com',
    credentials: true,
}))
  


const oneDay = 1000 * 60 * 60 * 24;

app.use(session({
  secret: '8B2ABEF6E81349189910F011A7FF11FB',
  resave: false,
  proxy: true,
  saveUninitialized: true,
  cookie: { maxAge: oneDay, sameSite:"none",secure: true}
}))


app.get('/',(req,res)=>{
  if(req.session.email){
    return db.select('*').from('users')
    .where('email', '=', req.session.email)
    .then(user =>{
      res.json(user[0])
    })
    .catch(err => res.status(400).json('error'))
  }
  else{
    res.json("no session")
  }
})


app.delete('/signout', (req,res) => {
  try {
    delete req.session.email;
    res.send('session deleted');
  } catch (error){
    res.status(400).json("couldn't delete session")
  }
})


app.post('/signin',(req,res) => {signin.handleSignin(req,res,db,bcrypt,session)})
app.post('/register', (req,res) => {register.handleRegister(req,res,db,bcrypt,session)})
app.get('/profile/:id',(req,res) => { profile.handleProfileGet(req,res,db)})
app.put('/image',(req,res) =>{ image.handleImage(req,res,db)})
app.post('/imageurl',(req,res) =>{ image.handleApiCall(req,res)})




const PORT = process.env.PORT;
app.listen(PORT , ()=>{
	console.log(`app is running on port ${PORT}`);
})

