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
		var that = this;
		var options = this.options;
		var inputElem = $('<input />');

		function maybeCopyAttr(name) {
			var val = that.element.attr(name);
			if(val) {
				inputElem.attr(name, val);
			}
		};
		maybeCopyAttr('id');
		maybeCopyAttr('class');
		maybeCopyAttr('name');

		if(this.element[0].tagName.toLowerCase() == 'select') {
			fillDataFromSelect(options, this.element);
		}
			
		this.arrowElem = $(this.options.arrowHTML.call(this))
			.click(function(e) {
				if(that.isListVisible()) {
					that.hideList();
				} else {
					that.showList();
				}
			}); 

		this.oldElem = this.element
			.unbind('getData.combobox')
			.unbind('setData.combobox')
			.unbind('remove')
			.after(this.arrowElem)
			.after(inputElem)
			.remove();

		this.listElem = this.buildList().insertAfter(this.arrowElem).hide();

		this.element = inputElem
			.keyup(function(e) {
				if(e.which == KEY_F4) { 
					that.showList(e);
				}
			})
			.change(boundCallback(this, 'fireEvent', 'select'));
		if(options.autoShow) {
			this.element
				.focus(boundCallback(this, 'showList'))
				.blur(boundCallback(this, 'hideList'));
		}
	},

	cleanup: function() {
		// Cleanup and destroy are split into two separate handlers because
		// one of them (cleanup, in this case) needs to be bound to the
		// 'remove' event handler to clean up the extra elements.  The
		// destroy handler removes the custom input element added by this
		// plugin, and so we get an infinite loop if they aren't split.
		if(this.boundKeyHandler) {
			$(document).unbind('keyup', this.boundKeyHandler);
		}
		this.arrowElem.remove();
		this.listElem.remove();
	},

	destroy: function() {
		var newElem = this.element;
		this.element = this.oldElem.insertBefore(this.arrowElem);
		newElem.remove();	// Triggers cleanup
	},

	setData: function(key, value) {
		this.options[key] = value;

		if(key == 'disabled' && this.isListVisible()) {
			this.hideList();
		}

		if(key == 'data' || key == 'listContainerTag' || key == 'listHTML') {
			var isVisible = this.isListVisible();
			this.listElem = this.buildList().replaceAll(this.listElem);
			this[isVisible ? 'showList' : 'hideList']();
		}
	},

	buildList: function() {
		var that = this;
		var options = this.options;
		var tag = options.listContainerTag;
		var elem = $('<' + tag + ' class = "ui-combobox-list">' + '</' + tag + '>');

		$.each(options.data, function(i, val) {
			$(options.listHTML(val, i))
				.appendTo(elem)
				.click(boundCallback(that, 'finishSelection', i))
				.mouseover(boundCallback(that, 'changeSelection', i));
		});
		return elem;
	},

	isListVisible: function() {
		return this.listElem.is(':visible');
	},

	showList: function(e) {
		if(this.options.disabled) {
			return;
		}

		var styles = this.element.offset();
		// TODO: account for borders/margins
		styles.top += this.element.height();
		styles.width = this.element.width();
		styles.position = 'absolute';

		this.boundKeyHandler = boundCallback(this, 'keyHandler');
		$(document).keyup(this.boundKeyHandler);
		this.listElem.css(styles).show();
		this.changeSelection(this.findSelection(), e);
	},

	hideList: function() {
		this.listElem.hide();
		$(document).unbind('keyup', this.boundKeyHandler);
	},

	keyHandler: function(e) {
		if(this.options.disabled) {
			return;
		}

		var optionLength = this.options.data.length;
		switch(e.which) {
			case KEY_ESC:
				this.hideList(); 
				break;
			case KEY_UP:
				this.changeSelection((this.selectedIndex - 1) % optionLength, e);
				break;
			case KEY_DOWN:
				this.changeSelection((this.selectedIndex + 1) % optionLength, e);
				break;
			case KEY_ENTER:
				this.finishSelection(this.selectedIndex, e);
				break;
			default:
				this.fireEvent('key', e);
				this.changeSelection(this.findSelection());
				break;
		}
	},

	prepareCallbackObj: function(val) {
		val = val || this.element.val();
		var index = $.inArray(val, this.options.data);
		return {
			value: val,
			index: index,
			isCustom: index == -1,
			inputElement: this.element,
			listElement: this.listElement
		};
	},

	fireEvent: function(eventName, e, val) {
		this.element.triggerHandler('combobox' + eventName, [
			e,
			this.prepareCallbackObj(val)
		], this.options[eventName]);
	},

	findSelection: function() {
		var data = this.options.data;
		var typed = this.element.val().toLowerCase();

		for(var i = 0, len = data.length; i < len; ++i) {
			var index = data[i].toLowerCase().indexOf(typed);
			if(index == 0) {
				return i;
			}
		};

		if(this.options.matchMiddle) {
			for(var i = 0, len = data.length; i < len; ++i) {
				var index = data[i].toLowerCase().indexOf(typed);
				if(index != -1) {
					return i;
				}
			};
		}

		return 0;
	},

	changeSelection: function(index, e) {
		this.selectedIndex = index;
		this.listElem.children('.selected').removeClass('selected');
		this.listElem.children(':eq(' + index + ')').addClass('selected');
		if(e) {
			this.fireEvent('change', e, this.options.data[index]);
		}
	},

	finishSelection: function(index, e) {
		this.element.val(this.options.data[index]);
		this.hideList();
		this.fireEvent('select', e);
	}

});

$.extend($.ui.combobox, {
	defaults: {
		data: [],
		autoShow: true,
		matchMiddle: true,
		change: function(e, ui) {},
		select: function(e, ui) {},
		key: function(e, ui) {},
		arrowUrl: 'drop_down.png',
		arrowHTML: function() {
			return $('<img class = "ui-combobox-arrow" src = "' 
				+ this.options.arrowUrl + '" width = "18" height = "22" />')
		},
		listContainerTag: 'span',
		listHTML: defaultListHTML
	}
});

// Hack for chainability - since the combobox modifies this.element but 'this'
// is only the UI instance, it leaves the JQuery collection itself pointing
// at stale, removed-from-DOM instances.  This hack invokes the UI-factory 
// plugin method first, then maps each instance in the JQuery collection to 
var oldPlugin = $.fn.combobox;
$.fn.combobox = function() {
	var results = oldPlugin.apply(this, arguments);
	if(!(results instanceof $)) {
		return results;
	}

	var needsHack = false;
	var newResults = $($.map(results, function(dom) {
		var instance = $.data(dom, 'combobox');
		if(instance && instance.element[0] != dom) {
			needsHack = true;
			var newDOM = instance.element[0];
			$.data(newDOM, 'combobox', instance);
			return newDOM;
		} else {
			return dom;
		}
	}));

	return !needsHack ? results : newResults
		.bind('setData.combobox', function(e, key, value) {
			return $.data(this, 'combobox').setData(key, value);
		})
		.bind('getData.combobox', function(e, key) {
			return $.data(this, 'combobox').getData(key);
		})
		.bind('remove', function() {
			return $.data(this, 'combobox').cleanup();
		});
};

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
	var optionMap = {}, computedData = [];
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
