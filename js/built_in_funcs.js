/*
ΗΜ(Χ) Υπολογισμός ημιτόνου
ΣΥΝ(Χ) Υπολογισμός συνημιτόνου
ΕΦ(Χ) Υπολογισμός εφαπτομένης
Τ_Ρ(Χ) Υπολογισμός τετραγωνικής ρίζας
ΛΟΓ(Χ) Υπολογισμός φυσικού λογαρίθμου
Ε(Χ) Υπολογισμός του ex
Α_Μ(Χ) Ακέραιο μέρος του Χ
_Τ(Χ) Απόλυτη τιμή του Χ
*/

var built_in_funcs = {
	ΗΜ: function(a){
		if(isNaN(a)) throw "Η συνάρτηση HM() πέρνει ως παράμετρο μόνο αριθμό";
		return [a, Math.sin(a)];
	},
	ΣΥΝ: function(a){
		if(isNaN(a)) throw "Η συνάρτηση ΣΥΝ() πέρνει ως παράμετρο μόνο αριθμό";
		return [a, Math.cos(a)];
	},
	ΕΦ: function(a){
		if(isNaN(a)) throw "Η συνάρτηση ΕΦ() πέρνει ως παράμετρο μόνο αριθμό";
		return [a, Math.tan(a)];
	},
	Τ_Ρ: function(a){
		if(isNaN(a)) throw "Η συνάρτηση Τ_Ρ() πέρνει ως παράμετρο μόνο αριθμό";
		return [a, Math.sqrt(a)];
	},
	ΛΟΓ: function(a){
		if(isNaN(a)) throw "Η συνάρτηση ΛΟΓ() πέρνει ως παράμετρο μόνο αριθμό";
		return [a, Math.log(a)];
	},
	Ε: function(a){
		if(isNaN(a)) throw "Η συνάρτηση Ε() πέρνει ως παράμετρο μόνο αριθμό";
		return [a, Math.exp(a)];
	},
	Α_Μ: function(a){
		if(isNaN(a)) throw "Η συνάρτηση Α_Μ() πέρνει ως παράμετρο μόνο αριθμό";
		return [a, Math.floor(a)];
	},
	Α_Τ: function(a){
		if(isNaN(a)) throw "Η συνάρτηση Α_Τ() πέρνει ως παράμετρο μόνο αριθμό";
		return [a, a > 0 ? a : -a];
	}
}
