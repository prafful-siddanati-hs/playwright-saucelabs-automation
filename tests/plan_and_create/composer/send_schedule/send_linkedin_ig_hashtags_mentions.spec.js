/* Test to send a post with a mix of hashtags & mentions to LinkedIn & Instagram */
const { test, expect} = require('@playwright/test');
const tearDown = require('../../../../custom-commands/tearDown');
const {ComposePage} = require('../../../../pages/planandcreate/compose');
const { getObjectByName } = require('../../../../globals');
const {LoginPage} = require('../../../../pages/login');
const getFixture = require('../../../../custom-commands/getFixture');

let liAccount, igbAccount;

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Send linkedin & IG post with hashtags & mentions', async ({ page }) => {
	const sendText = 'Want to streamline your social media management? Try Hootsuite today!📝 #SocialMedia #Management';
	const mentionName = 'Hootsuite';

	const addFixture = new getFixture();
	const loginPage = new LoginPage(page);
	const composePage = new ComposePage(page);

	await test.step('Setup user & accounts', async () => {
		await addFixture.command('li_ig_send_hashtags_mentions', 'pro_user_composer', true, 300);
		liAccount = getObjectByName(global.fixture, 'li_ig_send_hashtags_mentions').linkedinProfile.username;
		igbAccount = getObjectByName(global.fixture, 'li_ig_send_hashtags_mentions').instagramBusiness.username;
	});

	await test.step('Login as pro user', async () => {
		await loginPage.signIn('li_ig_send_hashtags_mentions');
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

	await test.step('Attach a media file', async () => {
		await composePage.uploadMediaFile('test_data/publisher/images','test_data/publisher/images/Laptop.png');
	});

	await test.step('Write a message with hashtags & mentions', async () => {
		await expect(composePage.linkedInTab).toBeVisible();
		await composePage.linkedInTab.click();
		await composePage.writeMessage(`${sendText} @${mentionName} `);
		await composePage.verifyLinkedInPreview(`${sendText} @${mentionName}`);
	});

	await test.step('Select and link the mention', async () => {
		await composePage.selectMention(mentionName);
		await composePage.verifyLinkedInMentionPreview(mentionName);
	});

	await test.step('Switch to Instagram & write a message', async () => {
		await expect(composePage.instagramTab).toBeVisible();
		await composePage.instagramTab.click();
		await composePage.writeMessage(`${sendText} @${mentionName}`);
		await composePage.verifyInstagramPreview(`${sendText} @${mentionName}`);
		await expect(page.locator('//*[@aria-labelledby="message-tab-bar-instagram"]//*[@role="alert"]//p')).toHaveText('Instagram mentions will be linked when the post is published to Instagram.');
	});

	await test.step('Send the post', async () => {
		await composePage.sendNow();
	});
});
