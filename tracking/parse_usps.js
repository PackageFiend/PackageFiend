module.exports = function parseUSPS (resJS) {
  const retArr = [];

  //console.log(JSON.stringify(resJS, null, 2));
  const dat = resJS.TrackResponse[0];

  //console.log(JSON.stringify(resJS, null, 2));

  for (let i = 0; i < dat.TrackInfo.length; i++) {
    //console.log('Iteration:', i);
    const tinfo = dat.TrackInfo[i];
    const ret = {};
    ret.TrackNum = tinfo._attributes.ID;
    ret.Provider = 'USPS';

    if (tinfo.Error !== undefined) {
      console.error('Error in response:', JSON.stringify(dat, null, 2));
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

      const time = tmatch ? new Date(tmatch[1]) : null;
      const description = dmatch ? dmatch[1] : null;
      const location = lmatch ? lmatch[1] : null;

      ret.Events.push({
        Time: time,
        Description: description,
        Location: {
          String: location
        }
      });
    }

    retArr.push(ret);
  }

  return retArr;
}

