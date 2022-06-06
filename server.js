const express = require('express');
const bcrypt = require('bcrypt-nodejs')
const app = express();
const cors = require('cors');
const knex = require('knex');
const signin =require ('./controllers/signin');
const register =require ('./controllers/register');
const profile =require ('./controllers/profile');
const image =require ('./controllers/image');


const db = knex({
  client: 'pg',
  connection: {
  	host : process.env.DATABASE_URL,
    ssl:true,
  },
});

app.use(express.json())

app.use(cors())

app.get('/',(req,res)=>{
	res.send('test');
})

app.post('/signin',(req,res) => {signin.handleSignin(req,res,db,bcrypt)})
app.post('/register', (req,res) => {register.handleRegister(req,res,db,bcrypt)})
app.get('/profile/:id',(req,res) => { profile.handleProfileGet(req,res,db)})
app.put("/image",(req,res) =>{ image.handleImage(req,res,db)})
app.post("/imageurl",(req,res) =>{ image.handleApiCall(req,res)})


const PORT = 3001;
app.listen(PORT, ()=>{
	console.log(`app is running on port ${PORT}`);
})