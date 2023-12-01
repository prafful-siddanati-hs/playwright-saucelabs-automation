const { test } = require('@playwright/test');
const getFixture = require('../custom-commands/getFixture');
const tearDown = require('../custom-commands/tearDown');
const createOrg = require('../custom-commands/createOrg');

test.afterEach(async ({ page }) => {
    const cleanUp = new tearDown();
    
    //await cleanUp.command();
    await page.close();
});

test('Create an Enterprise user', async ({ page }) => {
    const addFixture = new getFixture();
    const createNewOrg = new createOrg();

    await addFixture.command('pw_enterprise_test', 'enterprise', false, 240);
    await addFixture.command('test_ent','twitter', false, 300);
    await createNewOrg.command('pw_1299')

    //await page.waitForTimeout(2000);
    //TODO:Implement signInSkipOnboarding() similar to Nightwatch

    await page.waitForTimeout(2000);
});