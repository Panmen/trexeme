
var keywords = ["ΤΕΛΟΣ_ΠΡΟΓΡΑΜΜΑΤΟΣ", "ΤΕΛΟΣ_ΔΙΑΔΙΚΑΣΙΑΣ", "ΤΕΛΟΣ_ΕΠΑΝΑΛΗΨΗΣ", "ΤΕΛΟΣ_ΣΥΝΑΡΤΗΣΗΣ", "ΑΡΧΗ_ΕΠΑΝΑΛΗΨΗΣ", "ΤΕΛΟΣ_ΕΠΙΛΟΓΩΝ", "ΜΕΧΡΙΣ_ΟΤΟΥ", "ΔΙΑΔΙΚΑΣΙΑ", "ΑΛΛΙΩΣ_ΑΝ", "ΠΕΡΙΠΤΩΣΗ", "ΕΠΑΝΑΛΑΒΕ", "ΠΡΟΓΡΑΜΜΑ", "ΣΥΝΑΡΤΗΣΗ", "ΤΕΛΟΣ_ΑΝ", "ΕΠΙΛΕΞΕ", "ΜΕ", "ΒΗΜΑ", "ΑΛΛΙΩΣ", "ΜΕΧΡΙ", "ΤΟΤΕ", "ΑΡΧΗ", "ΟΣΟ", "ΓΙΑ", "ΑΠΟ", "ΑΝ"] ; 

var atoms = ["ΑΛΗΘΗΣ", "Αληθής", "Αληθης", "αληθής", "αληθης", "ΨΕΘΔΗΣ", "Ψευδής", "Ψευδης", "ψευδής", "ψευδης"];

var operators = ["ΚΑΙ", "και", "Η", "η", "ή", "ΟΧΙ", "οχι", "όχι", "MOD", "DIV"];

var variable_1 = ["ΚΑΛΕΣΕ", "ΓΡΑΨΕ", "ΔΙΑΒΑΣΕ"];

var variable_2 = ["ΜΕΤΑΒΛΗΤΕΣ", "ΣΤΑΘΕΡΕΣ"];

var variable_3 = ["ΠΡΑΓΜΑΤΙΚΗ", "ΠΡΑΓΜΑΤΙΚΕΣ", "ΑΚΕΡΑΙΑ", "ΑΚΕΡΑΙΕΣ", "ΛΟΓΙΚΗ", "ΛΟΓΙΚΕΣ", "ΧΑΡΑΚΤΗΡΑ", "ΧΑΡΑΚΤΗΡΕΣ"];


CodeMirror.defineMode("glwssa", function() { return{


	token: function(stream, state) {

	var ch = stream.next();

	//detect comment
	if(ch == "!"){
		stream.skipToEnd();
		return "comment";
	}

	//detect string
	if(ch == "'"){
		if(stream.skipTo("'")){
			stream.next();
			return "string";
		}else return null;
	}

	if(ch == "\""){
		if(stream.skipTo("\"")){
			stream.next();
			return "string";
		}else return null;
	}

	//detect numbers
	if(ch.match(/\d/) != null){

		stream.eatWhile(/\d/);
		if(stream.peek() == "."){
			stream.next();
			stream.eatWhile(/\d/);
		}
		return "number";
	}

	//symbols
	if(ch.match(/[+-/*<>=]/)){
		return "operator";
	}
///^([Α-Ωα-ωA-Za-z_άέήίόύώΆΈΉΊΌΎΏς]+[Α-Ωα-ωA-Za-z_0-9άέήίόύώΆΈΉΊΌΎΏς]*) *= *(['"])(.*)\2 *$/
	if(ch.match(/[Α-Ωα-ωA-Za-z_άέήίόύώΆΈΉΊΌΎΏς]/)){
		stream.eatWhile(/[Α-Ωα-ωA-Za-z_0-9άέήίόύώΆΈΉΊΌΎΏς]/);

		if(keywords.includes(stream.current())) return "keyword";
		if(atoms.includes(stream.current())) return "atom";
		if(operators.includes(stream.current())) return "operator";
		if(variable_1.includes(stream.current())) return "variable";
		if(variable_2.includes(stream.current())) return "variable-2";
		if(variable_3.includes(stream.current())) return "variable-3";
		
		return null;
	}

	return null;

	}




}});
