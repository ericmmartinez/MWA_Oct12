var AddView = (function () {
	var DEFAULTS = {
		isMobile: true,
		layout: {setView: function() {}},
		list: {add: function() {}}
	};

	var AddView = function (options) {
		var _this = this,
			 _el = null,
		    _options = DEFAULTS,
			 _titleField = null,
			 _contentField = null,
			 _locationField = null,
			 _dateField = null,
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
			_dateField = document.getElementById('entry-date');
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

		this.onViewSubmit = function () {
			var title = _titleField.value;
			var content = _contentField.value;
			var includeLocation = _locationField.checked;
			var date = +new Date; 

			var addEntry = function (data) {
				var isGood = (data !== null && typeof data.coords !== 'undefined');

				options.list.add(new Entry({
					'title': title,
					'content': content,
					'date': date,
					'location': (isGood) ? data.coords : null
				}));

				//options.layout.setView(Layout.VIEW_LIST);
				window.location.hash = '#' + Layout.VIEW_LIST;
			};

			if (includeLocation) {
				navigator.geolocation.getCurrentPosition(addEntry, addEntry);
			} else {
				addEntry(null);
			}
		};

		__construct(options);
	};

	return AddView;
}).call(this);
