const axios = require('axios');
const convert = require('xml-js');
const fs = require('fs');
const path = require('path');

const GeoPoint = require('geopoint');

const Geos = require('./geos');

const parseUPS = require('./parse_ups');
const parseUSPS = require('./parse_usps');


const demoData = JSON.parse(fs.readFileSync('tracking/demodata.json', 'utf8'));

console.log("loaded");
for (const parcelID in demoData) {
  const parcel = demoData[parcelID];
  for (const event of parcel.Events) {
    if (event.Time === null) continue;
    event.Time = new Date(event.Time);
  }
}

const keys = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'keys.json'), 'utf8'));


const uspsReg = /^(?:9(?:4|2|3)|EC|CP|82)\d+(?:EA)?\d+(?:US)?$/;
const upsReg = /^1Z[A-Z0-9]+$/;
const fedexReg = /^(?:\d{12}|\d{15}|\d{20})$/;

function parseFedEx (resJS) {
  console.log(JSON.stringify(resJS, null, 2));
  return null;
}

module.exports = {
  track: async function (ids, lite=false, provider=null) {
    const ret = [];

    const numstack = {
      usps: [],
      ups: [],
      fedex: [],
      invalid: []
    };

    for (let i = 0; i < ids.length; i++) {
      if (ids[i] in demoData) {
        ret.push(demoData[ids[i]]);
        continue;
      }
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

    // Create all the USPS request promises
    if (numstack.usps.length) {
      let reqDat = `<TrackRequest USERID="${keys.usps}">`;
      for (let i = 0; i < numstack.usps.length; i++) {
        reqDat += `<TrackID ID="${numstack.usps[i]}"/>`;
      }
      reqDat += '</TrackRequest>';

      uspsProm = axios.get(`http://production.shippingapis.com/ShippingAPI.dll?API=TrackV2&XML=${reqDat}`);
    }

    // Create all the UPS request promises
    if (numstack.ups.length) {
      const config = {
        headers: {
          AccessLicenseNumber: keys.ups
        }
      };

      for (let i = 0; i < numstack.ups.length; i++) {
        upsProm.push(axios.get(`https://onlinetools.ups.com/track/v1/details/${numstack.ups[i]}`, config).catch(err => {
          return {
            response: {
              errors: [{
                code: 500,
                message: '500 response from UPS'
              }],
              trackNum: numstack.ups[i]
            }
          };
        }));
      }
    }

    // Create the Fedex Promise
    if (numstack.fedex.length) {
      try {

      } catch (err) {

      }
    }

    // Parse all of the USPS data
    console.log('Waiting for usps data');
    if (numstack.usps.length) {
      try {
        const res = await uspsProm;
        const uspsVals = convert.xml2js(res.data, { compact: true, alwaysArray: true });
        ret.push(...parseUSPS(uspsVals));
      } catch (err) {
        console.error('Error getting USPS:', err);
      }
    }

    console.log('Waiting for UPS data');
    // Parse all of the UPS data
    if (numstack.ups.length) {
      try {
        const upsVals = await Promise.all(upsProm);
        // console.dir(upsVals, {depth: null});
        const parsed = parseUPS(upsVals);
        // console.log(parsed);
        ret.push(...parsed);
      } catch (err) {
        console.error('Error getting UPS:', err);
      }
    }

    console.log('Got all data');

    if (!lite) {
      const geos = [];

      // Add geo data
      for (let i = 0; i < ret.length; i++) {
        const parcel = ret[i];
        if (parcel.Demo && !parcel.Fill) continue;
        if (parcel.Error) continue;
        for (let j = 0; j < parcel.Events.length; j++) {
          const event = parcel.Events[j];
          if (event.Location.String === null || event.Location.String.length <= 5) {
            event.Location.Geo = null;
            event.Location.Address = null;
            continue;
          }
          geos.push(Geos.getGeo(event.Location.String, event));
        }
      }

      try {
        await Promise.all(geos);
      } catch (err) {
        console.error('Error getting geo information:', err);
      }


      // Add travel time data
      for (let i = 0; i < ret.length; i++) {
        const parcel = ret[i];
        console.log(parcel);
        if (parcel.Error) continue;
        if (parcel.Demo && !parcel.Fill) continue;
        parcel.Travels = [];
        parcel.TotalDistance = 0;
        const start = null;
        const end = null;
        for (let j = parcel.Events.length - 1; j > 0; j--) {
          const event = parcel.Events[j];
          if (!event.Location.Geo || !event.Time) continue;
          const thisPosition = new GeoPoint(event.Location.Geo.lat, event.Location.Geo.lng);

          for (let k = j - 1; k >= 0; k--) {
            const nextEvent = parcel.Events[k];
            if (!nextEvent.Location.Geo || !nextEvent.Time) continue;
            const nextPosition = new GeoPoint(nextEvent.Location.Geo.lat, nextEvent.Location.Geo.lng);

            const dist = thisPosition.distanceTo(nextPosition);
            const timeDiff = (nextEvent.Time.getTime() - event.Time.getTime()) / 1000;

            const niceDist = (dist ? Math.floor(dist) : 0);
            parcel.TotalDistance += niceDist;

            parcel.Travels.push({
              From: event.Location.Address, // .replace(/([A-Z]{2}).+/, '$1'),
              To: nextEvent.Location.Address, // .replace(/([A-Z]{2}).+/, '$1'),
              Distance: niceDist,
              TimeTaken: timeDiff
            });

            // console.log(j, k);
            j = k + 1;
            break;
          }
        }
      }
    }

    // Add MostRecentTime property
    for (let i = 0; i < ret.length; i++) {
      const parcel = ret[i];
      if (parcel.Error) continue;
      if (parcel.Demo && !parcel.Fill) continue;
      for (let j = 0; j < parcel.Events.length; j++) {
        if (parcel.Events[j].Time !== null) {
          parcel.MostRecentTime = parcel.Events[j].Time;
          break;
        }
      }
      if (parcel.MostRecentTime === undefined) {
        parcel.MostRecentTime = null;
      }
    }


    // console.log(parcel.Travels);

    return ret;
  }
};
