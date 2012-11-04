document.addEventListener('DOMContentLoaded', function () {
	var container = document.getElementsByClassName('entries')[0];
	var articles = container.getElementsByTagName('article');

	container.className = 'entries enhanced';

	for (var i = 0, article = null; article = articles[i]; i++) {
		var heading = article.getElementsByTagName('h2')[0];
		heading.addEventListener('click', (function (context) {
			return function (e) {
				if (context.className === 'expanded') {
					context.className = '';
				} else {
					context.className = 'expanded';
				}
			};
		})(article));
	}
});
