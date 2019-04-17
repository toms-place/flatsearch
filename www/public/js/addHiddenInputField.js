$(document).ready(function () {
    let addButton = $('.plz span'); //Add button selector
    let wrapper = $('.field_wrapper'); //Input field wrapper    

    //Once add button is clicked
    $(addButton).click(function () {

        let fieldHTML =
            `
        <input type='number' max='9999' min="1000" name="plz_remove" value="${$(this).parent().attr('id')}" hidden />
        `

        $(wrapper).append(fieldHTML); //Add field html
        $(this).parent().remove();

    });
});