module.exports = tableSorting;


/*
* Sort table based on the column number passed.
*/
var table; // Table object
var arrRow, arrTitleRow, arrTitleRowCell, arrTitleSpanCell, arrColSpan, arrColTitleFilled = new Array(); // Some Array Declarations
var sortingIndex; // Sorting index for sorting
var descending = false; // Descending order set to false initially
var numberOfRows, actualDataRows, maximumNumberColumns; 
// constants
var ascChr = "&#8607;"; // Symbol for ascending sort
var desChr = "&#8609;"; // Symbol for descending sort
var delimiter = '|'; // Delimiter

/*
    Initialize table
*/
function initTable(tableElement) {
 // Local variables
 var columnCount;
 var nChildNodes;
 var innerMostNode;
 var nColSpan, rowSpannedTitleCol, columnPosition;
 var cell, cellText;
 var titleFound = false;
 var remainingRowSpans, remainingColSpans;

 // Checking if the passed element is a real Table
 if (tableElement.tagName == "TABLE")
  table = tableElement;
 else
  table = document.getElementById(tableElement);

 if (table == null) return;

 if (table.tagName != "TABLE") return;

 // set max col number
 maximumNumberColumns = table.rows[table.rows.length - 1].cells.length;

 arrRow = new Array();
 arrColSpan = new Array();
 arrColTitleFilled = new Array();
 arrTitleRow = new Array();
 arrTitleRowCell = new Array();

 for (var i = 0; i < maximumNumberColumns; i++)
  arrColTitleFilled[i] = false;

 // Setting the number of rows
 numberOfRows = table.rows.length;

 // Should have at least 1 row
 if (numberOfRows < 1) return;

 // Initialization of local variables
 actualDataRows = 0;
 remainingRowSpans = 0; // Remaining rows in the row span
 remainingColSpans = 0; // Remaining cols in the col span
 rowSpannedTitleCol = 0; // Number of title cols from row span

 // Looping  rows
 for (var i = 0; i < numberOfRows; i++) {
  nColSpan = 1, columnPosition = 0;
  // Looping through columns
  for (var j = 0; j < table.rows[i].cells.length; j++) {
   // If title found
   if (titleFound == false) {
    if (table.rows[i].cells[j].rowSpan > 1) {
     if (table.rows[i].cells[j].colSpan < 2) {
      arrTitleSpanCell[columnPosition] = table.rows[i].cells[j];
      arrColTitleFilled[columnPosition] = true;
      rowSpannedTitleCol++;
     }
     if (table.rows[i].cells[j].rowSpan - 1 > remainingRowSpans) {
      remainingRowSpans = table.rows[i].cells[j].rowSpan - 1;
      if (table.rows[i].cells[j].colSpan > 1)
       remainingColSpans = remainingRowSpans + 1;
     }
    }
   }
   if (table.rows[i].cells[j].colSpan > 1 &&
    remainingColSpans == 0) {
    nColSpan = table.rows[i].cells[j].colSpan;
    columnPosition += nColSpan;
   } else {
    columnPosition++;
   }
  }

  // Setting up the title cells
  if (titleFound == false && nColSpan == 1 &&
   remainingRowSpans == 0 && remainingColSpans == 0 && titleFound == false) {
   arrColSpan[i] = true;
   titleFound = true;

   // Using indivisual cell as an array element
   columnCount = 0;
   for (var j = 0; j < table.rows[i].cells.length + rowSpannedTitleCol; j++) {
    if (arrColTitleFilled[j] != true) {
     arrTitleRowCell[j] = table.rows[i].cells[columnCount];
     columnCount++;
    } else {
     arrTitleRowCell[j] = arrTitleSpanCell[j];
    }
   }
  }
  // Setting up the data rows
  else if (titleFound == true && nColSpan == 1 && remainingRowSpans == 0) {
   for (var j = 0; j < table.rows[i].cells.length; j++) {
    if (table.rows[i].cells[j].rowSpan > 1) return;
    nChildNodes = table.rows[i].cells[j].firstChild.childNodes.length;
    innerMostNode = table.rows[i].cells[j].firstChild;

    while (nChildNodes != 0) {
     innerMostNode = innerMostNode.firstChild;
     nChildNodes = innerMostNode.childNodes.length;
    }

    if (j == 0) {
     arrRow[actualDataRows] = innerMostNode.data;
    } else {
     arrRow[actualDataRows] += delimiter + innerMostNode.data;
    }
   }
   // Inconsistent col lengh for data rows
   if (table.rows[i].cells.length > maximumNumberColumns)
    return;
   actualDataRows++;
   arrColSpan[i] = false;
  } else if (nColSpan == 1 && remainingRowSpans == 0 && remainingColSpans == 0 && titleFound == false) {
   arrColSpan[i] = false;
  } else {
   arrColSpan[i] = true;
  }

  // Counters for row/column spans
  if (remainingRowSpans > 0) remainingRowSpans--;
  if (remainingColSpans > 0) remainingColSpans--;
 }

 if (actualDataRows < 1) return;

 // Re-drawing the title row
 for (var j = 0; j < maximumNumberColumns; j++) {
  // If no child found
  if (arrTitleRowCell[j].childNodes.length == 0) return;
  if (arrTitleRowCell[j].firstChild != null) {
   nChildNodes = arrTitleRowCell[j].firstChild.childNodes.length;
   innerMostNode = arrTitleRowCell[j].firstChild;

   while (nChildNodes != 0) {
    innerMostNode = innerMostNode.firstChild;
    nChildNodes = innerMostNode.childNodes.length;
   }
   cellText = innerMostNode.data;
  } else {
   cellText = "column(" + j + ")";
  }
  arrTitleRow[j] = cellText;
  arrTitleRowCell[j].innerHTML ='<a ' +j + ',' + '"' + table.id + '"' + ');\'>' +cellText +'</a>';
 }
}

function tableSorting(sortColumnIndex, tableElement) {
 // Re-inializing the table object
 initTable(tableElement);

 // Local variables
 var nChildNodes;
 var innerMostNode;
 var rowContent;
 var rowCount;
 var cell, cellText;
 var newTitle;

 // Can't sort past the max allowed column size
 if (sortColumnIndex < 0 || sortColumnIndex >= maximumNumberColumns) return;

 // Assignment of sort sortColumnIndex
 sortingIndex = sortColumnIndex;
 // Doing the sort using JavaScript generic function for an Array
 arrRow.sort(compareValues);

 // Title row redraw
 for (var j = 0; j < maximumNumberColumns; j++) {
  cellText = arrTitleRow[j];
  cellText = cellText + '</a>';
  newTitle = '<a ' +
   j + ',' + '"' + table.id + '"' + ');\'>' +
   cellText +
   '</a>';
  if (j == sortingIndex) {
   newTitle += '&nbsp;';
   if (descending){
        newTitle += desChr;
    }
   else{
        newTitle += ascChr;
    }
   newTitle += '</font>';
  }
  arrTitleRowCell[j].innerHTML = newTitle;
 }

 // Table redrawn
 rowCount = 0;
 for (var i = 0; i < numberOfRows; i++) {
  if (!arrColSpan[i]) {
   for (var j = 0; j < maximumNumberColumns; j++) {
    rowContent = arrRow[rowCount].split(delimiter);
    nChildNodes = table.rows[i].cells[j].firstChild.childNodes.length;
    innerMostNode =table.rows[i].cells[j].firstChild;

    while (nChildNodes != 0) {
     innerMostNode = innerMostNode.firstChild;
     nChildNodes = innerMostNode.childNodes.length;
    }
    innerMostNode.data = rowContent[j];
   }
   rowCount++;
  }
 }
}

/*
    Array Comparing 
*/
function compareValues(valueOne, valueTwo) {
 var valueOneRowContent = valueOne.split(delimiter);
 var valueTwoRowContent = valueTwo.split(delimiter);

//Incase if data conversion
 var valueOneToBeCompared, valueTwoToBeCompared;

 if (!isNaN(valueOneRowContent[sortingIndex]))
  valueOneToBeCompared = parseFloat(valueOneRowContent[sortingIndex]);
 else
  valueOneToBeCompared = valueOneRowContent[sortingIndex];

 if (!isNaN(valueTwoRowContent[sortingIndex]))
  valueTwoToBeCompared = parseFloat(valueTwoRowContent[sortingIndex]);
 else
  valueTwoToBeCompared = valueTwoRowContent[sortingIndex];

 if (valueOneToBeCompared < valueTwoToBeCompared)
  if (!descending) {
   return -1;
  } else {
   return 1;
  }
 if (valueOneToBeCompared > valueTwoToBeCompared)
  if (!descending) {
   return 1;
  } else {
   return -1;
  }
 return 0;
}