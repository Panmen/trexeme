
importScripts("mother_intepreter.js", "block.js", "evaluate_expression.js", "intepreter.js", "built_in_funcs.js");

var reserved = ["ΤΕΛΟΣ_ΠΡΟΓΡΑΜΜΑΤΟΣ", "ΤΕΛΟΣ_ΔΙΑΔΙΚΑΣΙΑΣ", "ΤΕΛΟΣ_ΕΠΑΝΑΛΗΨΗΣ", "ΤΕΛΟΣ_ΣΥΝΑΡΤΗΣΗΣ", "ΑΡΧΗ_ΕΠΑΝΑΛΗΨΗΣ", "ΤΕΛΟΣ_ΕΠΙΛΟΓΩΝ", "ΜΕΧΡΙΣ_ΟΤΟΥ", "ΔΙΑΔΙΚΑΣΙΑ", "ΑΛΛΙΩΣ_ΑΝ", "ΠΕΡΙΠΤΩΣΗ", "ΕΠΑΝΑΛΑΒΕ", "ΠΡΟΓΡΑΜΜΑ", "ΣΥΝΑΡΤΗΣΗ", "ΤΕΛΟΣ_ΑΝ", "ΕΠΙΛΕΞΕ", "ΜΕ", "ΒΗΜΑ", "ΑΛΛΙΩΣ", "ΜΕΧΡΙ", "ΤΟΤΕ", "ΑΡΧΗ", "ΟΣΟ", "ΓΙΑ", "ΑΠΟ", "ΑΝ", "ΑΛΗΘΗΣ", "Αληθής", "Αληθης", "αληθής", "αληθης", "ΨΕΘΔΗΣ", "Ψευδής", "Ψευδης", "ψευδής", "ψευδης", "ΚΑΙ", "και", "Η", "η", "ή", "ΟΧΙ", "οχι", "όχι", "MOD", "DIV", "ΚΑΛΕΣΕ", "ΓΡΑΨΕ", "ΔΙΑΒΑΣΕ", "ΜΕΤΑΒΛΗΤΕΣ", "ΣΤΑΘΕΡΕΣ", "ΠΡΑΓΜΑΤΙΚΗ", "ΠΡΑΓΜΑΤΙΚΕΣ", "ΑΚΕΡΑΙΑ", "ΑΚΕΡΑΙΕΣ", "ΛΟΓΙΚΗ", "ΛΟΓΙΚΕΣ", "ΧΑΡΑΚΤΗΡΑ", "ΧΑΡΑΚΤΗΡΕΣ"];




var mother = new mother_intepreter();

var input_string = "";
var screen_callback = null;
var screen_callback_min = 0;

var start_time;


var running = true;

onmessage = function(event){

	console.log("worker");
	console.log(event.data);

	switch(event.data.type){
		case "start":
			start(event.data.code);
		break;
		case "read":
			read(event.data.data);
		break;
	}

}

function start(code){
	
	clear_screen();

	running = true;

	try{
		start_time = new Date();
		mother.run(code);
		ended();
	}catch(e){
		if(e == "Empty input"){
			//do nothing
		}else{
			//something better
			console.error(e);
			ended_exception(e);
		}
	}
}

function ended(){
	if(!running) return;
	running = false;
	var dt = new Date() - start_time;
	var msg = "Χρόνος Εκτέλεσης: " + dt + "ms"
	postMessage({type:"ended", msg:msg, error: false});
}

function ended_exception(e){
	var msg = "Σφάλμα : " + e;
	postMessage({type:"ended", msg:msg, error:true});
}

function read(text){
	input_string += text + " ";
	if(screen_callback != null && screen_available() >= screen_callback_min){
		console.log("Callback from input");

		try{
			screen_callback();
			ended();
		}catch(e){
			if(e == "Empty input"){
				//do nothing
			}else{
				//something better
				console.error(e);
				ended_exception(e);
			}
		}
	}

}


//Screen Stuff
function write_screen(text){
	postMessage({type:"write_screen", text:text});
}

function screen_available(){
	var res = input_string.match(/([^\n ]+) +/g);
	if(res == null) return 0;
	return res.length;
}

function screen_get_value(){
	var value = input_string.match(/([^\n ]+) +/);
	if(value == null) return null;

	var index = input_string.search(escapeRegExp(value[0]));
	input_string = input_string.substring(index + value[0].length, input_string.length);

	return value[1];
}

function clear_screen(){
	postMessage({type:"clear_screen"});
	input_string = "";
}
//End Sreen stuff


function param_split(text){

	var output = [];
	var cur = ""

	var bracket_depth = 0;
	var parenth_depth = 0;

	var in_string = false;
	var match = "";

	var i = 0;
	while(i < text.length){
		if(text[i] == "\'" || text[i] == "\""){
			if(in_string && text[i] == match) in_string = false;
			else if (!in_string){ in_string = true; match = text[i];}
		}else if(!in_string && text[i] == "("){
			parenth_depth += 1;
		}else if(!in_string && text[i] == ")"){
			parenth_depth -= 1;
		}else if(!in_string && text[i] == "["){
			bracket_depth += 1;
		}else if(!in_string && text[i] == "]"){
			bracket_depth -= 1;
		}else if(text[i] == ","){
			if(bracket_depth == 0 && parenth_depth == 0 && !in_string){
				output.push(cur);
				cur = "";
				i++;
				continue;
			}
		}

		cur += text[i];
		i++;
	}

	output.push(cur);
	return output;
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}


function is_letter(c){
	var regex = /^[Α-Ωα-ωA-Za-z_άέήίόύώΆΈΉΊΌΎΏς]$/;
	return c.match(regex) != null;
}

function is_letter_or_symnum(c){
	var regex = /^[Α-Ωα-ωA-Za-z_0-9άέήίόύώΆΈΉΊΌΎΏς]$/;
	return c.match(regex) != null;
}

function is_whitespace(c){
	var regex = /^\s$/;
	return c.match(regex) != null;
}

