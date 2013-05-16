/*
 * ivartech-bootstrap.js
 *
 * @author Nikola Stamatovic Stamat 
 * @copyright IVARTECH < http://ivartech.com >
 * @since May 2013
 */

ivar.formAgregator = {};

$(document).ready(function() {
	console.log(validate.email('markobre1@a.gmail.info'));
	initInputs($('.ivartech-input'));
});


function InputField(o) {
	this.data = 'string';
	this.elem = null;
	this.field = null;
	this.min = 0;
	this.max = null;
	this.regex = null;
	this.mandatory = false;
	this.skip_validation = false;
	this.form = null;
	this.valfn = null;
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
		if(ifield.default_state !== null)
			ifield.setState(ifield.default_state);
		else
			ifield.setState();
}

function fieldBlur(elem, e) {
	var ifield = $(elem).data('ivartech-input');	
	if(!ifield.skip_validation)
		if(ifield.validate()) {
			if(!ifield.mandatory && ifield.field.val().length === 0 ) {
				if(ifield.tip_msg !== null)
					ifield.setState('tip');
			} else {
				ifield.setState('valid');
			}
		} else {
			ifield.setState('error');
		}
}
