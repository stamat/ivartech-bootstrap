/*
 * ivartech-bootstrap.js
 *
 * @author Nikola Stamatovic Stamat 
 * @copyright IVARTECH < http://ivartech.com >
 * @since May 2013
 */

ivar.formAgregator = {};

$(document).ready(function() {
	initInputs($('.ivartech-input'));
	
	console.log(jsonv.validate('foo', schema));
});

var schema = {
	name: '',
	type: 'text', //text, textarea, checkbox, multicheckbox, select, button
	
	form: null,
	
	state: {
		// normal, error, tip, warn, valid, info, load
		'default': 'normal',
		'message': {
			'tip': '',
			'info': '',
			'warn': '',
			'load': '',
			'valid': '',
			'error': ''
		}
	},
	
	validation: {
		'type': 'string', //int,float,array,string,bool
		'min': {
			value: 0,
			exclusive: false
		},
		'max': {
			value: null,
			exclusive: false
		},
		'regexp': null, //sting,int,float
		'required': false,

		//---- other ---//
		'default': null,
		'format': '', //string
		'unique': false, //array
		'enum': ['happyness', 'joy', '1.34'],
		'devisableBy': null //number
	}
};

function Input(schema, target) {
	
	this.name = '';
	this.type = 'text'; //text, textarea, checkbox, multicheckbox, select, button
	this.form = null;
	this.value = null;
	
	this.elem = null; //html elem
	this.classes = '';
	
	this.parsing_functions = [];
	
	this.state = {
		'current': 'normal', // normal, error, tip, warn, valid, info, load
		'default': 'normal',
		'message': {
			'tip': '',
			'info': '',
			'warm': '',
			'load': '',
			'valid': '',
			'error': ''
		}
	};
	
	this.validation = {
		'type': 'string', //int,float,array,string,bool
		'min': {
			value: 0,
			exclusive: false
		},
		'max': {
			value: 0,
			exclusive: false
		},
		'regexp': null, //sting
		'required': false,
		
		//---- other ---//
		'default': null,
		'format': '', //string
		'unique': false, //array
		'enum': {
			'happyness':0,
			'joy':0,
			'true':0,
			'1.34':0,
		}
	};
	
	this.actions = [
		'mousedown',
		'mouseup',
		'mousemove',
		'mouseenter',
		'mouseleave',
		'focus',
		'blur',
		'keypress',
		'keyup',
		'keydown'
	];
	
	this.buildActionHandlerSlots(this.actions);
	
	this.events = ['error','valid','loading','loaded','warn','info'];
	//TODO: bind events
	
	this.parseSchema(schema);
}

Input.prototype.parseSchema = function(schema) {
	if(schema.validation.hasOwnProperty('enum'))
		this.validation['enum'] = ivar.mapArray(schema.validation['enum']);
	//...
};

Input.prototype.enumCheck = function(value) {
	if(isNumber(value))
		value = value.toString();
	return this.validation.hasOwnProperty(value);
};

Input.prototype.buildActionHandlerSlots = function(action_names) {
	var self = this;
	ivar.loop(action_names.length, function(i){
		self[action_names[i]] = function(fn) {
			$(self.elem).bind(action_names[i], function(e){
				fn(self, e);
			});
		}
	});
}

var numberSchemaTemplate = {
		'required': false,
		'default': null,
		
		'min': {
			value: 0,
			exclusive: false
		},
		'max': {
			value: null,
			exclusive: false
		},
		'regex': null, //sting,int,float

		//---- other ---//
		'only': ['happyness', 'joy', '1.34'], //!!! enum renamed into only
		'forbidden': ['sadness'],
		'devisableBy': null //number
}

//int,float,number,array,string,bool,object
var schema = {
		'strict':true,
		'type': 'string', //TODO: type can be array of types??? or not needed
		//'disallow': 'int' //disallowed types, can be array
		'required': false,
		'default': null,
		
		'min': {
			value: 0,
			exclusive: false
		},
		'max': {
			value: 30,
			exclusive: false
		},
		
		'unique': true, //if array items must be unique 	//uniqueProperties: []  //not Unique ITEMS!!! unique items dont have sense
		'regex': 'f', //sting,int,float
		//'format': 'email', //can be array
		
		//'forbidden': ['stamatron@gmail.com'] // true for object id no properties allowed

		//---- other ---//
		//'only': ['lol6zors', 6, 4], //true for object if you want selected properties in properties property of schema to be only ones allowed
		//'dividableBy': 3 //number
		//items: [{schema}] Schemas for an item!
		//properties: {propertyName:schema...} //object
}

var jsonv = {};

jsonv.aggregateErrors = true;
jsonv.errors = [];
jsonv.errorMessages = {};
jsonv.errorMessages['type'] = 'Invalid type. Type of data should be {{schema}}';

jsonv.validate = function validate(value, schema) {
	if(schema.hasOwnProperty('only') && ivar.isArray(schema['only']))
		schema['only'] = ivar.mapArray(schema['only']);
	if(schema.hasOwnProperty('forbidden') && ivar.isArray(schema['forbidden']))
		schema['forbidden'] = ivar.mapArray(schema['forbidden']);
	
	jsonv.errors = [];
	//console.log(ivar.whatis(schema['enum']));
		
	for(var i in schema) {
		if(schema[i] && jsonv.validator[i]) {
			console.log(i+': '+jsonv.validator[i](value, schema[i]));
			if(!jsonv.validator[i](value, schema[i])) {
				jsonv.invalid(i, value, schema[i]);
				if(!jsonv.aggregateErrors)
					return false;
			}
		}
	}
	
	if(jsonv.aggregateErrors && jsonv.errors.length > 0)
		return false;
	return true;
}

jsonv.invalid = function(field, value, schema, callback) {
	var val = value.toString();
	if(ivar.isCustomObject(value))
		value = JSON.stringify(value);
	var sch = schema.toString();
	if(ivar.isCustomObject(schema))
		sch = JSON.stringify(schema);
	var message = jsonv.errorMessages[field]?jsonv.errorMessages[field].templater({value: val, schema: sch}):'[error] '+field+': '+sch+' -> ' + val;
	jsonv.errors.push(message);
	if(callback && ivar.isFunction(callback))
		callback(field, value, schema, message);
}

jsonv.validator = {};

jsonv.validator.required = function(value) {
	return ivar.isSet(value);
}

jsonv.validator.only = function(value, enumobj) {
	if(ivar.isNumber(value))
		value = value.toString();
	return enumobj.hasOwnProperty(value);
};

jsonv.validator.enum = jsonv.validator.only;
 
jsonv.validator.forbidden = function(value, enumobj) {
	if(ivar.isNumber(value))
		value = value.toString();
	return !enumobj.hasOwnProperty(value);
};

jsonv.validator.unique = function(value) {
	var aggr = {};
	for(var i = 0; i < value.length; i++) {
		if(!aggr.hasOwnProperty(value[i]))
			aggr[''+value[i]] = 1;
		else
			return false;
	}
	return true;
};

jsonv.validator.min = function(value, min, exclusive) {
	if(value.hasOwnProperty('length'))
		value = value.length;
	min = jsonv.utils.buildRangeObj(min, exclusive);
	return min.exclusive?min.value<value:min.value<=value; 
};

jsonv.validator.minimum = jsonv.validator.min;
jsonv.validator.minItems = jsonv.validator.min;

jsonv.validator.max = function(value, max, exclusive) {
	if(value.hasOwnProperty('length'))
		value = value.length;
	max = jsonv.utils.buildRangeObj(max, exclusive);
	return max.exclusive?max.value>value:max.value>=value; 
};

jsonv.validator.maximum = jsonv.validator.max;
jsonv.validator.maxItems = jsonv.validator.max;

jsonv.validator.exclusiveMinimum = function(value, min) {
	return jsonv.validator.min(value, min, true);
};

jsonv.validator.exclusiveMinimum = function(value, max) {
	return jsonv.validator.max(value, max, true);
};

jsonv.validator.regex = function(value, regex) {
	if(!isString(value))
		value = value.toString();
	if(!(regex instanceof RegExp))
		regex = jsonv.utils.buildRegExp(regex);	
	return regex.test(value);
}

jsonv.validator.dividableBy = function(value, num) {
	return value%num === 0;
}

jsonv.validator.positive = function(value) {
	return value > 0;
}

jsonv.validator.positiveInteger = jsonv.validator.positive;

jsonv.formats = {}; //date-time YYYY-MM-DDThh:mm:ssZ, date YYYY-MM-DD, time hh:mm:ss, utc-milisec, regex, color, style, phone E.123, uri, url, email, ipv4, ipv6, host-name
jsonv.formats.email = function(val) {
	return ivar.regex.email.test(val);
};

jsonv.formats.regex = function(val) {
	return ivar.regex.regex.test(val);
};

jsonv.validator.format = function(value, format) {
	return jsonv.formats[format](value);
};

jsonv.validator.type = function(value, type) {
	return ivar.is(value, type);
};

jsonv.utils = {};

jsonv.utils.buildRangeObj = function(val, exclusive) {
	if(ivar.isString(val))
		val = parseFloat(val);
	if(!ivar.isSet(exclusive))
		exclusive = false;
	return ivar.isNumber(val)?{value:val, exclusive: exclusive}:val;
};

jsonv.utils.buildRegExp = function(val) {
	if(!isString(val))
		val = val.toString();
	var re = val.toRegExp();
	if(re)
		return re;
	else
		jsonv.error('Malformed regexp!');
};

jsonv.error = function(msg) {
	ivar.error(msg);
};

function InputField(o) {
	this.elem = null;
	this.field = null;
	
	this.data = 'string';
	this.min = 0;
	this.max = null;
	this.regex = null;
	this.mandatory = false;
	
	this.valfn = null;
	
	this.skip_validation = false;
	this.form = null;
	this.classes = '';
	
	this.info_msg = null;
	this.error_msg = null;
	this.valid_msg = null;
	this.tip_msg = null;
	
	this.default_state = null;
	
	if(o !== undefined)
		ivar.extend(this, o);
};

InputField.prototype.validate = function() {
	var value = this.field.val();
	
	if(value.length === 0 && this.mandatory)
		return false;
	
	if(value.length < this.min)
		return false;
		
	var max = this.max;
	if(this.data === 'float' && this.max !== null)
		max = max+1;
	if(max !== null && value.length > max)
		return false;
		
	if(this.regex !== null && !this.regex.test(value))
		return false;
		
	if(value.length > 0)
	if(this.data === 'int' && /\D/.test(value)) {
		return false;
	}
	
	if(value.length > 0 && !/^\d*$/.test(value))
	if(this.data === 'float' && !/^\d+\.\d+$/.test(value)) {
		return false;
	}
	
	if(this.valfn !== null)	
	for(var i = 0; i < this.valfn.length; i++) {
		if(!this.valfn[i](value)) {
			return false;
		}
	}
	
	return true;
};

InputField.prototype.setState = function(state, title, message) {
	this.elem.attr('class', this.classes);
	if(state)
		this.elem.addClass(state);
	if(title)
		this.setStateTitle(state, title);
	if(message)
		this.setStateMessage(message);
	else
		this.setStateMessage('');
};

InputField.prototype.setStateTitle = function(state, title) {
	this.elem.find('.'+state).attr('title', title);
};

InputField.prototype.setStateMessage = function(message) {
	this.elem.find('.message').html(message);
};

InputField.prototype.setDefaultState = function() {
	if(this.default_state !== null)
		this.setState(this.default_state);
	else
		this.setState();
}

InputField.prototype.buildState = function(elem, state) {
	var attrName = state+'_msg';
	attrToObjProp(this, elem, attrName);
	this.setStateTitle(state, this[attrName]);
};

function attrToObjProp(obj, elem, attrName) {
	if(elem.attr(attrName)) {
		obj[attrName] = elem.attr(attrName);
		elem.removeAttr(attrName);
	}
};

function buildFunctionList(str, delimiter) {
	if(delimiter === undefined)
		delimiter = ' ';
	var fns = str.split(delimiter);
	var res = [];
	for(var i = 0; i < fns.length; i++) {
		var parts = fns[i].split('.');
		var current = window;
		for(var j = 0; j < parts.length; j++) {
			if(current.hasOwnProperty(parts[j]))
				current = current[parts[j]];
			else
				break;
		}

		if(isFunction(current))
			res.push(current);
	}
	
	return res;
};

var validate = {};

validate.email = function(val) {
	return /^[a-z0-9\._\-]+@[a-z\.\-]+\.[a-z]{2,4}$/.test(val);
}

function initInputs(elems) {

	for(var i = 0; i < elems.length; i++) {
		var template = $('#ivartech-templates .input-field').clone();
		var tmp = $(elems[i]).clone();
		if(tmp.prop('tagName').toLowerCase() === 'textarea')
			template.addClass('textarea');
		
		template.find('#input-field-template').replaceWith(tmp);
		tmp.attr('name', tmp.attr('id'));
		template.find('label').html(
			tmp.attr('label')).attr(
				'for', tmp.attr('name'));
				
		var ifield = new InputField();
		ifield.elem = template;
		ifield.field = tmp;
		var classes = template.attr('classes')?' '+template.attr('classes'):'';
		ifield.classes = template.attr('class') + classes;
		
		if(tmp.attr('mandatory') && tmp.attr('mandatory').toLowerCase() === 'true') {
			template.find('label').prepend('<span class="mandatory">*</span>');
			tmp.removeAttr('mandatory');
			template.attr('mandatory', 'true');
			ifield.mandatory = true; 
		}
		
		attrToObjProp(ifield, tmp, 'data'); //int, float, string, date?
		
		attrToObjProp(ifield, tmp, 'default_state');
		
		if(tmp.attr('min')) {
			ifield.min = parseInt(tmp.attr('min'), 10);
			tmp.removeAttr('min');
		}
		
		if(tmp.attr('max')) {
			ifield.max = parseInt(tmp.attr('max'), 10);
			tmp.removeAttr('max');
		}
		
		if(tmp.attr('regex')) {
			var parts = tmp.attr('regex').split(' ')
			ifield.regex = new RegExp(parts[0], parts[1]?parts[1]:undefined);
			tmp.removeAttr('regex');
		}
		
		if(tmp.attr('valfn')) {
			var fns = tmp.attr('valfn');
			ifield.valfn = buildFunctionList(fns);
			tmp.removeAttr('valfn');
		}
		
		ifield.buildState(tmp, 'info');
		ifield.buildState(tmp, 'tip');
		ifield.buildState(tmp, 'error');
		ifield.buildState(tmp, 'valid');
		ifield.buildState(tmp, 'load');
		ifield.buildState(tmp, 'warn');

		attrToObjProp(ifield, tmp, 'skip_validation');
		
		ifield.setDefaultState();
		
		if(tmp.attr('form')) {
			ifield.form = tmp.attr('form');
			if(!ivar.formAgregator.hasOwnProperty(ifield.form))
				ivar.formAgregator[ifield.form] = [];
				
			ivar.formAgregator[ifield.form].push(ifield);
			tmp.removeAttr('form');
		}
		
		tmp.data('ivartech-input', ifield);
		
		tmp.blur(function(e) {
			fieldBlur(this, e);
		});
		
		tmp.focus(function(e) {
			fieldFocus(this, e);
		});
		
		$(elems[i]).replaceWith(template);
	}
};

function fieldFocus(elem, e) {
	var ifield = $(elem).data('ivartech-input');
	if(!ifield.skipvalidation)
		ifield.setDefaultState();
}

function fieldBlur(elem, e) {
	var ifield = $(elem).data('ivartech-input');	
	if(!ifield.skip_validation)
		if(ifield.validate()) {
			if(!ifield.mandatory && ifield.field.val().length === 0 ) {
				ifield.setDefaultState();
			} else {
				ifield.setState('valid');
			}
		} else {
			ifield.setState('error');
		}
}
