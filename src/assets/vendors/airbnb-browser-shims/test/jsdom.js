'use strict';

/* testfile.test.jsx */

/**
 * @jest-environment jsdom
 */

require('./');

describe('any test', () => {
  it('should do something', () => {
    console.log('it will fail before tests are run');
  });
});
