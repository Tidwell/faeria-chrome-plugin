FAERIA_HOVER_CHROME_EXTENSION_STORAGE = (function() {
	const console = window.console;
	const chrome = window.chrome;

	let fetchUrlPrefix = '';
	if (window.location.protocol === 'chrome-extension:') {
		fetchUrlPrefix = 'http:';
	}
	function fetchCards(cb) {
		fetch(fetchUrlPrefix + '//raw.githubusercontent.com/Tidwell/faeria-cards/master/build/output.json')
			.then(
				function(response) {
					if (response.status !== 200) {
						cb(response, null);
						return;
					}

					// Examine the text in the response  
					response.json().then(function(data) {
						cb(null, data);
					});
				}
			)
			.catch(function(err) {
				cb(err, null);
			});
	}

	function fetchFail(err) {
		console.warn('Faeria Cards Popup Extension: failed to load cards.', err);
	}

	function fetchSuccess(data, callback) {
		chrome.storage.local.set({
			faeriaHoverChromeExtensionAllCardCache: data,
			faeriaHoverChromeExtensionAllCardCacheLastRetrieved: Date.now()
		}, function() {
			callback(data);
		});
	}

	function forceFetch(callback) {
		fetchCards(function(err, data){
			if (err) {
				return fetchFail(err);
			}
			fetchSuccess(data, callback);
		});
	}

	function getCards(callback) {
		chrome.storage.local.get(['faeriaHoverChromeExtensionAllCardCache'], function(items) {
			if (items.faeriaHoverChromeExtensionAllCardCache) {
				callback(items.faeriaHoverChromeExtensionAllCardCache);
			} else {
				fetchCards(function(err, data){
					if (err) {
						return fetchFail(err);
					}
					fetchSuccess(data, callback);
				});
			}
		});
	}

	function getLastRetrieved(callback) {
		chrome.storage.local.get(['faeriaHoverChromeExtensionAllCardCacheLastRetrieved'], function(items) {
			if (items.faeriaHoverChromeExtensionAllCardCacheLastRetrieved) {
				callback(items.faeriaHoverChromeExtensionAllCardCacheLastRetrieved);
			} else {
				callback(null);
			}
		});
	}

	function clear(callback) {
		chrome.storage.local.remove([
			'faeriaHoverChromeExtensionAllCardCache',
			'faeriaHoverChromeExtensionAllCardCacheLastRetrieved'
		], function(){
			callback();
		});
	}

	return {
		getCards: getCards,
		clear: clear,
		lastRetrieved: getLastRetrieved,
		forceFetch: forceFetch
	};
}());
