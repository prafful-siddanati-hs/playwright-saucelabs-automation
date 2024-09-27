/* Test verifies sending a post with only media (Image, GIF) and no text to all social networks. */
const { test, expect} = require('@playwright/test');
const tearDown = require('../../../../custom-commands/tearDown');
const {ComposePage} = require('../../../../pages/planandcreate/compose');
const { getObjectByName } = require('../../../../globals');
const {LoginPage} = require('../../../../pages/login');
const getFixture = require('../../../../custom-commands/getFixture');

let liAccount, igbAccount, twAccount, fbAccount;
test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Send media only post to all social networks', async ({ page }) => {
	const addFixture = new getFixture();
	const loginPage = new LoginPage(page);
	const composePage = new ComposePage(page);

	await test.step('Setup user & accounts', async () => {
		await addFixture.command('all_sn_media_only', 'pro_user_composer', true, 300);
		liAccount = getObjectByName(global.fixture, 'all_sn_media_only').linkedinProfile.username;
		igbAccount = getObjectByName(global.fixture, 'all_sn_media_only').instagramBusiness.username;
		twAccount = getObjectByName(global.fixture, 'all_sn_media_only').twitter.username;
		fbAccount = getObjectByName(global.fixture, 'all_sn_media_only').facebookPage.username;
	});

	await test.step('Login as pro user', async () => {
		await loginPage.signIn('all_sn_media_only');
	});

	await test.step('Select compose button', async () => {
		await composePage.selectComposeButton();
	});

	await test.step(`Select ${liAccount}, ${igbAccount}, ${twAccount} & ${fbAccount} social networks`, async () => {
		await composePage.profileDropDown.click();
		await expect(composePage.snContentItems).toBeVisible();
		await composePage.selectSocialProfile(liAccount);
		await composePage.selectSocialProfile(igbAccount);
		await composePage.selectSocialProfile(twAccount);
		await composePage.selectSocialProfile(fbAccount);
		await composePage.postToWrapper.click();
		await expect(composePage.profileListItemTitle).not.toBeVisible();
		await expect(composePage.emptyLinkedInPreview).toBeVisible();
		await expect(composePage.emptyInstagramPreview).toBeVisible();
		await expect(composePage.emptyTwitterPreview).toBeVisible();
		await expect(composePage.emptyFacebookPreview).toBeVisible();
	});

	await test.step('Attach different media files', async () => {
		await composePage.uploadMediaFile('test_data/publisher/images', '', 3);
		await composePage.uploadMediaFile('test_data/publisher/giphy', 'test_data/publisher/giphy/stay_cool.gif', 1);
	});

	await test.step('Verify and adjust media for twitter', async () => {
		await expect(composePage.twitterTab).toBeVisible();
		await composePage.twitterTab.click();
		await expect(composePage.imagePublishLimit).toHaveText('errorYou can\'t add a GIF and other image typesTwitter only supports attaching a GIF or still images, not both.');
		await expect(page.getByLabel('stay_cool.gif').getByLabel('Remove item')).toBeVisible();
		await page.getByLabel('stay_cool.gif').getByLabel('Remove item').click(); //Remove only the GIF file
		await expect(composePage.imagePublishLimit).not.toBeVisible();
	});

	await test.step('Add text only for LinkedIn', async () => {
		await expect(composePage.linkedInTab).toBeVisible();
		await composePage.linkedInTab.click();
		await composePage.writeMessage('Text only for LinkedIn');
		await composePage.verifyLinkedInPreview('Text only for LinkedIn');
	});

	await test.step('Send the post', async () => {
		await composePage.sendNow();
	});
});
