var Notifier = (function () {
	var b = document.body;
	var Notifier = {
		notify: function (message) {
			var aside = document.createElement('aside');
			aside.innerHTML = message;
			aside.className = 'notification';
			b.appendChild(aside);

			setTimeout(function () {
				aside.className = 'notification remove';
			}, 5000);
			setTimeout(function () {
				b.removeChild(aside);
			}, 6000);
		}
	};

	return Notifier;
}).call(this);
