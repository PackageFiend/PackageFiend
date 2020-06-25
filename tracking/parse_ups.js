module.exports = function parseUPS (resJS) {
  // Initialize the array for parsed packages
  const retArr = [];

  for (let i = 0; i < resJS.length; i++) {
    // Initialize empty parsed package
    const ret = {};

    let parcel = null;
    if (resJS[i].data) {
      parcel = resJS[i].data.trackResponse.shipment[0].package[0];
      ret.TrackNum = parcel.trackingNumber;
    }

    ret.Provider = 'UPS';

    // If the API returned no data for the package, set an error for the
    // requested package
    if (!parcel) {
      ret.TrackNum = resJS[i].response.trackNum;
      ret.Error = {
        Number: resJS[i].response.errors[0].code,
        Description: resJS[i].response.errors[0].message
      };
      retArr.push(ret);
      continue;
    }

    ret.Error = false;

    ret.Summary = 'foo'; // I think this should probably go

    ret.Delivered = (parcel.deliveryDate[0].type === 'DEL');

    ret.OutForDelivery = false;

    ret.Events = [];
    const events = parcel.activity;

    for (let i = 0; i < events.length; i++) {
      const event = events[i];

      // Parse the date to a standard MM/DD/YYYY format
      const date = event.date;
      const newDate = date.slice(0, 4) + '/' + date.slice(4, 6) + '/' + date.slice(6);

      // Parse the time to a standard HH:MM:SS format
      const time = event.time;
      const newTime = time.slice(0, 2) + ':' + time.slice(2, 4) + ':' + time.slice(4);

      // Combine date and time for JS Date
      const newDateTime = `${newDate} ${newTime}`;

      const loc = event.location.address;
      // Create location string for user consumption and for Geo processing
      const location = [loc.city, loc.stateProvince, loc.postalCode, loc.country].join(' ');

      // Set OutForDelivery if the event states
      if (event.status.code === 'OT' && !ret.Delivered) {
        ret.OutForDelivery = true;
      }

      // Add event to package
      ret.Events.push({
        Time: new Date(newDateTime),
        Description: event.status.description,
        Location: {
          String: location
        }
      });
    }

    // Add package to array
    retArr.push(ret);
  }

  return retArr;
}

