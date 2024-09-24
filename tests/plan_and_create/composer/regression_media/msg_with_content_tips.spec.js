const { test, expect} = require('@playwright/test');
const tearDown = require('../../../../custom-commands/tearDown');
const getFixture = require('../../../../custom-commands/getFixture');
const { LoginPage } = require('../../../../pages/login');
const { getObjectByName } = require('../../../../globals');
const { ComposePage } = require('../../../../pages/planandcreate/compose');
let fbAccount, twAccount, liAccount , igbAccount;

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Compose message with content tips', async ({ page }) => {
	const composeBasicText = 'We have new content suggestion tips for your message using our AI model. #DigitalMarketing #ContentStrategy #AIContent https://www.honda.ca 😀📊';
	const addFixture = new getFixture();
	const loginPage = new LoginPage(page);
	const composePage = new ComposePage(page);

	await test.step('Setup user & accounts', async () => {
		await addFixture.command('composer_basic', 'pro_user_composer', true, 300);
		twAccount = getObjectByName(global.fixture, 'composer_basic').twitter.username;
		fbAccount = getObjectByName(global.fixture, 'composer_basic').facebookPage.username;
		liAccount = getObjectByName(global.fixture, 'composer_basic').linkedinProfile.username;
		igbAccount = getObjectByName(global.fixture, 'composer_basic').instagramBusiness.username;
	});

	await test.step('Login as pro user', async () => {
		await loginPage.signIn('composer_basic');
	});

	await test.step('Open composer', async () => {
		await composePage.selectComposeButton();
	});

	await test.step('Select facebook & twitter account', async () => {
		await composePage.profileDropDown.click();
		await expect(composePage.snContentItems).toBeVisible();
		await composePage.selectSocialProfile(twAccount);
		await composePage.selectSocialProfile(fbAccount);
		await composePage.selectSocialProfile(liAccount);
		await composePage.selectSocialProfile(igbAccount);
		await composePage.postToWrapper.click();
		await expect(composePage.profileListItemTitle).not.toBeVisible();
		await expect(composePage.emptyTwitterPreview).toBeVisible();
		await expect(composePage.emptyFacebookPreview).toBeVisible();
		await expect(composePage.emptyLinkedInPreview).toBeVisible();
		await expect(composePage.emptyInstagramPreview).toBeVisible();
	});

	await test.step('Write a message', async () => {
		await composePage.writeMessage(composeBasicText);
		await composePage.verifyTwitterPreview(composeBasicText);
		await composePage.verifyFacebookPreview(composeBasicText);
		await composePage.verifyLinkedInPreview(composeBasicText);
		await composePage.verifyInstagramPreview(composeBasicText);
		await page.waitForTimeout(2000);
	});

	await test.step('Verify AI content tips for facebook tab', async () => {
		await expect(composePage.facebookPageTab).toBeVisible();
		await composePage.facebookPageTab.click();
		await composePage.verifyFacebookPreview(composeBasicText);
		await composePage.selectAIContentTipButton();
		await composePage.verifyFBAIContentTips();
		await composePage.closeAIContentTips();
	});

	await test.step('Verify AI content tips for twitter tab', async () => {
		await expect(composePage.twitterTab).toBeVisible();
		await composePage.twitterTab.click();
		await composePage.verifyTwitterPreview(composeBasicText);
		await composePage.selectAIContentTipButton();
		await composePage.verifyTWAIContentTips();
		await composePage.closeAIContentTips();
	});

	await test.step('Verify AI content tips for linkedin tab', async () => {
		await expect(composePage.linkedInTab).toBeVisible();
		await composePage.linkedInTab.click();
		await composePage.verifyLinkedInPreview(composeBasicText);
		await composePage.selectAIContentTipButton();
		await composePage.verifyLIAIContentTips();
		await composePage.closeAIContentTips();
	});

	await test.step('Verify AI content tips for instagram tab', async () => {
		await expect(composePage.instagramTab).toBeVisible();
		await composePage.instagramTab.click();
		await composePage.verifyInstagramPreview(composeBasicText);
		await composePage.selectAIContentTipButton();
		await composePage.verifyIGBAIContentTips();
	});
});
