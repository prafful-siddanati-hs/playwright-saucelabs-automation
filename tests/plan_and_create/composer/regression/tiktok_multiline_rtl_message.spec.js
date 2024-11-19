/* Test to verify multliline and RTL previews for a Tiktok post */
const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../../../../pages/login.js');
const { ComposePage } = require('../../../../pages/planandcreate/compose.js');
const getFixture = require('../../../../custom-commands/getFixture.js');
const tearDown = require('../../../../custom-commands/tearDown.js');
const { plan_create } = require('../../../../globals.js');
let tiktokProfile = 'testharp';

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Verify composer message editor for Tiktok with multi line and RTL', async ({ page }) => {
	const multiLineMsg = `This is a multi line test message with URL and hashtag and ${plan_create.getRandomEmoji()} ${plan_create.getRandomLanguageHashtag()}.

    This is useful for testing
    how messages are displayed across multiple lines.

        Ensure that all lines are preserved and formatted correctly. ${plan_create.getRandomUrl()} #test #multiline`;

	const mixedMessage = `✨ This is sample Hebrew text to verify if Tiktok profile in Hootsuite can display correct preview for this text 🎉 #rtl #preview

    זהו טקסט לדוגמה בעברית כדי לוודא אם פרופיל הטיקטוק ב-Hootsuite יכול להציג תצוגה מקדימה נכונה עבור הטקסט הזה #rtl #preview`;

	const oneLineRtlMessage = '✡️ זהו טקסט לדוגמה בעברית שנכתב מימין לשמאל, זה יוודא אם פרופיל הטיקטוק ב-Hootsuite יכול להציג תצוגה מקדימה נכונה עבור סוג זה של טקסט. #rtl #תצוגה מקדימה';

	const addFixture = new getFixture();
	const loginPage = new LoginPage(page);
	const composePage = new ComposePage(page);

	await test.step('Setup user & accounts', async () => {
		await addFixture.command('tiktok_multiline_rtl', 'linkedin_enterprise', true, 300);
	});

	await test.step('Login as test user', async () => {
		await loginPage.signIn('tiktok_multiline_rtl');
	});

	await test.step('Open composer', async () => {
		await composePage.selectComposeButton();
	});

	await test.step('Select Tiktok account from profile picker', async () => {
		await composePage.profileDropDown.hover();
		await composePage.profileDropDown.click();
		await expect(composePage.snContentItems).toBeVisible();
		await composePage.selectSocialProfile(tiktokProfile);
		await expect(composePage.postToWrapper).toBeVisible();
		await composePage.postToWrapper.click();
		await expect(composePage.profileListItemTitle).not.toBeVisible();
		await expect(composePage.emptyTiktokPreview).toBeVisible();
	});

	await test.step('Upload a video', async () => {
		await composePage.uploadMediaFile('test_data/publisher/videos');
		await expect(composePage.tiktokVideoPreview).toBeVisible();
	});

	await test.step('Enter multi line message', async () => {
		await composePage.writeMessage(multiLineMsg);
		await composePage.verifyTiktokPreview(multiLineMsg);
		await composePage.clearMessageEditor();
	});

	await test.step('Enter mixed message', async () => {
		await composePage.writeMessage(mixedMessage);
		await composePage.verifyTiktokPreview(mixedMessage);
		await composePage.clearMessageEditor();
	});

	await test.step('Enter one line right to left message', async () => {
		await composePage.writeMessage(oneLineRtlMessage);
		await composePage.verifyTiktokPreview(oneLineRtlMessage);
	});
});
