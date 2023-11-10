const { test } = require('@playwright/test');
const createUser = require('../custom-commands/createUser');
const getFixture = require('../custom-commands/getFixture');
const tearDown = require('../custom-commands/tearDown.js');

test('Try resource locking', async ({page}) => {
    const createNewUser = new createUser();
    const addFixture = new getFixture();
    const cleanUp = new tearDown();

    await createNewUser.command('pw_test', 'professional');
    await addFixture.command('test1','twitter', true, 180);
    await addFixture.command('test2','twitter', true, 180);
    
    await page.waitForTimeout(2000);
    await cleanUp.command();

    await page.close();
});
