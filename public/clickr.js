;// Wrapped so we don't have to worry about polluting the global namespace.
(function(){
	var scans = document.querySelectorAll('.scan');
	for (var i = 0; i < scans.length; ++i) {
		var scanEl = scans[i];
		scanEl.addEventListener("click", scanClicked);
	}

	document.getElementById('diff').addEventListener("click", diff);
	document.getElementById('clear').addEventListener("click", clear);

	var first = null;
	var second = null;

	function scanClicked(event) {
		var clickedElement = event.target;
		var clickedId = clickedElement.id;
		console.log(clickedId);
		if(first === clickedId) {
			first = null;
			clickedElement.style.backgroundColor = '';
		} else if(second === clickedId) {
			second = null;
			clickedElement.style.backgroundColor = '';
		} else if(first === null) {
			clickedElement.style.backgroundColor = 'green';
			first = clickedId;
		} else if(second === null){
			clickedElement.style.backgroundColor = 'red';
			second = clickedId;
		}
	}

	function clear(){
		if(first !== null){
			document.getElementById(first).style.backgroundColor = null;
			first = null;
		}
		if(second !== null){
			document.getElementById(second).style.backgroundColor = null;
			second = null;
		}
	}

	function diff(){
		if (first === null || second === null){
			alert('must select 2 items to diff');
		} else {
			window.location.href = '/diff?first=' + first + '&second=' + second;
		}
	}
})();
