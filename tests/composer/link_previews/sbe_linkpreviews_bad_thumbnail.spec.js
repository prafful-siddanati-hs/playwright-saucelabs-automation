/**
 * [https://hootsuite.atlassian.net/browse/SBE-5648]
 * [https://hootsuite.atlassian.net/browse/SBE-6234]
 * Test to verify that a link with bad thumbnail displays a warning in composer.
 */
const { test, expect} = require('@playwright/test');
const tearDown = require('../../../custom-commands/tearDown');
const getFixture = require('../../../custom-commands/getFixture');
const {getObjectByName} = require('../../../globals');
const { LoginPage } = require('../../../pages/login');
const { ComposePage } = require('../../../pages/planandcreate/compose');
let liAccount;

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Link containing bad thumbnail in composer', async ({ page }) => {
	const sbe_url = 'https://www.kijiji.ca/b-dogs-puppies/vancouver/c126l1700287';
	const composeText = `Bad thumbnail link ${sbe_url} `.concat(Math.floor(Math.random() * 1000));
	const addFixture = new getFixture();
	const loginPage = new LoginPage(page);
	const composePage = new ComposePage(page);

	await test.step('Setup user & accounts', async () => {
		await addFixture.command('pw_bad_thumbnail', 'enterprise_user_composer', true, 300);
		liAccount = getObjectByName(global.fixture, 'pw_bad_thumbnail').linkedinProfile.username;
	});

	await test.step('Login as enterprise user', async () => {
		await loginPage.signInSkipOnboarding('pw_bad_thumbnail');
	});

	await test.step('Select new compose button', async () => {
		await composePage.selectComposeButton();
	});

	await test.step('Select linkedin account from social network picker', async () => {
		await composePage.profileDropDown.click();
		await expect(composePage.snContentItems).toBeVisible();
		await composePage.selectSocialProfile(liAccount);
		await composePage.postToWrapper.click();
		await expect(composePage.profileListItemTitle).not.toBeVisible();
	});

	await test.step('Write a message', async () => {
		await composePage.writeMessage(composeText);
	});

	await page.pause();

	await test.step('Verify linkedin link preview', async () => {
		await composePage.verifyLinkedInPreview(composeText);
		await composePage.verifyLinkInLinkedinPagePreview(sbe_url);
		await expect(composePage.linkedinLinkPreviewTitle).toBeVisible();
		await expect(composePage.linkedinLinkPreviewSource).toHaveText(sbe_url);
	});

	await test.step('Verify bad thumbnail warning', async () => {
		await expect(composePage.badLinkThumbnailWarning).toBeVisible();
	});

	await test.step('Upload a custom thumbnail', async () => {
		await composePage.uploadMediaFile('test_data/publisher/images');
	});

	await test.step('Veriy thumbnail error is no longer displayed', async () => {
		await expect(composePage.badLinkThumbnailWarning).not.toBeVisible();
		await expect(composePage.linkedinLinkPreviewTitle).not.toBeVisible();
	});

	await test.step('Close composer', async () => {
		await composePage.closeComposer();
	});
});
