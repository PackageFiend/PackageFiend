const track = require('../track');

const myArgs = process.argv.slice(2);

async function main() {
  try {
    const res = await track.track(myArgs);
    //console.log(JSON.stringify(res, null, 2));
    console.dir(res, {depth: null});
  } catch (err) {
    console.error('Error with track function:', err);
  }
}

main();

//track.parse();
