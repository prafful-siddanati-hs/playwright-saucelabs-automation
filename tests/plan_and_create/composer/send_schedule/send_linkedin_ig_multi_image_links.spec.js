/* Test to validate and send post with text, links & mulitple images to LinkedIn & Instagram */
const { test, expect} = require('@playwright/test');
const tearDown = require('../../../../custom-commands/tearDown');
const {ComposePage} = require('../../../../pages/planandcreate/compose');
const {getObjectByName, plan_create} = require('../../../../globals');
const {LoginPage} = require('../../../../pages/login');
const getFixture = require('../../../../custom-commands/getFixture');

let liAccount, igbAccount;
const SHORTENER = 'https://ow.ly';

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Send LinkedIn & IG post with text and multiple images', async ({ page }) => {
	const sendText = `Post now LinkedIn & IG with multiple images & ${plan_create.getRandomUrl()} ` + Math.floor(Math.random() * 1000);

	const addFixture = new getFixture();
	const loginPage = new LoginPage(page);
	const composePage = new ComposePage(page);

	await test.step('Setup user & accounts', async () => {
		await addFixture.command('li_ig_send_multiple_images', 'pro_user_composer', true, 300);
		liAccount = getObjectByName(global.fixture, 'li_ig_send_multiple_images').linkedinProfile.username;
		igbAccount = getObjectByName(global.fixture, 'li_ig_send_multiple_images').instagramBusiness.username;
	});

	await test.step('Login as pro user', async () => {
		await loginPage.signIn('li_ig_send_multiple_images');
	});

	await test.step('Select compose button', async () => {
		await composePage.selectComposeButton();
	});

	await test.step(`Select ${liAccount} & ${igbAccount} from social network picker`, async () => {
		await composePage.profileDropDown.click();
		await expect(composePage.snContentItems).toBeVisible();
		await composePage.selectSocialProfile(liAccount);
		await composePage.selectSocialProfile(igbAccount);
		await composePage.postToWrapper.click();
		await expect(composePage.profileListItemTitle).not.toBeVisible();
		await expect(composePage.emptyLinkedInPreview).toBeVisible();
		await expect(composePage.emptyInstagramPreview).toBeVisible();
	});

	await test.step('Upload 2 images to LinkedIn', async () => {
		await expect(composePage.linkedInTab).toBeVisible();
		await composePage.linkedInTab.click();
		await composePage.uploadMediaFile('test_data/publisher/images', '', 2);
	});

	await test.step('Verify validation error is shown when only images are added', async () => {
		await expect(composePage.postNowButton).toBeVisible();
		await composePage.postNowButton.click();
		await expect(composePage.composeTextAreaErrorTitle).toBeVisible();
		await expect(composePage.linkedInEmptyTextAreaErrorDescription).toBeVisible();
	});

	await test.step('Write a message and verify preview & validation', async () => {
		await composePage.writeMessage(sendText);
		await composePage.verifyLinkedInPreview(sendText);
		await expect(composePage.composeTextAreaErrorTitle).not.toBeVisible();
		await expect(composePage.linkedInEmptyTextAreaErrorDescription).not.toBeVisible();
	});

	await test.step('Shorten the link and verify the preview', async () => {
		await composePage.selectShortenWithOwlyButton();
		await composePage.verifyLinkedInPreview(SHORTENER);
		await expect(composePage.clearOwlyShorteningButton).toBeVisible();
	});

	await test.step('Add only text to Instagram', async () => {
		await expect(composePage.instagramTab).toBeVisible();
		await composePage.instagramTab.click();
		await composePage.writeMessage(sendText);
		await composePage.verifyInstagramPreview(sendText);
	});

	await test.step('Verify validation error', async () => {
		await expect(composePage.composeMediaAreaErrorTitle).toBeVisible();
		await expect(composePage.instagramEmptyMediaAreaErrorDescription).toBeVisible();
	});

	await test.step('Upload 2 images to Instagram', async () => {
		await composePage.uploadMediaFile('test_data/publisher/images', '', 2);
		await expect(composePage.composeMediaAreaErrorTitle).not.toBeVisible();
		await expect(composePage.instagramEmptyMediaAreaErrorDescription).not.toBeVisible();
	});

	await test.step('Shorten the link and verify preview for instagram', async () => {
		await composePage.selectShortenWithOwlyButton();
		await composePage.verifyLinkInInstagramPreview(SHORTENER);
		await expect(composePage.clearOwlyShorteningButton).toBeVisible();
	});

	await test.step('Send the post', async () => {
		await composePage.sendNow();
	});
});
