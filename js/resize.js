
function resize(){

	//mobile
	if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
		if(window.innerWidth < window.innerHeight){
		editor.setSize(360, 500);
		}else if(window.innerWidth <= 950){
			var height = (window.innerHeight - 100 - 3 * 20) / 2 - 2;
			if(height < 220) height = 220;
			editor.setSize(window.innerWidth - 2 - 2 * 20 , height);
		}else{
			editor.setSize((window.innerWidth -4 - 3 * 20)/2 - 1, window.innerHeight - 100 - 2 * 20 - 2);
		}

		return;
	}

	//desktop
	if(window.innerWidth < 400){ // mobile
		editor.setSize(window.innerWidth - 2, 500);
	}else if(window.innerWidth <= 950){
		var height = (window.innerHeight - 100 - 3 * 20) / 2 - 2;
		if(height < 220) height = 220;
		editor.setSize(window.innerWidth - 2 - 2 * 20 , height);
	}else{
		editor.setSize((window.innerWidth -4 - 3 * 20)/2 - 1, window.innerHeight - 100 - 2 * 20 - 2);
	}

}

resize();

window.onresize = resize;
