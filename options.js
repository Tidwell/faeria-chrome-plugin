(function() {

const STORAGE = window.FAERIA_HOVER_CHROME_EXTENSION_STORAGE;
const chrome = window.chrome;

let sizeInput;
let statusTxt;
let loadedTime;
let clearButton;
let fetchButton;

function getElements() {
	sizeInput = document.getElementById('card-size');
	statusTxt = document.getElementById('status');
	loadedTime = document.getElementById('card-loaded-time');
	clearButton = document.getElementById('cache-clear');
	fetchButton = document.getElementById('cache-fetch');
}

function updateValue() {
	statusTxt.textContent = sizeInput.value;
}

function onChange() {
	saveOptions();
	updateValue();
}

// Saves options to chrome.storage
function saveOptions() {
	const size = sizeInput.value;
	chrome.storage.sync.set({
		cardSize: size,
	}, function() {
		//saved
	});
}

function restoreOptions() {
	chrome.storage.sync.get({
		cardSize: 300
	}, function(items) {
		sizeInput.value = items.cardSize;
		updateValue();
	});

	STORAGE.lastRetrieved(function(time){
		let markup = 'Card Data has not been loaded, it will be fetched the first time it is needed.';
		if (time) {
			time = new Date(time);
			markup = 'Card Data loaded at ' + time.toDateString() + ' ' + time.toTimeString();
		}
		loadedTime.innerHTML = markup;
	});
}

function clearCache() {
	STORAGE.clear(function() {
		restoreOptions();
	});
}

function fetchCache() {
	STORAGE.forceFetch(function() {
		restoreOptions();
	});
}

function bindEvents() {
	sizeInput.addEventListener('input', updateValue);
	sizeInput.addEventListener('change', onChange);
	clearButton.addEventListener('click', clearCache);
	fetchButton.addEventListener('click', fetchCache);
}

function init() {
	getElements();
	bindEvents();
	restoreOptions();
}

// Init
document.addEventListener('DOMContentLoaded', init);

}());
