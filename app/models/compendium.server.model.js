'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Compendium Schema
 */
var CompendiumSchema = new Schema({
	// Compendium model fields   
	created:{
		type: Date,
		default: Date.now
		},
	title: {
		type: String,
		default: '',
		trim: true,
		required: 'Title cannot be blank'
	},
	description: {
		type: String,
		default: '',
		trim: true,
		required: 'Description cannot be blank'
	},
	content: {
		type: String,
		default: '',
		trim: true,
		required: 'Content cannot be blank'
	},
	type: {
		type:String,
		default:'',
		trim:true,
		required: 'Type is required'
	},
	user: {
		type: Schema.ObjectId,
		ref: 'User'
	}
});

mongoose.model('Compendium', CompendiumSchema);