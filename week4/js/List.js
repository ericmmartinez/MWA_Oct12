/**
 * This script defines the List manager for the application. This is the heart
 * of the application.
 *
 * The list manager saves/loads the diary information to/from localStorage,
 * renders the diary entries for viewing, and accepts new entries from the
 * AddView.
 *
 * @see #AddView
 */
var List = (function () {
	// Static constants
	var ID_PREFIX = 'entry-',
	    DELETE_PREFIX = 'delete-',
	    STORAGE_KEY = 'diary';
	    CLASS_VISIBLE = 'visible'; // Must correspond with CSS
	    CLASS_DELETE = 'delete';
	    DEFAULTS = {clickTimeout: 300/*ms*/, swipeYThreshold: 20/*px*/};

	/**
	 * Static helper method.
	 *
	 * Creates the markup for the entry.
	 *
	 * @param entry {Object}
	 *      The data structure containing entry information from the AddView.
	 *
	 * @return {String}
	 *      The markup suitable for injection into the DOM. Note, this is a
	 *      String, not a DOM object. Insertion is done as a single "innerHTML"
	 *      call (this is for efficiency purposes).
	 */
	var _renderEntry = function (entry) {

		if (!entry) { return ''; }

		var theDate = new Date(entry.date),
		    timeStamp = _iso8601(theDate),
			 formattedTime = _formatDate(theDate),
			 formattedPosition = _formatPosition(entry.location),
			 id = ID_PREFIX + entry.date;

		return [
			'<article id="', id, '">',
				'<h2>',
					entry.title,
					'<a href="#', DELETE_PREFIX, ID_PREFIX, entry.date, '">',
						'Delete',
					'</a>',
				'</h2>',
				'<h3>',
					'<time datetime="', timeStamp, '">',
						formattedTime,
					'</time>',
					formattedPosition,
				'</h3>',
				'<p>',
					entry.content.replace(/\n+/g, '</p><p>'),
				'</p>',
			'</article>'
		].join('');
	};

	/**
	 * Static helper method.
	 *
	 * This method formats a date object according to the ISO-8601 specification.
	 * If the date object has a native implementation, this method delegates to
	 * that implementation. This _could_ be a polyfill, but meh.
	 *
	 * @param date {Date}
	 *      The date object to format.
	 *
	 * @return {String}
	 *      The ISO-8601 format for the given date.
	 */
	var _iso8601 = function (date) {
		if (date.toISOString) {
			return date.toISOString();
		} else {
			var y = date.getUTCFullYear(),
			    m = date.getUTCMonth() + 1,
			    d = date.getUTCDate(),
			    h = date.getUTCHours(),
			    i = date.getUTCMinutes(),
			    s = date.getUTCSeconds(),
			    l = String((date.getUTCMilliseconds()/1000).toFixed(3)).slice(2,5);

			if (m < 10) { m = '0' + m; }
			if (d < 10) { d = '0' + d; }
			if (h < 10) { h = '0' + h; }
			if (i < 10) { i = '0' + i; }
			if (s < 10) { s = '0' + s; }

			return y+'-'+m+'-'+d+'T'+h+':'+i+':'+s+'.'+l+'Z';
		}
	};

	/**
	 * Static helper method.
	 *
	 * @param date {Date}
	 *      The date object to format.
	 * @return {String}
	 *      A human-readable date format.
	 */
	var _formatDate = function (date) {
		return date.toString(); // Improve this?
	};

	/**
	 * Static helper method.
	 *
	 * @param coords {Coordinates}
	 *      The GoeLocation API Coordinates object to format.
	 * @return {String}
	 *      A human-readable location format string.
	 */
	var _formatPosition = function (coords) {
		var latitude = null, latLbl = '&deg;N',
		    longitude = null, lngLbl = '&deg;E';

		if (coords === null) {
			return '';
		}

		latitude = parseFloat(coords.latitude);
		longitude = parseFloat(coords.longitude);
		if (latitude < 0.0) { latitude *= -1.0; latLbl = '&deg;S'; }
		if (longitude < 0.0) { longitude *= -1.0; lngLbl = '&deg;W'; }

		return latitude.toFixed(2)+latLbl +', '+ longitude.toFixed(2)+lngLbl;
	};


	/**
	 * Class definition.
	 *
	 * @see #__construct
	 */
	var List = function (options) {
		var _this = this,
			 _options = DEFAULTS,
		    _entries = [],
			 _el = null,
			 _holdStart = null,
			 _holdEnd = null;

		/**
		 * Constructor.
		 *
		 * Performs a few bootstrapping steps to prep the list. Reads in existing
		 * diary entries from local storage and renders them for viewing.
		 *
		 * @param options {Object}
		 *      Customizable configuration options. See #DEFAULTS for more
		 *      information.
		 */
		var __construct = function (options) {
			var es = null;
			for (var key in options) {
				if (key === 'el') {
					_el = options[key];
				} else {
					_options[key] = options[key];
				}
			}

			if (_el === null) {
				_el = document.createElement('section');
			}

			es = window.localStorage.getItem(STORAGE_KEY);
			if (es) {
				_entries = JSON.parse(es);
			}

			_this.render();
		};

		/**
		 * Private method.
		 *
		 * Binds event handlers to the headers in the diary. Event handlers are
		 * mobile-aware and support click (tap) or drag/hold (swipe) events.
		 *
		 * Note :: Attempts were made to delegate events to the container element,
		 *         but performance seemed spotty and sometimes delegation seemed
		 *         to fail. Delegation would be preferred if it works reliably. 
		 */
		var _bindHandlers = function () {
			var headers = _el.getElementsByTagName('h2'),
				 // Map of events to callback that need binding
			    events = (_options.isMobile) ? 
				 		{
							'touchstart': _onHoldStart,
							'touchend': _onHoldEnd,
							'touchcancel': _onHoldCancel
						} 
					:
				 		{
							'mousedown': _onHoldStart,
							'mouseup': _onHoldEnd
						};

			for (var i = 0, h =  null; h = headers[i]; i++) {
				for (var type in events) {
					h.addEventListener(type, events[type]);
					var anchor = h.getElementsByTagName('a')[0];
					if (anchor) {
						anchor.addEventListener(
								_options.isMobile ? 'touchend' : 'mouseup',
								_deleteEntry);
					}
				}
			}
		};

		/**
		 * Private method.
		 *
		 * Removes the entry from the DOM and removes its corresponding object for
		 * the List.
		 *
		 * Note: This is an event callbaack method. Inside the method the "this"
		 * keyword refers to the DOM element on which the event was triggered. To
		 * reference the List object, use "_this".
		 *
		 * @param evt {Event}
		 *      The event that triggered this call.
		 * @see List#remove
		 */
		var _deleteEntry = function (evt) {
			var regex = new RegExp('^.*#' + DELETE_PREFIX + ID_PREFIX);
			var id = parseInt(this.href.replace(regex, ''), 10);
			_this.remove(_this.get(id));

			if (evt.preventDefault) {
				evt.preventDefault();
			}
			return false;
		};

		/**
		 * Private method.
		 *
		 * Triggers on mousedown (touchstart) on a header (h2) element in the
		 * diary. If a _holdStart has not been triggered yet, the _holdStart is
		 * set on the instance for later use. Multi-touch is not supported.
		 *
		 * Default event behavior is prevented after this method.
		 *
		 * @param evt {Event}
		 *      The event that triggered this call.
		 */
		var _onHoldStart = function (evt) {
			if (_holdStart === null) {
				_holdStart = {
					'stamp': +new Date,
					'evt': evt
				};
			}

			if (evt.preventDefault) {
				evt.preventDefault();
			}
			return false;
		};

		/**
		 * Private method.
		 *
		 * Triggers on mouseup (touchend) on a header (h2) element in the diary.
		 * If a _holdStart was previously triggered and no other touches are
		 * currently occurring, the "hold" event is handled.
		 *
		 * Default event behavior is prevented after this method.
		 *
		 * @param evt {Event}
		 *      The event that triggered this call.
		 */
		var _onHoldEnd = function (evt) {
			_holdEnd =  {
				'stamp': +new Date,
				'evt': evt
			};
			
			if (_holdStart !== null && (!evt.touches||evt.touches.length === 0)) {
				_handleEvent(_holdStart, _holdEnd);
			}

			// Clear hold status
			_holdStart = null; _holdEnd = null;

			if (evt.preventDefault) {
				evt.preventDefault();
			}

			return false;
		};

		/**
		 * Private method.
		 *
		 * Triggers when a touch is canceled. This happens for a variety of
		 * reasons, but in testing I never actually saw it get called. Hmm...
		 *
		 * Default event behavior is prevented after this method.
		 *
		 * @param evt {Event}
		 *      The event that triggered this call.
		 */
		var _onHoldCancel = function (evt) {
			_holdStart = null; _holdEnd = null;
			if (evt.preventDefault) {
				evt.preventDefault();
			}
			return false;
		};

		/**
		 * Private method.
		 *
		 * Called after a hold sequence has executed.
		 *
		 * If the hold was a simple click (tap) sequence, the corresponding diary
		 * entry is shown/hidden.
		 *
		 * If the hold was a drag (swipe) or just a press-and-hold sequence, a
		 * "delete" button is exposed in the UI so the corresponding diary entry
		 * can be removed from the diary.
		 *
		 * Each parameter is a "HoldEvent" which contains a references to an
		 * underlying mouse/touch event as well as a timestamp that references
		 * when the underlying mouse/touch event originally occurred.
		 *
		 * @param start {HoldEvent}
		 *      The HoldEvent that started the sequence.
		 * @param end {HoldEvent}
		 *      The HoldEvent that ended the sequence.
		 */
		var _handleEvent = function (start, end) {
			var startY = (start.evt.changedTouches) ?
					start.evt.changedTouches[0].clientY : start.evt.clientY;
			var endY = (end.evt.changedTouches) ?
					end.evt.changedTouches[0].clientY : end.evt.clientY;

			if (end.stamp - start.stamp <= _options.clickTimeout) {
				// Event was a simple click/tap event...
				_onHeaderActivate(end.evt);
			} else if (Math.abs(startY - endY) <= _options.swipeYThreshold) {
				// Event was a hold in place. Do same as swipe...
				_onHeaderHold(end.evt);
			}

		};

		/**
		 * Private method.
		 *
		 * Toggles visibility of the corresponding diary entry.
		 *
		 * @param evt {Event}
		 *      The mouse/touch event that triggered this call.
		 */
		var _onHeaderActivate = function (evt) {
			evt.target.parentNode.classList.toggle(CLASS_VISIBLE);
			evt.target.parentNode.classList.remove(CLASS_DELETE);
		};

		/**
		 * Private method.
		 *
		 * Toggles a "delete" button on the diary header.
		 *
		 * @param evt {Event}
		 *      The mouse/touch event that triggered this call.
		 */
		var _onHeaderHold = function (evt) {
			evt.target.parentNode.classList.toggle(CLASS_DELETE);
		};

		/**
		 * Public API method.
		 *
		 * @param id {Integer}
		 *      The id of the event to get from the diary. In practice, this is
		 *      the millisecond timestamp of when the entry was created.
		 *
		 * @return {Object}
		 *      The diary entry corresponding to the given id. Or null if no
		 *      entry is found.
		 */
		this.get = function (id) {
			for (var i = 0, entry = null; entry = _entries[i]; i++) {
				if (entry.date === id) {
					return entry;
				}
			}
			return null;
		};

		/**
		 * Public API method.
		 *
		 * Adds an entry to the diary.
		 *
		 * @param entry {Object}
		 *      The entry to add.
		 */
		this.add = function (entry) {
			_entries.push(entry);
			this.render();
		};

		/**
		 * Public API method.
		 *
		 * Removes an entry from the diary.
		 *
		 * @param entry {Object}
		 *      The entry to remove.
		 */
		this.remove = function (entry) {
			if (!entry) { return; }
			var entryId = entry.date;
			for (var i = 0, e = null; e = _entries[i]; i++) {
				var eid = e.date;
				if (eid === entryId) {
					_entries.splice(i, 1);
					this.render();
					break;
				}
			}
		};

		/**
		 * Public API method.
		 *
		 * (Re-)Renders the list. For each entry in the diary the helper method
		 * _renderEvent is called. If no entries are present, a "getting started"
		 * informational box is shown instead.
		 */
		this.render = function () {
			var markup = [], diary = [];

			for (var i = 0, entry = null; entry = _entries[i]; i++) {
				markup.push(_renderEntry(entry));
				diary.push(entry);
			}

			// Show most recent first
			markup.reverse();

			if (markup.length > 0) {
				// Show entries
				_el.innerHTML = markup.join('');
				_bindHandlers();
				window.localStorage.setItem(STORAGE_KEY, JSON.stringify(diary));
			} else {
				// No entries, show getting started info
				_el.innerHTML = [
					'<div class="getstarted">',
						'Seems like nothing is here yet. Why not try ',
						'<a href="#add">adding one now</a>?',
					'</div>'
				].join('');
				window.localStorage.removeItem(STORAGE_KEY);
			}
		};

		__construct(options);
	};

	return List;
}).call(this);
