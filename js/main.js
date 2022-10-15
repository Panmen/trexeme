
var code_area = document.getElementById("code_area");
var editor = CodeMirror.fromTextArea(code_area, {lineNumbers: true, mode: "mymode"});
var keyboard = document.getElementById("keyboard");

//var intepreter = new intepreter();
var mother = new mother_intepreter();


editor.setValue("ΜΕΤΑΒΛΗΤΕΣ\nΑΚΕΡΑΙΕΣ: α, ω, ψδδ, _ασ2\nΧΑΡΑΚΤΗΡΕΣ: ασδασδ, σσδδσςςερτ\nΠΡΑΓΜΑΤΙΚΕΣ: ρ\nΛΟΓΙΚΕΣ: ζζ\nΣΤΑΘΕΡΕΣ\nΠΑΤΑΤΑ = 1\nssdd = \'sdfs\'\nΑΡΧΗ\nα <- 123\nΔΙΑΒΑΣΕ α\nΓΡΑΨΕ α");

start();

function start(){
	setInterval(auto_save, 1000);
	auto_load();
}

function auto_load(){
	var save = window.localStorage.getItem("autosave");
	if(save == undefined) return;
	editor.setValue(save);
}

function auto_save(){
	console.log("auto save");
	//document.cookie = "autosave=" + btoa(encodeURIComponent(editor.getValue()));
	window.localStorage.setItem("autosave", editor.getValue());
}

function clicked(){
	//console.log(editor.getValue());
	
	clear_screen();

	mother.run(editor.getValue());

	//intepreter.run(editor.getValue());

}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
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

