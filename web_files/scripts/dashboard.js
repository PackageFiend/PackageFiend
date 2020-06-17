// Accordion dropdowns
$(document).ready(function() {
  console.log('First Script');
  $('.indv_time').each(function () {
    const time = $(this).text().trim();
    //console.log(time);
    let ftime = null;
    if ($(this).parent().is('.data_line_r, .est_delivery')) {
      fTime = moment(time).format('ddd, MMMM Do, YYYY');
    } else {
      fTime = moment(time).format('MMMM Do, h:mm a');
    }
    //console.log(fTime);
    $(this).text(fTime);
  });

  const user_initial = localStorage.pkgfnd_name.slice(0,1);
  $('.user_initial').text(user_initial);

  $(".alerts_collapsible").click(function(){
      $(".alerted_nums").toggleClass("add_five_lines");
  });
  $(".active_collapsible").click(function(){
      $(".active_nums").toggleClass("add_five_lines");
  });
  $(".delivered_collapsible").click(function(){
      $(".delivered_nums").toggleClass("add_ten_lines");
  });

  $('.logout_button').click(() => {
    delete localStorage.pkgfnd_name;
    delete localStorage.pkgfnd_token;
    window.location = "http://localhost:8080";
  });

  $('.ed_parcel_name').click(function() {
    const parent = $(this).parent();
    const icon = parent.children('#save_name');
    icon.css('visibility', 'visible');
  })

  $('.fas').click(function() {
    const inputDiv = $(this).next();
    const nameVal = inputDiv.children('input');
    const inputVal = nameVal.val();

    nameVal.attr('placeholder', inputVal);
    nameVal.val('');

    axios.post('http://localhost:8080/user/packages/name', {
      id: inputDiv.data('id'),
      name: inputVal,
    }, {
      headers: {
        Authorization: `Bearer ${localStorage.pkgfnd_token}`
      }
    }).then(data => {
      $(this).css('color', 'green');
      setTimeout(() => {
        $(this).css('visibility', 'hidden');
      }, 3000);
    });
    
  });

  $('.data_line_l, .data_line_r').click(function () {
    const parent = $(this).parent();
    if (parent.hasClass('alert_data_line')) {
      const numList = [];
      for (const parcel of ofd) {
        numList.push(parcel.TrackNum);
      }
      const formattedList = numList.join(',');
      window.location = `http://localhost:8080/track/num/${formattedList}`;
    } else if (parent.hasClass('active_data_line')) {
      const numList = [];
      for (const parcel of it) {
        numList.push(parcel.TrackNum);
      }
      const formattedList = numList.join(',');
      window.location = `http://localhost:8080/track/num/${formattedList}`;
    } else if (parent.hasClass('delivered_data_line')) {
      const numList = [];
      for (const parcel of dd) {
        numList.push(parcel.TrackNum);
      }
      const formattedList = numList.join(',');
      window.location = `http://localhost:8080/track/num/${formattedList}`;
    }
  });

  /* Adds a tracking number to the user's stored numbers */
  $('.add_button').click(async () => {
    const input = $('.enter_numbers_box input');
    if (input.prop('disabled')) return;

    const num = input.val().replace(/\s/g, '');
    input.prop('disabled', true);

    const getPack = axios.get(`http://localhost:8080/track/q/${num}`).catch(err => {
      console.error(err);
      return null;
    });

    const res = await axios.post('http://localhost:8080/user/packages',
      {
        id: num.trim()
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.pkgfnd_token}`
        }
      });

    console.log(res);

    if (res.request.status !== 200) {
      console.error(res);
    } else {
      console.log('Added package');
    }

    const packDat = await getPack;

    const parcel = packDat.data[0];
    if (!parcel) {
      input.prop('disabled', false);
      input.val('Problem adding number :(');

      window.setTimeout(() => {
        input.val('');
      }, 2000);

      return;
    }

    if (parcel.Delivered) {
      const fTime = moment(parcel.MostRecentTime).format('ddd, MMMM Do, YYYY');
      const rowDat = `
        <div class="delivered_data_line">
          <div class="editable">
            <i id="save_name" class="fas fa-save"></i>
            <div class="ed_parcel_name">
              <input id="name_input" type="text" placeholder="Customize" />
            </div>
          </div>
          <div class="data_line_l">
            <p>${parcel.Name ? parcel.Name : parcel.TrackNum}</p>
            <div class="carrier_icon">${parcel.Provider}</div>
          </div>
          <div class="data_line_r">
            <div id="data_line_status">Delivered: </div>
            <div id="data_line_delivery_date indv_time">${fTime}</div>
          </div>
        </div>
        `;
      $('.delivered_nums').append(rowDat);
      const old_tot = $('#delivered_num').text();
      window.dd.push(parcel);
      $('#delivered_num').text(Number(old_tot) + 1);
    } else if (parcel.OutForDelivery) {
      const fTime = moment(parcel.MostRecentTime).format('ddd, MMMM Do, YYYY');
      const rowDat = `
        <div class="alert_data_line">
          <div class="editable">
            <i id="save_name" class="fas fa-save"></i>
            <div class="ed_parcel_name">
              <input id="name_input" type="text" placeholder="Customize" />
            </div>
          </div>
          <div class="data_line_l">
            <p>${parcel.Name ? parcel.Name : parcel.TrackNum}</p>
            <div class="carrier_icon">${parcel.Provider}</div>
          </div>
          <div class="data_line_r">
            <div id="data_line_status">In transit:</div>
            <div id="data_line_delivery_date indv_time">${fTime}</div>
          </div>
        </div>
        `;
      $('.alerted_nums').append(rowDat);
      const old_tot = $('#alerted_num').text();
      window.ofd.push(parcel);
      $('#alerted_num').text(Number(old_tot) + 1);
    } else {
      const fTime = moment(parcel.MostRecentTime).format('ddd, MMMM Do, YYYY');
      const rowDat = `
        <div class="active_data_line">
          <div class="editable">
            <i id="save_name" class="fas fa-save"></i>
            <div class="ed_parcel_name">
              <input id="name_input" type="text" placeholder="Customize" />
            </div>
          </div>
          <div class="data_line_l">
            <p>${parcel.Name ? parcel.Name : parcel.TrackNum}</p>
            <div class="carrier_icon">${parcel.Provider}</div>
          </div>
          <div class="data_line_r">
            <div id="data_line_status">In transit:</div>
            <div id="data_line_delivery_date indv_time">${fTime}</div>
          </div>
        </div>
        `;
      $('.active_nums').append(rowDat);
      const old_tot = $('#active_num').text();
      window.it.push(parcel);
      $('#active_num').text(Number(old_tot) + 1);
    }

    input.prop('disabled', false);
    input.val('Number added!');

    window.setTimeout(() => {
      input.val('');
    }, 2000);

    //TODO: Call function to add to render
  })
});
