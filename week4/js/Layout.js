/**
 * This script defines a Layout manager class for the page. The layout manager
 * listens for hash change events, and when it recognizes a hash that it
 * understands, it will set new classes on the document.body. These classes are
 * then used in CSS to change which view is displayed to the user.
 *
 */
var Layout = (function () {
	// Static constants
	var VIEW_LIST = 'list',
	    VIEW_ADD  = 'add',
	    DEFAULTS  = {initialView: VIEW_LIST};

	/**
	 * Class definition.
	 *
	 * @see __construct
	 */
	var Layout = function (options) {
		var _this = this,
		    _options = DEFAULTS,
		    _listeners = [],
		    _body = null,
			 _currentView = null,
			 _intervalHandler = null;

		/**
		 * Constructor
		 *
		 * Extends the given options with defaults, sets up the hash change
		 * listener and sets the initial view.
		 *
		 * @param options {Object}
		 *      Configuration options. See #DEFAULTS
		 */
		var __construct = function (options) {
			for (var key in options) {
				_options[key] = options[key];
			}

			// Save this for later
			_body = document.body;

			// Add hash change listener (see index.js)
			if ('onhashchange' in window) {
				window.addEventListener('hashchange', _onHashChange);
			} else {
				(function () {
					var previousHash = window.location.hash;
					_intervalHandler = setInterval(function () {
						var currentHash = window.location.hash;
						if (currentHash !== previousHash) {
							_onHashChange();
						}
					}, 250);
				}).call(this);
			}

			// Add online status listener if supported
			if ('onLine' in navigator) {
				window.addEventListener('online', function () {
					Notifier.notify('You are now online.');
				});

				window.addEventListener('offline', function () {
					Notifier.notify('You are now offline.');
				});

				if (navigator.onLine) {
					Notifier.notify('You are currently online.');
				} else {
					Notifier.notify('You are currently offline.');
				}
			}

			_this.setView(_options.initialView);
			_onHashChange();
		};

		/**
		 * Cleans up event handler on window to save memeory.
		 */
		this.__destroy = function () {
			if ('onhashchange' in window) {
				window.removeEventListener('hashchange', _onHashChange);
			} else {
				window.clearInterval(_intervalHandler);
			}
		};

		/**
		 * Private method.
		 *
		 * Triggers when the window hash changes. If the new hash corresponds to a
		 * known "view", the view is updated.
		 */
		var _onHashChange = function () {
			var view = window.location.hash.replace('#', '');
			if (view === VIEW_ADD || view === VIEW_LIST) {
				_this.setView(view);
			}
		};

		/**
		 * Sets the current view.
		 *
		 * @param view {String}
		 *      The new view to use. Nothing is done if already set to this view.
		 */
		this.setView = function (view) {
			var previewView = null;

			// Already using this view. Just stop.
			if (_currentView === view) { return; }

			_body.classList.remove((view===VIEW_LIST) ? VIEW_ADD : VIEW_LIST);
			_body.classList.add(view);

			previousView = _currentView;
			_currentView = view;

			// Notify listeners
			for (var i = 0, l = null; l = _listeners[i]; i++) {
				l.callback.call(l.context, _currentView, previousView);
			}
		};


		__construct(options);
	};

	// Expose these constants so others can use them
	Layout.VIEW_LIST = VIEW_LIST;
	Layout.VIEW_ADD = VIEW_ADD;

	return Layout;
}).call(this);
