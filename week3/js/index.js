// Container for the diary
var diaryContainer = null;

var updateDiaryContext = function () {
	var newContext = window.location.hash;

	if (newContext === '') {
		// Default context
		newContext = 'addentry';
	} else {
		newContext = newContext.replace('#', '');
	}

	diaryContainer.classList.remove(
		(newContext === 'addentry') ? 'entries' : 'addentry');
	diaryContainer.classList.add(newContext);
};

document.addEventListener('DOMContentLoaded', function () {
	// Set the container for the diary
	diaryContainer = document.body;

	// Set up context switching (add/view)
	if ("onhashchange" in window) {
		window.addEventListener('hashchange', updateDiaryContext);
	} else {
		// Hack. Check hash on an interval.
		(function () {
			var knownHash = window.location.hash;
			var intervalHandler = setInterval(function () {
				var currentHash = window.location.hash;
				if (currentHash !== knownHash) {
					knownHash = currentHash;
					updateDiaryContext();
				}
			}, 250);
		}).call(this);
	}

	// If user is returning to a bookmark with a hash, show proper context
	updateDiaryContext();
});
