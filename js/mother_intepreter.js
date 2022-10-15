function mother_intepreter(){

this.main = null;
this.procedures = {};
this.functions = {};
/*
this.proc_intepreter = null;
this.proc_params = null;;
*/

this.main_intepreter = null;

this.run = function(code){

	//replace all annoying backticks
	code = code.replace(/`/g, "'");


	this.reset();

	code = this.remove_comments(code);
	
	var main_code_regex = /ΠΡΟΓΡΑΜΜΑ (.*)\n([^]+?)\nΤΕΛΟΣ_ΠΡΟΓΡΑΜΜΑΤΟΣ/;
	var main_code = code.match(main_code_regex);

	if(main_code == null) throw "Δεν βρέθηκε πρόγραμμα";

	var mult = code.match(/ΠΡΟΓΡΑΜΜΑ (.*)\n/g);
	if(mult.length > 1) throw "Δεν επιτρέπονται πολλαπλά προγράμματα.";

	var proc_code_regex_g = /ΔΙΑΔΙΚΑΣΙΑ (.*)\n([^]+?)\nΤΕΛΟΣ_ΔΙΑΔΙΚΑΣΙΑΣ/g;
	var proc_code_regex = /ΔΙΑΔΙΚΑΣΙΑ (.*)\((.*)\)\n([^]+?)\nΤΕΛΟΣ_ΔΙΑΔΙΚΑΣΙΑΣ/;
	var proc_code = code.match(proc_code_regex_g);

	var func_code_regex_g = /ΣΥΝΑΡΤΗΣΗ (.*):(.*)\n([^]+?)\nΤΕΛΟΣ_ΣΥΝΑΡΤΗΣΗΣ/g;
	var func_code_regex = /ΣΥΝΑΡΤΗΣΗ (.*)\((.*)\) *: *(.*)\n([^]+?)\nΤΕΛΟΣ_ΣΥΝΑΡΤΗΣΗΣ/;
	var func_code = code.match(func_code_regex_g);


	//Proc breakdown
	var i;
	var res;
	if(proc_code != null){
		for(i = 0 ; i < proc_code.length; i++){
			res = proc_code[i].match(proc_code_regex);
			if(res == null) throw "Στο '" + proc_code[i].split("\n")[0] + "'";
			if(this.procedures.hasOwnProperty(res[1].trim())) throw "Η διαδικασία με ονομα " + res[1].trim() + " υπάρχει ήδη";
			var offset = this.find_line_offset(res[0], code);

			if(reserved.includes(res[1].trim())) throw "Στη γραμμή " + offset + " το όνομα " + res[1] + " είναι δεσμευμένο από τη γλώσσα";

			if(res[2].trim() == "") this.procedures[res[1].trim()] = {param_names: [],code:res[3].trim(), offset:offset};
			else this.procedures[res[1].trim()] = {param_names:res[2].trim().split(","),code:res[3].trim(), offset:offset};
		}
	}

	if(func_code != null){
		for(i = 0 ; i < func_code.length; i++){
			res = func_code[i].match(func_code_regex);
			if(res == null) throw "Στο '" + func_code[i].split("\n")[0] + "'";
			if(this.functions.hasOwnProperty(res[1].trim())) throw "Η συνάρτηση με όνομα " + res[1].trim() + " υπάρχει ηδη";
			var offset = this.find_line_offset(res[0], code);

			if(reserved.includes(res[1].trim())) throw "Στη γραμμή " + offset + " το όνομα " + res[1] + " είναι δεσμευμένο από τη γλώσσα";

			if(res[2].trim() == "") this.functions[res[1].trim()] = {param_names:[], code:res[4].trim(), return_type:res[3].trim(), offset:offset};  
			else this.functions[res[1].trim()] = {param_names:res[2].trim().split(","), code:res[4].trim(), return_type:res[3].trim(), offset:offset};
		}
	}


	this.main_intepreter = new intepreter(this.find_line_offset(main_code[0], code));
	this.main_intepreter.run(main_code[2]);
}

this.call_func = function(name, params){

	//check if it is one of the built in
	if(built_in_funcs.hasOwnProperty(name)){
		if(params.length != 1) throw "Η συνάρτηση " + name + " δέχεται ακριβώς μία παράμετρο";
		return built_in_funcs[name](params[0]);
	}

	if(!this.functions.hasOwnProperty(name)) throw "Δεν υπάρχει συνάρτηση με όνομα " + name;
	if(params.length != this.functions[name].param_names.length) throw "Λάθος πλήθος παραμέτρων κατά την κλήση της συνάρτησης " + name;

	var	type = {ΠΡΑΓΜΑΤΙΚΗ:"real", ΑΚΕΡΑΙΑ:"int", ΛΟΓΙΚΗ:"bool", ΧΑΡΑΚΤΗΡΕΣ:"string"};
	var	def = {ΠΡΑΓΜΑΤΙΚΗ:0, ΑΚΕΡΑΙΑ:0, ΛΟΓΙΚΗ:false, ΧΑΡΑΚΤΗΡΕΣ:""};

	var _intepreter = new intepreter(this.functions[name].offset, true);

	var type = type[this.functions[name].return_type];
	var def = def[this.functions[name].return_type];
	var param_names = this.functions[name].param_names;

	if(type == undefined) throw "Δεν υπάρχει τύπος '" + this.functions[name].return_type + "'" + ". Γραμμή " + (this.functions[name].offset);

	_intepreter.init_vars = function(){
		_intepreter.create_vars([name], type, def);

		
		var i = 0;
		try{
		for(i = 0 ; i < params.length; i++){
			if(_intepreter.var_exists(param_names[i]))
				_intepreter.set_value(param_names[i], params[i]);
			else
				throw "@Στη γραμμή " + this.offset + " στη συνάρτηση '" + name + "' η παράμετρος '" + param_names[i] + "' δεν έχει δηλωθεί στις μεταβλητές.";
		}
		}catch(e){
			if(typeof e == "string" && e.startsWith("@")) throw e.substr(1, e.length);
			throw "Οι παράμετροι δεν ταιρίαζουν με τον τύπο των τυπικών παραμέτρων της συνάρτησης " + name;
		}
	};

	_intepreter.run(this.functions[name].code);


	var output = [];
	for(var i = 0 ; i < param_names.length; i++){
		output[i] = _intepreter.get_value(param_names[i]);
	}

	output.push(_intepreter.get_value(name));
	
	return output;
}
/*
this.call_proc = function(name, params){
	if(!this.procedures.hasOwnProperty(name)) throw "No procedure named " + name;
	if(params.length != this.procedures[name].param_names.length) throw "Invalid argument count";


	this.proc_intepreter = new intepreter();
	var _intepreter = this.proc_intepreter;

	this.proc_params = this.procedures[name].param_names;
	var param_names = this.proc_params;

	_intepreter.init_vars = function(){
		
		var i = 0;
		for(i = 0 ; i < params.length; i++){
			_intepreter.set_value(param_names[i], params[i]);
		}
	};

	_intepreter.run(this.procedures[name].code);

	var output = [];
	for(var i = 0 ; i < param_names.length; i++){
		output[i] = _intepreter.get_value(param_names[i]);
	}

	this.proc_intepreter = null;
	this.proc_params = null;

	return output;
}

this.resume_proc = function(){
	
	if(this.proc_intpreter == null) throw "proc_intepreter is null";

	this.proc_intepreter.resume();
	

	var output = [];
	for(var i = 0 ; i < this.proc_params.length; i++){
		output[i] = this.proc_intepreter.get_value(this.proc_params[i]);
	}

	this.proc_intepreter = null;
	this.proc_params = null;

	return output;
}
*/
this.resume = function(){
	mother.main_intepreter.resume();
}

//this.prepare_exp = function(exp){
//	return this.active_intepreter.prepare_exp(exp);
//}

this.remove_comments_old = function(code){
	return code.replace(/!.*/g, "")
}

this.remove_comments = function(code){
	var i = 0;
	var in_string = false;
	var match = "";
	var result = "";
	while(i < code.length){
		if(code[i] == "\'" || code[i] == "\""){
			if(in_string && code[i] == match) in_string = false;
			else if (!in_string){in_string = true; match = code[i]}
		}else if(code[i] == "\n"){
			in_string = false; //reset for new line
		}if (code[i] == "!" && !in_string){
			while(i < code.length && code[i] != "\n") i++;
		}
		if(i > code.length) break;
		result += code[i];
		i++;
	}
	return result;
}

this.find_line_offset = function(key, text){
	var ind = text.indexOf(key);
	if(ind == -1) return 0;
	var count = 0;
	for(var i = 0 ; i < ind; i++){
		if(text[i] == "\n") count++;
	}
	return count + 1;
}

this.reset = function(){
	this.main = null;
	this.procedures = {};
	this.functions = {};
	this.main_intepreter = null;
}


}

