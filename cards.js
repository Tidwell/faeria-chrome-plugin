(function() {
	const STORAGE = window.FAERIA_HOVER_CHROME_EXTENSION_STORAGE;

	let CARD_SIZE = 300;
	let ALL_FAERIA_CARDS;

	let SORTED_ALL_CARDS;

	const ignoreNodes = [
		'SCRIPT',
		'NOSCRIPT',
		'A',
		'IMG',
		'INPUT',
		'OPTION',
		'TEXTAREA'
	];

	const ignoreCards = [
		338,
		318,
		317,
		325,
		341,
		322,
		324,
		319,
		334,
		332,
		333,
		330,
		336,
		331,
		320,
		340,
		321,
		337
	];

	const wrapperDataAttr = 'data-faeria-card-hover-chrome-extension-card-id';
	const imageDataAttr = 'data-faeria-hover-chrome-extension-card-overlay-image';

	function createWrapper(txt, id) {
		const prettyTxt = txt.toLowerCase().replace(/[^\w]/gi, '-');
		return `<a href="//www.faeria.com/the-hub/card/${id}-${prettyTxt}" ${wrapperDataAttr}="${id}">${txt}</a>`;
	}

	function createCardElement(id) {
		const img = document.createElement('img');
		img.src = `//raw.githubusercontent.com/abrakam/Faeria_Cards/master/CardExport/English/${id}.png`;
		return img;
	}

	function padNum(num) {
		var str = String(num);
		while (str.length < 3) {
			str = 0 + str;
		}
		return str;
	}

	function occuranceIndexes(source, find) {
		let i;
		var result = [];
		for (i = 0; i < source.length; ++i) {
			if (source.substring(i, i + find.length).toLowerCase() === find) {
				result.push(i);
			}
		}
		return result;
	}

	function replaceOccurances(card, text, occurances) {
		let lastIndex = 0;
		const newTextFragments = [];
		occurances.forEach((txtIndex) => {
			newTextFragments.push(text.substring(lastIndex, txtIndex));
			const wrapper = createWrapper(card.name, card.id);
			newTextFragments.push(wrapper);
			lastIndex = txtIndex + card.name.length;
		});
		const txtAfter = text.substring(occurances[occurances.length - 1] + card.name.length);
		newTextFragments.push(txtAfter);
		const returnText = newTextFragments.join('');
		return returnText;
	}

	function replaceNode(node, replacementMarkup) {
		const replacementNode = document.createElement('span');
		replacementNode.innerHTML = replacementMarkup;
		node.parentNode.replaceChild(replacementNode, node);
	}

	function replaceNodeText(node) {
		const txt = node.textContent;
		if (!txt) {
			return;
		}

		let lowercaseTxt = txt.toLowerCase();
		let newText = txt;

		ALL_FAERIA_CARDS.forEach((card) => {
			if (ignoreCards.indexOf(card.id) > -1) {
				return;
			}

			const occurances = occuranceIndexes(lowercaseTxt, card.name.toLowerCase());
			if (occurances.length) {
				newText = replaceOccurances(card, newText, occurances);
				lowercaseTxt = newText.toLowerCase();
			}
		});
		if (newText !== txt) {
			replaceNode(node, newText);
		}
	}

	function crawlText(parentNode) {
		parentNode.childNodes.forEach((node) => {
			if (ignoreNodes.indexOf(node.tagName) > -1 ||
				(node.dataset && node.dataset.faeriaCardHoverChromeExtensionCardId) ||
				(node.dataset && node.dataset.cardPreview)) {
				return;
			}
			if (node.nodeType == Element.TEXT_NODE && node.textContent) {
				replaceNodeText(node);
			} else if (node.nodeType === Element.ELEMENT_NODE) {
				crawlText(node);
			}
		});
	}

	function showCardPopup(event) {
		const element = event.target;
		const rect = element.getBoundingClientRect();

		let leftPosition = rect.left - (CARD_SIZE/2) + (rect.width / 2);

		document.documentElement.style.setProperty('--faeria-hover-chrome-extension-card-overlay-top',  `${rect.top}px`);
		document.documentElement.style.setProperty('--faeria-hover-chrome-extension-card-overlay-left', `${leftPosition}px`);
		const cardId = padNum(element.dataset.faeriaCardHoverChromeExtensionCardId);
		const cardElement = createCardElement(cardId);
		cardElement.dataset.faeriaHoverChromeExtensionCardOverlayImage = true;
		document.body.appendChild(cardElement);
	}

	function removeCardPopup() {
		document.body.removeChild(document.querySelectorAll('[' + imageDataAttr + ']')[0]);
	}

	function addEventListeners() {
		document.querySelectorAll('[' + wrapperDataAttr + ']').forEach((element) => {
			if (element.dataset.faeriaCardHoverChromeExtensionBound) {
				return;
			}
			element.addEventListener('mouseenter', showCardPopup);
			element.addEventListener('mouseleave', removeCardPopup);
			element.dataset.faeriaCardHoverChromeExtensionBound = true;
		});
	}

	//the forums use Ember, so we have no idea if stuff gets re-rendered, instead we check every 10 seconds
	function continuousCheck() {
		setInterval(() => {
			crawlText(document);
			addEventListeners();
		}, 10000);
	}

	function getSettings() {
		chrome.storage.sync.get({
			cardSize: 300
		}, function(items) {
			CARD_SIZE = items.cardSize;
			document.documentElement.style.setProperty('--faeria-hover-chrome-extension-card-overlay-card-size', `${items.cardSize}px`);
		});
	}

	function sortCards() {
		SORTED_ALL_CARDS = ALL_FAERIA_CARDS.sort((a, b) => {
			if (a.name.length < b.name.length) {
				return 1;
			}
			if (a.name.length > b.name.length) {
				return -1;
			}
			return 0;
		});
	}

	function init() {
		sortCards();
		getSettings();
		crawlText(document);
		addEventListeners();
		continuousCheck();
	}


	STORAGE.getCards(function(cards) {
		ALL_FAERIA_CARDS = cards;
		init();
	});
	
}());

