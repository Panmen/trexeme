
function send_event_run(){
	if ("ga" in window) {
	    tracker = ga.getAll()[0];
	    if (tracker)
	        tracker.send('event', 'Toolbar', 'Run');
	}
}

function btn_runstop(){
	//alert("Play/Stop");

	if(program_running){
		stop_execution();
	}else{
		send_event_run();
		start_execution();
		document.location = "#keyboard";
	}
}

function stop_execution(){
	program_running = false;
	program_worker.terminate();
	create_worker();
	document.getElementById("btn_runstop").innerHTML = "Run";
	write_screen_error("Stopped.");
}

function start_execution(){
	program_worker.postMessage({type:"start", code:editor.getValue()});
	program_running = true;
	document.getElementById("btn_runstop").innerHTML = "Stop";
}


function btn_save(){
	alert("Save");
}

function btn_load(){
	alert("Load");
}

function keyboard_down(e){
	if(e.keyCode == 13){
		if(keyboard.value.trim() != ""){
			var text = keyboard.value;
			keyboard.value = "";
			read_screen(text);
		}
		keyboard.value = "";
	}
}

function save(){
	//alert("Saving...");
	var file = new Blob([editor.getValue()], {type: "text/plain;charset=utf-8"});
	var filename = document.getElementById("save_filename").value;

	location.replace("#");

	saveAs(file, filename + '.txt');

}

function load(){
	//alert("Loading...");

	var file = document.getElementById("load_file").files[0];

	if(file == undefined) return;


	if(program_running){
		stop_execution();
	}

	var reader = new FileReader();
        reader.readAsText(file);
        reader.onload = function(e) {
            // browser completed reading file - display it
            editor.setValue(e.target.result);
			location.replace("#");
        };
}

