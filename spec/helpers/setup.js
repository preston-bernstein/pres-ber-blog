const { JSDOM } = require('jsdom');
const sinon = require('sinon');

beforeAll(() => {
  const dom = new JSDOM('<!doctype html><html><body></body></html>', {
    url: 'http://localhost/'
  });

  global.window = dom.window;
  global.document = dom.window.document;
  global.navigator = {
    userAgent: 'node.js',
  };
  global.HTMLElement = dom.window.HTMLElement;
  global.sinon = sinon; // Make Sinon globally available

  global.window.Swiper = function() {
    this.init = sinon.stub();
  };
});

afterAll(() => {
  delete global.window;
  delete global.document;
  delete global.navigator;
  delete global.HTMLElement;
  delete global.sinon;
});
