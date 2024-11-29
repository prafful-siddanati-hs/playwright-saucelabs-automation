const { test, expect} = require('@playwright/test');
const tearDown = require('../../../../custom-commands/tearDown');
const {MemberOverViewPage} = require('../../../../pages/memberOverview');
const {LoginPage} = require('../../../../pages/login');
const getFixture = require('../../../../custom-commands/getFixture');
const createOrg = require('../../../../custom-commands/createOrg');
const addSocialToOrg = require('../../../../custom-commands/addSocialToOrg');
const {SnProfilesSettingPage} = require('../../../../pages/snProfileSettings');
const {getObjectByName} = require('../../../../globals');

let userName;

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Verify two level custom approvals settings', async ({ page }) => {
	let orgName = 'Ca_two_level' + Math.floor(Math.random() * 10000);
	const addFixture = new getFixture();
	const createNewOrg = new createOrg();
	const loginPage = new LoginPage(page);
	const memberPage = new MemberOverViewPage(page);
	const addSocialNetwork = new addSocialToOrg();
	const snProfileSettings = new SnProfilesSettingPage(page);

	await test.step('Setup user & accounts', async () => {
		await addFixture.command('pw_ca_two', 'plan_create_enterprise', false, 300);
		await addFixture.command('ca_tow_tw','twitter', false, 300);
		await createNewOrg.command(orgName);
		await addSocialNetwork.command('ca_tow_tw');
		userName = getObjectByName(global.fixture, 'pw_ca_two').username;
	});

	await test.step('Login as test enterprise user', async () => {
		await loginPage.signInSkipOnboarding('pw_ca_two');
	});

	await test.step('Go to member page', async () => {
		await memberPage.visitMember();
	});

	await test.step('Adding second level custom approval for social network', async () => {
		await expect(snProfileSettings.selectSocialNetworksBtn).toBeVisible();
		await snProfileSettings.selectSocialNetworksBtn.click();
		await snProfileSettings.openSnProfileSettingsTab();
		await snProfileSettings.verifyDefaultCustomApprovals();
		await snProfileSettings.selectEditCustomApprovalButton();
		await snProfileSettings.addSecondLevelCustomApproval(userName);
		await snProfileSettings.saveFirstLevelCustomApproval();

	});
});
