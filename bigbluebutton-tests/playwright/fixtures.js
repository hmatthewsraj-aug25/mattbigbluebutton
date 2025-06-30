const base = require('@playwright/test');
const { fullyParallel } = require('./playwright.config');
const parameters = require('./core/parameters');
const helpers = require('./core/helpers');

exports.test = base.test.extend({
  sharedEachTestHook: [async ({ browser, request }, use) => {
    // before test
    
    const BBB_URL_PATTERN = /^https:\/\/[^/]+\/bigbluebutton\/(?:api\/)?$/;
    if (!parameters.secret) throw new Error('BBB_SECRET environment variable is not set');
    if (!parameters.server) throw new Error('BBB_URL environment variable is not set');
    if (!BBB_URL_PATTERN.test(parameters.server)) throw new Error('BBB_URL must follow the pattern "https://DOMAIN_NAME/bigbluebutton/"');

    try {
      // Test the /create endpoint with a temporary meeting
      const testMeetingId = `validation-test-${Date.now()}`;
      const createUrl = helpers.createMeetingUrl(parameters, undefined, testMeetingId);
      const createResponse = await request.get(createUrl);

      if (!createResponse.ok()) {
        const msg = `Failed to validate /create endpoint. HTTP status: ${createResponse.status()}.`;
        console.error(msg);
        throw new Error(msg);
      }

      // Test the /join endpoint (will return an error for non-existent meeting, but validates the endpoint works)
      const joinUrl = helpers.getJoinURL(testMeetingId, parameters, true);
      const joinResponse = await request.get(joinUrl);

      // For /join, we expect either success (200) or a valid BBB error response
      if (!joinResponse.ok() && joinResponse.status() !== 404) {
        const msg = `Failed to validate /join endpoint. HTTP status: ${joinResponse.status()}.`;
        console.error(msg);
        throw new Error(msg);
      }

      console.log('Endpoints validation okay: /create and /join are accessible !!!!');
    } catch (error) {
      console.error('Endpoints validation failed:', error.message);
      throw error;
    }

    await use();

    // after test
    if (fullyParallel) {
      while (browser.contexts().length > 0) {
        await browser.contexts()[0].close();
      }
    }
  }, { scope: 'test', auto: true }],
});
