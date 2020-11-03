const express = require('express');
const cors = require('cors');

const app = express();

app.use(express.json());
app.use(cors());

const database = {
	users: [
		{
			id: '123',
			name: 'John Bull',
			email: 'john@gmail.com',
			password: 'cookies',
			entries: 0,
			joined: new Date()
		},
		{
			id: '124',
			name: 'Sally Paul',
			email: 'sally@gmail.com',
			password: 'bananas',
			entries: 0,
			joined: new Date()
		}
	]
}

app.get('/', (req,res) => {
	res.json(database.users);
})

app.post('/signin', (req,res) => {
	const { email, password } = req.body;
 	database.users.filter(user => {
		if(email === user.email && password === user.password) {
			return res.json(user);
		}
	})
	res.status(400).json('signin failure');
})

app.post('/register', (req,res) => {
	const { email, name, password } = req.body;
	const newUser = {
		id: '1234', //Should probably use UUID instead
		name: name,
		email: email,
		password: password,
		entries: 0,
		joined: new Date()
	}
	database.users.push(newUser);
	res.json(newUser);
})

app.post('/profile/:id', (req,res) => {
	const { id } = req.params;
	let found = false;
 	database.users.filter(user => {
		if(id === user.id) {
			found = true;
			return res.json(user);
		}
	})
	if(!found){
		res.status(404).json('User Not Found!');
	}
})

app.put('/imageEntry', (req, res) => {
	const { id } = req.body;
	let found = false;
 	database.users.filter(user => {
		if(id === user.id) {
			found = true;
			user.entries++
			return res.json(user.entries);
		}
	})
	if(!found){
		return res.status(404).json('User Not Found!');
	}
})


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server currently running on http://localhost:${PORT}`));
