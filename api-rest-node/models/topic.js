'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var mongoosePaginate = require('mongoose-paginate-v2');
//Modelo de COMENT
var ComentSchema = Schema({
	content: String,
	date: {type: Date, default: Date.now },
	user: {type: Schema.ObjectId, ref: 'User'}
});

var Comment = mongoose.model('Comment', ComentSchema);
//Modelo de TOPIC
var TopicSchema = Schema({
	title: String,
	content: String,
	code: String,
	lang: String,
	date: {type: Date, default: Date.now },
	user: {type: Schema.ObjectId, ref: 'User'},
	comments: [ComentSchema]
});

//Cargar paginacion al modelo de topics
TopicSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Topic', TopicSchema);