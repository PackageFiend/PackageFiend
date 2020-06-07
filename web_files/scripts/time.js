$(document).ready(function() {
  console.log('Ready');
  $('.indv_time').each(function () {
    const time = $(this).text();
    const fTime = moment(time).format('MMMM Do, h:mm a');
    console.log(fTime);
    $(this).text(fTime);
  });
});
