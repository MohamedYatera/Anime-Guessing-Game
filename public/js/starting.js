$(document).ready(function () {
    $('.title').on('click', function () {
        $('.title').text('Button was clicked!');
        console.log(rounds);
    });

    $('.reveal-btn').on('click', function () {
        if ($('.hint').css("visibility") == "visible") {
            $('.hint').css("visibility", "hidden");
        } else {
        $('.hint').css("visibility", "visible");
    }
    });
  
});








