const express = require("express"); //Imports express
const app = express();
const cors = require("cors");
const mySql = require("mysql");
const db = require("./db");
const { restart } = require("nodemon");

app.use(cors());
app.use(express.json());

app.use(function (req, res, next) {
	res.header("Access-Control-Allow-Origin", "https://heagle.herokuapp.com"); // update to match the domain you will make the request from
    // res.header("Access-Control-Allow-Origin", "http://localhost:3000"); // update to match the domain you will make the request from
	res.header(
		"Access-Control-Allow-Headers",
		"Origin, X-Requested-With, Content-Type, Accept"
	);
	next();
});

//-----------------------------api endpoints----------------------------------------------------//

//Root endpoint (when accessing the base url of the server)
app.get("/", (req, res) => {
	//req is the request (input) and res is the response (output)
	res.send(
		"This is the heagle backend. You can access the main website at this URL: https://heagle.herokuapp.com"
	);
});

//Retrieve Individual Product from Db
app.get("/getProduct/:id", (req, res) => {
	const searchId = req.params.id;
	const sqlQuery =
		"SELECT * FROM e5zkwad79wtbvjrc.products WHERE id='" + searchId + "'";
	db.query(sqlQuery, (err, results) => {
		if (err) {
			throw err;
		} else {
			res.send(results);
		}
	});
});

//Retrieve product quantity and price from Db
app.get("/getProductQty/:id", (req, res) => {
	const searchId = req.params.id;
	const sqlQuery =
		"SELECT price, quantity FROM e5zkwad79wtbvjrc.products WHERE id='" + searchId + "'";
	db.query(sqlQuery, (err, results) => {
		if (err) {
			throw err;
		} else {
			// console.log(results)
			res.send(results);
		}
	});
});

//Retrieve Products from Db
app.get("/fetchProductList", (req, res) => {
	const sqlQuery = `SELECT * FROM  e5zkwad79wtbvjrc.products
	`;
	db.query(sqlQuery, (err, result) => {
		if (err) {
			console.log(err);
		} else {
			res.send(result);
		}
	});
});

//Removes a product based on its id
app.delete("/removeProduct", (req, res) => {
	const id = req.body.id;
	const sellerID = req.body.sellerID;

	const sqlQuery =
		"DELETE FROM e5zkwad79wtbvjrc.products WHERE id = ? and sellerID = ?";

	db.query(sqlQuery, [id, sellerID], (err, result) => {
		if (err) {
			console.log(err);
			res.send(err);
		} else {
			res.send("Product with id " + id + " has been successfully deleted");
		}
	});
});

app.post("/editProduct", (req, res) => {
	const id = req.body.id;
	const name = req.body.name;
	const description = req.body.description;
	const price = req.body.price;
	const quantity = req.body.quantity;
	const imageUrl = req.body.imageURL;
	const type = req.body.type;
	const sellerID = req.body.sellerID;

	const sqlQuery =
		"UPDATE e5zkwad79wtbvjrc.products SET name = ?, description = ?, price = ?, quantity = ?, imageUrl = ?, type = ? WHERE id = ? AND sellerID = ?";

	db.query(
		sqlQuery,
		[name, description, price, quantity, imageUrl, type, id, sellerID],
		(err, result) => {
			if (err) {
				console.log(err);
				res.send(err);
			} else {
				res.send("Product succesfully added to the database");
			}
		}
	);
});

//Insert  User type (seller) to temp_user Db, when Admin accepts
app.post("/acceptSeller", (req, res) => {
	const sellerID = req.body.sellerID;
	const typeUser = req.body.typeUser;

	const sqlQuery =
	"UPDATE e5zkwad79wtbvjrc.temp_users SET typeUser = ? WHERE id=" + sellerID;
	db.query(sqlQuery,[typeUser],
	(err, result) => {
		if (err) {
			console.log(err);
			res.send(err);
		} else {
			res.send("Admin completed task: user " + sellerID + " is now a Seller.");
		}
	});
});

//Insert  User type (customer) to temp_user Db, when Admin refuses
app.post("/refuseSeller", (req, res) => {
	const sellerID = req.body.sellerID;
	const typeUser = req.body.typeUser;

	const sqlQuery =
	"UPDATE e5zkwad79wtbvjrc.temp_users SET typeUser = ? WHERE id=" + sellerID;
	db.query(sqlQuery,[typeUser],
	(err, result) => {
		if (err) {
			console.log(err);
			res.send(err);
		} else {
			res.send("Admin completed task: user " + sellerID + " is now a Customer.");
		}
	});
});

//Insert User Info to Db
app.post("/registerUser", (req, res) => {
	const email = req.body.email;
	const password = req.body.password;
	const firstName = req.body.firstName;
	const lastName = req.body.lastName;
	const typeUser = req.body.typeUser;

	// Include typeUser
	if(typeUser == "customer"){
		const sqlQuery = `INSERT INTO e5zkwad79wtbvjrc.temp_users (email, password, firstName, lastName, typeUser)	
		VALUES (?,?,?,?,?)`;

		db.query(sqlQuery, [email, password, firstName, lastName, typeUser], (err, result) => {
			if (err) {
				console.log(err);
			} else {
				// res.send("User Successfully Registered");
				res.send(""+result.insertId);
			} 
		});
	}
	// Don't include typeUser
	else if (typeUser == "seller"){
		const sqlQuery = `INSERT INTO e5zkwad79wtbvjrc.temp_users (email, password, firstName, lastName)
		VALUES (?,?,?,?)`;

		db.query(sqlQuery, [email, password, firstName, lastName], (err, result) => {
			if (err) {
				console.log(err);
			} else {
				// res.send("User Successfully Registered");
				res.send(""+result.insertId);
			} 
		});
	}
});

//Insert user request to become seller to admin_actions Db
app.post("/requestSellerType/:id", (req, res) => {
	const sellerID = req.body.id;
	const typeUser = req.body.typeUser;

	const sqlQuery = `INSERT INTO e5zkwad79wtbvjrc.admin_actions (sellerID, typeUser)
		VALUES (?,?)`;

	db.query(sqlQuery, [sellerID, typeUser], (err, result) => {
		if (err) {
			console.log(err);
		} else {
			res.send("Seller's request entered successfully");
		}
	});
});

//Retrieve admin action(s) from Db
app.get("/getAdminActions", (req, res) => {
	const sqlQuery =
		"SELECT * FROM e5zkwad79wtbvjrc.admin_actions";
	db.query(sqlQuery, (err, results) => {
		if (err) {
			throw err;
		} else {
			res.send(results);
		}
	});
});

//Retrieve User Info from Db
app.get("/getUser/:id", (req, res) => {
	const searchId = req.params.id;
	const sqlQuery =
		"SELECT * FROM e5zkwad79wtbvjrc.temp_users WHERE id='" + searchId + "'";
	db.query(sqlQuery, (err, results) => {
		if (err) {
			throw err;
		} else {
			res.send(results);
		}
	});
});

//Retrieve all users from db
app.get("/fetchUserList", (req, res) => {
	const sqlQuery = `SELECT * FROM  e5zkwad79wtbvjrc.temp_users;`;
	db.query(sqlQuery, (err, result) => {
		if (err) {
			console.log(err);
		} else {
			res.send(result);
		}
	});
});

//Removes a user based on its id
app.delete("/removeUser", (req, res) => {
	const id = req.body.id;
	const typeUser = req.body.typeUser;

	if(typeUser != 'admin'){
		res.send("Operation failed: only admin accounts can remove users.")
	}
	else{
		const sqlQuery = "DELETE FROM e5zkwad79wtbvjrc.temp_users WHERE id = ?";
		db.query(sqlQuery, [id], (err, result) => {
			if (err) {
				console.log(err);
				res.send(err);
			}
			else {
				res.send("User with id " + id + " has been successfully deleted");
			}
		})
	}
	
})

//Removes an admin's action (user request to be seller) based on user's id, when admin manages this user's account
app.delete("/removeAdminAction", (req, res) => {
	const sellerID = req.body.sellerID;
	const typeUser = req.body.typeUser;

	const sqlQuery = "DELETE FROM e5zkwad79wtbvjrc.admin_actions WHERE sellerID = ?";
	db.query(sqlQuery, [sellerID], (err, result) => {
		if (err) {
			console.log(err);
			res.send(err);
		}
		else {
			res.send("User " + sellerID + " has been successfully deleted from Admin Actions");
		}
	})
	
})

//Removes a cart based on its id
app.delete("/removeCart", (req, res) => {
	const userId = req.body.userId;

	const sqlQuery =
		"DELETE FROM e5zkwad79wtbvjrc.carts WHERE userId = ?";

	db.query(sqlQuery, [userId], (err, result) => {
		if (err) {
			console.log(err);
			res.send(err);
		} else {
			res.send("cart with id " + userId + " has been successfully deleted");
		}
	});
});

//Retrieve User Info from Db by email
app.get("/getUserByEmail/:email", (req, res) => {
	const searchEmail = req.params.email;
	const sqlQuery =
		"SELECT * FROM e5zkwad79wtbvjrc.temp_users WHERE email='" +
		searchEmail +
		"'";
	db.query(sqlQuery, (err, results) => {
		if (err) {
			throw err;
		} else {
			res.send(results);
		}
	});
});

//Update User Info to Db
app.post("/updateUser", (req, res) => {
	const password = req.body.password;
	const email = req.body.email;
	const phoneNumber = req.body.phoneNumber;
	const firstName = req.body.firstName;
	const lastName = req.body.lastName;
	const typeUser = req.body.typeUser;
	const typeSeller = req.body.typeSeller;
	const searchId = req.body.userID;

	const sqlQueryParams =
		"email = '" +
		email +
		"', " +
		"password = '" +
		password +
		"', " +
		"firstName = '" +
		firstName +
		"', " +
		"lastName = '" +
		lastName +
		"', " +
		"phoneNumber = '" +
		phoneNumber +
		"', " +
		"typeUser = '" +
		typeUser +
		"', " +
		"typeSeller = '" +
		typeSeller +
		"'";

	const sqlQuery =
		"UPDATE e5zkwad79wtbvjrc.temp_users SET " +
		sqlQueryParams +
		" WHERE id = '" +
		searchId +
		"'";

	db.query(sqlQuery, (err, result) => {
		if (err) {
			console.log(err);
		} else {
			res.send("User Successfully Updated Info");
			// console.log(result);
		}
	});
});

//Retrieve Seller's Product(s) from Db
app.get("/getSellerProducts/:id", (req, res) => {
	const searchId = req.params.id;
	const sqlQuery =
		"SELECT * FROM e5zkwad79wtbvjrc.products WHERE sellerID='" + searchId + "'";
	db.query(sqlQuery, (err, results) => {
		if (err) {
			throw err;
		} else {
			res.send(results);
		}
	});
});

//Insert new product into db
app.post("/addProduct", (req, res) => {
	const productName = req.body.productName;
	const imageURL = req.body.imageURL;
	const quantity = req.body.quantity;
	const description = req.body.description;
	const price = req.body.price;
	const type = req.body.type;
	const sellerID = req.body.sellerID;

	const sqlQuery = `INSERT INTO e5zkwad79wtbvjrc.products (name, imageURL, quantity, description, price, type, sellerID)
		VALUES (?,?,?,?,?,?,?)`;

	db.query(
		sqlQuery,
		[productName, imageURL, quantity, description, price, type, sellerID],
		(err, result) => {
			if (err) {
				console.log(err);
			} else {
				res.send("Product Successfully Added");
				// console.log(result);
			}
		}
	);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT);


//-----Cart-----//
app.post("/createCart", (req, res)=>{
	const id = req.body.id;
	const userId = req.body.userId;
	const cartContent = req.body.cartContent;

	const sqlQuery = `INSERT INTO e5zkwad79wtbvjrc.carts (userId, cartContent) VALUES (?,?)`
	db.query(
		sqlQuery,
		[userId, cartContent],
		(err, result) => {
			if (err) {
				console.log(err);
				res.send(err);
			} else {
				res.send("Cart created successfully");
				// console.log(result);
			}
		}
	);
})

app.post("/updateCart", (req, res)=>{
	const userId = req.body.userId; 
	const cartContent = req.body.cartContent;

	const sqlQuery = `UPDATE e5zkwad79wtbvjrc.carts SET cartContent = (?) WHERE userId = ?`
	db.query(
		sqlQuery,
		[cartContent, userId],
		(err, result) => {
			if (err) {
				console.log(err);
				res.send(err);
			} else {
				res.send("Cart updated successfully");
				// console.log(result);
			}
		}
	);
})

app.get("/getCart/:userId", (req, res)=>{ 
	const userId = req.params.userId;
	const sqlQuery =
	"SELECT * FROM e5zkwad79wtbvjrc.carts WHERE userId = ?";

	db.query(sqlQuery, [userId],(err, result) => {
		if (err) {
			console.log(err);
			res.send(err);
		} else {
			res.send(result);
			// console.log(result);
		}
	});

})

