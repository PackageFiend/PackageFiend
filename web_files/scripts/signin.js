// Create account collapsible
const collapse_button = document.querySelector('.no_account');
collapse_button.addEventListener("click", event => {
    collapse_button.classList.toggle('active');
    const collapsible = document.querySelector('.create_collapsible');
    collapsible.classList.toggle('create_uncollapsed');
    const signin = document.querySelector('.sign_in_box');
    signin.classList.toggle('inactive');
});

$(document).ready(() => {

  // Checks validity of data entered for log in attempts.
  // Redirects to dashboard if successful.
  $('.sign_in_button').click(async () => {
    const username = $('#si_username').val();
    const pass = $('#si_password').val();

    if (username === "" || pass === "") {
      $('.sign_in_message').html('Please enter username and password.');
    } else {
      const res = await axios.post('http://localhost:8080/auth/login', {
        username: username,
        password: pass
      }).catch((err) => {
        if (err.response.status === 400) {
          return null;
        }
      });
      console.log(res);
      if (res === null) {
        $('.sign_in_message').html('Log in failed. Please try again.');
        return;
      } else {
        console.log(res);
        localStorage.pkgfnd_token = res.data.token;
        localStorage.pkgfnd_name = res.data.user.name;
    
        window.location = "http://localhost:8080";
      };
    };
  });
// Check validity of data entered for user creation attempts.
// Logs them in and redirects to dashboard is successful.
  $('.create_button').click(async () => {
    const name = $('#name').val();
    const username = $('#username').val();
    const pass1 = $('#pass1').val();
    const pass2 = $('#pass2').val();

    if (name === "" || username === "" || pass1 === "" || pass2 === "") {
      $('.create_message').html('Please enter information to create account.');
    } else if (pass1 !== pass2) {
      $('.create_message').html('Passwords must match. Try again.');
    } else {
      
      const res = await axios.post('http://localhost:8080/auth/createuser', {
        name: name,
        username: username,
        password: pass1
      }).catch((err) => {
        console.log(err.response);
        if (err.response.status === 400) {
          return null;
        }
      });
  
      if (res === null) {
      $('.create_message').html('Username is taken. Please enter a different name.');
        return;
      } else {
      $('.create_message').html('User creation successful.');
      };
      console.log(res);
    };
  });
});
