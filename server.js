const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { MongoClient } = require('mongodb');

const app = express();

app.use(express.json());
app.use(cors());

const main = async () => {

	const uri = "mongodb+srv://Mankind:sohibulfay@facerecognition.nrq0k.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

	const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
 
    // Connect to the MongoDB cluster
    await client.connect();
 
    // Make the appropriate DB calls

	app.get('/', (req,res) => {
		findAll(client)
		.then(result => res.json(result))
		.catch(err => console.error(err))
	})

	app.post('/register', (req,res) => {
		const { username, name, password } = req.body;
		if(username === "" || password === "" || name === "" ) {
			res.json("Error")
		} else {
			const newUser = {
				name: name,
				username: username,
				password: password,
				entries: 0,
				joined: new Date()
			}
			createUser(client, newUser)
			.then(result => {
				if (result) {
					return res.json({
						name: name,
						username: username,
						entries: 0,
						joined: new Date()						
					});
				}
			})			
		}
	})

	app.post('/signin', (req,res) => {
		const { username, password } = req.body;
		findOneUserByUsername(client, username, password)
		.then(result => {
			if(result.name) {
				return res.json({
							name: result.name,
							username: result.username,
							entries: result.entries,
							joined: result.joined
						})				
			} else {
				return "Username/Password incorrect"
			}
		})
	})

	app.put('/imageEntry', (req, res) => {
		const { username } = req.body;
		let found = false;
		updateEntriesByUsername(client, username)
		.then(result => {
			getIndexByEntries(client, result)
			.then(count => {
				res.json({entries: result, rank: count})
			})
		})
	})
}

main().catch(console.error)

const createUser = async (client, newUser) => {
    const result = await client.db("users").collection("data").insertOne(newUser);
    if (result) {
        return `New user created with the following id: ${result.insertedId}`;
    } else {
        return false;
    }
}

const findAll = async (client) => {
    const result = await client.db("users").collection("data").find({}).toArray();
    if (result) {
        return result;
    } else {
        return `No users found`;
    }
}

const findOneUserByUsername = async (client, usernameOfUser, passwordOfUser) => {
    const result = await client.db("users").collection("data").findOne({ username: usernameOfUser, password: passwordOfUser });
    if (result) {
        return result;
    } else {
        return `Username/Password incorrect`;
    }
}

const updateEntriesByUsername = async (client, usernameOfUser) => {
    const result = await client.db("users").collection("data")
                        .updateOne({ username: usernameOfUser }, { $inc: {entries: 1} });
    if (result) {
    	const user = await client.db("users").collection("data").findOne({ username: usernameOfUser });
	    if (user) {
	        return user.entries;
	    }
    } else {
    	return "Could not update entries count"
    }
}

const getIndexByEntries = async (client, entriesOfUser) => {
    const result = await client.db("users").collection("data")
    					.find({entries: { $gt : entriesOfUser }}).count() + 1;
    if (result) {
    	return result;
    } else {
    	return "Could not count"
    }
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server currently running on http://localhost:${PORT}`));
