const track = require('../track');

const myArgs = process.argv.slice(2);

async function main() {
  const res = await track.track(myArgs);
  console.log(JSON.stringify(res, null, 2));
}

main();

//track.parse();
