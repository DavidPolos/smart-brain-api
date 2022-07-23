const PORT = 3001 ;
const express = require('express');
const bcrypt = require('bcrypt-nodejs')
const app = express();
const cors = require('cors');
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const knex = require('knex');
const signin = require ('./controllers/signin');
const register = require ('./controllers/register');
const profile = require ('./controllers/profile');
const image = require ('./controllers/image');
const signout = require ('./controllers/signout');
const root = require ('./controllers/root');
const session = require('express-session');
const io = new Server(server,{
  cors: {
    origin: 'http://localhost:3000'
  }
});
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
app.use(cors({
    origin: devFront,
    credentials: true,
}))
//  
//secure false on deploy // Session for remembering login
const oneDay = 1000 * 60 * 60 * 24;
app.use(session({
  secret: '8B2ABEF6E81349189910F011A7FF11FB',
  resave: false,
  proxy: true,
  saveUninitialized: true,
  cookie: { maxAge: oneDay}
}))


//Sockets for 'real time' messaging 
io.on('connection', socket => {
  socket.on('send-message',(message, room) =>{ // takes room from front
    socket.to(room).emit('send-message',message)
  })
})
//


app.get('/',(req,res) => {root.handleSession(req,res,session,db)})
app.delete('/signout', (req,res) => {signout.handleSignout(req,res,session)})
app.post('/signin',(req,res) => {signin.handleSignin(req,res,db,bcrypt,session)})
app.post('/register', (req,res) => {register.handleRegister(req,res,db,bcrypt,session)})
app.get('/profile/:id',(req,res) => { profile.handleProfileGet(req,res,db)})
app.put('/image',(req,res) =>{ image.handleImage(req,res,db)})
app.post('/imageurl',(req,res) =>{ image.handleApiCall(req,res)})
app.get('/messages/:fromuser/:touser', (req,res) => { //gets messages between users from database
  const {fromuser, touser} = req.params;
  db.select('message','fromuser','touser')
  .from('messages').where({fromuser: fromuser,touser: touser})
  .orWhere({fromuser: touser, touser: fromuser})
  .then(messages => res.json(messages))
  .catch(err => "couldn't get messages")
})
app.post('/message/:fromuser/:touser',(req,res)=>{//posts message to database
  const { fromuser, touser } = req.params;
  const { message } = req.body;
  db('messages').insert({message: message, fromuser: fromuser,touser: touser})
  .then(res.status(200).json("message sent"))
  .catch(res.status(400).json("failed to send message"))
})
app.post('/friendrequest/:userId/:reqUserId',(req,res) => {
  const { userId, reqUserId} = req.params;
  console.log(userId)
  db('friendrequest').insert({fromuser: userId, touser: reqUserId})
  .then(res.status(200).json("friend request sent"))
  .catch(err => res.status(400).json("failed to send friend request"))
})
app.post('/addfriend', (req,res) => {
  const {user1, user2} = req.body;
  db('friendlist').insert({user1: user1, user2: user2})
  .then(res.status(200).json("friend added"))
  .catch(err => res.status(400).json("failed to add friend"));
})
app.delete('/friendrequest',(req,res) => {
  const {user, requestUser} = req.body;
  console.log(requestUser)
  db('friendrequest').where('fromuser',requestUser)
  .del()
  .then(res.status(200).json("friend deleted"))
  .catch(res.status(400).json("couldn't delete friend"));
})
app.put('/pfp',(req,res)=> {
  const {pfp,id} = req.body;
  console.log(pfp)
  console.log(id)
  db('users').where('id', '=',id).update({pfp:pfp})
  .then(res.status(200).json('request success'))
  
})
app.delete('/removefriend',(req,res) => {
  const {user, friend} = req.body;
  db('friendlist').where({user1: user, user2: friend})
  .orWhere({user1: friend, user2: user})
  .del()
  .then(res.status(200).json("friend deleted"))
  .catch(err => res.status(400).json("unable to remove friend"))
})
app.get('/users/:userId', (req,res) => {
  const {userId} = req.params;
  db.select('touser').from('friendrequest').where({fromuser:userId})
  .unionAll([db.select('fromuser').from('friendrequest').where({touser:userId})])
  .unionAll([db.select('user1').from('friendlist').where({user2:userId})])
  .unionAll([db.select('user2').from('friendlist').where({user1:userId})])
  //Selects all users that are friends with the user and all where there is pending
  //friendrequest
  .then(data => {
    const toFilterFromUsers = data.map(data => data.touser);
    toFilterFromUsers.push(parseInt(userId))
    //Creates array of all their id's and the main users id
    db('users').then(users => {
      filteredUsers = users.filter(el =>{
        return !toFilterFromUsers.includes(el.id)
        //returns all users from database that are /not/ the user/their friends
        //nor people the user has a pending friendrequest with
      })
      res.json(filteredUsers)
    })
  })

.catch(err => res.status(400).json("couldn't 'get' users"))
})

app.get('/:user/friends',(req,res) => {
  const {user} = req.params;
  //gets friends from db for friendslist.
  db.select('user1').from('friendlist').where({user2:user})
  .unionAll([db.select('user2').from('friendlist').where({user1:user})])
  .then(data => { 
    const someConst = data.map(data=> data.user1);
    db('users').then(users => {
      filteredUsers = users.filter(el =>{
        return someConst.includes(el.id)
      })
      res.json(filteredUsers)
    })
  })
  .catch(err => res.status(200).json("couldn't 'get' friends"))
})
  

//users where it isnt current user or current users friends
//get current userId from body
//get current user friendsId from db 
//remove them from list of users





server.listen(PORT , ()=>{
	console.log(`app is running on port ${PORT}`);
})

