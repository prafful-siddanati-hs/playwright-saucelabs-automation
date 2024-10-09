/* Test to verify that alt-text character limit is always set to the lowest acceptable count when multiple networks are selected */
const {test, expect} = require('@playwright/test');
const tearDown = require('../../../../custom-commands/tearDown');
const getFixture = require('../../../../custom-commands/getFixture');
const { LoginPage } = require('../../../../pages/login');
const { getObjectByName } = require('../../../../globals');
const { ComposePage } = require('../../../../pages/planandcreate/compose');

let fbAccount, twAccount, liAccount;

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Ensure alt-text character limit is set based on selected networks', async ({page}) => {
	const fixture = new getFixture();
	const loginPage = new LoginPage(page);
	const composePage = new ComposePage(page);

	await test.step('Setup user & accounts', async () => {
		await fixture.command('alt_text_char_limit', 'pro_user_composer', true, 300);
		fbAccount = getObjectByName(global.fixture, 'alt_text_char_limit').facebookPage.username;
		twAccount = getObjectByName(global.fixture, 'alt_text_char_limit').twitter.username;
		liAccount = getObjectByName(global.fixture, 'alt_text_char_limit').linkedinProfile.username;
	});

	await test.step('Log in as pro user', async () => {
		await loginPage.signIn('alt_text_char_limit');
	});

	await test.step('Click on new compose button', async () => {
		await composePage.selectComposeButton();
	});

	await test.step(`Select ${liAccount} from social networks dropdown`, async () => {
		await composePage.profileDropDown.click();
		await expect(composePage.snContentItems).toBeVisible();
		await composePage.selectSocialProfile(liAccount);
		await composePage.postToWrapper.click();
		await expect(composePage.profileListItemTitle).not.toBeVisible();
		await expect(composePage.emptyLinkedInPreview).toBeVisible();
	});

	await test.step('Upload an image file', async () => {
		await composePage.uploadMediaFile('test_data/publisher/images', 'test_data/publisher/images/Desert.png');
		await expect(composePage.linkedInPreviewSingleImage, 'LinkedIn preview is updated with image').toBeVisible();
		await expect(composePage.linkedInPreviewSingleImage).toHaveAttribute('src', /staging/);
		await composePage.verifyLinkedInImagePreview();
	});

	await test.step('Verify alt-text character limit for LinkedIn', async () => {
		await page.getByLabel('Desert.png').hover();
		await expect(composePage.altTextButton).toBeVisible();
		await page.waitForTimeout(500);
		await composePage.altTextButton.click();
		await expect(composePage.altTextCharLimit).toBeVisible();
		await expect(composePage.altTextCharLimit).toHaveText('0 / 4086 characters');
		await expect(composePage.altTextDialogCloseButton).toBeVisible();
		await composePage.altTextDialogCloseButton.click();
	});

	await test.step(`Select ${twAccount} from social networks dropdown`, async () => {
		await composePage.profileDropDown.click();
		await expect(composePage.snContentItems).toBeVisible();
		await composePage.selectSocialProfile(twAccount);
		await composePage.postToWrapper.click();
		await expect(composePage.profileListItemTitle).not.toBeVisible();
		await expect(composePage.emptyTwitterPreview).toBeVisible();
	});

	await test.step('Ensure alt-text character limit is updated to 1000 characters after adding Twitter', async () => {
		await page.getByLabel('Desert.png').hover();
		await expect(composePage.altTextButton).toBeVisible();
		await page.waitForTimeout(1000);
		await composePage.altTextButton.click();
		await expect(composePage.altTextCharLimit).toBeVisible();
		await expect(composePage.altTextCharLimit).toHaveText('0 / 1000 characters');
		await expect(composePage.altTextDialogCloseButton).toBeVisible();
		await composePage.altTextDialogCloseButton.click();
	});

	await test.step(`Select ${fbAccount} from social networks dropdown`, async () => {
		await composePage.profileDropDown.click();
		await expect(composePage.snContentItems).toBeVisible();
		await composePage.selectSocialProfile(fbAccount);
		await composePage.postToWrapper.click();
		await expect(composePage.profileListItemTitle).not.toBeVisible();
		await expect(composePage.emptyFacebookPreview).toBeVisible();
	});

	await test.step('Ensure alt-text character limit is updated to 500 characters after adding Facebook', async () => {
		await page.getByLabel('Desert.png').hover();
		await expect(composePage.altTextButton).toBeVisible();
		await page.waitForTimeout(1000);
		await composePage.altTextButton.click();
		await expect(composePage.altTextCharLimit).toBeVisible();
		await expect(composePage.altTextCharLimit).toHaveText('0 / 500 characters');
	});

	await test.step('Enter alt-text and save', async () => {
		await composePage.writeAltText('Desert - alt text for LinkedIn, Twitter, and Facebook');
	});

	await test.step('Verify the alt-text is saved', async () => {
		await page.getByLabel('Desert.png').hover();
		await expect(composePage.altTextButton).toBeVisible();
		await page.waitForTimeout(1000);
		await composePage.altTextButton.click();
		await expect(composePage.altTextCharLimit).toHaveText('53 / 500 characters', { message: 'Alt-text character count is updated correctly' });
		await expect(composePage.altTextInputbox).toHaveText('Desert - alt text for LinkedIn, Twitter, and Facebook', { message: 'Alt-text is saved correctly' });
	});
});
