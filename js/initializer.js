
var code_area = document.getElementById("code_area");
var editor = CodeMirror.fromTextArea(code_area, {lineNumbers: true,
	lineWrapping: false,
	mode: "glwssa",
	theme:"rubyblue",
	autofocus: true,
	tabSpace: 4});
//editor.setSize(500, 500);

var keyboard = document.getElementById("keyboard");


var program_worker; create_worker();
var program_running = false;


var file_explorer_inst = new file_explorer("examples");
file_explorer_inst.init();



//public functions
function httpGet(theUrl){
	var xmlHttp = new XMLHttpRequest();
	xmlHttp.open( "GET", encodeURI(theUrl), false ); // false for synchronous request
	xmlHttp.send( null );
	return xmlHttp.responseText;
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}


function is_letter(c){
	var regex = /^[Α-Ωα-ωA-Za-z_άέήίόύώ]$/;
	return c.match(regex) != null;
}

function is_letter_or_symnum(c){
	var regex = /^[Α-Ωα-ωA_Za-z_0-9άέήίόύώ]$/;
	return c.match(regex) != null;
}

function is_whitespace(c){
	var regex = /^\s$/;
	return c.match(regex) != null;
}

function create_worker(){
	program_worker = new Worker("/js/program_worker.js");
	
	program_worker.onmessage = function(event){
		console.log("Main");
		console.log(event.data);


		switch(event.data.type){
			case "clear_screen":
				clear_screen();
			break;
			case "write_screen":
				write_screen(event.data.text);
			break;
			case "ended":
				program_running = false;
				document.getElementById("btn_runstop").innerHTML = "Run";
				if(event.data.error){
					write_screen_error(event.data.msg);
				}else{
					write_screen_msg(event.data.msg);
				}
			break;
		}
	}
}
