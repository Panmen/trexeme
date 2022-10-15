
var screen = document.getElementById("screen");
var screen_lines = [];

function write_screen(text){
	var new_line = document.createElement("div");
	
	new_line.innerHTML = filter_text(text);
	new_line.className = "out";

	screen_lines.push(new_line);
	screen.appendChild(new_line);

	screen.scrollTop = screen.scrollHeight;
}

function write_screen_msg(text){
	var new_line = document.createElement("div");
	
	new_line.innerHTML = filter_text(text);
	new_line.className = "msg";

	screen_lines.push(new_line);
	screen.appendChild(new_line);

	screen.scrollTop = screen.scrollHeight;
}

function write_screen_error(text){
	var new_line = document.createElement("div");
	
	new_line.innerHTML = filter_text(text);
	new_line.className = "error";

	screen_lines.push(new_line);
	screen.appendChild(new_line);

	screen.scrollTop = screen.scrollHeight;
}

function read_screen(text){

	var new_line = document.createElement("div");
	
	new_line.innerHTML = text;
	new_line.className = "in";

	screen_lines.push(new_line);
	screen.appendChild(new_line);

	screen.scrollTop = screen.scrollHeight;

	if(program_worker != undefined){
		program_worker.postMessage({type:"read", data:text});
	}
}

function clear_screen(){
	for(var i = 0; i < screen_lines.length; i++){
		screen.removeChild(screen_lines[i])
	}
	screen_lines = [];
}

function filter_text(text){
	return text.replace(/\&/g, '&amp;')
        .replace(/\</g, '&lt;')
        .replace(/\>/g, '&gt;')
        .replace(/\"/g, '&quot;')
        .replace(/\'/g, '&#x27');
}

