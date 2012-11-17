var List = (function () {
	var STORAGE_KEY = 'diary';
	var DEFAULTS = {
	};

	var List = function (options) {
		var _this = this,
			 _options = DEFAULTS,
		    _entries = [],
			 _el = null;

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

		this.add = function (entry) {
			_entries.push(entry);
			this.render();
		};

		this.remove = function (entry) {
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
			_el.innerHTML = markup.join('');
			window.localStorage.setItem(STORAGE_KEY, JSON.stringify(diary));
		};

		__construct(options);
	};

	return List;
}).call(this);
