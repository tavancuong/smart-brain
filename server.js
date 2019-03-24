const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
var cors = require('cors');
var knex = require('knex');
const handleRegister = require('./controler/register')
const Clarifai = require('clarifai');


//You must add your own API key here from Clarifai.
const ap = new Clarifai.App({
 apiKey: 'fe892194015740c68862a49d9657c4ab'
});


const db = knex({
  client: 'pg',
  connection: {
    host : '127.0.0.1',
    user : 'postgres',
    password : '01665449685',
    database : 'smart'
  }
});


const app = express();

app.use(bodyParser.json());
app.use(cors());

app.post('/clarifai', (req, res) =>{
	ap.models
      .predict(
        Clarifai.FACE_DETECT_MODEL,
        req.body.input)
      .then(data => res.json(data))
      .catch(err => res.status(400).json('unable to work with API'))
})


app.get('/', (req, res)=>{
	res.send(database.users)
})


app.post('/signin', (req, res)=>{
	const { email, password } = req.body;
	db.select('email', 'hash').from('login')
		.where('email', '=', email)
		.then(data => { 
			const isVaLid = bcrypt.compareSync(password, data[0].hash);
			if(isVaLid){
				db.select('*').from('users')
					.where('email', '=', req.body.email)
					.then( user => res.json(user[0]))
					.catch(err => res.status(400).json('can not log in'))
			}else{
				res.json('either password or email wrong')
			}
		})
		.catch( err => res.status(400).json('either password or email wrong'))
})
	

app.post('/register', handleRegister(db,bcrypt)
)


app.get('/profile/:id', (req,res) =>{
	const {id} = req.params;
	db.where({
	  id: id
	})
  		.select()
		.table('users')
		.then(user=> {
			if (user.length) {
				res.json(user[0])
			}else{
				res.status(400).json("not found!")
			}
		})
		.catch(err=> res.status(400).json('error getting user'))
})


app.put('/image', (req, res)=>{
	const {id} = req.body;
	db('users')
		.where('id', '=', id)
		.increment('entries', 1)
		.returning('entries')
		.then(entries=>res.json(entries[0]))
		.catch(err => res.status(400).json('unable to increment'))
  })		




app.listen(3001, ()=> {
	console.log(`app's working on port 3001`)
})