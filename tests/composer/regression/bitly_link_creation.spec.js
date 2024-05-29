const { test } = require('@playwright/test');
const tearDown = require('../../../custom-commands/tearDown');
const {MemberOverViewPage} = require('../../../pages/memberOverview');
const {LinkPresetsManagePage} = require('../../../pages/planandcreate/linkPresetsManage');
const {LoginPage} = require('../../../pages/login');
const getFixture = require('../../../custom-commands/getFixture');
const createOrg = require('../../../custom-commands/createOrg');

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Bitly link shortener creation', async ({ page }) => {
	let orgName = 'Bit_ly_org_' + Math.floor(Math.random() * 10000);
	const addFixture = new getFixture();
	const createNewOrg = new createOrg();
	const loginPage = new LoginPage(page);
	const memberPage = new MemberOverViewPage(page);
	const linkPresetsManagePage = new LinkPresetsManagePage(page);

	await test.step('Setup user & accounts', async () => {
		await addFixture.command('bit_ly_user', 'enterprise', false, 300);
		await createNewOrg.command(orgName);
	});

	await test.step('Login as test enterprise user', async () => {
		await loginPage.signInSkipOnboarding('bit_ly_user');
	});

	await test.step('Navigate to member page', async () => {
		await memberPage.visitMember();
	});

	await test.step('Create Bit.ly shortener', async () => {
		await memberPage.selectLinkSettingButton();
		await linkPresetsManagePage.selectShortenerProvider('Bit.ly shorteners');
		await linkPresetsManagePage.createBitlyShortener(`PW Bit.ly ${Date.now()}`);
	});
});
