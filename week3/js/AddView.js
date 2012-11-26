/**
 * This script defines an AddView class. This class is used to handle
 * information input and submitted from the HTML form. When the add button on
 * the form is clicked (mouseup/touchend), the form fields are read, attached to
 * an anonymous object, and this data object is added to the List.
 *
 * @see List.js
 */
var AddView = (function () {
	// Some sensible defaults
	var DEFAULTS = {

		// This is a mobile app, but it might get loaded on a desktop too. We'll
		// assume mobile, but the "real" value should be set during construction.
		isMobile: true,

		// List really should be set in the options during construction, if it
		// isn't, just use a dummy list.
		list: {add: function() {}}
	};

	/**
	 * Class definition.
	 *
	 * @see AddView#__construct
	 */
	var AddView = function (options) {
		var _this = this,
			 _el = null,
		    _options = DEFAULTS,
			 _titleField = null,
			 _contentField = null,
			 _locationField = null,
			 _addButton = null;

		/**
		 * Constructor.
		 *
		 * This method is called during construction. Options are extended with
		 * the class DEFAULTS and internal fields are fetched from the DOM and
		 * stored for faster access later. Finally, an event handler is added to
		 * the "add" button in order to add an entry to the diary.
		 *
		 * @see AddView#DEFAULTS
		 */
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

		/**
		 * Clears, or resets, the entry form. This is called after the user adds
		 * the current entry to the diary. This does not get called if the user
		 * shows/hides the form.
		 *
		 * The user preference as to whether or not to include location
		 * information is not cleared by this method.
		 */
		var _clearForm = function () {
			_titleField.value = '';
			_contentField.value = '';
		};

		var _notify = function (message) {
			alert(message);
		};

		/**
		 * Adds the current entry to the diary. Input is not validated or even
		 * ensured to be non-empty. This is a _user_ diary and the user can do
		 * what they choose. Also, if the _user_ makes a mistake, they can always
		 * delete entries as well.
		 */
		this.onViewSubmit = function () {
			var title = _titleField.value;
			var content = _contentField.value;
			var includeLocation = _locationField.checked;
			var date = +new Date; 

			/**
			 * Callback that actually adds the data to the diary. This callback is
			 * required in case user has selected to include location information.
			 * If user does not want location information, this method is invoked
			 * immediately.
			 *
			 * @param data {Position|PositionError}
			 *      The result of the geolocation getCurrentPosition method. May
			 *      also be null if user does not want position information.
			 */
			var addEntry = function (data) {
				options.list.add({
					'title': title,
					'content': content,
					'date': date,
					'location': (data && data.coords) ? data.coords : null
				});

				// Let user know their efforts have failed
				if (includeLocation && (!data || !data.coords)) {
					_notify('Geolocation failed.');
				}

			};

			if (includeLocation) {
				navigator.geolocation.getCurrentPosition(addEntry, addEntry,
						{enableHighAccuracy: true, timeout: 10000});
			} else {
				addEntry(null);
			}

			// Reset the form
			_clearForm();

			// Use the hash change listener to switch back to list view
			window.location.hash = '#' + Layout.VIEW_LIST;
		};

		// Call constructor now
		__construct(options);
	};

	return AddView;
}).call(this);
