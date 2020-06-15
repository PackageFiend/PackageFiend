$(document).ready(function() {
  
  /* Switches between signin button and logged in user in Nav Bar */
  if (localStorage.pkgfnd_name) {
    const user_initial = localStorage.pkgfnd_name.slice(0,1);
    const user_html = `<p><a href="https://packagefiend.com/track/dashboard/">DASHBOARD</a></p><div class="user_icon"><div class="user_initial">${user_initial}</div><div class="logout_button">Logout</div></div>`;
    
    $('.sign_in_box').append(user_html);
  } else {
    $('.sign_in_box').append('<div class="sign_in_button">Sign In</div>');
  };

  /* Makes 'more' visible on the collapsible menu header if multiple track numbers are present */
  if (data.length > 1) {
    $(".more_numbers_selector").addClass("visible");
  }

  /* Sets the dates to correct format in the collapsible menu */
  $('.indv_time').each(function () {
    const time = $(this).text().trim();
    //console.log(time);
    let ftime = null;
    if ($(this).parent().is('.data_line_r, .est_delivery')) {
      fTime = moment(time).format('dddd, MMMM Do, YYYY');
    } else {
      fTime = moment(time).format('MMMM Do, h:mm a');
    }
    //console.log(fTime);
    $(this).text(fTime);
  });

  /* Sets the dates to correct format in the location v time elapsed data box */
  $('.sec_time').each(function () {
    const time = $(this).text().split(' ')[1].trim();
    //console.log(time);
    const fTime = moment.utc(time).format('h [hours,] mm [minutes]');
    //console.log(fTime);
    $(this).text('Time: ' + fTime);
  });

  /* Resets all the data when a new tracking number is selected from the collapsible */
  $('.collapsible_list').on('click', '.track_data_line', function (e) {
    if ($(this).is('.tdl_bold')) return;
    $('.tdl_bold').removeClass('tdl_bold');
    $(this).addClass('tdl_bold');

    /* parcel variable is the all the data for the newly selected track num */
    const pid = $(this).children('.data_line_l').children('.data_line_num').eq(0).text();
    //console.log(pid);
    /* Get parcel data */
    let parcel = null;
    for (let i = 0; i < data.length; i++) {
      if (data[i].TrackNum === pid) {
        parcel = data[i];
        break;
      }
    }
    
  
    $('.tracking_number').text(parcel.TrackNum);
    $('.track_number_title .carrier_icon_bold').text(parcel.Provider);
    $('.events_data_box').empty();
    /* Clear map */
    mymap.eachLayer((layer) => {
      mymap.removeLayer(layer);
    });
    
    tlayer.addTo(mymap);
    const latlngs = [];

    /* Populate data with newly selected tracking number */
    if (!parcel.Error) {
      $("#est_delivery_desc").text(parcel.Delivered ? "Delivered:" : "In Transit:");
      $("#est_delivery_time").text(moment(parcel.MostRecentTime).format('dddd, MMMM Do, YYYY'));

      /* Populate areas requiring events */
      for (let i = 0; i < parcel.Events.length; i++) {
        const event = parcel.Events[i];

        if (event.Location.Geo !== undefined && event.Location.Geo !== null) { 
          L.marker([event.Location.Geo.lat, event.Location.Geo.lng]).addTo(mymap);
          latlngs.push([event.Location.Geo.lat, event.Location.Geo.lng]);
        }

        let thtml = '';
        if (event.Time) {
          const ftime = moment(event.Time.trim()).format('MMMM Do, h:mm a');
          thtml = `<div class="times"><div class="reg_body indv_time">${ftime}</div></div>`;
        }

        const loctimes = `
          <div class="line_event_and_date">
            <div class="event_description">
              <div class="reg_body">${event.Description}</div>
            </div>
            ${thtml}
          </div>`;

        $('.events_data_box').append(loctimes);
      };

      $('#total_dist').text(parcel.TotalDistance + " Miles");

      $('.location_list').empty();
      $('.travel_time_bar').empty();

      /* Populate Areas requiring travels */
      let running_time_total = 0;
      let time_idle = 0;
      let time_road = 0;
      for (let i = 0; i < parcel.Travels.length; i++) {
        const travel = parcel.Travels[i];
        let startLocation = travel.From;
        let endLocation = '-> ' + travel.To;
        
        let time_taken = Math.round(travel.TimeTaken/3600);
        running_time_total = running_time_total + time_taken;
        if (travel.Distance === 0) {
          time_idle = time_idle + time_taken;
        } else {
          time_road = time_road + time_taken;
        };
        
        if (travel.From === travel.To) {
				  endLocation = "";
        };
        
        let dist_width = travel.Distance * 353 / parcel.TotalDistance;
        let time_width = time_taken * 353 / 17;
        const dist_bar = '<div class="distance_bar" style="width:' + dist_width + 'px;"></div>';
        const time_bar = '<div class="time_bar" style="width:' + time_width + 'px;"></div>';
        
        const mBoxTemplate = `
          <div class="place_and_distance">
            <div class="place_description">
              <div class="tight_text_l">${startLocation}</div>
              <div class="tight_text_l">${endLocation}</div>
            </div>
            <div class="distance_time">
              <div class="tight_text_r">${travel.Distance ? travel.Distance + " miles" : "Idle"}</div>
              <div class="tight_text_r">${time_taken} hrs</div>
            </div>
            <div class="graph_box">
                ${dist_bar}
                ${time_bar}
            </div>
          </div>
          `;
        $('.location_list').append(mBoxTemplate);
      };
      /* Repopulate the time on road vs time at idle bar */
      const road_width = `style=\"width:${756 * time_road / running_time_total}px;\"`;
      const idle_width = `style=\"width:${756 - 756 * time_road / running_time_total}px;\"`;
      console.log(idle_width);
      const time_bar_template = `
        <div class="bar_road_time" ${road_width}><p class="bar_info">Time on Road: ${time_road} hrs</p></div>
        <div class="white_stripe"></div>
        <div class="bar_idle_time" ${idle_width}><p class="bar_info">Time at Idle: ${time_idle} hrs</p></div>
      `;
      $('.travel_time_bar').append(time_bar_template);
      
      $('#total_time').html(running_time_total + ' hrs');
    } else {
      $("#est_delivery_desc").text("");
      $("#est_delivery_time").text("");
      $('#total_dist').text("");
      $('.travel_time_bar').html("<p>Geo Data Unavailable</p>");


      const loctimes = `
        <div class="line_event_and_date">
          <div class="event_description">
            <div class="reg_body">Sorry, there's no information about this package, yet.</div>
          </div>
        </div>`;

      $('.events_data_box').append(loctimes);
    };

    /* Formats the location and time sections in case of no data */
    if (parcel.Travels.length === 0) {
      let no_data = '<div class="reg_body">Time and location data not available.</div>';
      $('.location_list').html(no_data);
      $('#total_dist').text('Unknown');
      $('#total_time').text('Unknown');
    };

    const pline = L.polyline(latlngs);
    //console.log(pline);
    mymap.fitBounds(pline.getBounds(), {padding: [25, 25]});
    pline.addTo(mymap);
  });

  /* Add tracking number to list */
  $('.add_button').click(async function() {
    const newnums = $('.add_in').val();
    $('.add_in').val('');
    //TODO: Check to make sure the number isn't already there
    const newdat = await axios.get(`https://packagefiend.com/track/q/${newnums}`);

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
        $('.collapsible_list').append(ndiv);
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
      
      $('.collapsible_list').append(ndiv);

      /* Makes 'more' visible on the collapsible menu header if multiple track numbers are present */
      if (data.length > 1) {
        $(".more_numbers_selector").addClass("visible");
      }s

    }
    $(`#${nplist[0].TrackNum}`).click();
    
  });
});
