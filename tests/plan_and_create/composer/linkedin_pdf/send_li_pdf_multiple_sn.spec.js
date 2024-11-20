/* Test to Send(Post Now) a LinkedIn PDF post which includes other social networks */
const { test, expect } = require('@playwright/test');
const tearDown = require('../../../../custom-commands/tearDown');
const { getObjectByName } = require('../../../../globals');
const { SetUpEnterpriseUser } = require('../../../../custom-commands/setUpEnterpriseUser');
const { LoginPage } = require('../../../../pages/login');
const { ComposePage } = require('../../../../pages/planandcreate/compose');

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Send LinkedIn PDF post with multiple social networks', async ({ page }) => {
	let orgName = 'pw_send_li_pdf_multiple_sn_' + Math.floor(Math.random() * 10000);
	const pdfText = 'Send with PDF ' + Math.floor(Math.random() * 1000);

	let accounts = {
		linkedin: ['pw_send_li'],
		twitter: ['pw_send_tw'],
		plan_create_facebookpage: ['pw_send_fb']
	};

	const loginPage = new LoginPage(page);
	const composePage = new ComposePage(page);
	const setUpEnterpriseUser = new SetUpEnterpriseUser();

	await test.step('Setup user & accounts', async () => {
		await setUpEnterpriseUser.setUpEnterpriseUser(orgName, 'pw_send_li_pdf_multiple_sn', accounts);
	});

	await test.step('Login as test enterprise user', async () => {
		await loginPage.signInSkipOnboarding('pw_send_li_pdf_multiple_sn');
	});

	await test.step('Select new compose button', async () => {
		await composePage.selectComposeButton();
	});

	await test.step('Write a message', async () => {
		await composePage.writeMessage(pdfText);
	});

	await test.step('Select all social networks', async () => {
		await composePage.profileDropDown.click();
		await expect(composePage.snContentItems).toBeVisible();
		await composePage.selectSocialProfile(getObjectByName(global.fixture, `${accounts.linkedin}`).username);
		await composePage.selectSocialProfile(getObjectByName(global.fixture, `${accounts.twitter}`).username);
		await composePage.selectSocialProfile(getObjectByName(global.fixture, `${accounts.plan_create_facebookpage}`).username);
		await composePage.postToWrapper.click();
		await expect(composePage.profileListItemTitle).not.toBeVisible();
	});

	await test.step('Attach an image', async () => {
		await composePage.uploadMediaFile('test_data/publisher/images');
		await page.waitForTimeout(1000);
	});

	await test.step(`Verify preview for ${accounts.twitter} & ${accounts.plan_create_facebookpage}`, async () => {
		await expect(composePage.twitterTab).toBeVisible();
		await composePage.twitterTab.click();
		await composePage.verifyTwitterPreview(pdfText);
		await expect(composePage.facebookPageTab).toBeVisible();
		await composePage.facebookPageTab.click();
		await composePage.verifyFacebookPreview(pdfText);
	});

	await test.step(`Verify ${accounts.linkedin} preview`, async () => {
		await expect(composePage.linkedInTab).toBeVisible();
		await composePage.linkedInTab.click();
		await composePage.verifyLinkedInPreview(pdfText);
	});

	await test.step('Attach PDF file', async () => {
		await composePage.uploadMediaFile('test_data/publisher/pdfs');
	});

	await test.step('Remove image for linkedin', async () => {
		await expect(composePage.imageRemoveButton).toBeVisible();
		await composePage.imageRemoveButton.click();
		await expect(composePage.mediaDeleteAnimation).toBeVisible();
		await composePage.verifyLinkedInPdfPreview();
		await expect(composePage.mediaDeleteAnimation).not.toBeVisible();
	});

	await test.step('Send the post', async () => {
		await composePage.sendNow();
	});
});
