const uspsReg = /^(?:9(?:4|2|3)|EC|CP|82)\d+(?:EA)?\d+(?:US)?$/;
const upsReg = /^1Z[A-Z0-9]+$/;
const fedexReg = /^(?:\d{12}|\d{15}|\d{20})$/;

function send_to_tracking() {
  const tnums = $('.enter_numbers_box input').val();
    const numsList = tnums.split(',');
    let err = false;

    $('.regex_errors').empty();

    for (let i = 0; i < numsList.length; i++) {
      const num = numsList[i].trim();
      if (!uspsReg.test(num) && !upsReg.test(num) && !fedexReg.test(num)) {
        $('.regex_errors').append(`<div class="err_num">${num} is not a valid tracking number.</div>`);
        err = true;
      }
    }
    
    if (tnums !== "" && !err) {
      window.location = `http://localhost:8080/track/num/${tnums.replace(/\s/g, '')}`;
    }
}


$(document).ready(() => {
  if (localStorage.pkgfnd_name) {
    $('.sign_in_box').html('<a href="http://localhost:8080/track/dashboard">Dashboard</a> Hello, ' + localStorage.pkgfnd_name);
  }

  $('.go_button').click(() => {
    send_to_tracking();
  });

  $('.enter_numbers_box input').keypress(function(event){
    const keycode = event.which;
    if(keycode == 13){
      // Keeps form from clearing
      event.preventDefault();
      send_to_tracking();
    }
  });
  
});
