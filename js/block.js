
function block(code_lines, int, offset){

this.code_lines = code_lines;
this.lc = 0;
this.offset = offset;
this.intepreter = int;

this.child = null;
this.child_data = null;

this.resume = function(){

	if(this.child != null){

		switch(this.child_data.type){
			case "proc":
				this.resume_proc();
				this.lc++;
				break;
			case "if":
				this.resume_if();
				this.lc ++;
				break;
			case "for":
				this.resume_for();
				this.lc++;
				break;
			case "while":
				this.resume_while();
				this.lc++;
				break;
			case "dowhile":
				this.resume_dowhile();
				this.lc++;
				break;
			case "options":
				this.resume_options();
				this.lc++;
			default:
				console.trace();
		}
	
	}
		

	this.go(this.lc);
}

this.run = function(){
	this.go(0);
}

this.go = function(from){

	for(this.lc = from; this.lc < this.code_lines.length; this.lc++){
		this.child = null;
		this.child_data = null;
		if(this.code_lines[this.lc].trim() == "") continue;
		if(this.code_lines[this.lc].trim() == "ΑΡΧΗ") continue;
		if(this.check_assignment()) continue;
		if(this.check_read()) continue;
		if(this.check_write()) continue;
		if(this.check_if()) continue;
		if(this.check_options()) continue;
		if(this.check_while()) continue;
		if(this.check_dowhile()) continue;
		if(this.check_for_withstep()) continue;
		if(this.check_for()) continue;
		if(this.check_call_proc()) continue;

		throw "Στη γραμμή " + this.getline() + " δεν βρέθηκε εντολή '" + this.code_lines[this.lc] + "'";
	}
}

this.call_proc = function(name, params_v, params_n){
	if(!mother.procedures.hasOwnProperty(name)) throw "Στη γραμμή " + this.getline() + " δεν έχει οριστεί διαδικασία με όνομα '" + name + "'";
	if(params_v.length != mother.procedures[name].param_names.length) throw "Στη γραμμή " + this.getline() + " δίνεται λάθος πλήθος παραμέτρων";


	this.child = new intepreter(mother.procedures[name].offset);
	var _intepreter = this.child;

	var param_names = mother.procedures[name].param_names;
	
	this.child_data = {type:"proc", param_calling:params_n, param_called:param_names};
	
	_intepreter.init_vars = function(){
		
		var i = 0;
		try{
			for(i = 0 ; i < params_v.length; i++){
				if(_intepreter.var_exists(param_names[i]))
					_intepreter.set_value(param_names[i], params_v[i]);
				else
					throw "@Στη γραμμή " + this.offset + " στη διαδικασία '" + name + "' η παράμετρος '" + param_names[i] + "' δεν έχει δηλωθεί στις μεταβλητές.";
			}
		}catch(e){
			if(typeof e == "string" && e.startsWith("@")) throw e.substr(1, e.length);
			throw "Οι παράμετροι δεν ταιρίαζουν με τον τύπο των τυπικών παραμέτρων της συνάρτησης " + name;
		}
	};

	_intepreter.run(mother.procedures[name].code);

	var output = [];
	for(var i = 0 ; i < param_names.length; i++){
		output[i] = _intepreter.get_value(param_names[i]);
	}

	this.child = null;
	this.child_data = null;

	return output;
}

this.check_call_proc = function(){

	var regex = /^\s*ΚΑΛΕΣΕ (.+)\((.*)\)\s*$/;

	var res = this.code_lines[this.lc].match(regex);

	if(res != null){

		var name = res[1].trim();
		var params = res[2];
		if(params.trim() == "") params = [];
		else params = param_split(params);
		//else params = params.split(/,(?![^\[\(]*[\]\)])/);

		var params_values = [];
		for(var i = 0 ; i < params.length; i++){
			params_values[i] = this.intepreter.get_value(params[i]);			
		}

		var new_param_values = this.call_proc(name, params_values, params);

		for(var i = 0 ; i < params.length; i++){
			this.intepreter.set_value(params[i], new_param_values[i]);
		}

		return true;
	}else{
		return false;
	}

}

this.check_for_withstep = function(){

	var regex_open = /^\s*ΓΙΑ +(.+) +ΑΠΟ +(.*) +ΜΕΧΡΙ +(.*) +ΜΕ ΒΗΜΑ +(.*)\s*$/;
	var regex_close = /^\s*ΤΕΛΟΣ_ΕΠΑΝΑΛΗΨΗΣ\s*$/;

	var res = this.code_lines[this.lc].match(regex_open);

	if(res != null){

		var end = this.find_matching_end(this.lc+1, regex_open, regex_close);

		if(end == -1) throw "Στη γραμμή " + this.getline() + " δεν βρέθηκε το ΤΕΛΟΣ_ΕΠΑΝΑΛΗΨΗΣ της ΓΙΑ";

		var variable = res[1];
		var begin = eval_exp(res[2], this.intepreter);
		var endp = eval_exp(res[3], this.intepreter);
		var step = eval_exp(res[4], this.intepreter);

		if(begin == undefined || endp == undefined || step == undefined || isNaN(begin) || isNaN(endp) || isNaN(step)) throw "Στη γραμμή "+ this.getline() + " λάθος παράμετροι για την ΓΙΑ";

		this.child = new block(this.code_lines.slice(this.lc+1, end), this.intepreter, this.lc + 1 + this.offset);
		this.child_data = {type:"for", variable: variable, begin:begin, endp:endp, end:end, step:step};
		this.child_data = {type:"for", variable: variable, begin:begin, endp:res[3], end:end, step:res[4]};

		var i;
		if(step > 0){
			for(i = begin; i <= endp; i += step){
				this.intepreter.set_value(variable, i);
				this.child.run();

				endp = eval_exp(res[3], this.intepreter);
				step = eval_exp(res[4], this.intepreter);
				i = this.intepreter.get_value(variable);
			}
			this.intepreter.set_value(variable, i);
		}else{
			for(i = begin; i >= endp; i += step){
				this.intepreter.set_value(variable, i);
				this.child.run();

				endp = eval_exp(res[3], this.intepreter);
				step = eval_exp(res[4], this.intepreter);
				i = this.intepreter.get_value(variable);
			}
			this.intepreter.set_value(variable, i);
		}
		
		this.lc = end;

		return true;

	}else{
		return false;
	}


}

this.check_for = function(){

	var regex_open = /^\s*ΓΙΑ (.+) +ΑΠΟ +(.*) +ΜΕΧΡΙ +(.*) *\s*$/;
	var regex_close = /^\s*ΤΕΛΟΣ_ΕΠΑΝΑΛΗΨΗΣ\s*$/;

	var res = this.code_lines[this.lc].match(regex_open);

	if(res != null){

		var end = this.find_matching_end(this.lc+1, regex_open, regex_close);

		if(end == -1) throw "Στη γραμμή " + this.getline() + " δεν βρέθηκε το ΤΕΛΟΣ_ΕΠΑΝΑΛΗΨΗΣ της ΓΙΑ";

		var variable = res[1];
		var begin = eval_exp(res[2], this.intepreter);
		var endp = eval_exp(res[3], this.intepreter);
		var step = 1;

		if(begin == undefined || endp == undefined || step == undefined || isNaN(begin) || isNaN(endp)) throw "Στη γραμμή "+ this.getline() + " λάθος παράμετροι για την ΓΙΑ";

		this.child = new block(this.code_lines.slice(this.lc+1, end), this.intepreter, this.lc + this.offset);
		this.child_data = {type:"for", variable: variable, begin:begin, endp:res[3], end:end, step:"1"};

		var i;
		for(i = begin; i <= endp; i += step){
			this.intepreter.set_value(variable, i);
			this.child.run();

						
			endp = eval_exp(res[3], this.intepreter);
			i = this.intepreter.get_value(variable);
		}
		this.intepreter.set_value(variable, i);
		
		this.lc = end;

		return true;

	}else{
		return false;
	}


}

this.check_dowhile = function(){

	var regex_open = /^\s*ΑΡΧΗ_ΕΠΑΝΑΛΗΨΗΣ\s*$/;
	var regex_close = /^\s*ΜΕΧΡΙΣ_ΟΤΟΥ +(.*)\s*$/;

	var res = this.code_lines[this.lc].match(regex_open);

	if(res != null){

		var end = this.find_matching_end(this.lc+1, regex_open, regex_close);

		if(end == -1) throw "Στη γραμμή " + this.getline() + " δεν βρέθηκε ΜΕΧΡΙΣ_ΟΤΟΥ";

		var resend = this.code_lines[end].match(regex_close);

		var condition = false;
		this.child = new block(this.code_lines.slice(this.lc+1, end), this.intepreter, this.lc + this.offset + 1);
		this.child_data = {type:"dowhile", condition:resend[1], end:end};

		//var max = 1000;
		do{
			this.child.run();
			//max--;

			condition = eval_exp(resend[1], this.intepreter);
		}while(!condition /*&& max > 0*/);

		//if(max == 0) throw "Exceeded max loops";
		
		this.lc = end;

		return true;

	}else{
		return false;
	}
}


this.check_while = function(){

	var regex_open = /^\s*ΟΣΟ (.+) +ΕΠΑΝΑΛΑΒΕ\s*$/;
	var regex_close = /^\s*ΤΕΛΟΣ_ΕΠΑΝΑΛΗΨΗΣ\s*$/;

	var res = this.code_lines[this.lc].match(regex_open);

	if(res != null){

		var end = this.find_matching_end(this.lc+1, regex_open, regex_close);

		if(end == -1) throw "Στη γραμμή " + this.getline() + " δεν βρέθηκε το ΤΕΛΟΣ_ΕΠΑΝΑΛΗΨΗΣ της ΟΣΟ";

		var condition = eval_exp(res[1], this.intepreter);
		this.child = new block(this.code_lines.slice(this.lc+1, end), this.intepreter, this.lc + this.offset + 1);
		this.child_data = {type:"while", condition:res[1], end:end};

		//var max = 1000;
		while(condition /*&& max > 0*/){
			this.child.run();
			//max--;

			condition = eval_exp(res[1], this.intepreter);
		}

		//if(max == 0) throw "Exceeded max loops";
		
		this.lc = end;

		return true;

	}else{
		return false;
	}


}

this.check_if = function(){
	
	var regex_open = /^\s*ΑΝ (.+) +ΤΟΤΕ\s*$/;
	var regex_close = /^\s*ΤΕΛΟΣ_ΑΝ\s*$/;
	var regex_elif = /^\s*ΑΛΛΙΩΣ_ΑΝ +(.*) +ΤΟΤΕ\s*$/;
	var regex_else = /^\s*ΑΛΛΙΩΣ\s*$/;

	var res = this.code_lines[this.lc].match(regex_open);

	if(res != null){

		//find end
		var end = this.find_matching_end(this.lc+1, regex_open, regex_close);
		var elif = this.find_matching_elifs(this.lc+1, regex_open, regex_close, regex_elif);
		var els = this.find_matching_else(this.lc+1, regex_open, regex_close, regex_else);

		if(end == -1) throw "Στη γραμμή " + this.getline() + " δεν βρέθηκε το ΤΕΛΟΣ_ΑΝ";
	
		var condition = eval_exp(res[1], this.intepreter);
		var done_smth = false;

		if(condition){
			var lim = end;
			if(els != -1) lim = els;
			if(elif != null) lim = elif[0][0];
			this.child = new block(this.code_lines.slice(this.lc+1, lim), this.intepreter, this.lc + 1 + this.offset);
			this.child_data= {type:"if", end:end};
			this.child.run();
			done_smth = true;
		}else if(elif != null){
			for(var i = 0; i < elif.length; i++){
				condition = eval_exp(elif[i][2], this.intepreter);
				if(condition){
					var lim = (i == elif.length - 1) ? els : elif[i+1][0];
					if(lim == -1) lim = end;
					this.child = new block(this.code_lines.slice(elif[i][0]+1, lim), this.intepreter, elif[i][0] + 1 + this.offset);
					this.child_data= {type:"if", end:end};
					this.child.run();
					done_smth = true;
					break;
				}
			}
		}

		if(els != -1 && !done_smth){
			this.child = new block(this.code_lines.slice(els+1, end), this.intepreter, els + 1 + this.offset);
			this.child_data= {type:"if", end:end};
			this.child.run();
		}

		this.lc = end;
		
		return true;
	}else{
		return false;
	}

}

this.check_options = function(){
	
	var regex_open = /^\s*ΕΠΙΛΕΞΕ (.+)\s*$/;
	var regex_close = /^\s*ΤΕΛΟΣ_ΕΠΙΛΟΓΩΝ\s*$/;
	var regex_option = /^\s*ΠΕΡΙΠΤΩΣΗ +(.*)\s*$/;

	var res = this.code_lines[this.lc].match(regex_open);

	if(res != null){

		//find end
		var end = this.find_matching_end(this.lc+1, regex_open, regex_close);
		var options = this.find_matching_options(this.lc+1, regex_open, regex_close, regex_option);

		if(end == -1) throw "Στη γραμμή " + this.getline() + " δεν βρέθηκε το ΤΕΛΟΣ_ΕΠΙΛΟΓΩΝ";

		var value = eval_exp(res[1], this.intepreter);
	
		var i = 0;
		for(i = 0 ; i < options.length; i++){

			var lim = i + 1< options.length ? options[i+1][0] : end;

			if(options[i][2].trim() == "ΑΛΛΙΩΣ"){
				
				this.child = new block(this.code_lines.slice(options[i][0] + 1, lim), this.intepreter, options[i][0] + 1 + this.offset);
				this.child_data= {type:"options", end:end};
				this.child.run();
				break;
			}else if(this.param_split_options(options[i][2]).includes(value)){

				this.child = new block(this.code_lines.slice(options[i][0] + 1, lim), this.intepreter, options[i][0] + 1 + this.offset);
				this.child_data= {type:"options", end:end};
				this.child.run();
				break;
			}
		}


		this.lc = end;
	
		return true;
	}else{
		return false;
	}

}


this.check_assignment = function(){

	var regex = /^\s*([Α-Ωα-ωA-Za-z_άέήίόύώΆΈΉΊΌΎΏς]+[Α-Ωα-ωiA-Za-z_0-9άέήίόύώΆΈΉΊΌΎΏς]* *(\[.*\])?) *<- *(.*) *\s*$/;

	var res = this.code_lines[this.lc].match(regex);

	try{
	if(res != null){
		var value = eval_exp(res[3], this.intepreter);
		this.intepreter.set_value(res[1], value);
		return true;
	}
	}catch(e){
		throw "Στην ανάθεση γραμμή " + this.getline() + " : " + e;
	}
	return false;

}

this.check_read = function(){
	
	var regex = /^\s*ΔΙΑΒΑΣΕ +(.+)\s*/;
	var res = this.code_lines[this.lc].match(regex);
	
	if(res == null) return false;

	if(this.intepreter.is_function) throw "Στη γραμμή " + this.getline() + " δεν μπορεί να κληθεί η εντολή ΔΙΑΒΑΣΕ μέσα σε συνάρτηση";

	var vars = res[1].split(/,(?![^\[]*])/);
	for(var i = 0 ; i < vars.length; i++ ) vars[i] = vars[i].trim();


	if(screen_available() >= vars.length){

		for(var i = 0 ; i < vars.length; i++){
			var name = vars[i].match(/(.*)\[|(.*)/);
			if(name[1] == undefined) name = name[2]; else name = name[1];
			if(this.intepreter.var_exists(name)){
					if(this.intepreter.variables[name].type.startsWith("int") 
					|| this.intepreter.variables[name].type.startsWith("real")){
						this.intepreter.set_value(vars[i], parseFloat(screen_get_value()));
					}else if(this.intepreter.variables[name].type.startsWith("string")){
						this.intepreter.set_value(vars[i], screen_get_value());
					}else{
						var val = screen_get_value().trim();
						if(val == "true"){
							this.intepreter.set_value(vars[i], true);
						}else if(val == "false"){
							this.intepreter.set_value(vars[i], false);
						}else{
							 throw "Στη γραμμή " + this.getline() + ". Για να διαβάσεις σε λογικές μεταβλητές γράφεις true ή false.";
						}
					}
			}else{
				throw "Στη γραμμή " + this.getline() + ". Δεν έχει ορισθεί μεταβλητή με όνομα " + vars[i];
			}	

		}
	}else{
		screen_callback_min = vars.length;
		screen_callback = mother.resume;
		throw "Empty input";
	}

	return true;
}

this.check_write = function(){
	
	var regex = /^\s*ΓΡΑΨΕ +(.+)\s*/;
	var res = this.code_lines[this.lc].match(regex);
	
	if(res == null) return false;

	if(this.intepreter.is_function) throw "Στη γραμμή " + this.getline() + " δεν μπορεί να κληθεί η εντολή ΓΡΑΨΕ μέσα σε συνάρτηση";

	var params = param_split(res[1]);
	//var params = res[1].split(/,(?![^\[\(]*[\]\)])/);
	for(var i = 0 ; i < params.length; i++ ) params[i] = params[i].trim();

	var line = "";

	for(var i = 0 ; i < params.length; i++){
		try{
			if(this.intepreter.var_exists(params[i])){
				line += this.intepreter.get_value(params[i]);
			}else{
				line += eval_exp(params[i], this.intepreter);
			}
		}catch(e){
			console.error(e);
			throw "Στη γραμμή " + this.getline() + " με την εντολή ΓΡΑΨΕ : " + e;
		}
	} 

	write_screen(line);

	return true;
}

//RESUME

this.resume_if = function(){

	this.child.resume();
	this.lc = this.child_data.end;

}

this.resume_options = function(){

	this.child.resume();
	this.lc = this.child_data.end;

}

this.resume_for = function(){

		var variable = this.child_data.variable;
		var endp_exp = this.child_data.endp;
		var step_exp = this.child_data.step;

		var i;


		this.child.resume();


		endp = eval_exp(endp_exp, this.intepreter);
		step = eval_exp(step_exp, this.intepreter);

		var begin = this.intepreter.get_value(this.child_data.variable) + step;

		if(step > 0){
			for(i = begin; i <= endp; i += step){
				this.intepreter.set_value(variable, i);
				this.child.run();

				endp = eval_exp(endp_exp, this.intepreter);
				step = eval_exp(step_exp, this.intepreter);
				i = this.intepreter.get_value(variable);
			}
			this.intepreter.set_value(variable, i);
		}else{
			for(i = begin; i >= endp; i += step){
				this.intepreter.set_value(variable, i);
				this.child.run();

				endp = eval_exp(endp_exp, this.intepreter);
				step = eval_exp(step_exp, this.intepreter);
				i = this.intepreter.get_value(variable);
			}
			this.intepreter.set_value(variable, i);
		}
		
		this.lc = this.child_data.end;

}

this.resume_while = function(){
	


		var condition_exp = this.child_data.condition;
		

		this.child.resume();

		//var max = 1000;
		var condition = eval_exp(condition_exp, this.intepreter);
		while(condition /*&& max > 0*/){
			this.child.run();
			//max--;

			condition = eval_exp(condition_exp, this.intepreter);
		}

		//if(max == 0) throw "Exceeded max loops";
		
		this.lc = this.child_data.end;

}


this.resume_dowhile = function(){


		var condition_exp = this.child_data.condition;



		this.child.resume();

		var condition = eval_exp(condition_exp, this.intepreter);
		//var max = 1000;
		while(!condition /*&& max > 0*/){
			this.child.run();
			//max--;

			condition = eval_exp(condition_exp, this.intepreter);
		}

		//if(max == 0) throw "Exceeded max loops";
		
		this.lc = this.child_data.end;
}

this.resume_proc = function(){

	var params_calling = this.child_data.param_calling;
	var param_called = this.child_data.param_called;

	this.child.resume();

	var output = [];
	for(var i = 0 ; i < param_called.length; i++){
		output[i] = this.child.get_value(param_called[i]);
	}

	for(var i = 0 ; i < params_calling.length; i++){
		this.intepreter.set_value(params_calling[i], output[i]);
	}


}

this.find_line = function(regex, from, to){
	for(var i = from; i < to; i++){
		if(this.code_lines[i].match(regex) != null)
			return i;
	}
	return -1;
}

this.find_matching_end = function(start, regex_open, regex_close) {
	var depth = 0;
	for(var i = start ; i < this.code_lines.length; i++){
		if(this.code_lines[i].match(regex_open) != null){
			depth++;
		}else if(this.code_lines[i].match(regex_close) != null){
			depth--;
		}
		if(depth < 0){
			return i;
		}
	}
	return -1;
}

this.find_matching_else = function(start, regex_if, regex_endif, regex_else) {
	var ifs = 0;
	for(var i = start ; i < this.code_lines.length; i++){
		if(this.code_lines[i].match(regex_if) != null){
			ifs++;
		}else if(this.code_lines[i].match(regex_endif) != null){
			ifs--;
		}else if(ifs == 0 && this.code_lines[i].match(regex_else) != null){
			return i;
		}
		if(ifs < 0) return -1;
	}
	return -1;
}

this.find_matching_elifs = function(start, regex_if, regex_endif, regex_elif) {
	var list = [];
	var ifs = 0;
	for(var i = start ; i < this.code_lines.length; i++){
		if(this.code_lines[i].match(regex_if) != null){
			ifs++;
		}else if(this.code_lines[i].match(regex_endif) != null){
			ifs--;
		}else if(ifs == 0){
			var res = this.code_lines[i].match(regex_elif);
			if(res != null) list.push([i].concat(res));
		}
		if(ifs < 0) break;
	}

	if(list.length == 0) return null;
	return list;
}

this.find_matching_options = function(start, regex_open, regex_close, regex_options) {
	var list = [];
	var options = 0;
	for(var i = start ; i < this.code_lines.length; i++){
		if(this.code_lines[i].match(regex_open) != null){
			optins++;
		}else if(this.code_lines[i].match(regex_close) != null){
			options--;
		}else if(options == 0){
			var res = this.code_lines[i].match(regex_options);
			if(res != null) list.push([i].concat(res));
		}
		if(options < 0) break;
	}

	if(list.length == 0) return null;
	return list;
}

this.param_split_options = function(text){

	var list = text.split(',');

	var regex_int = /^\d+$/;
	var regex_float = /^\d+\.\d+$/;
	var regex_text = /^(['"])(.*)\1$/;
	var regex_true = /^ΑΛΗΘΗΣ$|^Αληθής$|^Αληθης$|^αληθής$|^αληθης$/;
	var regex_false = /^ΨΕΥΔΗΣ$|^Ψευδής$|^Ψευδης$|^ψευδής$|^ψευδης$/;

	var result;

	var i = 0;
	for(i = 0 ; i < list.length; i++){
		if(list[i].trim().match(regex_true) != null){ list[i] = true; continue;}
		if(list[i].trim().match(regex_false) != null){ list[i] = false; continue;}

		if(list[i].trim().match(regex_int) != null){ list[i] = parseInt(list[i]); continue;}
		if(list[i].trim().match(regex_float) != null){ list[i] = parseFloat(list[i]); continue;}

		result = list[i].trim().match(regex_text);
		if(result != null){ list[i] = result[2]; continue;}

		throw 'Μη έγκυρη λίστα τιμών ' + text;
	}

	return list;
}

this.find_all = function(regex, from, to){
	var list = [];
	for(var i = from; i < to; i++){
		var res = this.code_lines[i].match(regex);
		if(res != null)
			list.push([i].concat(res));
	}
	if(list.length == 0) return null;
	return list;
}

this.getline = function(){
	return this.lc + this.offset + 1;
}


}

