$(document).ready(() => {
  
    /* Switches between signin button and logged in user in Nav Bar */
    if (localStorage.pkgfnd_name) {
      const user_initial = localStorage.pkgfnd_name.slice(0,1);
      const user_html = `<a id="dashboard_link" href="/track/dashboard/">DASHBOARD</a><div class="user_icon"><div class="user_initial">${user_initial}</div><div class="logout_button">Logout</div></div>`;
      $('.sign_in_box').append(user_html);
    } else {
      $('.sign_in_box').append('<a href="/signin.html"><div class="sign_in_button">Sign In</div></a>');
    };
  
    $('.logout_button').click(() => {
      delete localStorage.pkgfnd_name;
      delete localStorage.pkgfnd_token;
      window.location = "/";
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