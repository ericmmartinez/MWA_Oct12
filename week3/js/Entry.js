var Entry = (function () {

	var ID_PREFIX = 'entry-';

	var iso8601 = function (theDate) {
		var year = null, month = null, day = null,
		    hour = null, minute = null, second = null;

		_formattedTime = theDate.toString();

		year = theDate.getUTCFullYear();
		month = theDate.getUTCMonth() + 1;
		if (month < 10) { month = '0' + month; }
		day = theDate.getUTCDate();
		if (day < 10) { day = '0' + day; }

		hour = theDate.getUTCHours();
		if (hour < 10) { hour = '0' + hour; }
		minute = theDate.getUTCMinutes();
		if (minute < 10) { minute = '0' + minute; }
		second = theDate.getUTCSeconds();
		if (second < 10) { second = '0' + second; }

		return [
			year, '-', month, '-', day,
			'T',
			hour, ':', minute, ':', second,
			'Z'
		].join('');
	};

	var formatPosition = function (position) {
		var latitude = null, latExtra = '&deg;N',
		    longitude = null, lonExtra = '&deg;E';

		if (position === null) {
			return '';
		}

		// Pre-format the location information
		latitude = parseFloat(position.latitude);
		longitude = parseFloat(position.longitude);
		if (latitude < 0.0) { latitude *= -1.0; latExtra = '&deg;S'; }
		if (longitude < 0.0) { longitude *= -1.0; lonExtra = '&deg;W'; }

		return [
			latitude.toFixed(2), latExtra,
			', ',
			longitude.toFixed(2), lonExtra
		].join('');
	};

	var Entry = function (data) {
		var _this = this,
		    _data = null,
		    _markup = '';

		var __construct = function (data) {
			var theDate = null,
			    timeStamp = '',
			    formattedTime = '',
			    formattedPosition = '';

			_data = data;

			theDate = new Date(_data.date);
			timeStamp = iso8601(theDate);
			formattedTime = theDate.toString(); // TODO :: Improve this
			formattedPosition = formatPosition(_data.location);

			_markup = [
				'<article id="', ID_PREFIX, _data.date, '">',
					'<h2>', _data.title, '</h2>',
					'<h3>',
						'<time datetime="', timeStamp, '">',
							formattedTime,
						'</time>',
						formattedPosition,
					'</h3>',
					_data.content,
				'</article>'
			].join('');
		};

		this.getMarkup = function () {
			return _markup;
		};

		this.getData = function () {
			return _data;
		};

		this.getId = function () {
			return _data.date;
		};

		__construct(data);
	};

	return Entry;
}).call(this);
