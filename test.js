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
	return $('#demo1').combobox({
		data: ['Apples', 'Oranges', 'Pears', 'Bananas', 'Kiwis', 'Grapes'],
		autoShow: false
	});
};

function makeDemo2() {
	return $('#demo2').combobox();
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
	equals($('#demo1').attr('title'), 'Test');
	equals($('#demo1').attr('name'), 'field1');
	equals($('#demo1').attr('class'), 'inputField');

	equals($('#demo1').attr('size'), '40');
	equals($('#demo1').attr('maxlength'), '30');
	equals($('#demo1').attr('value'), 'Apples');

	clickDropdown('demo1');
	ok($('.ui-combobox-list').is('.inputField'), 'list has class');
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
	equals($('#demo2').val(), 'orange');
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

	$(document).click();
	ok(dropdownList('demo1').is(':hidden'), 'list is hidden');
});

test('replace data', function() {
	makeDemo1();
	clickDropdown('demo1')
	$('#demo1').triggerHandler('setData.combobox', ['data', ['Foo', 'Bar', 'Baz']]);

	var firstOption = dropdownOptions('demo1').eq(0);
	ok(dropdownList('demo1').is(':visible'), 'list still visible');
	ok(firstOption.is('.selected'), 'first item selected');
	equals(firstOption.text(), 'Foo');
});

test('add to data', function() {
	makeDemo1();
	clickDropdown('demo1');
	var items = $('#demo1').combobox('getData', 'data');
	equals(items.length, 6);
	equals(items[0], 'Apples');

	items.push('Option 7');
	equals(dropdownOptions('demo1').length, 6);

	$('#demo1').combobox('setData', 'data', items);
	equals($('#demo1').combobox('getData', 'data').length, 7);
	equals(dropdownOptions('demo1').length, 7);
	equals(dropdownOptions('demo1').eq(6).text(), 'Option 7');
});

test('disable', function() {
	function isHidden(msg) {
		ok(dropdownList('demo2').is(':hidden'), msg);
	};

	var keyEvent = null;
	makeDemo2().bind('comboboxkey', function(e, ui) {
		keyEvent = ui;	
	});
	clickDropdown('demo2');
	$('#demo2').combobox('disable');
	isHidden('closes dropdown');

	clickDropdown('demo2');
	isHidden('disabled click');

	$('#demo2').focus();
	isHidden('disabled focus');

	$('#demo2').val('ki').keyup();
	isHidden('disabled typing');
	ok(!keyEvent, 'disabled event firing');

	$('#demo2').combobox('enable');
	clickDropdown('demo2');
	dropdownList('demo2').is(':visible');
});

test('destroy', function() {
	makeDemo2();
	clickDropdown('demo2');
	$('#demo2').combobox('destroy');

	ok($('#demo2').is('select'), 'original element restored');
	equals($('#demo2').siblings('img').length, 0, 'image deleted');
	equals(dropdownList('demo2').length, 0, 'list deleted');
});

test('remove', function() {
	makeDemo2();
	clickDropdown('demo2');
	$('#demo2').remove();

	equals($('#demo2').length, 0, 'element deleted');
	equals($('#box2 img').length, 0, 'image deleted');
	equals(dropdownList('demo2').length, 0, 'list deleted');
});

test('select by click', function() {
	makeDemo1();
	var selectEvent = null, changeEvent = null;
	$('#demo1').bind('comboboxselect', function(e, ui) {
		selectEvent = ui;
	})
	.bind('comboboxchange', function(e, ui) {
		changeEvent = ui;	
	});

	clickDropdown('demo1');
	dropdownOptions('demo1').eq(2).mouseover();
	equals(changeEvent.value, 'Pears');
	ok(dropdownOptions('demo1').eq(2).is('.selected'), 'mouseover selects');

	dropdownOptions('demo1').eq(3).click();
	equals($('#demo1').val(), 'Bananas', 'field');
	equals(selectEvent.value, 'Bananas', 'event');
	equals(selectEvent.index, 3);
	ok(selectEvent.isCustom == false, 'is custom');
	ok(dropdownList('demo1').is(':hidden'), 'menu hidden');
});

test('select by focus', function() {
	makeDemo2();
	var selectEvent = null, changeEvent = null;
	$('#demo2').bind('comboboxselect', function(e, ui) {
		selectEvent = ui;
	})
	.bind('comboboxchange', function(e, ui) {
		changeEvent = ui;	
	});

	$('#demo2').focus();
	dropdownOptions('demo2').eq(2).mouseover();
	equals(changeEvent.value, 'pear');
	equals($('#demo2').val(), 'orange', 'field');
	ok(dropdownOptions('demo2').eq(2).is('.selected'), 'mouseover selects');

	dropdownOptions('demo2').eq(2).click();
	$('#demo2').blur();
	equals($('#demo2').val(), 'pear', 'field');
	equals(selectEvent.value, 'pear', 'event');
	equals(selectEvent.index, 2);
	ok(selectEvent.isCustom == false, 'is custom');
	ok(dropdownList('demo2').is(':hidden'), 'menu hidden');
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

	fireKey(KEY_UP);
	equals(changeEvent.value, 'grape');

	fireKey(KEY_DOWN);
	fireKey(KEY_DOWN);
	equals(changeEvent.value, 'apple');

	fireKey(KEY_ENTER);
	equals($('#demo2').val(), 'apple', 'value');
	equals(selectEvent.value, 'apple');
	ok(dropdownList('demo2').is(':hidden'), 'menu hidden');
});

test('select by typing', function() {
	var keyEvent = null, selectEvent = null;
	makeDemo2().bind('comboboxkey', function(e, ui) {
		keyEvent = ui;
	})
	.bind('comboboxselect', function(e, ui) {
		selectEvent = ui;
	});

	$('#demo2').focus().val('pe');
	fireKey(101);	 // e
	ok(dropdownList('demo2').is(':visible'), 'list is visible');
	ok(dropdownOptions('demo2').eq(2).is('.selected'), 'Pears is selected');
	equals(keyEvent.value, 'pe');
	
	fireKey(KEY_ENTER);
	equals(selectEvent.value, 'pear');
	equals(selectEvent.index, 2);
});

test('both open', function() {
	makeDemo1();
	makeDemo2();

	clickDropdown('demo1');
	ok(dropdownList('demo1').is(':visible'), 'list 1 is visible');

	clickDropdown('demo2');
	ok(dropdownList('demo2').is(':visible'), 'list 2 is visible');
	ok(dropdownList('demo1').is(':hidden'), 'list 1 is not visible');
});
