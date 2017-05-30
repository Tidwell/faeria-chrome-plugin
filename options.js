let sizeInput;
let statusTxt;

function getElements() {
	sizeInput = document.getElementById('card-size');
	statusTxt = document.getElementById('status');
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
}

function bindEvents() {
	sizeInput.addEventListener('input', updateValue);
	sizeInput.addEventListener('change', onChange);
}

function init() {
	getElements();
	bindEvents();
	restoreOptions();
}

// Init
document.addEventListener('DOMContentLoaded', init);
