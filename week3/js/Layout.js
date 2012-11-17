var Layout = (function () {
	var VIEW_LIST = 'list',
	    VIEW_ADD  = 'add',
	    DEFAULTS  = {initialView: VIEW_LIST};

	var Layout = function (options) {
		var _this = this,
		    _options = DEFAULTS,
		    _listeners = [],
		    _body = null,
			 _currentView = null;

		var __construct = function (options) {
			for (var key in options) {
				_options[key] = options[key];
			}

			_body = document.body;

			_this.setView(_options.initialView);
		};

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

		this.addContextListener = function (callback, context) {
			callback.id = _listeners.length;
			_listeners.push({'callback': callback, 'context': context||window});
		};

		__construct(options);
	};

	Layout.VIEW_LIST = VIEW_LIST;
	Layout.VIEW_ADD = VIEW_ADD;

	return Layout;
}).call(this);
