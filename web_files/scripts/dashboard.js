// Accordion dropdowns
$(document).ready(function() {
  //console.log('First Script');
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
    window.location = "/";
  });

  $('.alerted_nums, .active_nums, .delivered_nums').on('click', '.ed_parcel_name', function() {
    const parent = $(this).parent();
    const icon = parent.children('#save_name');
    icon.css('visibility', 'visible');
  })

  $('.alerted_nums, .active_nums, .delivered_nums').on('click', '.fas', function() {
    const inputDiv = $(this).next();
    const nameVal = inputDiv.children('input');
    const inputVal = nameVal.val();

    nameVal.attr('placeholder', inputVal);
    nameVal.val('');

    axios.post('/user/packages/name', {
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

  $('.alerted_nums, .active_nums, .delivered_nums').on('click', '.data_line_l, .data_line_r', function () {
    const parent = $(this).parent();
    const clickedNumber = parent.children('.data_line_l').children('p').text();
    console.log(clickedNumber);
    const numList = [];
    numList.push(clickedNumber);
    if (parent.hasClass('alert_data_line')) {
      for (const parcel of ofd) {
        if (parcel.TrackNum === clickedNumber) continue;
        numList.push(parcel.TrackNum);
      }
    } else if (parent.hasClass('active_data_line')) {
      for (const parcel of it) {
        if (parcel.TrackNum === clickedNumber) continue;
        numList.push(parcel.TrackNum);
      }
    } else if (parent.hasClass('delivered_data_line')) {
      for (const parcel of dd) {
        if (parcel.TrackNum === clickedNumber) continue;
        numList.push(parcel.TrackNum);
      }
    }
    const formattedList = numList.join(',');
    window.location = `/track/num/${formattedList}`;
  });

  /* Adds a tracking number to the user's stored numbers */
  $('.add_button').click(async () => {
    const input = $('.enter_numbers_box input');
    if (input.prop('disabled')) return;

    const num = input.val().replace(/\s/g, '');
    input.prop('disabled', true);

    const getPack = axios.get(`/track/q/${num}`).catch(err => {
      console.error(err);
      return null;
    });

    const res = await axios.post('/user/packages',
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

    if (!packDat.data[0]) {
      input.prop('disabled', false);
      input.val('Problem adding number :(');

      window.setTimeout(() => {
        input.val('');
      }, 2000);

      return;
    }

    for (let i = 0; i < packDat.data.length; i++) {
      parcel = packDat.data[i];

      if (parcel.Delivered) {
        const fTime = moment(parcel.MostRecentTime).format('ddd, MMMM Do, YYYY');
        const rowDat = `
          <div class="delivered_data_line">
            <div class="editable">
              <i id="save_name" class="fas fa-save"></i>
              <div class="ed_parcel_name" data-id="${parcel.TrackNum}">
                <input id="name_input" type="text" placeholder="(Add name)" />
              </div>
            </div>
            <div class="data_line_l">
              <p>${parcel.TrackNum}</p>
              <div class="carrier_icon">${parcel.Provider}</div>
            </div>
            <div class="data_line_r">
              <div id="data_line_status">Delivered: </div>
              <div id="data_line_delivery_date" class="indv_time">${fTime}</div>
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
              <div class="ed_parcel_name" data-id="${parcel.TrackNum}">
                <input id="name_input" type="text" placeholder="(Add name)" />
              </div>
            </div>
            <div class="data_line_l">
              <p>${parcel.TrackNum}</p>
              <div class="carrier_icon">${parcel.Provider}</div>
            </div>
            <div class="data_line_r">
              <div id="data_line_status">In transit:</div>
              <div id="data_line_delivery_date" class="indv_time">${fTime}</div>
            </div>
          </div>
          `;
        $('.alerted_nums').append(rowDat);
        const old_tot = $('#alerted_num').text();
        window.ofd.push(parcel);
        $('#alerts_num').text(Number(old_tot) + 1);
      } else {
        const fTime = moment(parcel.MostRecentTime).format('ddd, MMMM Do, YYYY');
        const rowDat = `
          <div class="active_data_line">
            <div class="editable">
              <i id="save_name" class="fas fa-save"></i>
              <div class="ed_parcel_name" data-id="${parcel.TrackNum}">
                <input id="name_input" type="text" placeholder="(Add name)" />
              </div>
            </div>
            <div class="data_line_l">
              <p>${parcel.TrackNum}</p>
              <div class="carrier_icon">${parcel.Provider}</div>
            </div>
            <div class="data_line_r">
              <div id="data_line_status">In transit:</div>
              <div id="data_line_delivery_date" class="indv_time">${fTime}</div>
            </div>
          </div>
          `;
        $('.active_nums').append(rowDat);
        const old_tot = $('#active_num').text();
        window.it.push(parcel);
        $('#active_num').text(Number(old_tot) + 1);
      }
    }

    input.prop('disabled', false);
    input.val('Number(s) added!');

    window.setTimeout(() => {
      input.val('');
    }, 2000);

    //TODO: Call function to add to render
  });

  $('.enter_numbers_box input').keypress(function(event){
    const keycode = event.which;
    if(keycode == 13){
      // Keeps form from clearing
      event.preventDefault();
      $('.add_button').click();
    }
  });
});
