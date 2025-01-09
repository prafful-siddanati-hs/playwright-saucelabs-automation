const { LoginPage } = require('../../../pages/login');
const {test} = require('@playwright/test');
const tearDown = require('../../../custom-commands/tearDown');
const createUser = require('../../../custom-commands/createUser');
const {getObjectByName} = require('../../../globals');

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Login via member', async ({page}) => {
	const createNewUser = new createUser();
	const loginPage = new LoginPage(page);

	await createNewUser.command('member_login_test', 'professional');
	await loginPage.signIn('member_login_test');
});

test('Login via email and password', async ({page}) => {
	const createNewUser = new createUser();
	const loginPage = new LoginPage(page);

	await createNewUser.command('email_login_test', 'professional');

	let user = getObjectByName(global.member, 'email_login_test');
	await loginPage.login(user.email, user.password);
});
