const mocha = require('mocha');
const chai = require('chai');
const it = mocha.it;
const describe = mocha.describe;
const expect = chai.expect;

describe('sample test', () => {
  it('Should return string', () => {
    expect('i with travis').to.equal('ci with travis');
  });
});
