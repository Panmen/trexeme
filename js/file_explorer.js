function file_explorer(s_dir){

	this.start_dir = s_dir;
	this.state = null;
	this.load_callback = null;

	this.dom_elements = [];
	this.f_explorer = null;

	//should be createed with the name file_explorer_inst

	this.init = function(){
		this.f_explorer = document.getElementById("file_explorer");
		this.get_state();

		this.refresh_display();
	}

	this.get_state = function(){
		var data = httpGet(this.start_dir + "/state.json");
		this.state =  JSON.parse(data);
	}


	this.clear_display = function(){
		for(var i = 0; i < this.dom_elements.length; i++){
			this.f_explorer.removeChild(this.dom_elements[i])
		}
		this.dom_elements = [];
	}

	this.refresh_display = function(){

		if(this.state.back) this.add_dom_back();

		var i;
		for(i = 0 ; i < this.state.dir.length; i++){
			this.add_dom_dir(this.state.dir[i].name, this.state.dir[i].real_name);
		}

		for(i = 0 ; i < this.state.file.length; i++){
			this.add_dom_file(this.state.file[i].name, this.state.file[i].real_name);
		}
		
	}

	this.update = function(){
		this.clear_display();
		this.get_state();
		this.refresh_display();
	}

	this.dir_pressed = function(name){
		console.log(name);

		this.start_dir += "/" + name;

		this.update();
	}

	this.file_pressed = function(name){
		console.log(name);

		var data = httpGet(this.start_dir + "/" + name + ".txt");

		if(program_running){
			stop_execution();
		}

		editor.setValue(data);

		document.location = "#";
	}
		
	this.back = function(){
		console.log("back");
		
		var dirs = this.start_dir.split("/");
		if(dirs.length == 1) return;

		var new_dir = dirs[0];
		var i;
		for(i = 1 ; i < dirs.length - 1; i++){
			new_dir += "/" + dirs[i];
		}

		this.start_dir = new_dir;

		this.update();
	}

	this.add_dom_back = function(){

		var new_element = this.create_li("↩");

		new_element.onclick = function() { file_explorer_inst.back(); };
	}

	this.add_dom_dir = function(name, real_name){
		
		var new_element = this.create_li( "&#128193;" + name);

		new_element.onclick = function() { file_explorer_inst.dir_pressed(real_name); };
	}

	this.add_dom_file = function(name, real_name){
		
		var new_element = this.create_li("&#128196;" + name);

		new_element.onclick = function() { file_explorer_inst.file_pressed(real_name); };
	}

	this.create_li = function(content){

		var new_element = document.createElement("li");
		
		new_element.innerHTML = content;
		new_element.className += " unselectable"

		this.dom_elements.push(new_element);
		this.f_explorer.appendChild(new_element);

		return new_element;
	}


}
