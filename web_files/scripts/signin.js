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

  $('.create_button').click(async () => {
    const name = $('#name').val();
    const username = $('#username').val();
    const pass1 = $('#pass1').val();
    const pass2 = $('#pass2').val();

    const res = await axios.post('http://localhost:8080/auth/createuser', {
      name: name,
      username: username,
      password: pass1
    });

    console.log(res);
  });

  $('.go_button').click(async () => {
    const username = $('#si_username').val();
    const pass = $('#si_password').val();

    const res = await axios.post('http://localhost:8080/auth/login', {
      username: username,
      password: pass
    });

    console.log(res);
    localStorage.pkgfnd_token = res.data.token;
    localStorage.pkgfnd_name = res.data.user.name;

    window.location = "http://localhost:8080";
  });

});
