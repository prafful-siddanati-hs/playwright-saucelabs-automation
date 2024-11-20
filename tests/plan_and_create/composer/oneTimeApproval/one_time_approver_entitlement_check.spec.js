/* Test to verify Professional (& Team) users do not have access to One time approval workflows. Only enterprise users can access it. */
const { test, expect} = require('@playwright/test');
const createUser = require('../../../../custom-commands/createUser');
const { SetUpEnterpriseUser } = require('../../../../custom-commands/setUpEnterpriseUser');
const getFixture = require('../../../../custom-commands/getFixture');
const tearDown = require('../../../../custom-commands/tearDown');
const { getObjectByName } = require('../../../../globals');
const { LoginPage } = require('../../../../pages/login');
const { ComposePage } = require('../../../../pages/planandcreate/compose');

let proUserFacebookPage, enterpriseUserFacebookPage;

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Verify one time approver is only enabled for enterprise user', async ({page}) => {
	const loginPage = new LoginPage(page);
	const composePage = new ComposePage(page);
	const createNewUser = new createUser();
	const addFixture = new getFixture();
	const setUpEnterpriseUser = new SetUpEnterpriseUser();

	let orgName = 'fb_flex_approver_enterprise_' + Math.floor(Math.random() * 10000);
	let accounts = {
		plan_create_facebookpage: ['fb_flex_approver_enterprise']
	};

	await test.step('Setup user & accounts', async () => {
		await createNewUser.command('flex_approver_pro_user', 'professional');
		await addFixture.command('fb_flex_approver_pro','plan_create_facebookpage', true, 300);
		proUserFacebookPage = getObjectByName(global.fixture, 'fb_flex_approver_pro').socialProfile.username;
	});

	await test.step('Login as professional user', async () => {
		await loginPage.signInAsProUser('flex_approver_pro_user');
	});

	await test.step('Select new compose button', async () => {
		await composePage.selectComposeButton();
	});

	await test.step('Verify linkedin account is selected', async () => {
		await composePage.verifySocialProfileSelected(proUserFacebookPage);
	});

	await test.step('Verify one time approver field is not displayed', async () => {
		await expect(composePage.oneTimeApproverDropDown).not.toBeVisible();
	});

	await test.step('Logout from professional user', async () => {
		await loginPage.logout();
		new tearDown().command();
	});

	await test.step('Create an enterprise user', async () => {
		await setUpEnterpriseUser.setUpEnterpriseUser(orgName, 'flex_approver_enterprise', accounts);
		enterpriseUserFacebookPage = getObjectByName(global.fixture, 'fb_flex_approver_enterprise').socialProfile.username;
	});

	await test.step('Login as enterprise user', async () => {
		await loginPage.signInSkipOnboarding('flex_approver_enterprise');
	});

	await test.step('Open composer for enterprise user', async () => {
		await composePage.selectComposeButton();
	});

	await test.step('Verify linkedin account is selected', async () => {
		await composePage.verifySocialProfileSelected(enterpriseUserFacebookPage);
	});

	await test.step('Verify one time approver field is displayed', async () => {
		await expect(page.getByRole('heading', { name: 'Ask for approval' })).toBeVisible();
		await expect(page.getByText('Invite a team member with access to the selected accounts to approve this post first.')).toBeVisible();
		await expect(composePage.oneTimeApproverDropDown).toBeVisible();
	});

	await test.step('Remove the selected network and verify one time approver field is not displayed', async () => {
		await page.getByLabel(`Clear selection ${enterpriseUserFacebookPage}`).click();
		await expect(page.getByRole('heading', { name: 'Ask for approval' })).not.toBeVisible();
		await expect(page.getByText('Invite a team member with access to the selected accounts to approve this post first.')).not.toBeVisible();
		await expect(composePage.oneTimeApproverDropDown).not.toBeVisible();
	});
});
