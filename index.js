/**
 * This javascript file will constitute the main part of your solution.
 *
 * Edit it as you need.  It currently contains things that you might find helpful to get started.
 */

// This is not really required, but means that changes to index.html will cause a reload.
require('./site/index.html')
// Apply the styles in style.css to the page.
require('./site/style.css')
var tableSorting = require('./site/tableSorting');
// Change this to get detailed logging from the stomp library
global.DEBUG = true;

const url = "ws://localhost:8011/stomp"
const client = Stomp.client(url)
client.debug = function(msg) {
  if (global.DEBUG) {

  }
}

function connectCallback() {
  //document.getElementById('stomp-status').innerHTML = "It has now successfully connected to a stomp server serving price updates for some foreign exchange currency pairs."
		subscription = client.subscribe("/fx/prices", function(msg) {
			// handle messages for this subscription 
			var dataTable = document.getElementById('data-table');
			var tableBody = document.getElementById('table-body');
			buildHtmlTable(dataTable, tableBody, JSON.parse(msg.body));
			tableSorting(6,'data-table');
		});
}

client.connect({}, connectCallback, function(error) {
  alert(error.headers.message);

});
/*
Function to add currency pair to data table if it is not already added
*/
function buildHtmlTable(dataTable, tableBody, data) {
    if(tableBody.getElementsByClassName(data.name).length === 0){
    	var row = tableBody.insertRow(0);
	    row.id=data.name;
	    row.className=data.name;
	   	var arr = Object.keys(data).map(function(k) { return data[k] });
	    for(var i in arr) {
	    	var cell = row.insertCell(i);
	    	cell.innerHTML = arr[i];
		}
    }
    else{
    	updateHtmlTable(dataTable.rows.namedItem(data.name), tableBody, data);
    }
}
/*
Function to update the table if the currency row is already added to data table
*/
function updateHtmlTable(dataRow, tableBody, data){
	var bestBid = dataRow.cells[1];
	var bestAsk = dataRow.cells[2];
	var openBid = dataRow.cells[3];
	var openAsk = dataRow.cells[4];
	var lastChangeAsk = dataRow.cells[5];
	var lastChangeBid = dataRow.cells[6];
	var textColor = parseFloat(lastChangeBid.innerHTML) >= data.lastChangeBid ? '#00EC00' : '#FF06DC' ;
	bestBid.innerHTML = data.bestBid;
	bestAsk.innerHTML = data.bestAsk;
	openBid.innerHTML = data.openBid;
	openAsk.innerHTML = data.openAsk;
	lastChangeAsk.innerHTML = data.lastChangeAsk;
	lastChangeBid.innerHTML = data.lastChangeBid;
	lastChangeBid.style.color = textColor;
	
}
var modal = document.getElementById('myModal');
var infoLink = document.getElementById("infoLink");
var close = document.getElementsByClassName("close")[0];

infoLink.onclick = function() {
    modal.style.display = "block";
}

close.onclick = function() {
    modal.style.display = "none";
}
infoLink.onclick = function() {
    modal.style.display = "block";
}

window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}


  	
