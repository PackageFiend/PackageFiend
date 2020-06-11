module.exports = function parseUPS (resJS) {
  const retArr = [];
  for (let i = 0; i < resJS.length; i++) {
    const parcel = resJS[i].data.trackResponse.shipment[0].package[0];
    //console.dir(resJS[i].data, {depth: null});

    const ret = {};
    ret.TrackNum = parcel.trackingNumber;
    console.log(ret.TrackNum);
    ret.Provider = 'UPS';

    if (parcel === undefined) {
      ret.TrackNum = null;
      ret.Error = {
        Number: resJS.response.errors[0].code,
        Description: resJS.response.errors[0].message
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

      const date = event.date;
      const newDate = date.slice(0, 4) + '/' + date.slice(4, 6) + '/' + date.slice(6);

      const time = event.time;
      const newTime = time.slice(0, 2) + ':' + time.slice(2, 4) + ':' + time.slice(4);

      const newDateTime = `${newDate} ${newTime}`;

      const loc = event.location.address;
      const location = [loc.city, loc.stateProvince, loc.postalCode, loc.country].join(' ');

      let geo = null;

      ret.Events.push({
        Time: new Date(newDateTime),
        Description: event.status.description,
        Location: {
          String: location
        }
      });
    }

    retArr.push(ret);
  }

  return retArr;
}

