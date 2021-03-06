'use strict'
var Topic = require('../models/topic');
var validator = require('validator');

var controller = {
	add: function(req,res){

		//Recoger el id del topic de la url
		var topicId = req.params.topicId;

		//find por id del topic
		Topic.findById(topicId).exec((err,topic)=>{

			if(err){
				return res.status(500).send({
					status: 'error',
					message:'Error en la peticion'
				});
			}
			if(!topic){
				return res.status(404).send({
					status: 'error',
					message:'No existe el topic'
				});
			}

			//Comprobar objeto usuario
			if(req.body.content){
				//Validar datos
				try{
					var validate_content = !validator.isEmpty(req.body.content);
				}catch(err){
					return res.status(200).send({
						message: 'No has comentado nada'
					});
				}
				if(validate_content){

					var comment = {
						user: req.user.sub,
						content: req.body.content
					}
					//En la propiedad coment del objeto resultante hacer un push

					topic.comments.push(comment);
					//Guardar el topic completo
					topic.save((err) => {
						if(err){
							return res.status(500).send({
								status: 'error',
								message:'Error Al guardar el comentario'
							});
						}
						
						//Devolver una respuesta
						return res.status(200).send({
								status: 'success',
								topic
						});
					});
				}else{
					return res.status(200).send({
						message: 'No se han validado los datos del comentario'
					});	
				}

			}

		});
	},
	update: function(req,res){
		//Conseguir el ID del comentario de la URL
		var commentId = req.params.commentId 
		//Recoger datos y validar
		var params = req.body;
		try{
			var validate_content = !validator.isEmpty(params.content);
		}catch(err){
			return res.status(200).send({
				message: 'No has comentado nada'
			});
		}
		if(validate_content){
			//Find and Update de una propiedad de un subDocumento
			Topic.findOneAndUpdate(
				{"comments._id": commentId },
				{
					"$set": {
						"comments.$.content": params.content
					}
				},
				{new:true},
				(err, topicUpdated) => {
					if(err){
						return res.status(500).send({
							status: 'error',
							message:'Error en la peticion'
						});
					}
					if(!topicUpdated){
						return res.status(404).send({
							status: 'error',
							message:'topicUpdated es nulo'
						});
					}
					//Devolver los datos
					return res.status(200).send({
						status: 'success',
						topic: topicUpdated
					});			
				}
			);
		}
		
	},
	delete: function(req,res){
		//Sacar el ID del topic y del comentario a borrar
		var topicId = req.params.topicId;
		var commentId = req.params.commentId;
		//Buscar el topic
		Topic.findById(topicId, (err, topic) =>{
			if(err){
				return res.status(500).send({
					status: 'error',
					message:'Error en la peticion'
				});
			}
			if(!topic){
				return res.status(404).send({
					status: 'error',
					message:'topic es nulo'
				});
			}
			// Seleccionar el subdocumento (El comentario)
			var comment = topic.comments.id(commentId);
			//Borrar el comentario
			if(comment){
				comment.remove();
				//Guardar el topic
				topic.save((err) =>{

					if(err){
						return res.status(500).send({
							status: 'error',
							message:'Error en la peticion'
						});
					}
					//Devolver un resultado
						return res.status(200).send({
								status: 'success',
								topic
						});
				});
				
			}else{
				return res.status(404).send({
					status: 'error',
					message:'No existe el comentario'
				});
			}
			
		});
	},


};

module.exports = controller;