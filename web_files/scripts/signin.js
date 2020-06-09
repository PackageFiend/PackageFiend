// Create account collapsible
const collapse_button = document.querySelector('.no_account');
collapse_button.addEventListener("click", event => {
    collapse_button.classList.toggle('active');
    const collapsible = document.querySelector('.create_collapsible');
    collapsible.classList.toggle('create_uncollapsed');
    const signin = document.querySelector('.sign_in_box');
    signin.classList.toggle('inactive');
});