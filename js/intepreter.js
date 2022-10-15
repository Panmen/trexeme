function intepreter(offset, is_func = false){

this.end_callback = null;
this.is_function = is_func;
this.constants = {};
this.variables = {};
this.lc = 0;
this.offset = offset;
this.code_lines = null;
this.init_vars = null;

this.main_block = null;

this.run = function(code){

	this.reset();

	this.code_lines = code.split("\n");

	this.intepret();
}

this.get_value = function(name){
	name = name.trim();

	var m = name.match(/(.*)\[(.*),(.*)\]/);
	if(m != null){
		return this.get_value_array2(m[1], eval_exp(m[2], this), eval_exp(m[3], this));
	}
	m = name.match(/(.*)\[(.*)\]/);
	if(m != null){
		return this.get_value_array(m[1], eval_exp(m[2], this));
	}

	

	if(this.constants.hasOwnProperty(name)) return this.constants[name].value;
	else if(this.variables.hasOwnProperty(name)){
		if(this.variables[name].type.endsWith("_array") || this.variables[name].type.endsWith("_array2"))
			throw "Η μεταβλητή " + name + " είναι πίνακας. Χρειάζεται [ ] για να διαβαστεί το περιεχόμενο της"; 
		else
			return this.variables[name].value;
	}
	else throw "Δεν βρέθηκε μεταβλητή ή σταθερά με όνομα " + name;
}

this.get_value_array = function(name, i){
	if(!Number.isInteger(i)){
		throw "Δεν δόθηκε αριθμός για την θέση του πίνακα με όνομα " + name;
	}

	i = i - 1;

	if(i < 0 || i >= this.variables[name].size) throw "Η θέση " + (i+1) + " είναι εκτός των ορίων του πίνακα " + name;

	if(this.variables.hasOwnProperty(name)){

		if(!this.variables[name].type.endsWith("_array")) throw "Η μεταβλητή " + name + "δεν είναι πίνακας";
		if(i < 0 || i >= this.variables[name].size) throw "Η θέση " + (i+1) + " είναι εκτός των ορίων του πίνακα " + name;

		return this.variables[name].value[i];
	}
}

this.get_value_array2 = function(name, i, j){
	if(!Number.isInteger(i) || !Number.isInteger(j)){
		throw "Δεν δόθηκε αριθμός για την θέση του πίνακα με όνομα " + name;
	}

	i = i - 1;
	j = j - 1;

	if(i < 0 || i >= this.variables[name].size[0]) throw "Η θέση (γραμμή) " + (i+1) + " είναι εκτός των ορίων του πίνακα " + name;
	if(j < 0 || j >= this.variables[name].size[1]) throw "Η θέση (στήλη) " + (j+1) + " είναι εκτός των ορίων του πίνακα " + name;

	if(this.variables.hasOwnProperty(name)){

		if(!this.variables[name].type.endsWith("_array2")) throw "Η μεταβλητή " + name + "δεν είναι πίνακας δύο διαστάσεων";
		if(i < 0 || i >= this.variables[name].size[0]) throw "Η θέση (γραμμή) " + (i+1) + " είναι εκτός των ορίων του πίνακα " + name;
		if(j < 0 || j >= this.variables[name].size[1]) throw "Η θέση (στήλη) " + (j+1) + " είναι εκτός των ορίων του πίνακα " + name;

		return this.variables[name].value[i][j];
	}
}
this.var_exists = function(name){
	return this.variables.hasOwnProperty(name);
}

this.set_value = function(name, value){

	name = name.trim();

	var m = name.match(/(.*)\[(.*),(.*)\]/);
	if(m != null){
		this.set_value_array2(m[1], eval_exp(m[2], this), eval_exp(m[3], this), value);
		return;
	}
	m = name.match(/(.*)\[(.*)\]/);
	if(m != null){
		this.set_value_array(m[1], eval_exp(m[2], this), value);
		return;
	}


	if(this.variables[name].type.endsWith("_array") || this.variables[name].type.endsWith("_array2"))
		throw "Η μεταβλητή " + name + " είναι πίνακας. Χρειάζεται [ ] για να επεξεργαστέις το περιεχόμενο της.";

	if(this.variables.hasOwnProperty(name)){
		if(typeof value == "number" && !isNaN(value)){
			if(this.variables[name].type == "int"){
				this.variables[name].value = Math.floor(value);
			}else if(this.variables[name].type == "real"){
				this.variables[name].value = value;
			}else{
				throw "Προσπάθεια ανάθεσης στη μεταβλητή με όνομα " + name + " με μη ταιριαστό τύπο";
			}
		}else if(typeof value == "string"){
			if(this.variables[name].type == "string"){
				this.variables[name].value = value;
			}else{
				throw "Προσπάθεια ανάθεσης στη μεταβλητή με όνομα " + name + " με μη ταιριαστό τύπο";
			}
		}else if(typeof value == "boolean"){
			if(this.variables[name].type == "bool"){
				this.variables[name].value = value;
			}else{
				throw "Προσπάθεια ανάθεσης στη μεταβλητή με όνομα " + name + " με μη ταιριαστό τύπο";
			}
		}else{
			throw "Προσπάθεια ανάθεσης στη μεταβλητή με όνομα " + name + " με μη ταιριαστό τύπο";
		}
	}else{
		throw "Δεν βρέθηκε μεταβλητή με όνομα " + name;
	}
}

this.set_value_array = function(name, i, value){
	if(!Number.isInteger(i)){
		throw "Δεν δόθηκε αριθμός για την θέση του πίνακα με όνομα " + name;
	}

	i = i - 1;

	if(this.variables.hasOwnProperty(name)){
		
		if(!this.variables[name].type.endsWith("_array")) throw "Η μεταβλητή " + name + "δεν είναι πίνακας";
		if(i < 0 || i >= this.variables[name].size) throw "Η θέση " + (i+1) + " είναι εκτός των ορίων του πίνακα " + name;

		if(typeof value == "number" && !isNaN(value)){
			if(this.variables[name].type == "int_array"){
				this.variables[name].value[i] = Math.floor(value);
			}else if(this.variables[name].type == "real_array"){
				this.variables[name].value[i] = value;
			}else{
				throw "Προσπάθεια ανάθεσης στον πίνακα με όνομα " + name + " με μη ταιριαστό τύπο";
			}
		}else if(typeof value == "string"){
			if(this.variables[name].type == "string_array"){
				this.variables[name].value[i] = value;
			}else{
				throw "Προσπάθεια ανάθεσης στον πίνακα με όνομα " + name + " με μη ταιριαστό τύπο";
			}
		}else if(typeof value == "boolean"){
			if(this.variables[name].type == "bool_array"){
				this.variables[name].value[i] = value;
			}else{
				throw "Προσπάθεια ανάθεσης στον πίνακα με όνομα " + name + " με μη ταιριαστό τύπο";
			}
		}else{
			throw "Προσπάθεια ανάθεσης στον πίνακα με όνομα " + name + " με μη ταιριαστό τύπο";
		}
	}else{
		throw "Δεν βρέθηκε πίνακας με όνομα " + name;
	}
	
}


this.set_value_array2 = function(name, i, j, value){
	if(!Number.isInteger(i) || !Number.isInteger(j)){
		throw "Δεν δόθηκε αριθμός για την θέση του πίνακα με όνομα " + name;
	}

	i = i - 1;
	j = j - 1;

	if(this.variables.hasOwnProperty(name)){

		if(!this.variables[name].type.endsWith("_array2")) throw "Η μεταβλητή " + name + "δεν είναι πίνακας δύο διαστάσεων";
		if(i < 0 || i >= this.variables[name].size[0]) throw "Η θέση (γραμμή) " + (i+1) + " είναι εκτός των ορίων του πίνακα " + name;
		if(j < 0 || j >= this.variables[name].size[1]) throw "Η θέση (στήλη) " + (j+1) + " είναι εκτός των ορίων του πίνακα " + name;

		if(typeof value == "number" && !isNaN(value)){
			if(this.variables[name].type == "int_array2"){
				this.variables[name].value[i][j] = Math.floor(value);
			}else if(this.variables[name].type == "real_array2"){
				this.variables[name].value[i][j] = value;
			}else{
				throw "Προσπάθεια ανάθεσης στον πίνακα με όνομα " + name + " με μη ταιριαστό τύπο";
			}
		}else if(typeof value == "string"){
			if(this.variables[name].type == "string_array2"){
				this.variables[name].value[i][j] = value;
			}else{
				throw "Προσπάθεια ανάθεσης στον πίνακα με όνομα " + name + " με μη ταιριαστό τύπο";
			}
		}else if(typeof value == "boolean"){
			if(this.variables[name].type == "bool_array2"){
				this.variables[name].value[i][j] = value;
			}else{
				throw "Προσπάθεια ανάθεσης στον πίνακα με όνομα " + name + " με μη ταιριαστό τύπο";
			}
		}else{
			throw "Προσπάθεια ανάθεσης στον πίνακα με όνομα " + name + " με μη ταιριαστό τύπο";
		}
	}else{
		throw "Δεν βρέθηκε δισδιάστατος πίνακας με όνομα " + name;
	}
	
}


this.intepret = function(){

	var const_declared = false;
	var var_declared = false;

	while(this.lc < this.code_lines.length){
		var line = this.code_lines[this.lc].trim();
		if(line == ""){
			this.lc++;
			continue;
		}
		switch(line){
			case "ΣΤΑΘΕΡΕΣ":
				if(const_declared){
					throw "Στη γραμμή " + this.getline() + ". Έχουν ήδη οριστεί οι σταθερές";
					return;
				}
				this.declare_constants();

				//console.log(this.constants);
				const_declared = true;
				break;
			case "ΜΕΤΑΒΛΗΤΕΣ":
				if(var_declared){
					console.trace();
					throw "Στη γραμμή " + this.getline() + ". Έχουν ήδη οριστεί οι μεταβλητές";
					return;
				}
				this.declare_variables();

				//console.log(this.variables);
				var_declared = true;
				break;
			case "ΑΡΧΗ":
				this.execute();
				console.log(this.constants);
				console.log(this.variables);
				console.log("DONE");
				return;
			default:
				throw "Στη γραμμή " + this.getline() + " αναμενόταν ΑΡΧΗ / ΜΕΤΑΒΛΗΤΕΣ / ΣΤΑΘΕΡΕΣ";
				return;
		}
	}

	console.log(this.constants);
	console.log(this.variables);
	console.log("DONE");
}

this.hello = function(){
	console.log("Hello");
}

this.resume = function(){
	this.main_block.resume();
}

this.execute = function(){

	if(this.init_vars != null) this.init_vars(); 

	this.main_block = new block(this.code_lines.slice(this.lc, this.code_lines.length), this, this.lc + this.offset);
	//try{
	this.main_block.run();
	//}catch(e){
		//console.error(e);
	//}
}


this.prepare_exp = function(exp){

	var i = 0;
	var name;
	var res = "";

	while(i < exp.length){
	
		if(is_letter(exp[i])){
			name = exp[i];
			i++;
			while(i < exp.length && is_letter_or_symnum(exp[i])){
				 name = name + exp[i];
				 i++;
			}

			if(reserved.includes(name)){
				res += this.prepare_get_var(name);
			}else if(i >= exp.length){
				//variable
				res+= this.prepare_get_var(name);
				break;
			}else {
				//continue until you find ( or [ or [not space]

				while(i < exp.length && is_whitespace(exp[i])) i++;

				if(i >= exp.length){
					//variable
					res+= this.prepare_get_var(name);
					break;
				}else if(exp[i] == "("){
					//function
					i++;
					var params = "";
					var depth = 1;
					while(i < exp.length){
						if(exp[i] == "(") depth++;
						if(exp[i] == ")") depth--;
						if(depth == 0) break;
						params += exp[i];
						i++;
					}
					if(i >= exp.length) throw "Αναμενόταν ')' στην έκφραση " + exp;


					if(params.trim() == "") params = [];
					else params = param_split(params);

					var params_values = [];
					for(var k = 0 ; k < params.length; k++){
						params_values[k] = eval_exp(params[k], this);			
					}

					var new_param_values = mother.call_func(name, params_values);

					if(typeof new_param_values[new_param_values.length - 1] == "boolean"){
						res += new_param_values[new_param_values.length - 1] ? "@" : "#";
					}else{
						res += new_param_values[new_param_values.length - 1];
					}
					
				}else if(exp[i] == "["){
					//array
					i++;
					var index = "";
					var depth = 1;
					while(i < exp.length){
						if(exp[i] == "[") depth++;
						if(exp[i] == "]") depth--;
						if(depth == 0) break;
						index += exp[i];
						i++;
					}

					if(i >= exp.length) throw "Αναμενόταν ']' στην έκφραση " + exp;
					i++;
					var index_old = index;
					var index = param_split(index);

					switch(index.length){
						case 1:
							res += this.prepare_get_array1(name, eval_exp(index[0], this));
							break;
						case 2:
							res += this.prepare_get_array2(name, eval_exp(index[0], this), eval_exp(index[1], this));
							break;
						default:
							throw "Λάθος στο " + name + "[" + index_old + "]";
	
					}
				}else{
					res+= this.prepare_get_var(name);
				}

			}

		}else if(exp[i] == "\'"){
			res += exp[i];
			i++;
			while(i < exp.length && exp[i] != "\'"){
				res += exp[i];
				i++;
			}
			if(i < exp.length){
				res += exp[i]; 
				i++;
			}
		}else if(exp[i] == "\""){
			res += exp[i];
			i++;
            while(i < exp.length && exp[i] != "\""){
                res += exp[i];
                i++;
            }
			if(i < exp.length){
				res += exp[i]; 
				i++;
			}
        }else{

			//not name
			res += exp[i];
			i++;
			
		}

	}

	return res;

}

this.prepare_get_var = function(name){


	//might be special
	if(name.match(/^ΚΑΙ$|^και$/) != null) return "&&";
	if(name.match(/^Η$|^Ή$|^η$|^ή$/) != null) return "||";
	if(name.match(/^ΟΧΙ$|^ΌΧΙ$|^οχι$|^όχι$/) != null) return "!";
	if(name.match(/^DIV$|^div$/) != null) return "$";
	if(name.match(/^MOD$|^mod$/) != null) return "%";

	if(name.match(/^ΑΛΗΘΗΣ$|^Αληθής$|^Αληθης$|^αληθής$|^αληθης$/) != null) return "@";
	if(name.match(/^ΨΕΥΔΗΣ$|^Ψευδής$|^Ψευδης$|^ψευδής$|^ψευδης$/) != null) return "#";
	//end special

	if(this.constants.hasOwnProperty(name)){
		if(typeof this.constants[name] == "string")
			return "\'" + this.constants[name] + "\'";
		else
			return this.constants[name];
	}else if(this.variables.hasOwnProperty(name)){

		var type = this.variables[name].type;
		if(type.endsWith("array") || type.endsWith("array2")) throw "Η μεταβλητή " + name + "είναι πίνακας";

		if(type == "int" || type == "real")	return this.variables[name].value;
		if(type == "string") return "\'" +  this.variables[name].value + "\'";
		if(type == "bool") return this.variables[name].value ? "@" : "#";

	}else throw "Δεν βρέθηκε μεταβλητή ή σταθερά με όνομα " + name;
}


this.prepare_get_array1 = function(name, i){
	if(!Number.isInteger(i)){
		throw "Δεν δόθηκε αριθμός για την θέση του πίνακα με όνομα " + name;
	}

	i = i - 1;

	if(this.variables.hasOwnProperty(name)){

		var type = this.variables[name].type;
		if(type.endsWith("array")){
	
			if(i < 0 || i >= this.variables[name].size) throw "Η θέση " + (i+1) + " είναι εκτός των ορίων του πίνακα " + name;

			var type = this.variables[name].type.match(/(.*)_/)[1];
			
			
			if(type == "int" || type == "real")	return this.variables[name].value[i];
			if(type == "string") return "\'" + this.variables[name].value[i] + "\'";
			if(type == "bool") return this.variables[name].value[i] ? "@" : "#";

		}else{
			throw "Η μεταβλητη " + name + " δεν είναι πίνακας μίας διάστασης";
		}


	}else throw "Δεν βρέθηκε μεταβλητή με όνομα " + name;
}

this.prepare_get_array2 = function(name, i, j){
	if(!Number.isInteger(i) || !Number.isInteger(j)){
		throw "Δεν δόθηκε αριθμός για την θέση του πίνακα με όνομα " + name;
	}


	j = j - 1;
	i = i - 1;

	if(this.variables.hasOwnProperty(name)){

		var type = this.variables[name].type;
		if(type.endsWith("array2")){
	
			if(i < 0 || i >= this.variables[name].size[0]) throw "Η θέση (γραμμή) " + (i+1) + " είναι εκτός των ορίων του πίνακα " + name;
			if(j < 0 || j >= this.variables[name].size[1]) throw "Η θέση (στήλη) " + (j+1) + " είναι εκτός των ορίων του πίνακα " + name;

			var type = this.variables[name].type.match(/(.*)_/)[1];
			
			
			if(type == "int" || type == "real")	return this.variables[name].value[i][j];
			if(type == "string") return "\'" + this.variables[name].value[i][j] + "\'";
			if(type == "bool") return this.variables[name].value[i][j] ? "@" : "#";

		}else{
			throw "Η μεταβλητη " + name + " δεν είναι πίνακας δύο διαστάσεων";
		}


	}else throw "Δεν βρέθηκε μεταβλητή με όνομα " + name;
}

this.declare_constants = function(){
	this.lc++;

	var regex_string = /^([Α-Ωα-ωA-Za-z_άέήίόύώΆΈΉΊΌΎΏς]+[Α-Ωα-ωA-Za-z_0-9άέήίόύώΆΈΉΊΌΎΏς]*) *= *(['"])(.*)\2 *$/;	
	var regex_number = /^([Α-Ωα-ωA-Za-z_άέήίόύώΆΈΉΊΌΎΏς]+[Α-Ωα-ωA-Za-z_0-9άέήίόύώΆΈΉΊΌΎΏς]*) *= *([0-9.]*) *$/;

	while(this.lc < this.code_lines.length){

		var line = this.code_lines[this.lc].trim();
		var num = line.match(regex_number);
		var str = line.match(regex_string);

		if(num == null && str == null){
			//nothing found

			if(line.trim() == ""){
				this.lc++;
				continue;
			}
			
			switch(line.trim()){
				case "ΣΤΑΘΕΡΕΣ":
				case "ΜΕΤΑΒΛΗΤΕΣ":
				case "ΑΡΧΗ":
					return;
				default:
					throw "Στη γραμμή " + this.getline() + " αναμενόταν ΑΡΧΗ / ΜΕΤΑΒΛΗΤΕΣ / ΣΤΑΘΕΡΕΣ";
					break;
			}
		}else if(num != null){
			if(reserved.includes(num[1])) throw "Στη γραμμή " + this.getline() + " το όνομα " + num[1] + " είναι δεσμευμένο από τη γλώσσα";
			if(this.variables.hasOwnProperty(num[1]) || this.constants.hasOwnProperty(num[1])) throw "Στη γραμμή " + this.getline() + " το όνομα " + num[1] + " έχει ήδη δοθεί σε κάποια σταθερά ή μεταβλητή";
			this.constants[num[1]] = parseFloat(num[2]);
		}else{
			if(reserved.includes(str[1])) throw "Στη γραμμή " + this.getline() + " το όνομα " + str[1] + " είναι δεσμευμένο από τη γλώσσα";
			if(this.variables.hasOwnProperty(str[1]) || this.constants.hasOwnProperty(str[1])) throw "Στη γραμμή " + this.getline() + " το όνομα " + str[1] + " έχει ήδη δοθεί σε κάποια σταθερά ή μεταβλητή";
			this.constants[str[1]] = str[3];
		}

		this.lc++;
	}
	

}

this.create_vars = function(var_names, t, def){

	var regex_names = /^([Α-Ωα-ωA-Za-z_άέήίόύώΆΈΉΊΌΎΏς]+[Α-Ωα-ωA_Za-z_0-9άέήίόύώΆΈΉΊΌΎΏς]*)$/;
	var regex_names_array = /^([Α-Ωα-ωA-Za-z_άέήίόύώΆΈΉΊΌΎΏς]+[Α-Ωα-ωA_Za-z_0-9άέήίόύώΆΈΉΊΌΎΏς]*) *\[ *(\d+) *\]$/;
	var regex_names_array_2 = /^([Α-Ωα-ωA-Za-z_άέήίόύώΆΈΉΊΌΎΏς]+[Α-Ωα-ωA_Za-z_0-9άέήίόύώΆΈΉΊΌΎΏς]*) *\[ *(\d+) *\, *(\d+) *]$/;


	for(var i = 0; i < var_names.length; i++){
		var_names[i] = var_names[i].trim();
		var simple = var_names[i].match(regex_names);
		var array = var_names[i].match(regex_names_array);
		var array2 = var_names[i].match(regex_names_array_2);

		

		if(simple != null && !this.variables.hasOwnProperty(simple[1]) && !this.constants.hasOwnProperty(simple[1])){
			if(reserved.includes(simple[1])) throw "Στη γραμμή " + this.getline() + " το όνομα " + simple[1] + " είναι δεσμευμένο από τη γλώσσα";
			this.variables[simple[1]] = {type:t, value:def};
		}else if(array != null && !this.variables.hasOwnProperty(array[1]) && !this.constants.hasOwnProperty(array[1])){
			if(reserved.includes(array[1])) throw "Στη γραμμή " + this.getline() + " το όνομα " + array[1] + " είναι δεσμευμένο από τη γλώσσα";
			var s = parseInt(array[2]);
			if(s <= 0) throw "Στη γραμμή " + this.getline() + " πρέπει να δίνεται θετικός αριθμός για τη διάσταση του πίνακα " + array[1];
			this.variables[array[1]] = {type:t + "_array", size: s, value: new Array(s).fill(def)};
		}else if(array2 != null && !this.variables.hasOwnProperty(array2[1]) && !this.constants.hasOwnProperty(array2[1])){
			if(reserved.includes(array2[1])) throw "Στη γραμμή " + this.getline() + " το όνομα " + array2[1] + " είναι δεσμευμένο από τη γλώσσα";
			var s1 = parseInt(array2[2]);
			var s2 = parseInt(array2[3]);
			if(s1 <= 0 || s2 <= 0) throw "Στη γραμμή " + this.getline() + " πρέπει να δίνονται θετικοί αριθμοί για τις διαστάσεις του πίνακα " + array2[1];
			var arr = new Array(s1);
			for(var k = 0; k < s1; k++) arr[k] = new Array(s2).fill(def);
			this.variables[array2[1]] = {type:t + "_array2", size: [s1, s2], value: arr};
		}else if(simple != null && (this.variables.hasOwnProperty(simple[1]) || this.constants.hasOwnProperty(simple[1]))){
			throw "Στη γραμμή " + this.getline() + " το όνομα " + simple[1] + " έχει ήδη δοθεί σε κάποια σταθερά ή μεταβλητή";
		}else if(array != null && (this.variables.hasOwnProperty(array[1]) || this.constants.hasOwnProperty(array[1]))){
			throw "Στη γραμμή " + this.getline() + " το όνομα " + array[1] + " έχει ήδη δοθεί σε κάποια σταθερά ή μεταβλητή";
		}else if (array2 != null && (this.variables.hasOwnProperty(array2[1]) || this.constants.hasOwnProperty(array2[1]))){
			throw "Στη γραμμή " + this.getline() + " το όνομα " + array2[1] + " έχει ήδη δοθεί σε κάποια σταθερά ή μεταβλητή";

		}else{
			throw "Κατά τον ορισμό μεταβλητής στη γραμμή " + this.getline() + " στο " + var_names[i];
		}
	}
}

this.declare_variables = function(){
	this.lc++;


	while(this.lc < this.code_lines.length){

		var line = this.code_lines[this.lc];

		if(line.trim().match(/^ *ΠΡΑΓΜΑΤΙΚΕΣ *:/) != null){
			var other = line.trim().split(":");
			if(other.length == 2){
				var var_names = other[1].split(/,(?![^\[]*])/);

				this.create_vars(var_names, "real", 0.0);
			}else{
				throw "Κατά τον ορισμό μεταβλητής στη γραμμή " + this.getline();
			}
		}else if(line.trim().match(/^ *ΑΚΕΡΑΙΕΣ *:/) != null){
			var other = line.trim().split(":");
			if(other.length == 2){
				var var_names = other[1].split(/,(?![^\[]*])/);

				this.create_vars(var_names, "int", 0);
			}else{
				throw "Κατά τον ορισμό μεταβλητής στη γραμμή " + this.getline();
			}
		}else if(line.trim().match(/^ *ΧΑΡΑΚΤΗΡΕΣ *:/) != null){
			var other = line.trim().split(":");
			if(other.length == 2){
				var var_names = other[1].split(/,(?![^\[]*])/);

				this.create_vars(var_names, "string", "");
			}else{
				throw "Κατά τον ορισμό μεταβλητής στη γραμμή " + this.getline();
			}
		}else if(line.trim().match(/^ *ΛΟΓΙΚΕΣ *:/) != null){
			var other = line.trim().split(":");
			if(other.length == 2){
				var var_names = other[1].split(/,(?![^\[]*])/);

				this.create_vars(var_names, "bool", false);
			}else{
				throw "Κατά τον ορισμό μεταβλητής στη γραμμή " + this.getline();
			}
		}else{
			//nothing

			if(line.trim() == ""){
				this.lc++;
				continue;
			}

			
			switch(line.trim()){
				case "ΣΤΑΘΕΡΕΣ":
				case "ΜΕΤΑΒΛΗΤΕΣ":
				case "ΑΡΧΗ":
					return;
				default:
					throw "Στη γραμμή " + this.getline() + " αναμενόταν ΑΡΧΗ / ΜΕΤΑΒΛΗΤΕΣ / ΣΤΑΘΕΡΕΣ";
					break;
			}
			
		}

		this.lc++;


	}

	
}

this.get_parenthesis_pairs = function(exp){

	var o = exp.match(/\(/g);
	var c = exp.match(/\)/g);
	if(o != null && c!= null && o.length != c.length) throw "Μη ισορροπημένη έκφραση '" + exp + "'";
	if(o != null && c == null || o == null && c != null) throw "Μη ισορροπημένη έκφραση '" + exp + "'"; 
	
	var pair = [];

	var d = 0;
	var open = [];
	var i;
	for(i = 0 ; i < exp.length; i++){
		if(exp[i] == "("){
			open.push(i);
			d++;
		}else if(exp[i] == ")"){
			pair.push([open.pop(), i]);
			d--;
		}
	}

	
	return pair;
}

this.getline = function(){
	return this.lc + this.offset + 1;
}


this.reset = function(){
	this.constants = {};
	this.variables = {};
	this.lc = 0;
	this.code_lines = null;
	this.main_body = null;
}



}
