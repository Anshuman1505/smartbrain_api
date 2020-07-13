const express = require('express');
const bodyparser = require('body-parser');
const bcrypt = require('bcrypt');
const cors = require('cors');
const knex = require('knex');
 
 const db = knex({
 	client: 'pg',
  connection: {
    host : '127.0.0.1',
    user : 'postgres',
    password : 'user',
    database : 'smart_brain'
 }
})
db.select('*').from('users').then(data=>{
	console.log(data);
})

const app = express();
app.use(bodyparser.json());
app.use(cors());

app.get('/',(req,res) =>{
	res.send(database.users);
});

app.post('/signin',(req,res)=>{
	if(!req.body.email || !req.body.password){
		return  res.status(400).json('invalid credentials');
	}
	db.select('email','hash').from('login')
		.where('email','=',req.body.email)
		.then(data =>{
			if(bcrypt.compareSync(req.body.password,data[0].hash)){
				db.select('*').from('users').where('email','=',req.body.email)
					.then(user=>{
						res.json(user[0]);
				}).catch(err=>res.status(400).json('unable to get user'));
			}else{
			res.status(400).json('wrong credentials');
			}
		}).catch(err=>res.status(400).json('wrong credentials'));
})

app.post('/register',(req,res)=>{
	// let hashpass = "";
	// bcrypt.hash(req.body.password,1).then(hash=>{
	// 	hashpass = hash;
	// 	//console.log(1,hashpass);
	// 	database.login.push({
	// 		id:'125',
	// 		email:req.body.email,
	// 		hash:hashpass
	// 	})
	// 	res.json(database.login[database.login.length - 1]);
	// });
	//console.log(2,hashpass);
	const{email,name,password} = req.body; //destructuring
	//console.log(req.body);
	if(!email || !name || !password){
		return  res.status(400).json('incorrect form submission');
	}
	const hash = bcrypt.hashSync(password,1);
	console.log(hash);
	db.transaction(trx=>{
		trx.insert({
			hash:hash,
			email:email
		})
		.into('login')
		.returning('email')
		.then(loginEmail=>{
			return trx('users').returning('*').insert({  // returning returns the row added
				email:loginEmail[0],
				name:name,
				joined:new Date()
			}).then(user=>{
				res.json(user[0]);
			})
		}).then(trx.commit)
		.catch(trx.rollback)
	})
	.catch(err=>res.status(400).json('unable to register'));
	//res.json(database.users[database.users.length - 1]);
	// res.json(database.login[database.login.length - 1]);
})

app.get('/profile/:id',(req,res)=>{
	const { id }= req.params;
	db.select('*').from('users').where({
		id:id
	}).then(user=>{
		if(user.length){
			res.json(user[0]);
		}else{
			res.status(400).json('Not found');
		}
	})
})

app.put("/image",(req,res)=>{
	const { id }= req.body;
	db('users').where('id','=',id)
	.increment('entries',1)
	.returning('entries')
	.then(entries=>{
		res.json(entries[0]);
	}).catch(err=> res.status(400).json('enable to return entries'));

})

app.listen(3000,()=>{
	console.log('app is running on port 3000');
})
