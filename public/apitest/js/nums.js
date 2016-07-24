

function tnum(el){
return parseInt( el.style.top.replace("px","").replace("%","") );
}

function numpx(n){
return parseInt(n.replace("px","").replace("%",""));	
}

function hnum(el){
return parseInt( el.style.left.replace("px","").replace("%",""));
}

function ctop(el){
	var rect = el.getBoundingClientRect();

    return parseFloat( rect.top);
}


function cleft(el){
	var rect = el.getBoundingClientRect();
    return parseFloat( rect.left);
}


function cw(el){
	var rect = el.getBoundingClientRect();
    return parseFloat( rect.right-rect.left);
}


function ch(el){
	var rect = el.getBoundingClientRect();
    return parseFloat( rect.bottom-rect.top);
}