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
  
  /* Switches between signin button and logged in user in Nav Bar */
  if (localStorage.pkgfnd_name) {
    const user_initial = localStorage.pkgfnd_name.slice(0,1);
    const user_html = `<a id="dashboard_link" href="http://localhost:8080/track/dashboard/">DASHBOARD</a><div class="user_icon"><div class="user_initial">${user_initial}</div><div class="logout_button">Logout</div></div>`;
    $('.sign_in_box').append(user_html);
  } else {
    $('.sign_in_box').append('<a href="http://localhost:8080/signin.html"><div class="sign_in_button">Sign In</div></a>');
  };

  $('.logout_button').click(() => {
    delete localStorage.pkgfnd_name;
    delete localStorage.pkgfnd_token;
    window.location = "http://localhost:8080";
  });

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
