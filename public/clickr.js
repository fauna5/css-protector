

//function(){
	var scans = document.querySelectorAll('.scan');
	for (var i = 0; i < scans.length; ++i) {
		var scanEl = scans[i];
		scanEl.addEventListener("click", scanClicked);
	}

	document.getElementById('diff').addEventListener("click", diff);
	document.getElementById('clear').addEventListener("click", clear);

	var first = null;
	var second = null;

	function scanClicked(){
		console.log(event.target.id);
		if(first === null){
			event.target.style.backgroundColor = 'green';
			first = event.target.id;
		} else if(second === null){
			event.target.style.backgroundColor = 'red';
			second = event.target.id;
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
//}()

