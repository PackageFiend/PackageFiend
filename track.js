const axios = require('axios');
const convert = require('xml-js');
const fs = require('fs');

const keys = JSON.parse(fs.readFileSync('keys.json', 'utf8'));

const uspsReg = /^(?:9(?:4|2|3)|EC|CP|82)\d+(?:EA)?\d+(?:US)?$/; //Note: This only matches standard tracking number
const upsReg = /^1Z[A-Z0-9]+$/;

function parseUSPS(resJS) {
  ret = {};
  dat = resJS.TrackResponse[0]; 

  //console.log(JSON.stringify(resJS, null, 2));

  const tinfo = dat.TrackInfo[0]; //This index could loop for several IDs in one request
  ret.TrackNum = tinfo._attributes.ID;

  if (tinfo.Error !== undefined) {
    ret.Error = {
      Number: 1,
      Description: tinfo.Error[0].Description[0]._text
    }
    return ret;
  }

  const trackArr = tinfo.TrackDetail;

  if (trackArr === undefined) {
    ret.Error = {
      Number: 2,
      Description: tinfo.TrackSummary[0]._text[0]
    }
    return ret;
  }

  ret.Error = false;
  ret.Provider = "USPS";

  ret.Summary = tinfo.TrackSummary[0]._text[0];
  
  ret.Delivered = /delivered/.test(ret.Summary);

  ret.OutForDelivery = false;

  ret.Events = [];

  for (let i = 0; i < trackArr.length; i++) {
    const groupReg = /^([\w ,]+), ((?:\d{2}\/\d{2}\/\d{4}|\w+ \d+, \d{4}), \d{1,2}:\d{2} (?:am|pm)), (.+)$/ //God save us all
    const infoParts = trackArr[i]._text[0].match(groupReg);;
    //console.log(trackArr[i]._text[0], infoParts);
    ret.Events.push({
      Time: new Date(infoParts[2]).toString(),
      Description: infoParts[1],
      Location: infoParts[3]
    });
  }

  return ret;
}

function parseUPS(resJS) {
  const package = resJS.trackResponse.shipment[0].package[0];

  ret = {};

  if (package === undefined) {
    ret.TrackNum = null;
    ret.Error = {
      Number: resJS.response.errors[0].code,
      Description: resJS.response.errors[0].message
    }
    return ret;
  }

  ret.Error = false;
  ret.Provider = "UPS";

  ret.Summary = "foo"; //I think this should probably go

  ret.Delivered = (package.deliveryDate[0].type === "DEL");

  ret.OutForDelivery = false;
  
  ret.Events = [];
  const events = package.activity;

  for (let i = 0; i < events.length; i++) {
    const event = events[i];

    const date = event.date;
    const newDate = date.slice(0, 4) + '/' + date.slice(4, 6) + '/' + date.slice(6);
    
    const time = event.time;
    const newTime = time.slice(0, 2) + ':' + time.slice(2, 4) + ':' + time.slice(4);

    const newDateTime = `${newDate} ${newTime}`;

    const loc = event.location.address;
    const location = [loc.city, loc.stateProvince, loc.postalCode, loc.country].join(' ');

    ret.Events.push({
      Time: new Date(newDateTime),
      Description: event.status.description,
      Location: location
    });
  }

  return ret;
}

module.exports = {
  track: async function(id, provider=null) {
    idClean = id.replace(/\s/g, '');

    if (uspsReg.test(idClean)) {
      console.log("USPS number");

      const reqDat = `<TrackRequest USERID="${keys.usps}"> <TrackID ID="${idClean}"/> </TrackRequest>`;
      
      try {
        const res = await axios.get(`http://production.shippingapis.com/ShippingAPI.dll?API=TrackV2&XML=${reqDat}`);
        const resJS = convert.xml2js(res.data, {compact: true, alwaysArray: true});

        return parseUSPS(resJS);
      } catch (err) {
        console.error('Error USPS tracking:', err);
        return null;
      }
    } else if (upsReg.test(idClean)) {
      console.log("UPS number");

      const config = {
        headers: {
          AccessLicenseNumber: keys.ups
        }
      }

      try {
        const res = await axios.get(`https://onlinetools.ups.com/track/v1/details/${idClean}`, config);

        return parseUPS(res.data);
      } catch (err) {
        console.error('Error UPS tracking:', err);
        return null;
      }
    } else {
      console.log('Not a valid number:', idClean);
      return null;
    }
  }
}
