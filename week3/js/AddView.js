var AddView = (function () {
	var DEFAULTS = {
		isMobile: true,
		list: {add: function() {}}
	};

	var AddView = function (options) {
		var _this = this,
			 _el = null,
		    _options = DEFAULTS,
			 _titleField = null,
			 _contentField = null,
			 _locationField = null,
			 _addButton = null;

		var __construct = function (options) {
			for (var key in options) {
				if (key === 'el') {
					_el = options[key];
				} else {
					_options[key] = options[key];
				}
			}

			_titleField = document.getElementById('entry-title');
			_contentField = document.getElementById('entry-content');
			_locationField = document.getElementById('entry-geolocate');
			_addButton = document.getElementById('entry-submit');

			// If geolocation is not supported, hide the control in the view
			if (!navigator.geolocation) {
				_locationField.checked = false;
				_locationField.parentNode.style.display = 'none';
			}
			
			// Event handler(s)
			_addButton.addEventListener(_options.isMobile?'touchend':'mouseup',
					_this.onViewSubmit);
		};

		var _clearForm = function () {
			_titleField.value = '';
			_contentField.value = '';
			// Let's remember user preference for location information
		};

		this.onViewSubmit = function () {
			// Note :: We're not validating the input here. If _you_ put in funky
			// markup that ruins the page, _you_ just ruined it for _you_. Maybe in
			// a production system we would validate, show errors, clean input
			// etc..., but for now this seems okay.

			var title = _titleField.value;
			var content = _contentField.value;
			var includeLocation = _locationField.checked;
			var date = +new Date; 

			var addEntry = function (data) {

				options.list.add(new Entry({
					'title': title,
					'content': content,
					'date': date,
					'location': (data && data.coords) ? data.coords : null
				}));

				window.location.hash = '#' + Layout.VIEW_LIST;
			};

			if (includeLocation) {
				navigator.geolocation.getCurrentPosition(addEntry, addEntry);
			} else {
				addEntry(null);
			}

			_clearForm();
		};

		__construct(options);
	};

	return AddView;
}).call(this);
