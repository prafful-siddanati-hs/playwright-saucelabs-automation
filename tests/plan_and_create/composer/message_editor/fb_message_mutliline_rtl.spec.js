/* Test to verify multliline and RTL previews for a Facebook page post */
const { test, expect} = require('@playwright/test');
const tearDown = require('../../../../custom-commands/tearDown');
const { LoginPage } = require('../../../../pages/login');
const { ComposePage } = require('../../../../pages/planandcreate/compose');
const getFixture = require('../../../../custom-commands/getFixture');
const {getObjectByName, plan_create} = require('../../../../globals');

let fbAccount;

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Verify composer message editor for twitter with multi line and RTL', async ({ page }) => {
	const superLongText = `${plan_create.generateRandomMessage('Super long text for facebook ',63206)}`;

	const multiLineMsg = `${plan_create.getRandomUrl()} ${plan_create.getRandomHashTag()} This is a multi line test message with URL and hashtag.

    This is useful for testing
    how messages are displayed across multiple lines.
    
        Ensure that all lines are preserved and formatted correctly.`;

	const mixedMessage = `This is sample Hebrew text to verify if facebook profile in Hootsuite can display correct preview for this text #rtl #preview
    
    זהו טקסט לדוגמה בעברית כדי לוודא אם פרופיל הטוויטר ב-Hootsuite יכול להציג תצוגה מקדימה נכונה עבור הטקסט הזה #rtl #preview`;

	const oneLineRtlMessage = 'זהו טקסט לדוגמה בעברית שנכתב מימין לשמאל, זה יוודא אם פרופיל הטוויטר ב-Hootsuite יכול להציג תצוגה מקדימה נכונה עבור סוג זה של טקסט. #rtl #תצוגה מקדימה';

	const addFixture = new getFixture();
	const loginPage = new LoginPage(page);
	const composePage = new ComposePage(page);

	await test.step('Setup user & accounts', async () => {
		await addFixture.command('fb_multiline_rtl', 'pro_user_composer', true, 300);
		fbAccount = getObjectByName(global.fixture, 'fb_multiline_rtl').facebookPage.username;
	});

	await test.step('Login as test user', async () => {
		await loginPage.signInAsProUser('fb_multiline_rtl');
	});

	await test.step('Open composer', async () => {
		await composePage.selectComposeButton();
	});

	await test.step('Select facebook account from profile picker', async () => {
		await composePage.profileDropDown.hover();
		await composePage.profileDropDown.click();
		await expect(composePage.snContentItems).toBeVisible();
		await composePage.selectSocialProfile(fbAccount);
		await expect(composePage.postToWrapper).toBeVisible();
		await composePage.postToWrapper.click();
		await expect(composePage.profileListItemTitle).not.toBeVisible();
		await expect(composePage.emptyFacebookPreview).toBeVisible();
	});

	await test.step('Enter multi line message', async () => {
		await composePage.writeMessage(multiLineMsg);
		await composePage.verifyFacebookPreview(multiLineMsg);
		await composePage.clearMessageEditor();
	});

	await test.step('Enter mixed message', async () => {
		await composePage.writeMessage(mixedMessage);
		await composePage.verifyFacebookPreview(mixedMessage);
		await composePage.clearMessageEditor();
	});

	await test.step('Enter one line right to left message', async () => {
		await composePage.writeMessage(oneLineRtlMessage);
		await composePage.verifyFacebookPreview(oneLineRtlMessage);
	});
});
