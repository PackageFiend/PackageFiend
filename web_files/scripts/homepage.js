$(document).ready(() => {
  $('.go_button').click(() => {
    const tnums = $('.enter_numbers_box input').val();
    if (tnums !== "") {
      window.location = `http://localhost:8080/track/num/${tnums}`;
    }
  });
});
