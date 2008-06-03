/**
 * JQuery UI Combobox
 *
 * Copyright (c) 2008 Jonathan Tang
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * @dependency jquery.js
 * @dependency ui.core.js
 *
 * vim: noexpandtab
 */
;(function($) {
	
$.widget('ui.combobox', {

	init: function() {
		var options = this.options,
			inputElem = $('<input />')

		if(this.element[0].tagName.toLowerCase() == 'select') {
			fillDataFromSelect(options, this.element);
		}
			
		this.arrowElem = $(this.options.arrowHTML.call(this))
			.click(boundCallback(this, 'showList')); 
		this.oldElem = this.element
			.after(this.arrowElem)
			.after(inputElem)
			.remove();
		this.listElem = this.buildList().insertAfter(this.arrowElem).hide();
		this.element = inputElem;
	},

	buildList: function() {
		var that = this,
			options = this.options,
			tag = options.listContainerTag,
			elem = $('<' + tag + ' class = "comboboxList">' + '</' + tag + '>');

		$.each(options.data, function(i, val) {
			$(options.listHTML(val, i))
				.appendTo(elem)
				.click(boundCallback(that, 'selectIndex', i))
		});
		return elem;
	},

	showList: function() {
		var styles = this.element.offset();
		// TODO: account for borders/margins
		styles.top += this.element.height();
		styles.width = this.element.width();
		styles.position = 'absolute';

		this.listElem.css(styles).toggle();
	},

	selectIndex: function(index, e) {
		this.element.val(this.options.data[index]);
		this.listElem.hide();
	}

});

$.extend($.ui.combobox, {
	defaults: {
		data: [],
		arrowUrl: 'drop_down.png',
		arrowHTML: function() {
			return $('<img class = "comboboxArrow" src = "' 
				+ this.options.arrowUrl + '" width = "18" height = "22" />')
		},
		listContainerTag: 'span',
		listHTML: defaultListHTML
	}
});

function defaultListHTML(data, i) {
	var cls = i % 2 ? 'odd' : 'even';
	return '<span class = "combobox ' + cls + '">' + data + '</span>';
};

function boundCallback(that, methodName) {
	var extraArgs = [].slice.call(arguments, 2);
	return function() {
		that[methodName].apply(that, extraArgs.concat(arguments));
	};
};

function fillDataFromSelect(options, element) {
	var optionMap = {},
		computedData = [];
	element.children().each(function(i) {
		if(this.tagName.toLowerCase() == 'option') {
			var text = $(this).text(),
				val = this.getAttribute('value') || text;
			optionMap[val] = text;
			computedData.push(val);
		}
	});

	if(!options.data.length) {
		options.data = computedData;
	}

	if(options.listHTML == defaultListHTML) {
		options.listHTML = function(data, i) {
			return defaultListHTML(optionMap[data]);
		};
	}
};

})(jQuery);
