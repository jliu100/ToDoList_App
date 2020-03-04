const express = require("express");
const exphbs = require("express-handlebars");
const axios = require("axios");
const bodyParser= require("body-parser");

const app = express();

app.engine("handlebars", exphbs());
app.set("view engine", "handlebars");
app.use(bodyParser.urlencoded({extended: true})); 

app.get("/", function(req, res) {
  res.render("login");
});


const TODO_API_URL = "https://hunter-todo-api.herokuapp.com";
var token;

app.get("/users", function(req, res) {
  // we are using axios to make a request to our API
  // our model is now composed of our API (which we are only reading from in this example)
  axios.get(TODO_API_URL + "/user").then(function(response) {
    // we pass our response data to our view engine, which will template it into our HTML view
    res.render("user-list", { users: response.data });
  });
});

app.post("/home",function(req,res){
	
	var name=req.body.userName;
	console.log(name);

	axios.post('https://hunter-todo-api.herokuapp.com/auth', {}, {
	  	data:{
			username:name
		},
		headers: {'content-type': 'application/json'}

	}).then(function(response) {
		console.log('Authenticated');
		console.log(response.data);
	    token=response.data.token;

	    res.redirect('/list');

    }).catch(function(error) {
		  console.log('Error on Authentication');

	});

});

// reveal to do list item
app.get('/list',function(req,res){
	console.log(111);
	console.log(token);
	axios.get('https://hunter-todo-api.herokuapp.com/todo-item', { headers: { 'Authorization': token }}).then(response => {
	    console.log(response.data);
	    res.render("homeF", {yes: 1, list:response.data});
	    }).catch((error) => {
	        res.render("homeF", {yes: 0} );
	});
});

app.post("/newAccount", function(req,res){
	var answer=req.body.newUser;
	axios.post('https://hunter-todo-api.herokuapp.com/user', {
	  username: answer
	}).then(function(response){
		res.render("login");
	}).catch((error) => {
	       console.log(error);
	       console.log("Name repeated")
	       res.render("register");
	});
		
});

app.get("/newUser",function(req,res){
	res.render("register");
});

// logout
app.get("/logout", function(req, res) {
  	res.redirect('/');
});

//create new task in To Do List:
app.post("/createItem", function(req,res){
	var answer=req.body.new;
	if(answer===''){
		res.redirect('/list');
	}
	else{
		axios.post('https://hunter-todo-api.herokuapp.com/todo-item', {}, {
		  		data:{
					content:answer
				},
			  headers: { 'Authorization': token }
			}).then(function(response) {

			res.redirect('/list');
		}).catch((error) => {
	       console.log(error);
	       
		});
	}
		
});

//edit page
app.get("/edit/:param1",function(req, res){
	
	var id=req.params.param1;
	console.log(id);
	var url='https://hunter-todo-api.herokuapp.com/todo-item/'+id;

	axios.get(url, { headers: { 'Authorization': token }}).then(response => {
	    
	    console.log(response.data);
		res.render("edit", {data:response.data});
	    }).catch((error) => {
	        console.log('error on Edit');
	});

});

app.post("/complete/:id", function(req,res){
	var id=req.params.id;
	var url='https://hunter-todo-api.herokuapp.com/todo-item/'+id;

	axios.put(url, {},{ 
		data:{
			completed:true
		},
		headers: { 'Authorization': token }
	}).then(function(response) {
		console.log(response.data);
		res.redirect('/list');
	}).catch((error) => {
	       console.log(error);

	});
});

app.post("/delete/:id", function(req,res){
	var id=req.params.id;
	var url='https://hunter-todo-api.herokuapp.com/todo-item/'+id;
    console.log(url);

	axios.delete(url,{
	 	headers: {'Authorization': token }
	 }).then(response => {
	    console.log(response.data);
	    res.redirect('/list');
	    
	}).catch((error) => {
	        console.log(error);
	});
	
});

app.listen(3000);