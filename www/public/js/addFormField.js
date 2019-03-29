$(document).ready(function(){
    var maxField = 1000; //Input fields increment limitation
    var addButton = $('.add_button'); //Add button selector
    var wrapper = $('.field_wrapper'); //Input field wrapper
    var fieldHTML = 
	`
	<div class="plzs">
	<input type='number' max='9999' min="1000" name="plz_interests" class="form-control form-username plz_input" required />
    <a href="javascript:void(0);" class="remove_button plz_close" title="Add field">x</a>
    <a href="javascript:void(0);" class="add_button_new plz_add" title="Add field">＋</a>
	</div>
	`
	var x = 1; //Initial field counter is 1
    
    //Once add button is clicked
    $(addButton).click(function(){
        //Check maximum number of input fields
        if(x < maxField){ 
            x++; //Increment field counter
            $(wrapper).append(fieldHTML); //Add field html
        }
    });
    
    //Once remove button is clicked
    $(wrapper).on('click', '.remove_button', function(e){
        e.preventDefault();
        $(this).parent('div').remove(); //Remove field html
        x--; //Decrement field counter
    });

    //Once remove button is clicked
    $(wrapper).on('click', '.add_button_new', function(e){
        e.preventDefault();
        //Check maximum number of input fields
        if(x < maxField){ 
            x++; //Increment field counter
            $(wrapper).append(fieldHTML); //Add field html
        }
    });
});