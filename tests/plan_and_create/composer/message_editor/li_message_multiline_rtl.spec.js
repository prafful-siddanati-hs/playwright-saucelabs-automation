//This test is to validate linkedin message with arabic and multi line text
const { test, expect} = require('@playwright/test');
const tearDown = require('../../../../custom-commands/tearDown');
const { LoginPage } = require('../../../../pages/login');
const { ComposePage } = require('../../../../pages/planandcreate/compose');
const getFixture = require('../../../../custom-commands/getFixture');
const {getObjectByName, plan_create} = require('../../../../globals');

let liAccount;

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Verify the LinkedIn message character limit that are above and below the 3000-character threshold.', async ({ page }) => {
	const multiLineMsg = `${plan_create.getRandomUrl()} ${plan_create.getRandomHashTag()} This is a multiline test message.

It includes several lines of text to verify
that the system handles multiline content
properly. This is useful for testing
how messages are displayed across multiple lines.

Ensure that all lines are preserved and formatted correctly.`;

	const ltrRtlMessage = `استعدوا لتجربة عالم من الثقافة والتنوع في معرض الخريف في البحرين، من 23 يناير إلى 1 فبراير 2025 ! من الحرف اليدوية الرائعة إلى المأكولات اللذيذة، هناك شيء لكل فرد ليستمتع! 🎉 لا تفوتوا هذا العرض المذهل للوحدة الدولية! ✨
Get ready to experience a world of culture and diversity at The Autumn Fair Show in Bahrain, from January 23 - February 1 2025! From gorgeous handicrafts to delectable cuisines, there's something for everyone to enjoy! 🎉 Don't miss out on this amazing display of international unity! ✨
#تسوق_معنا #ا_لبحرين_للتسوق
#AutumnFair #CulturalDiversity #Bahrain #GlobalExperience`;

	const ltrRtlOneLine =
    'استعدوا لتجربة عالم من الثقافة والتنوع في معرض الخريف في البحرين، من 23 يناير إلى 1 فبراير 2025 ! من الحرف اليدوية الرائعة إلى المأكولات اللذيذة، هناك شيء لكل فرد ليستمتع! 🎉 لا تفوتوا هذا العرض المذهل للوحدة الدولية! ✨Get ready to experience a world of culture and diversity at The Autumn Fair Show in Bahrain, from January 23 - February 1 2025! From gorgeous handicrafts to delectable cuisines, there\'s something for everyone to enjoy! 🎉 Don\'t miss out on this amazing display of international unity! ✨#تسوق_معنا #ا_لبحرين_للتسوق#AutumnFair #CulturalDiversity #Bahrain #GlobalExperience';

	const addFixture = new getFixture();
	const loginPage = new LoginPage(page);
	const composePage = new ComposePage(page);

	await test.step('Setup user & accounts', async () => {
		await addFixture.command('li_msg_multi_line', 'pro_user_composer', true, 300);
		liAccount = getObjectByName(global.fixture, 'li_msg_multi_line').linkedinProfile.username;
	});

	await test.step('Login as pro test user', async () => {
		await loginPage.signInAsProUser('li_msg_multi_line');
	});

	await test.step('Open composer from global navigator', async () => {
		await composePage.selectComposeButton();
	});

	await test.step('Select linkedin account from profile picker', async () => {
		await composePage.profileDropDown.hover();
		await composePage.profileDropDown.click();
		await expect(composePage.snContentItems).toBeVisible();
		await composePage.selectSocialProfile(liAccount);
		await expect(composePage.postToWrapper).toBeVisible();
		await composePage.postToWrapper.click();
		await expect(composePage.profileListItemTitle).not.toBeVisible();
		await expect(page.locator('.vk-ComposerModal .vk-LinkedInPreview')).toBeVisible();
	});

	await test.step('Write a message and verify linkedin preview', async () => {
		await composePage.writeMessage(multiLineMsg);
		await composePage.verifyLinkedInPreview(multiLineMsg);
	});

	await test.step('Write a RTL message and verify linkedin preview', async () => {
		await composePage.clearMessageEditor();
		await composePage.writeMessage(ltrRtlMessage);
		await composePage.verifyLinkedInPreview(ltrRtlMessage);
	});

	await test.step('Write a RTL message in one line and verify linkedin preview', async () => {
		await composePage.clearMessageEditor();
		await composePage.writeMessage(ltrRtlOneLine);
		await composePage.verifyLinkedInPreview(ltrRtlOneLine);
	});

});
