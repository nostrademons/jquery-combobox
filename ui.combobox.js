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
	
var KEY_UP = 38,
	KEY_DOWN = 40,
	KEY_ENTER = 13,
	KEY_ESC = 27,
	KEY_F4 = 115;
	
$.widget('ui.combobox', {

	init: function() {
		var that = this,
			options = this.options,
			inputElem = $('<input />')

		if(this.element[0].tagName.toLowerCase() == 'select') {
			fillDataFromSelect(options, this.element);
		}
			
		this.arrowElem = $(this.options.arrowHTML.call(this))
			.click(function(e) {
				if(that.listElem.is(':visible')) {
					that.hideList();
				} else {
					that.showList();
				}
			}); 

		this.oldElem = this.element
			.after(this.arrowElem)
			.after(inputElem)
			.remove();

		this.listElem = this.buildList().insertAfter(this.arrowElem).hide();

		this.element = inputElem;
		if(options.autoShow) {
			this.element
				.focus(boundCallback(this, 'showList'))
				.blur(boundCallback(this, 'hideList'));
		}
	},

	buildList: function() {
		var that = this,
			options = this.options,
			tag = options.listContainerTag,
			elem = $('<' + tag + ' class = "ui-combobox-list">' + '</' + tag + '>');

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

		$(document).keyup(boundCallback(this, 'keyHandler'));
		this.listElem.css(styles).show();
	},

	hideList: function() {
		this.listElem.hide();
	},

	keyHandler: function(e) {
		switch(e.which) {
			case KEY_ESC:
				this.hideList(); break;
		};
	},

	selectIndex: function(index, e) {
		this.element.val(this.options.data[index]);
		this.hideList();
	}

});

$.extend($.ui.combobox, {
	defaults: {
		data: [],
		autoShow: true,
		arrowUrl: 'drop_down.png',
		arrowHTML: function() {
			return $('<img class = "ui-combobox-arrow" src = "' 
				+ this.options.arrowUrl + '" width = "18" height = "22" />')
		},
		listContainerTag: 'span',
		listHTML: defaultListHTML
	}
});

function defaultListHTML(data, i) {
	var cls = i % 2 ? 'odd' : 'even';
	return '<span class = "ui-combobox-item ' + cls + '">' + data + '</span>';
};

function boundCallback(that, methodName) {
	var extraArgs = [].slice.call(arguments, 2);
	return function() {
		that[methodName].apply(that, extraArgs.concat([].slice.call(arguments)));
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
