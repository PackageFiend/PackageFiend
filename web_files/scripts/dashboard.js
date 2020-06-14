// Accordion dropdowns
$(document).ready(function() {
  console.log('First Script');
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

  $('.add_button').click(async () => {
    const input = $('.enter_numbers_box input');
    if (input.prop('disabled')) return;

    const num = input.val();
    input.prop('disabled', true);

    res = await axios.post('http://localhost:8080/user/packages',
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

    input.prop('disabled', false);
    input.val('Number added!');

    window.setTimeout(() => {
      input.val('');
    }, 2000);

    //TODO: Call function to add to render
  })
});

// Placeholder data for developing
const user_data_fake = {
    "username": "shootermcgavinsucks",
    "name": "Happy Gilmore",
    "packages": [
        {
            "TrackNum":"9400116901645855817273",
            "Provider":"USPS",
            "Error":false,
            "Summary":"Your item was delivered in or at the mailbox at 2:27 pm on April 4, 2020 in MARIETTA, PA 17547.",
            "Delivered":true,
            "OutForDelivery":false,
            "Events":[
                {
                    "Time":null,
                    "Description":"Your item was delivered in or at the mailbox ",
                    "Location":{
                        "String":"MARIETTA, PA 17547",
                        "Geo":{
                            "lng":-76.5521882,
                            "lat":40.0570411
                        },
                        "Address":"Marietta, PA 17547, USA"
                    }
                },
                {
                    "Time":"2020-04-04T11:32:00.000Z",
                    "Description":"Out for Delivery",
                    "Location":{
                        "String":"MARIETTA, PA 17547",
                        "Geo":{
                            "lng":-76.5521882,
                            "lat":40.0570411
                        },
                        "Address":"Marietta, PA 17547, USA"
                    }
                },
                {
                    "Time":"2020-04-04T11:21:00.000Z",
                    "Description":"Arrived at Post Office",
                    "Location":{
                        "String":"MARIETTA, PA 17547",
                        "Geo":{
                            "lng":-76.5521882,
                            "lat":40.0570411
                        },
                        "Address":"Marietta, PA 17547, USA"
                    }
                },
                {
                    "Time":"2020-04-04T09:46:00.000Z",
                    "Description":"Departed USPS Regional Facility",
                    "Location":{
                        "String":"LANCASTER PA DISTRIBUTION CENTER",
                        "Geo":{
                            "lng":-76.30284689999999,"lat":40.0573456
                        },
                        "Address":"1301 Marshall Ave, Lancaster, PA 17601, USA"
                    }
                },
                {
                    "Time":"2020-04-04T07:01:00.000Z",
                    "Description":"Arrived at USPS Regional Facility",
                    "Location":{
                        "String":"LANCASTER PA DISTRIBUTION CENTER",
                        "Geo":{
                            "lng":-76.30284689999999,
                            "lat":40.0573456
                        },
                        "Address":"1301 Marshall Ave, Lancaster, PA 17601, USA"
                    }
                },
                {
                    "Time":"2020-04-04T05:46:00.000Z",
                    "Description":"Accepted at USPS Origin Facility",
                    "Location":{
                        "String":"LEBANON, PA 17046",
                        "Geo":{
                            "lng":-76.4331698,
                            "lat":40.37846
                        },
                        "Address":"Lebanon, PA 17046, USA"
                    }
                },
                {
                    "Time":"2020-04-03T19:11:00.000Z",
                    "Description":"Shipment Received, Package Acceptance Pending",
                    "Location":{
                        "String":"LEBANON, PA 17042",
                        "Geo":{
                            "lng":-76.3868797,
                            "lat":40.2927633
                        },
                        "Address":"CORNWALL BOROUGH, PA 17042, USA"
                    }
                },
                {
                    "Time":null,
                    "Description":"Pre-Shipment Info Sent to USPS, USPS Awaiting Item",
                    "Location":{
                        "String":"USPS Awaiting Item, April 3, 2020"
                    }
                }
            ],
            "MostRecentTime":"2020-04-04T11:32:00.000Z",
            "Travels":[
                {
                    "From":"CORNWALL BOROUGH, PA 17042, USA",
                    "To":"Lebanon, PA 17046, USA",
                    "Distance":6,
                    "TimeTaken":38100
                },
                {
                    "From":"Lebanon, PA 17046, USA",
                    "To":"1301 Marshall Ave, Lancaster, PA 17601, USA",
                    "Distance":23,
                    "TimeTaken":4500
                },
                {
                    "From":"1301 Marshall Ave, Lancaster, PA 17601, USA",
                    "To":"1301 Marshall Ave, Lancaster, PA 17601, USA",
                    "Distance":0,
                    "TimeTaken":9900
                },
                {
                    "From":"1301 Marshall Ave, Lancaster, PA 17601, USA",
                    "To":"Marietta, PA 17547, USA",
                    "Distance":13,
                    "TimeTaken":5700
                },
                {
                    "From":"Marietta, PA 17547, USA",
                    "To":"Marietta, PA 17547, USA",
                    "Distance":0,
                    "TimeTaken":660
                }
            ],
            "TotalDistance":42
        },
        {
            "TrackNum":"1Z061R620322489017",
            "Provider":"UPS",
            "Error":false,
            "Summary":"foo",
            "Delivered":true,
            "OutForDelivery":false,
            "Events":[
                {
                    "Time":"2020-05-09T16:03:36.000Z",
                    "Description":"Delivered",
                    "Location":{
                        "String":"MARIETTA PA  US",
                        "Geo":{
                            "lng":-76.5521882,
                            "lat":40.0570411
                        },
                        "Address":"Marietta, PA 17547, USA"
                    }
                },
                {
                    "Time":"2020-05-09T13:42:16.000Z",
                    "Description":"Out For Delivery Today",
                    "Location":{
                        "String":"East Petersburg PA  US",
                        "Geo":{
                            "lng":-76.35412649999999,
                            "lat":40.10009609999999
                        },
                        "Address":"East Petersburg, PA, USA"
                    }
                },
                {
                    "Time":"2020-05-09T10:07:59.000Z",
                    "Description":"Loaded on Delivery Vehicle ",
                    "Location":{
                        "String":"East Petersburg PA  US",
                        "Geo":{
                            "lng":-76.35412649999999,
                            "lat":40.10009609999999
                        },
                        "Address":"East Petersburg, PA, USA"
                    }
                },
                {
                    "Time":"2020-05-09T10:01:28.000Z",
                    "Description":"Destination Scan",
                    "Location":{
                        "String":"East Petersburg PA  US",
                        "Geo":{
                            "lng":-76.35412649999999,
                            "lat":40.10009609999999
                        },
                        "Address":"East Petersburg, PA, USA"
                    }
                },
                {
                    "Time":"2020-05-09T07:14:00.000Z",
                    "Description":"Arrival Scan",
                    "Location":{
                        "String":"East Petersburg PA  US",
                        "Geo":{
                            "lng":-76.35412649999999,
                            "lat":40.10009609999999
                        },
                        "Address":"East Petersburg, PA, USA"
                    }
                },
                {
                    "Time":"2020-05-09T00:18:00.000Z",
                    "Description":"Departure Scan",
                    "Location":{
                        "String":"New Stanton PA  US",
                        "Geo":{
                            "lng":-79.6085852,
                            "lat":40.2276822
                        },
                        "Address":"New Stanton, PA, USA"
                    }
                },
                {
                    "Time":"2020-05-08T17:00:00.000Z",
                    "Description":"Arrival Scan",
                    "Location":{
                        "String":"New Stanton PA  US"
                    }
                },
                {
                    "Time":"2020-05-08T13:03:00.000Z",
                    "Description":"Departure Scan",
                    "Location":{
                        "String":"Columbus OH  US",
                        "Geo":{
                            "lng":-82.99879419999999,
                            "lat":39.9611755
                        },
                        "Address":"Columbus, OH, USA"
                    }
                },
                {
                    "Time":"2020-05-08T10:45:00.000Z",
                    "Description":"Arrival Scan",
                    "Location":{
                        "String":"Columbus OH  US"
                    }
                },
                {
                    "Time":"2020-05-08T06:35:00.000Z",
                    "Description":"Departure Scan",
                    "Location":{
                        "String":"Louisville KY  US"
                    }
                },
                {
                    "Time":"2020-05-08T00:56:39.000Z",
                    "Description":"Origin Scan",
                    "Location":{
                        "String":"Louisville KY  US"
                    }
                },
                {
                    "Time":"2020-05-07T23:52:56.000Z",
                    "Description":"Order Processed: Ready for UPS ",
                    "Location":{
                        "String":"   US",
                        "Geo":null,
                        "Address":null
                    }
                }
            ],
            "MostRecentTime":"2020-05-09T16:03:36.000Z",
            "Travels":[
                {
                    "From":"Columbus, OH, USA",
                    "To":"New Stanton, PA, USA",
                    "Distance":180,
                    "TimeTaken":40500
                },
                {
                    "From":"New Stanton, PA, USA",
                    "To":"East Petersburg, PA, USA",
                    "Distance":172,
                    "TimeTaken":24960
                },
                {
                    "From":"East Petersburg, PA, USA",
                    "To":"East Petersburg, PA, USA",
                    "Distance":0,
                    "TimeTaken":10048
                },
                {
                    "From":"East Petersburg, PA, USA",
                    "To":"East Petersburg, PA, USA",
                    "Distance":0,
                    "TimeTaken":391
                },
                {
                    "From":"East Petersburg, PA, USA",
                    "To":"East Petersburg, PA, USA",
                    "Distance":0,
                    "TimeTaken":12857
                },
                {
                    "From":"East Petersburg, PA, USA",
                    "To":"Marietta, PA 17547, USA",
                    "Distance":10,
                    "TimeTaken":8480
                }
            ],
            "TotalDistance":362
        }
    ],
    "pass_iter": 80000,
    "password": "123abc123abc",
    "salt": "1234abcd"
};

