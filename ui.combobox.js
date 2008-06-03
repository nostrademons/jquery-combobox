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
			
		this.arrowElem = $(this.options.arrowHTML.call(this))
			.click(boundCallback(this, 'showList')); 
		this.oldElem = this.element
			.after(this.arrowElem)
			.after(inputElem)
			.remove();
//		this.listElem = this.buildList().insertAfter(this.arrowElem).hide();
		this.element = inputElem;
	},

	buildList: function() {
		var tag = this.options.listContainerTag;
		return $('<' + tag + ' class = "comboboxList">' + 
			$.map(this.options.data, this.options.listHTML).join('') +
			'</' + tag + '>');
	},

	showList: function() {
		this.listElem.toggle();
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
		listHTML: function(data, i) {
			var cls = i % 2 ? 'odd' : 'even';
			return '<span class = "combobox ' + cls + '">' + data + '</span>';
		}
	}
});

function boundCallback(that, methodName) {
	return function() {
		that[methodName].apply(that, arguments);
	};
};

})(jQuery);
