var sup_peazzy = function(){


teazy =  get('obtab');

newfield();


}//sup_peazzy




var newfield = function(){

teazy.pend(

	el('tr').pend(
		
		el('td').pend(
		
			el('input').cl('fput')
		
			,'put')

		).pend(
		
		el('td').pend(
		
			el('input').cl('fput')
		
			,'put')

		)

	);


}// new field


var getobj = function(){
var rows = teazy.rows;

var obj = {};

for (var i = 0; i < rows.length; i++) {
	var ob = rows[i].cells;

obj[ ob[0].put.value ] =  ob[1].put.value 


};

return obj;

}//getobj

var send = function(){

var url = get('uput').value;

var obj = getobj();

grabstuff( url+'/'+encodeURI( JSON.stringify( obj ) ) ,function(stuff){

get('rspace').innerHTML = JSON.stringify(stuff);


} );


}//send



function grabstuff(url,callback,extra){
	//console.log(url);
	var xmlhttp;
	var txt,x,i;

	if (window.XMLHttpRequest)
	  {// code for IE7+, Firefox, Chrome, Opera, Safari
	  xmlhttp=new XMLHttpRequest();
	  }
	else
	  {// code for IE6, IE5
	  xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
	  }
	 xmlhttp.onreadystatechange=function()
	  {
	  if (xmlhttp.readyState==4 && xmlhttp.status==200)
	    {
	    
		  var back = xmlhttp.responseText;
		  var nson = JSON.parse(back);
			callback(nson,extra);
	   
	    }// ready state = 4
	  }//on ready state 

	xmlhttp.open("GET",url,true);
	xmlhttp.send();	
}//poststuff





