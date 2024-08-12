const { test} = require('@playwright/test');
const tearDown = require('../../../../custom-commands/tearDown');
const { LoginPage } = require('../../../../pages/login');
const { ComposePage } = require('../../../../pages/planandcreate/compose');
const createUser = require('../../../../custom-commands/createUser');

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Composer basic validations', async ({ page }) => {
	const createNewUser = new createUser();
	const loginPage = new LoginPage(page);
	const composePage = new ComposePage(page);

	await test.step('Setup user & accounts', async () => {
		await createNewUser.command('create_post', 'professional');
	});

	await test.step('Login as pro user', async () => {
		await loginPage.signInAsProUser('create_post');
	});

	await test.step('Open composer from global navigator', async () => {
		await composePage.selectComposeButton();
	});

	await test.step('Verify default composer', async () => {
		//await composePage.verifyDefaultComposer();
	});

});
