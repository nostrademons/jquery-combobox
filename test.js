/*
 * Qunit test suite for UI Combobox
 * vim: noexpandtab
 */

module('combobox');

var KEY_UP = 38,
	KEY_DOWN = 40,
	KEY_ENTER = 13,
	KEY_ESC = 27,
	KEY_F4 = 115;

function fireKey(code) {
	$(document).triggerHandler('keyup', [{
		which: code,
		preventDefault: function() {}
	}]);
};

function makeDemo1() {
	$('#demo1').combobox({
		data: ['Apples', 'Oranges', 'Pears', 'Bananas', 'Kiwis', 'Grapes'],
		autoShow: false
	});
};

function makeDemo2() {
	$('#demo2').combobox();
};

function clickDropdown(comboID) {
	return $('#' + comboID).siblings('img').click();
};

function dropdownList(comboID) {
	return $('#' + comboID).siblings('.ui-combobox-list');
};

function dropdownOptions(comboID) {
	return dropdownList(comboID).children();
};

test('preserves attributes', function() {
	makeDemo1();
	equals($('#demo1').attr('id'), 'demo1');
	equals($('#demo1').attr('name'), 'field1');
	equals($('#demo1').attr('class'), 'inputField');
});

test('chainability', function() {
	makeDemo1();
	$('#demo1').removeClass('inputField').val('test');
	equals($('#demo1').val(), 'test');
	equals($('#demo1').attr('class'), '');
});

test('fill from select', function() {
	makeDemo2();
	var found = $('#demo2').data('combobox').options.data;
	equals(6, found.length);
	equals(found[0], 'orange');
	equals(found[1], 'apple');
	equals(found[2], 'pear');
	equals(found[3], 'kiwi');
	equals(found[4], 'banana');
	equals(found[5], 'grape');
});

test('dropdown', function() {
	makeDemo1();
	clickDropdown('demo1');
	var expected = $('#demo1').data('combobox').options.data,
		found = dropdownOptions('demo1');

	for(var i = 0, len = expected.length; i < len; ++i) {
		equals(found.eq(i).text(), expected[i]);
	}
});

test('select by click', function() {
	makeDemo1();
	var eventVal = null;
	$('#demo1').bind('comboboxselect', function(e, ui) {
		eventVal = ui;
	});

	clickDropdown('demo1');
	dropdownOptions('demo1').eq(3).click();

	equals($('#demo1').val(), 'Bananas', 'field');
	equals(eventVal.value, 'Bananas', 'event');
	equals(eventVal.index, 3);
	ok(eventVal.isCustom == false, 'is custom');
	ok(dropdownList('demo1').is(':hidden'), 'menu hidden');
});

test('select by arrow', function() {
	makeDemo2();
	var selectEvent = null,
		changeEvent = null;
	$('#demo2').bind('comboboxchange', function(e, ui) {
		changeEvent = ui;
	})
	.bind('comboboxselect', function(e, ui) {
		selectEvent = ui;
	});

	$('#demo2').focus();
	ok(dropdownList('demo2').is(':visible'), 'menu visible');
	ok(changeEvent, 'event fired');
	equals(changeEvent.value, 'orange');

	fireKey(KEY_DOWN);
	equals(changeEvent.value, 'apple');

	fireKey(KEY_ENTER);
	equals($('#demo2').val(), 'apple', 'value');
	equals(selectEvent.value, 'apple');
	ok(dropdownList('demo2').is(':hidden'), 'menu hidden');
});

