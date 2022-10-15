
function is_op(op){
	return op.match(/^[\+\-\*\/\^\e\$\%]$|^=$|^<>$|^>$|^<$|^>=$|^<=$|^\|\|$|^&&$|^!$/) != null;
}

function precedence(op){

	if(!op[1] && op[0] == "!") throw "@O τελεστής ΟΧΙ παίρνει μόνο ένα τελούμενο";

	if(op[1]){
		switch(op[0]){
			case "-":
			case "+":
				return 4;
			case "!":
				return -3;
			default:
				return -99;
		}
	}
	switch(op[0]){
		case "+":
		case "-":
			return 1;
		case "*":
		case "/":
		case "$":
		case "%":
			return 2;
		case "^":
		case "e":
			return 3;
		case "<":
		case ">":
		case ">=":
		case "<=":
			return -1;
		case "=":
		case "<>":
			return -2;
		case "&&":
			return -4;
		case "||":
			return -5;
		default:
			return -99;
	}
}

function apply_op(a, b, op){


	if(op == "-" && a == undefined && typeof b == "number") return -b;
	if(op == "+" && a == undefined && typeof b == "number") return b;
	if(op == "!" && a == undefined && typeof b == "boolean") return !b;

	

	if(a == undefined || b == undefined || op == undefined){
		//console.trace();
		throw "@Σφάλμα κατά τον υπολογισμό της έκφρασης";
		return 0;
	}

	if(typeof a == "number" && typeof b == "number")
	switch(op){
		case "+":
			return a + b;
		case "-":
			return a - b;
		case "*":
			return a * b;
		case "/":
			return a / b;
		case "$":
			return Math.floor(a / b);
		case "%":
			return a % b;
		case "^":
			return Math.pow(a, b);
		case "e":
			return a * Math.pow(10, b);
		case "<":
			return a < b;
		case ">":
			return a > b;
		case "<=":
			return a <= b;
		case ">=":
			return a >= b;
		case "=":
			return a === b;
		case "<>":
			return a != b;
		default:
	}

	if(typeof a == "boolean" && typeof b == "boolean")
	switch(op){
		case "&&":
			return a && b;
		case "||":
			return a || b;
		default:
	}

	if(typeof a == "string" && typeof b == "string"){
		switch(op){
			case "=":
				return a == b;
			case "<>":
				return a != b;
			default:
		}
	}

	throw "@Δεν βρέθηκε τελεστής";
}

function is_digit(a){
	return a.match(/^[0-9]$/) != null;
}


function eval_exp(exp, intepreter){
	try{
		return eval_exp_throws(exp, intepreter);
	}catch(e){
			if(e[0] == "@"){
			throw "Στην έκφραση '" + exp + "'";
			}else{
				throw e;
			}
	}
}

function eval_exp_throws(exp, intepreter){

	//if(exp.match(/^(['"])(.*)\1$/) != null) return exp; // its a string
	if(exp.trim().match(/^\d+\.\d+$/) != null) return parseFloat(exp); 
	if(exp.trim().match(/^\d+$/) != null) return parseInt(exp); 

	exp = intepreter.prepare_exp(exp);
	
	exp += "   "; // May work without it? For double operators not check out of bounds 

	var i = 0;
	var values = [];
	var ops = [];
	var symbol_before = true;

	for(i = 0 ; i < exp.length; i++){

		if(exp[i] === " ") continue;

		else if(exp[i] == "\""){
			//read the whole string
			var str = "";

			
			i++;
			while(i < exp.length && exp[i] != "\""){
				str += exp[i];
				i++;
			}
			
            values.push(str);
			symbol_before = false;
		}else if(exp[i] == "\'"){
			//read the whole string
			var str = "";

			
			i++;
			while(i < exp.length && exp[i] != "\'"){
				str += exp[i];
				i++;
			}
			
            values.push(str);
			symbol_before = false;
		}else if(exp[i] == "("){
			ops.push([exp[i], symbol_before]);
			symbol_before = true;
		}

		else if(is_digit(exp[i])){
			var val = "";
			var decimal = false;
			while(i < exp.length && (is_digit(exp[i]) || (exp[i] === "." && !decimal))) { 
				if(!decimal && exp[i] === ".") deciam = true;
                val = val + exp[i];
                i++;
            }

			if(i < exp.length && i > 0 && !is_digit(exp[i])) i--;
              
            values.push(parseFloat(val));
			symbol_before = false;
		}else if(exp[i] == "@"){
			values.push(true);
			symbol_before = false;
		}else if(exp[i] == "#"){
			values.push(false);
			symbol_before = false;
		}

		// Closing brace encountered, solve  
        // entire brace.
		else if(exp[i] === ")"){
			while(ops.length != 0 && ops[ops.length - 1][0] != '(') 
            { 

				var op = ops.pop();
				var val1 = undefined;
				var val2 = undefined;
				if(op[1]){
                	val2 = values.pop(); 
				}else{
                	val2 = values.pop(); 

                	val1 = values.pop(); 
				}
                  
                  
                values.push(apply_op(val1, val2, op[0])); 
            } 
              
            ops.pop(); 
			symbol_before = false;
		}else if(is_op(exp.substring(i, i+2))){ //double character operator
			// While top of 'ops' has same or greater  
            // precedence to current token, which 
            // is an operator. Apply operator on top  
            // of 'ops' to top two elements in values stack. 
			while(ops.length != 0 && precedence(ops[ops.length - 1]) >= precedence([exp.substring(i, i+2), symbol_before])){ 
				var op = ops.pop();
				var val1 = undefined;
				var val2 = undefined;
				if(op[1]){
                	val2 = values.pop(); 
				}else{
                	val2 = values.pop(); 

                	val1 = values.pop(); 
				}
                  
                  
                values.push(apply_op(val1, val2, op[0])); 
            } 
            // Push current token to 'ops'.  
            ops.push([exp.substring(i, i+2), symbol_before]); 
			i++; // Not that good idea
			symbol_before = true;
		}else if(is_op(exp[i])){ //single character operator
			// While top of 'ops' has same or greater  
            // precedence to current token, which 
            // is an operator. Apply operator on top  
            // of 'ops' to top two elements in values stack. 
			while(ops.length != 0 && precedence(ops[ops.length - 1]) >= precedence([exp[i], symbol_before])){ 
				var op = ops.pop();
				var val1 = undefined;
				var val2 = undefined;
				if(op[1]){
                	val2 = values.pop(); 
				}else{
                	val2 = values.pop(); 

                	val1 = values.pop(); 
				}
                  
                  
                values.push(apply_op(val1, val2, op[0])); 
            } 
            // Push current token to 'ops'.  
            ops.push([exp[i], symbol_before]);
			symbol_before = true;
		}else{
			//console.trace();
			throw "@Λάθος τελεστής στην έκφραση " + exp;
		}

	}


	// Entire expression has been parsed at this 
    // point, apply remaining ops to remaining 
    // values. 
    while(ops.length != 0){ 
				var op = ops.pop();
				var val1 = undefined;
				var val2 = undefined;
				if(op[1]){
                	val2 = values.pop(); 
				}else{
                	val2 = values.pop(); 

                	val1 = values.pop(); 
				}
                  
                  
                values.push(apply_op(val1, val2, op[0])); 
    } 
      
    // Top of 'values' contains result, return it. 
    return values.pop(); 

} 
