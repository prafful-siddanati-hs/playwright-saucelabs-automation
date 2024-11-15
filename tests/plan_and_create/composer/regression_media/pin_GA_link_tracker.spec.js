//This test is to validate the pinterest preview for GA link settings
const { test, expect} = require('@playwright/test');
const tearDown = require('../../../../custom-commands/tearDown');
const { LoginPage } = require('../../../../pages/login');
const {PinPage} = require('../../../../pages/planandcreate/pin');
const {LinkSettingsModal} = require('../../../../pages/planandcreate/linkSettingsModal');
const getFixture = require('../../../../custom-commands/getFixture');
const { ComposePage } = require('../../../../pages/planandcreate/compose');

const URL = 'hootsuite.com';
const TRACKER = 'Google Analytics';

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Pinterest preview validations for google analytics link settings', async ({ page }) => {
	const pinText = `GA ${URL} `;
	const loginPage = new LoginPage(page);
	const linkSettingsModal = new LinkSettingsModal(page);
	const addFixture = new getFixture();
	const pinPage = new PinPage(page);
	const composePage = new ComposePage(page);

	await test.step('Setup user & accounts', async () => {
		await addFixture.command('pin_ga_tracker', 'enterprise_user_composer', true, 300);
	});

	await test.step('Login as enterprise user', async () => {
		await loginPage.signInSkipOnboarding('pin_ga_tracker');
	});

	await test.step('Select pin button from global navigator', async () => {
		await pinPage.selectPinButton();
	});

	await test.step('Select first board from social network picker', async () => {
		await pinPage.selectFirstPinBoard();
	});

	await test.step('Upload an image', async () => {
		await pinPage.uploadImageFile('test_data/publisher/images');
	});

	await test.step('Write a pin message and website url', async () => {
		await pinPage.writePinMessage(pinText);
		await pinPage.writeWebsiteUrl('bbc.com');
	});

	await test.step('Verify pin preview', async () => {
		await pinPage.verifyPinPreview(pinText, 'bbc.com');
	});

	await test.step('Select add tracker button', async () => {
		await composePage.openLinkSettingsDialog();
		await linkSettingsModal.verifyLinkSettingsModal();
	});

	await test.step('Add a tracker for link',async () => {
		await linkSettingsModal.selectCustomizeButton();
		await linkSettingsModal.selectLinkSettingsTrackerDropDown();
		await linkSettingsModal.selectTracker(TRACKER);
		await linkSettingsModal.setLinkTrackingParameter(2, 'Social Network');
		await linkSettingsModal.setLinkTrackingParameter(3, 'Social Profile');
		await linkSettingsModal.setLinkTrackingParameter(4, 'Post ID');
		await linkSettingsModal.setLinkTrackingParameter(5, 'Custom', 'test1');
	});

	await test.step('Verify & apply the tracking parameter', async () => {
		const exampleURL = page.getByTestId('LinkPreviewWithUTM');
		await expect(exampleURL).toContainText('hootsuite.com?utm_source=hootsuite&utm_medium=twitter&utm_term=edt2&utm_content=271723&utm_campaign=test1');
		await linkSettingsModal.selectLinkSettingsApplyButton();
		await page.waitForTimeout(5000);
	});

	await test.step('Verify composer preview after applying tracking parameters', async () => {
		await expect(composePage.editCustomLinkSettingsButton).toBeVisible();
		await expect(pinPage.previewDescription).toContainText('http://hootsuite.com?utm_source=hootsuite&utm_medium=pinterest');
	});
});
