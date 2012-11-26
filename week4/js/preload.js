/**
 * Create the diary application.
 */
document.addEventListener('DOMContentLoaded', function () {
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

	// pre-load some stuff
	var existing = window.localStorage.getItem('diary');
	if (!existing || (JSON.parse(existing)).length === 0) {
	
	list.add({
		'title': 'Wrote my first mobile application',
		'content': 'Today I wrote my first mobile application. It was great! I had huge amounts of fun, it was a lot easier than I expected, and I was so happy I spent the rest of the day celebrating.',
		'date': +new Date,
		'location': {
			'latitude':0.0,
			'longitude':0.0
		}
	});
	list.add({
		'title': 'Wrote another mobile application',
		'content': 'I am on such a roll with these mobile Web applications that I went crazy and wrote a second one. I am so happy I cannot stop singing at the top of my lungs. My cat seems worried that I\'ve finally lost it completely, but I don\'t care — it\'s mobile Web all the way from now on!',
		'date': +new Date,
		'location': {
			'latitude':0.0,
			'longitude':0.0
		}
	});
	list.add({
		'title': 'Must stop writing mobile applications',
		'content': 'My fingers are sore from writing so many great mobile Web applications. I know that I should stop and take a break, but there are so many great things to do with this technology that I really don\'t know how to stop!',
		'date': +new Date,
		'location': {
			'latitude':0.0,
			'longitude':0.0
		}
	});

	}
});
