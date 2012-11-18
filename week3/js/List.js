var List = (function () {
	var STORAGE_KEY = 'diary';
	var CLASS_VISIBLE = 'visible'; // Must correspond with CSS
	var CLASS_DELETE = 'delete';  
	var DEFAULTS = {
		clickTimeout: 300, // milliseconds
		swipeYThreshold: 20 // pixels (less than this means a swipe)
	};

	var List = function (options) {
		var _this = this,
			 _options = DEFAULTS,
		    _entries = [],
			 _el = null,
			 _holdStart = null,
			 _holdEnd = null;

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
				var e = JSON.parse(es);
				for (var i = 0, len = e.length; i < len; i++) {
					_entries.push(new Entry(e[i]));
				}
			}

			_this.render();
		};

		var _bindHandlers = function () {
			var headers = _el.getElementsByTagName('h2'),
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
						anchor.addEventListener('touchend', _deleteEntry);
					}
				}
			}
		};

		var _deleteEntry = function (evt) {
			var id = parseInt(this.href.replace(/^.*#delete-entry-/, ''), 10);
			_this.remove(_this.get(id));

			if (evt.preventDefault) {
				evt.preventDefault();
			}
			return false;
		};

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

		var _onHoldEnd = function (evt) {
			_holdEnd =  {
				'stamp': +new Date,
				'evt': evt
			};
			
			if (_holdStart !== null) {
				_handleEvent(_holdStart, _holdEnd);
			}

			// Clear hold status
			_holdStart = null; _holdEnd = null;

			if (evt.preventDefault) {
				evt.preventDefault();
			}

			return false;
		};

		var _onHoldCancel = function (evt) {
			_holdStart = null; _holdEnd = null;
			if (evt.preventDefault) {
				evt.preventDefault();
			}
			return false;
		};

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

		var _onHeaderActivate = function (evt) {
			evt.target.parentNode.classList.toggle(CLASS_VISIBLE);
			evt.target.parentNode.classList.remove(CLASS_DELETE);
		};

		var _onHeaderHold = function (evt) {
			evt.target.parentNode.classList.toggle(CLASS_DELETE);
		};

		this.get = function (id) {
			for (var i = 0, entry = null; entry = _entries[i]; i++) {
				if (entry.getId() === id) {
					return entry;
				}
			}
			return null;
		};

		this.add = function (entry) {
			_entries.push(entry);
			this.render();
		};

		this.remove = function (entry) {
			if (!entry) { return; }
			var entryId = entry.getId();
			for (var i = 0, e = null; e = _entries[i]; i++) {
				var eid = e.getId();
				if (eid === entryId) {
					_entries.splice(i, 1);
					this.render();
					break;
				}
			}
		};

		this.render = function () {
			var markup = [], diary = [];

			for (var i = 0, len =  _entries.length; i < len; i++) {
				markup.push(_entries[(len-i-1)].getMarkup());
				diary.push(_entries[i].getData());
			}

			if (markup.length > 0) {
				_el.innerHTML = markup.join('');
				_bindHandlers();
				window.localStorage.setItem(STORAGE_KEY, JSON.stringify(diary));
			} else {
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
