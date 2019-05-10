'use strict'

var mongoose = require("mongoose");
var app = require('./app');
var port = process.env.PORT ||	3999;

mongoose.set('userFindAndModify', false);
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/api_rest_node', {useNewUrlParser: true})
		.then( ()=>{
			console.log('La conexion funciona con la base de datos de mongo');
			//Crear el servidor
			app.listen(port, () =>{
				console.log('El servidor esta corriendo http:://localhost:3999 esta funcionando');
			});
		})
		.catch(error => console.log(error));