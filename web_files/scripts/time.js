$(document).ready(function() {
  console.log('Ready');
  $('.indv_time').each(function () {
    const time = $(this).text();
    const fTime = moment(time).format('MMMM Do, h:mm a');
    console.log(fTime);
    $(this).text(fTime);
  });

  $('.track_data_line').click(function () {
    if ($(this).hasClass('tdl_bold')) return;
    $('.tdl_bold').removeClass('tdl_bold');
    $(this).addClass('tdl_bold');

    const pid = $(this).children('.data_line_l').children('.data_line_num').eq(0).text();

    let parcel = null;
    for (let i = 0; i < data.length; i++) {
      if (data[i].TrackNum === pid) {
        parcel = data[i];
        break;
      }
    }

    $('.tracking_number').text(parcel.TrackNum);
    $('.track_number_title .carrier_icon_bold').text(parcel.Provider);

    console.log(parcel);
    
  });
});
