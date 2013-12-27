define(["jquery",
        "jquery.validator"], function($, validator) {

    $(document).ready(function() {
        $.validate({
            form: "#signup, #login",
            validateOnBlur : false,
            errorMessagePosition : 'top',
            modules: 'security'
        });
    });

});
