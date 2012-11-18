document.addEventListener('DOMContentLoaded', function () {
	var layout = new Layout(),
		list = new List({
			'el': document.getElementById('entries'),
			'isMobile': ('ontouchstart' in window)
		}),
		addView = new AddView({
			'el': document.getElementById('addentry'),
			'isMobile': ('ontouchstart' in window),
			'list': list
		});

	var onHashChange = function () {
		var view = window.location.hash.replace('#', '');
		if (view === Layout.VIEW_ADD || view === Layout.VIEW_LIST) {
			layout.setView(view);
		}
	}


	// Set up context switching (add/view)
	if ("onhashchange" in window) {
		window.addEventListener('hashchange', onHashChange);
	} else {
		// Hack. Check hash on an interval.
		(function () {
			var knownHash = window.location.hash;
			var intervalHandler = setInterval(function () {
				var currentHash = window.location.hash;
				if (currentHash !== knownHash) {
					knownHash = currentHash;
					onHashChange();
				}
			}, 250);
		}).call(this);
	}

	onHashChange();
});
