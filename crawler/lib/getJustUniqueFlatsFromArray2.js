function getJustUniqueFlatsFromArray2(array1, array2) {

	let uniqueElements = [];
  
	/* Nested for loop starting with longer array */
	for (let elem2 of array2) {
	  let found = false;
  
	  for (let elem1 of array1) {
		if (elem2.isSameAs(elem1)) {
		  found = true;
		}
	  }
  
	  if (!found) uniqueElements.push(elem2)
	}
  
	return uniqueElements;
  
  }

module.exports = getJustUniqueFlatsFromArray2;