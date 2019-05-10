'use strict'
var validator = require('validator');
var Topic = require('../models/topic');

var controller = {
	test:function(req,res){
		return res.status(200).send({
			message: 'Hola que tal'
		});
	},

	save: function(req, res){
		//Recoger los parametros por post
		var params = req.body;

		//Validar los datos

		try{
			var validate_title = !validator.isEmpty(params.title);
			var validate_content = !validator.isEmpty(params.content);
			var validate_lang = !validator.isEmpty(params.lang);


		}catch(err){
			return res.status(200).send({
				message: 'Faltan datos por enviar'
			});
		}
		if(validate_content && validate_title && validate_lang){
			//Crear objeto a guardar de topic
			var topic = new Topic();

			//Asignar valores a las propiedades del objeto
			topic.title=params.title;
			topic.content= params.content;
			topic.code = params.code;
			topic.lang = params.lang;
			topic.user = req.user.sub;

			//Guardar topic
			topic.save((err, topicStore)=>{
				//Devolver una respuesta
				if(err || !topicStore){
					return res.status(404).send({
						status: 'error',
						message: 'El tema no se ha guardado'
						
					});
				}
				return res.status(200).send({
					status: 'success',
					topic: topicStore
				});				
			});

		}else{
			return res.status(200).send({
				message: 'Los datos no son validos'
			});
		}
	},

	getTopics: function(req, res){
		//Cargar libreria de paginacion en la clase (en el modelo o schema)

		//Recoger la pagina actual
		if(!req.params.page || req.params.page == 0 || req.params.page == "0" ||  req.params.page == null || req.params.page == undefined){
			var page = 1;
		}
		else{
			var page = parseInt(req.params.page);
		}
		//Indicar las opciones de paginacion

		var options = {
			sort: {date: -1},
			populate: 'user',
			limit: 5,
			page: page
		}
		// Hacer el find paginado

		Topic.paginate({},options, (err, topics) =>{

			if(err){
				return res.status(500).send({
					status: 'error',
					message: 'Error al hacer la consulta'
				});
			}
			if(!topics){
				return res.status(404).send({
					status: 'error ',
					message: 'No hay topics'
				});
			}
			//Devolver resultado (topics, total de potic, total de paginas)
			return res.status(200).send({
				status: 'success',
				topics: topics.docs,
				totalDocs: topics.totalDocs,
				totalPages: topics.totalPages

			});
		})
	},

	getTopicsByUser: function(req, res){
		//Conseguir el ID del usuario
		var userId = req.params.user;

		//Hacer un find con una condicion de usaurio
		Topic.find({
			user: userId
		})
		.sort([['date','descending']])
		.exec((err, topics) => {
			if(err){
				return res.status(500).send({ 
					status: 'error',
					message: 'Error en la peticion'
				});
			}
			if(!topics || topics== 0){
				return res.status(404).send({ 
					status: 'error',
					message: 'No hay temas para mostrar'
				});
			}
			//Devolver un resultado
			return res.status(200).send({
				status: 'success',
				topics
			});
		});
		
	},

	getTopic: function(req , res){

		//Sacar el id del topic de la url
		var topicId = req.params.id;

		// Find por ID del topic
		Topic.findById(topicId)
			 .populate('user')
			 .exec((err, topic) => {
			 	if(err){
			 		return res.status(500).send({
						status: 'error',
						message: 'Error en la peticion'
					});	 
			 	}
			 	if(!topic){
			 		return res.status(404).send({
						status: 'error',
						message: 'No existe el tema'
					});	 
			 	}
			//Devolver el resultado
				return res.status(200).send({
					status: 'success',
					topic
				});	 	
			});
		
	},

	update: function(req, res){
		//Recoger el id del topic
		var topicId = req.params.id;

		//Recoger los datos que llegan desde post
		var params = req.body;

		// Validar la informacion
		try{
			var validate_title = !validator.isEmpty(params.title);
			var validate_content = !validator.isEmpty(params.content);
			var validate_lang = !validator.isEmpty(params.lang);


		}catch(err){
			return res.status(200).send({
				message: 'Faltan datos por enviar'
			});
		}
		if(validate_title && validate_content && validate_lang){

			//Montar un json con los datos que quiero modificar

			var update = {
				title: params.title,
				content: params.content,
				code: params.code,
				lang: params.lang
			};

			//Find and update del topic y ademas que seamos los dueños de ese topic
			Topic.findOneAndUpdate({_id: topicId, user:req.user.sub}, update, {new: true}, (err, topicUpdated) =>{

				if(err){
					return res.status(500).send({
						status: 'error',
						message: 'Error en la peticion'
					});
				}
				if(!topicUpdated){
					return res.status(404).send({
						status: 'error',
						message: 'No se ha actualizado el topic'
					});
				}
				//Devolver una respuesta
				return res.status(200).send({
							status: 'success',
							topicUpdated
				});
			});
		}else{
			return res.status(200).send({
				status: 'success',
				message: 'La validacion de los datos no es correcta'
			});
		}
	},

	delete: function(req, res){
		//Sacar el id del topic de la URL
		var topicId = req.params.id;
		//Find and delete por topic ID y por user ID
		Topic.findOneAndDelete({_id: topicId, user: req.user.sub}, (err, topicRemoved) =>{
			if(err){
					return res.status(500).send({
						status: 'error',
						message: 'Error en la peticion'
					});
				}
				if(!topicRemoved){
					return res.status(404).send({
						status: 'error',
						message: 'No se ha eliminado el topic'
					});
				}
			//Devolver una respuesta
			return res.status(200).send({
				status: 'success',
				topicRemoved
			});
		});

	},

	search: function(req, res){
		//Sacar string a buscar de la URL
		var searchString = req.params.search;

		//Find con operador OR
		Topic.find({ "$or": [
				{"title": {"$regex": searchString, "$options": "i"} },
				{"content": {"$regex": searchString, "$options": "i"} },
				{"lang": {"$regex": searchString, "$options": "i"} },
				{"code": {"$regex": searchString, "$options": "i"} }
			]})
		.sort([['date','descending']])
		.exec((err,topics)=>{
			if(err){
				return res.status(500).send({
					status: 'error',
					message: 'Error en la peticion'
				});
			}
			if(!topics){
					return res.status(404).send({
						status: 'error',
						message: 'No hay temas disponibles'
					});
				}
			//Devolver el resultado
			return res.status(200).send({
				status: 'success',
				topics
			});
		});
	}
};


module.exports = controller;