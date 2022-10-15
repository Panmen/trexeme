

function prepare(exp){

	
	exp = exp.replace(/ΚΑΙ|και/g, "&&");
	exp = exp.replace(/Η|η|ή/g, "||");
	exp = exp.replace(/ΟΧΙ|οχι|όχι/g, "!");

	exp = exp.replace(/ΑΛΗΘΗΣ|Αληθής|Αληθης|αληθής|αληθης/g, "@");
	exp = exp.replace(/ΨΕΥΔΗΣ|Ψευδής|Ψευδης|ψευδής|ψευδης/g, "#");

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
			
			if(i >= exp.length){
				//variable
				res += "var";
				break;
			}else {
				//continue until you find ( or [ or [not space]

				while(i < exp.length && is_whitespace(exp[i])) i++;

				if(i >= exp.length){
					//variable
					res+= "var";
					break;
				}else if(exp[i] == "("){
					while(i < exp.length && exp[i] != ")") i++;
					if(i >= exp.length) throw "Expected ')'";
					i++;
					res += "func";
					//function
				}else if(exp[i] == "["){
					//array
					while(i < exp.length && exp[i] != "]") i++;
					if(i >= exp.length) throw "Expected ']'";
					i++;
					res += "array";
				}

			}

		}else{

			//not name
			res += exp[i];
			i++;
			
		}

	}

	return res;

}


function prepare_get_variable(){

}
