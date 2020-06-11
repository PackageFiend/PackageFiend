$(document).ready(function() {
  console.log('Ready');
  $('.indv_time').each(function () {
    const time = $(this).text().trim();
    console.log(time);
    let ftime = null;
    if ($(this).parent().is('.data_line_r, .est_delivery')) {
      fTime = moment(time).format('dddd, MMMM Do, YYYY');
    } else {
      fTime = moment(time).format('MMMM Do, h:mm a');
    }
    //console.log(fTime);
    $(this).text(fTime);
  });

  $('.sec_time').each(function () {
    const time = $(this).text().split(' ')[1].trim();
    console.log(time);
    const fTime = moment.utc(time).format('h [hours,] mm [minutes]');
    //console.log(fTime);
    $(this).text('Time: ' + fTime);
  });

  $('.additional_track_nums').on('click', '.track_data_line', function (e) {
    if ($(this).is('.tdl_bold')) return;
    $('.tdl_bold').removeClass('tdl_bold');
    $(this).addClass('tdl_bold');

    const pid = $(this).children('.data_line_l').children('.data_line_num').eq(0).text();
    console.log(pid);

    let parcel = null;
    for (let i = 0; i < data.length; i++) {
      if (data[i].TrackNum === pid) {
        parcel = data[i];
        break;
      }
    }

    $('.tracking_number').text(parcel.TrackNum);
    $('.track_number_title .carrier_icon_bold').text(parcel.Provider);

    $('.location_box').empty();

    mymap.eachLayer((layer) => {
      mymap.removeLayer(layer);
    });

    tlayer.addTo(mymap);
    const latlngs = [];

    if (!parcel.Error) {
      $("#est_delivery_desc").text(parcel.Delivered ? "Delivered:" : "In Transit:");
      $("#est_delivery_time").text(moment(parcel.MostRecentTime).format('dddd, MMMM Do, YYYY'));

      for (let i = 0; i < parcel.Events.length; i++) {
        const event = parcel.Events[i];

        if (event.Location.Geo !== undefined && event.Location.Geo !== null) { 
          L.marker([event.Location.Geo.lat, event.Location.Geo.lng]).addTo(mymap);
          latlngs.push([event.Location.Geo.lat, event.Location.Geo.lng]);
        }

        let thtml = '';
        if (event.Time) {
          const ftime = moment(event.Time.trim()).format('MMMM Do, h:mm a');
          thtml = `<div class="times"> <div class="reg_body indv_time">${ftime}</div> </div>`;
        }

        const loctimes = `
          <div class="location_times">
            <div class="location">
              <div class="reg_body">${event.Description}</div>
            </div>
            ${thtml}
          </div>`;

        $('.location_box').append(loctimes);
      }

      $('#total_dist').text(parcel.TotalDistance + " Miles");

      $('.mileage_listings').empty();

      for (let i = 0; i < parcel.Travels.length; i++) {
        const travel = parcel.Travels[i];
        let travString = "";

        if (travel.From === travel.To) {
          travString = travel.From;
        } else {
          travString = travel.From + ' -> ' + travel.To;
        }

        const mBoxTemplate = `
          <div class="mileages_box">
              <div class="location">
                  <div class="reg_body">${travString}:</div>
                  <div></div>
              </div>
              <div class="times">
                  <div class="reg_body">${travel.Distance ? travel.Distance + " miles" : "At Location"}</div>
                  <div>Time: ${moment.utc(travel.TimeTaken*1000).format('h [hours,] mm [minutes]')}</div>
              </div>
          </div>
          `;
        $('.mileage_listings').append(mBoxTemplate);
      }
    } else {
      $("#est_delivery_desc").text("");
      $("#est_delivery_time").text("");
      $('#total_dist').text("");

      const loctimes = `
        <div class="location_times">
          <div class="location">
            <div class="reg_body">Sorry, there's no information about this package, yet.</div>
          </div>
        </div>`;

      $('.location_box').append(loctimes);
    }

    const pline = L.polyline(latlngs);
    mymap.fitBounds(pline.getBounds(), {padding: [25, 25]});
    pline.addTo(mymap);
  });

  $('.add_button').click(async function() {
    const newnums = $('.add_in').val();
    $('.add_in').val('');
    //TODO: Check to make sure the number isn't already there
    const newdat = await axios.get(`http://localhost:8080/track/q/${newnums}`);

    data.push(...newdat.data);

    const nplist = newdat.data;

    for (let i = 0; i < nplist.length; i++) {
      if (nplist[i].Error) {
        const ndiv = `
          <div id=${nplist[i].TrackNum} class="track_data_line noClick">
            <div class="data_line_l">
              <p class="data_line_num">${nplist[i].TrackNum}</p>
              <div class="carrier_icon_bold">${nplist[i].Provider}</div>
            </div>
            <div class="data_line_r">
              <div class="data_line_status">
                No Information Yet
              </div>
              <div class="data_line_delivery_date"></div>
            </div>
          `;
        $('.additional_track_nums').append(ndiv);
        continue;
      }
      const ndiv = `
        <div id=${nplist[i].TrackNum} class="track_data_line">
          <div class="data_line_l">
            <p class="data_line_num">${nplist[i].TrackNum}</p>
            <div class="carrier_icon_bold">${nplist[i].Provider}</div>
          </div>
          <div class="data_line_r">
            <div class="data_line_status">
              ${nplist[i].Delivered ? "Delivered:" : "In Transit"}
            </div>
            <div class="data_line_delivery_date">${moment(nplist[i].MostRecentTime).format('dddd, MMMM Do, YYYY')}</div>
          </div>
        `;

      $('.additional_track_nums').append(ndiv);
    }
    $(`#${nplist[0].TrackNum}`).click();
    
  });
});
