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
});


function InputField(o) {
	this.data = 'string';
	this.elem = null;
	this.field = null;
	this.min = 0;
	this.max = null;
	this.regex = null;
	this.mandatory = false;
	this.form = null;
	this.valfn = null;
	this.classes = '';
	this.info_msg = null;
	this.notvalid_msg = null;
	this.valid_msg = null;
	this.tip_msg = null;
	
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
		var parts = this.valfn[i].split('.');
		var current = window;
		for(var j = 0; j < parts.length; j++) {
			if(current.hasOwnProperty(parts[j]))
				current = current[parts[j]];
			else
				break;
		}
		
		if(isFunction(current)) {
			if(!current(value)) {
				return false;
			}
		}	
	}
	
	return true;
};

InputField.prototype.setState = function(state, title, message) {
	this.elem.attr('class', this.classes);
	this.elem.addClass(state);
	if(title !== undefined)
		this.elem.find('.'+state).attr('title', title);
	if(message !== undefined)
		this.elem.find('.message').html(message);
	else
		this.elem.find('.message').html('');
};

function attrToObjProp(obj, elem, attrName) {
	if(elem.attr(attrName)) {
		obj[attrName] = elem.attr(attrName);
		elem.removeAttr(attrName);
	}
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
			ifield.valfn = tmp.attr('valfn').split(' ');
			tmp.removeAttr('valfn');
		}
		
		attrToObjProp(ifield, tmp, 'info_msg');
		attrToObjProp(ifield, tmp, 'tip_msg');
		attrToObjProp(ifield, tmp, 'notvalid_msg');
		attrToObjProp(ifield, tmp, 'valid_msg');
		
		
		if(ifield.tip_msg !== null)
			ifield.setState('tip', ifield.tip_msg);
		
		if(tmp.attr('form')) {
			ifield.form = tmp.attr('form');
			if(!ivar.formAgregator.hasOwnProperty(ifield.form))
				ivar.formAgregator[ifield.form] = [];
				
			ivar.formAgregator[ifield.form].push(ifield);
			tmp.removeAttr('form');
		}
		
		tmp.data('ivartech-input', ifield);
		tmp.blur(function(e){
			var ifield = $(this).data('ivartech-input');
			
			console.log(ifield.validate());
			if(ifield.validate()) {
				ifield.setState('valid', ifield.valid_msg);
			} else {
				ifield.setState('error', ifield.notvalid_msg);
			}
		});
		
		$(elems[i]).replaceWith(template);
	}
	
	console.log(ivar.formAgregator);
};
