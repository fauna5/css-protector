console.log('loaded scan');

function scan(elemId){
	var outputTree = {children: []};
	var itemsScanned = 0;
	var startTime = Date.now();

	var element = document.getElementById(elemId);
	scanElement(element, outputTree, itemsScanned, startTime);
	console.log(outputTree);

}

function scanElement(element, outputTree, itemsScanned, startTime){
	if((Date.now() - startTime)/100 == 20 ){
		console.log('timed out');
		return;
	}

	if(element.nodeName == '#text'){
		//don't scan text nodes
		return;
	}
	
	var elementTree = {children: []}
	elementTree.name = element.nodeName;
	var computedStyle = window.getComputedStyle(element);
	for (x in computedStyle){
		if(isNaN(x)){
			var styleValue = computedStyle.getPropertyValue(x);
			if(styleValue != null && styleValue != ''){
				elementTree[x] = styleValue;
			}
		}
	}
	outputTree.children.push(elementTree);
	console.log('scanned', ++itemsScanned, 'itemsScanned in', (Date.now() - startTime)/100, 'seconds');

	for (var i = 0; i < element.childNodes.length; i++) {
		var returned = scanElement(element.childNodes[i], elementTree, itemsScanned, startTime);
		if (returned) {
			itemsScanned = returned;
		}
	};
	return itemsScanned;
}

scan('top-story');