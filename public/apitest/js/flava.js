
function flava(dio){
if(dio==null)return null;




dio.cl= function(clas){
dio.className = clas;
return dio;
}; 

dio.inn= function(word){
	dio.innerHTML =word;
	return dio;
}; 

dio.pend= function(el,key){
	dio.appendChild(el);
dio[key] = el;

	return dio;
}; 


dio.sh= function(h){
	dio.style.height =h;
	return dio;
}; 


dio.sw= function(w){
	dio.style.width =w;
	return dio;
}; 


dio.bc= function(word){
	dio.style.backgroundColor=word;
	return dio;
}; 


dio.prop= function(name,obj){
	dio[name]=obj;
	return dio;
}; 

dio.stprop= function(name,obj){
	dio.style[name]=obj;
	return dio;
}; 

dio.clear0 = function(){
	
	while( dio.hasChildNodes() ){
			  
		dio.removeChild(dio.lastChild);
			
		
	
	}
	return dio;	
};



dio.pendif = function(con,el){
	if(con)dio.appendChild(el);
	return dio;
}
	return dio;
}////flava

function div(){return flava( document.createElement('div') );}////div
function get(el){return flava( document.getElementById(el));}////get
function el(tag){return flava( document.createElement(tag));}///el

function ieck(){
	
	var ie = false;
		
		var tp = document.createElement("div");

	tp.style.display="none";
		tp.innerHTML="<!--[if gt IE ]><div id ='itest'></div><![endif]-->";
		
		document.body.appendChild(tp);
		
	var test = document.getElementById("itest");

	ie = (test!=null);
		
	return ie;	
	}

function safeclasser(cl,tag){
	var els=new Array();
	var clnl = cl.length;
	
	var prels;
	if(tag==null){
		
	prels = document.getElementsByTagName("*");	
		
		
	}else{
		
		prels = document.getElementsByTagName(tag);	

	}
	for(var i =0;i<prels.length;i++){
		prel = prels[i];
		
		var clname = prel.className;
		

		if( clname!=null && 
				clname.length==clnl &&
					clname.indexOf(cl)>-1 ){				
			els.push(prel);
		}
	}
	
	return els;
}
