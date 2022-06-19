const handleSignout = (req,res,session) => {
  try {
    delete req.session.email;
    res.send('session deleted');
  } catch (error){
    res.status(400).json("couldn't delete session")
  }
}

module.exports = {
	handleSignout
}