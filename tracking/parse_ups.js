module.exports = function parseUPS (resJS) {
  const retArr = [];
  for (let i = 0; i < resJS.length; i++) {
    const ret = {};

    let parcel = null;
    if (resJS[i].data) {
      parcel = resJS[i].data.trackResponse.shipment[0].package[0];
      ret.TrackNum = parcel.trackingNumber;
    }
    //console.dir(resJS[i].data, {depth: null});

    //console.log(ret.TrackNum);
    ret.Provider = 'UPS';

    //console.log(i);
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

      const date = event.date;
      const newDate = date.slice(0, 4) + '/' + date.slice(4, 6) + '/' + date.slice(6);

      const time = event.time;
      const newTime = time.slice(0, 2) + ':' + time.slice(2, 4) + ':' + time.slice(4);

      const newDateTime = `${newDate} ${newTime}`;

      const loc = event.location.address;
      const location = [loc.city, loc.stateProvince, loc.postalCode, loc.country].join(' ');

      if (event.status.code === 'OT' && !ret.Delivered) {
        ret.OutForDelivery = true;
      }

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

