const axios = require('axios');
const convert = require('xml-js');
const fs = require('fs');

const keys = JSON.parse(fs.readFileSync('keys.json', 'utf8'));

const uspsReg = /^(?:9(?:4|2|3)|EC|CP|82)\d+(?:EA)?\d+(?:US)?$/;
const upsReg = /^1Z[A-Z0-9]+$/;
const fedexReg = /^(?:\d{12}|\d{15}|\d{20})$/;

function parseUSPS (resJS) {
  const retArr = [];

  const dat = resJS.TrackResponse[0];

  //console.log(JSON.stringify(resJS, null, 2));

  for (let i = 0; i < dat.TrackInfo.length; i++) {
    //console.log('Iteration:', i);
    const tinfo = dat.TrackInfo[i];
    const ret = {};
    ret.TrackNum = tinfo._attributes.ID;

    if (tinfo.Error !== undefined) {
      console.error('Error in response');
      ret.Error = {
        Number: 1,
        Description: tinfo.Error[0].Description[0]._text
      };
      retArr.push(ret);
      continue;
    }

    const trackArr = tinfo.TrackDetail;

    if (trackArr === undefined) {
      ret.Error = {
        Number: 2,
        Description: tinfo.TrackSummary[0]._text[0]
      };
      retArr.push(ret);
      continue;
    }

    ret.Error = false;
    ret.Provider = 'USPS';

    ret.Summary = tinfo.TrackSummary[0]._text[0];

    ret.Delivered = /delivered/.test(ret.Summary);

    ret.OutForDelivery = false;

    ret.Events = [];

    const timeReg = /(\w+ \d+, \d{4}, \d+:\d{2} (?:am|pm)|\d{2}\/\d{2}\/\d{4}(?:, \d+:\d{2} (?:am|pm))?)/;
    const descReg = /([A-Za-z ,.:-]+)(?:at |, |\.)/;
    const locReg = /(?:, |in )([A-Za-z]+[\w ,-]+)\.?$/;

    trackArr.unshift(tinfo.TrackSummary[0]);

    for (let i = 0; i < trackArr.length; i++) {
      const text = trackArr[i]._text[0];
      const tmatch = text.match(timeReg);
      const dmatch = text.match(descReg);
      const lmatch = text.match(locReg);

      const time = tmatch ? tmatch[1] : null;
      const description = dmatch ? dmatch[1] : null;
      const location = lmatch ? lmatch[1] : null;

      ret.Events.push({
        Time: new Date(time),
        Description: description,
        Location: location
      });
    }

    retArr.push(ret);
  }

  return retArr;
}

function parseUPS (resJS) {
  const retArr = [];
  for (let i = 0; i < resJS.length; i++) {
    const parcel = resJS.trackResponse.shipment[0].parcel[0];

    const ret = {};

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
    ret.Provider = 'UPS';

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

      ret.Events.push({
        Time: new Date(newDateTime),
        Description: event.status.description,
        Location: location
      });
    }

    retArr.push(ret);
  }

  return retArr;
}

function parseFedEx (resJS) {
  console.log(JSON.stringify(resJS, null, 2));
  return null;
}

module.exports = {
  track: async function (ids, provider = null) {
    const ret = [];

    const numstack = {
      usps: [],
      ups: [],
      fedex: [],
      invalid: []
    };

    for (let i = 0; i < ids.length; i++) {
      idClean = ids[i].replace(/\s/g, '');
      if (uspsReg.test(idClean)) {
        console.log('USPS number');
        numstack.usps.push(idClean);
      } else if (upsReg.test(idClean)) {
        console.log('UPS number');
        numstack.ups.push(idClean);
      } else if (fedexReg.test(idClean)) {
        console.log('FedEx number');
        numstack.fedex.push(idClean);
      } else {
        console.log('Bad number');
        numstack.invalid.push(idClean);
      }
    }

    let uspsProm = null;
    const upsProm = [];
    const fedexProm = null;

    if (numstack.usps.length) {
      let reqDat = `<TrackRequest USERID="${keys.usps}">`;
      for (let i = 0; i < numstack.usps.length; i++) {
        reqDat += `<TrackID ID="${numstack.usps[i]}"/>`;
      }
      reqDat += '</TrackRequest>';

      uspsProm = axios.get(`http://production.shippingapis.com/ShippingAPI.dll?API=TrackV2&XML=${reqDat}`);
    }

    if (numstack.ups.length) {
      const config = {
        headers: {
          AccessLicenseNumber: keys.ups
        }
      };

      for (let i = 0; i < numstack.ups.length; i++) {
        upsProm.push(axios.get(`https://onlinetools.ups.com/track/v1/details/${numstack.ups[i]}`, config));
      }
    }

    try {
      const res = await uspsProm;
      const uspsVals = convert.xml2js(res.data, { compact: true, alwaysArray: true });
      ret.push(...parseUSPS(uspsVals));
    } catch (err) {
      console.error('Error getting USPS:', err);
    }

    try {
      const upsVals = await Promise.all(upsProm);
      ret.push(...parseUPS(upsVals));
    } catch (err) {
      console.error('Error getting UPS:', err);
    }

    /*
    if (uspsReg.test(idClean)) {
      console.log("USPS number");

    } else if (upsReg.test(idClean)) {
      console.log("UPS number");

      } catch (err) {
        console.error('Error UPS tracking:', err);
        return null;
      }
    } else if (fedexReg.test(idClean)) {
      console.log('FedEx number');

      const req = `\
          <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:v18="http://fedex.com/ws/track/v18">\
           <soapenv:Header/>\
           <soapenv:Body>\
              <v18:TrackRequest>\
                 <v18:WebAuthenticationDetail>\
                    <v18:UserCredential>\
                       <v18:Key>${keys.fedex.key}</v18:Key>\
                       <v18:Password>${keys.fedex.password}</v18:Password>\
                    </v18:UserCredential>\
                 </v18:WebAuthenticationDetail>\
                 <v18:ClientDetail>\
                    <v18:AccountNumber>${keys.fedex.accnum}</v18:AccountNumber>\
                    <v18:MeterNumber>${keys.fedex.metnum}</v18:MeterNumber>\
                 </v18:ClientDetail>\
                 <v18:Version>\
                    <v18:ServiceId>trck</v18:ServiceId>\
                    <v18:Major>18</v18:Major>\
                    <v18:Intermediate>0</v18:Intermediate>\
                    <v18:Minor>0</v18:Minor>\
                 </v18:Version>\
                 <v18:SelectionDetails>\
                    <!--Optional:-->\
                    <v18:PackageIdentifier>\
                       <v18:Type>TRACKING_NUMBER_OR_DOORTAG</v18:Type>\
                       <v18:Value>${idClean}</v18:Value>\
                    </v18:PackageIdentifier>\
                 </v18:SelectionDetails>\
              </v18:TrackRequest>\
           </soapenv:Body>\
        </soapenv:Envelope>`

      const config = {
        headers: {'Content-Type': 'text/xml'}
      };

      try {
        const res = await axios.post('https://wsbeta.fedex.com:443/web-services/', req, config);
        const resJS = convert.xml2js(res.data, {compact: true, alwaysArray: false});

        return parseFedEx(resJS);
      } catch (err) {
        console.error('Error FedEx tracking:', err);
        return null;
      }
    } else {
      console.log('Not a valid number:', idClean);
      return null;
    }
    */

    return ret;
  }
};
