/**
 * Create the diary application.
 */
document.addEventListener('DOMContentLoaded', function () {
	Notifier.notify('Loaded!');
	var isMobile = ('ontouchstart' in document.createElement('a'));
	var layout = new Layout();
	var list = new List({
		'el': document.getElementById('entries'),
		'isMobile': isMobile
	});
	var addView = new AddView({
		'el': document.getElementById('addentry'),
		'isMobile': isMobile,
		'list': list
	});
});
