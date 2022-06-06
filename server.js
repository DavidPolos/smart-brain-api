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
  	host : 'ec2-3-228-235-79.compute-1.amazonaws.com',
  	user : 'dqnrqelapgstdp',
  	port: 5432,
  	password : 'fadd106b472c3611d5d670b913b77e07dff02e547ee4bc44b171bbb44345c550',
    database: 'dcmlhourdo3cgj'
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


const PORT = process.env.PORT;
app.listen(PORT , ()=>{
	console.log(`app is running on port ${PORT}`);
})