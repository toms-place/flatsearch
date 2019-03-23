let input_Field = document.getElementById('plz_i_0');
input_Field.addEventListener('click', add_Field);

var count = 1;

function add_Field() {

	let input_Field = document.getElementById('plz_i_' + (count - 1));
	input_Field.removeEventListener('click', add_Field);

	var div1 = document.createElement('div');
	div1.setAttribute("class", "plzs");

	// Get template data
	div1.innerHTML =
		`   <input type='number' max='9999' id="plz_i_${count}" name='plz_interests' class='form-control form-username plz_input' />
			<div id="plz_x_${count}" class="plz_close">❌</div>
		`

//TODO add X button functionality


	// append to our form, so that template data
	document.getElementById('plzContainer').append(div1);
	input_Field = document.getElementById('plz_i_' + count);
	input_Field.addEventListener('click', add_Field);
	count++;
}