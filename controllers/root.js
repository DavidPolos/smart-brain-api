const handleSession = (req,res,session,db)=>{
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
}

module.exports = {
	handleSession
}