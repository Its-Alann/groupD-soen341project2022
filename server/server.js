const express = require("express"); //Imports express
const app = express();
const cors = require("cors");
const db = require("./db");
const database = db.db;

app.use(express.json())

app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "YOUR-DOMAIN.TLD"); // update to match the domain you will make the request from
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
  });
  
//api endpoints 

app.get("/", (req, res) => { //req is the request (input) and res is the response (output)
	res.send("This is the heagle backend. You can access the main website at this URL: https://heagle.herokuapp.com");
});

app.post("/registerUser", (req, res) =>{
	const email = req.body.email;
	const password = req.body.password;
	const firstName = req.body.firstName;
	const lastName = req.body.lastName;

	const sqlQuery = 
		`INSERT INTO e5zkwad79wtbvjrc.temp_users (email, password, firstName, lastName)
		VALUES (?,?,?,?)`;

	database.query(sqlQuery, [email, password, firstName, lastName], (err, result)=>{
		if(err){
			console.log(err);
		}
		else{
			res.send("User Successfully Registered")
			console.log(result);
		}
	})
})


const PORT = process.env.PORT || 3001;
app.listen(PORT);