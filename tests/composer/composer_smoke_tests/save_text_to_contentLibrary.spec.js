const { test, expect} = require('@playwright/test');
const tearDown = require('../../../custom-commands/tearDown');
const createTeam = require('../../../custom-commands/createTeam');
const { getObjectByName } = require('../../../globals');
const { LoginPage } = require('../../../pages/login');
const { ComposePage } = require('../../../pages/planandcreate/compose');
const { SetUpEnterpriseUser } = require('../../../custom-commands/setUpEnterpriseUser');
const { ContentLibraryPage } = require('../../../pages/planandcreate/contentLibrary');

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Save text data to content library', async ({ page }) => {
	let pwCLOrg = 'PW_contentLib_Org_'.concat(Math.floor(Math.random() * 10000));
	const pwCLText = 'CL text only template';
	const pwContentLibraryName = 'Playwright Content Library';
	const setUpEnterpriseUser = new SetUpEnterpriseUser();
	const createNewTeam = new createTeam();
	const loginPage = new LoginPage(page);
	const contentLibraryPage = new ContentLibraryPage(page);
	const composePage = new ComposePage(page);

	let accounts = {
		plan_create_facebookpage: []
	};
	accounts.plan_create_facebookpage.push('pw_fb_cl');

	await test.step('Setup enterprise user, team &  account', async () => {
		await setUpEnterpriseUser.setUpEnterpriseUser(pwCLOrg, 'pw_save_text_cl', accounts);
		await createNewTeam.command('PW_CL_TEAM');
	});

	await test.step('Login as test enterprise user', async () => {
		await loginPage.signInSkipOnboarding('pw_save_text_cl');
	});

	await test.step('Navigate to content library page', async () => {
		await contentLibraryPage.visit();
	});

	await test.step('Create new content library', async() => {
		await contentLibraryPage.createContentLibrary(pwContentLibraryName);
	});

	await test.step('Open composer', async () => {
		await composePage.selectComposeButton();
	});

	await test.step('Verify facebook account is selected', async () => {
		await composePage.verifySocialProfileSelected(getObjectByName(global.fixture, 'pw_fb_cl').username);
	});

	await test.step('Write a message', async () => {
		await composePage.writeMessage(pwCLText);
	});

	await test.step('Save as content library template', async () => {
		await composePage.saveToContentLibrary();
		await contentLibraryPage.createContentLibraryAsset(pwContentLibraryName);
		await expect(composePage.composeScreen).not.toBeVisible();
	});

	await test.step('Verify template was created', async () => {

	});

	await test.step('Delete the content library template', async () => {

	});


	await page.waitForTimeout(70000);

});
