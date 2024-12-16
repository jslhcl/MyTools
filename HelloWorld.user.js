// ==UserScript==
// @name        HelloWorld
// @namespace   hw
// @description first script
// @include 	http://bbs.nju.edu.cn/blogdoc?userid=snc
// @include 	http://bbs.nju.edu.cn/blogdoc?userid=snc*
// @version     1
// ==/UserScript==

//alert("hello");


/*var count = 1;
var File1 = document.getElementById("file1");
var div = document.createElement("div");
var countTxt = document.createTextNode("Text:"+count);
var inputTxt = document.createElement("input");
*/

// version 1, add an input in the page
/*var fonts = document.getElementsByTagName('font');
if (fonts.length) {
	var firstFont = fonts[0];
	var input = document.createElement('input');
	input.type = 'text';
	firstFont.parentNode.insertBefore(input, firstFont.nextSibling);
} */

function putInput() {

	GM_log("run here");
	//var input = document.createElement('input');
	//var btn = document.createElement('button');
	var myTbl = document.createElement('table');
	myTbl.innerHTML = '<table><tr><td></td></tr><tr><td></td></tr>';
	var textField = document.createElement('input');
	textField.type = 'text';
	var button = document.createElement('input');
	button.type = 'button';
	button.value = 'OK';
	/*button.onclick = function() {
		alert("hello");
	};*/
	button.onclick=myHandleClick;
	myTbl.firstChild.firstChild.appendChild(textField);
	myTbl.lastChild.firstChild.appendChild(button);

	var br = document.createElement('br');

	var tbls = document.getElementsByTagName('table');
	var tds = tbls[0].getElementsByTagName('td');	//2 columns in the table. We get the 1st
	var td = tds[0];
	var tbl = td.getElementsByTagName('table')[1];	//2 tables in this column. we get the second.	
	tbl.parentNode.insertBefore(br, tbl.nextSibling);
	br.parentNode.insertBefore(myTbl, br.nextSibling);
}

function myHandleClick() {
//	 alert("hello!!");
	window.open("http://www.google.com.hk");	
}

function main() {
	putInput();
//	document.addEventListener('click', handleClick);
}


main();
