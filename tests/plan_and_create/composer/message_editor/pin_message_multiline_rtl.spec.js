//This test is to validate pinterest message with arabic and multi line text
const { test} = require('@playwright/test');
const tearDown = require('../../../../custom-commands/tearDown');
const { LoginPage } = require('../../../../pages/login');
const getFixture = require('../../../../custom-commands/getFixture');
const {plan_create} = require('../../../../globals');
const {PinPage} = require('../../../../pages/planandcreate/pin');

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Verify the pinterest message with multi line and RTL', async ({ page }) => {
	const multiLineMsg = `${plan_create.getRandomUrl()} ${plan_create.getRandomHashTag()} This is a multiline test message.

It includes several lines of text to verify
that the system handles multiline content
properly. This is useful for testing
how messages are displayed across multiple lines.

Ensure that all lines are preserved and formatted correctly.`;

	const ltrRtlMessage = `استعدوا لتجربة عالم من الثقافة والتنوع في معرض الخريف في البحرين، من 23 يناير إلى 1 فبراير 2025 ! من الحرف اليدوية الرائعة إلى المأكولات اللذيذة، هناك شيء لكل فرد ليستمتع! 🎉 لا تفوتوا هذا العرض المذهل للوحدة الدولية! ✨
Get ready to experience a world of culture and diversity at The Autumn Fair Show in Bahrain, from January 23 - February 1 2025! From gorgeous handicrafts to delectable cuisines, there's something for everyone to enjoy! 🎉 ✨
#تسوق_معنا #ا_لبحرين_للتسوق
#AutumnFair`;

	const ltrRtlOneLine =
    'استعدوا لتجربة عالم من الثقافة والتنوع في معرض الخريف في البحرين، من 23 يناير إلى 1 فبراير 2025 ! من الحرف اليدوية الرائعة إلى المأكولات اللذيذة، هناك شيء لكل فرد ليستمتع! 🎉 لا تفوتوا هذا العرض المذهل للوحدة الدولية! ✨Get ready to experience a world of culture and diversity at The Autumn Fair Show in Bahrain, from January 23 - February 1 2025! From gorgeous handicrafts to delectable cuisines 🎉 Don\'t miss out on this amazing display of international unity! ✨#تسوق_معنا #ا_لبحرين_للتسوق#AutumnFair #CulturalDiversity e';

	const addFixture = new getFixture();
	const loginPage = new LoginPage(page);
	const pinPage = new PinPage(page);

	await test.step('Setup user & accounts', async () => {
		await addFixture.command('pin_mes_char_limit', 'enterprise_user_composer', true, 300);
	});

	await test.step('Login as enterprise test user', async () => {
		await loginPage.signInSkipOnboarding('pin_mes_char_limit');
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
		await pinPage.writePinMessage(multiLineMsg);
		await pinPage.writeWebsiteUrl('bbc.com');
	});

	await test.step('Verify pin preview', async () => {
		await pinPage.verifyPinPreview(multiLineMsg, 'bbc.com');
	});

	await test.step('Write a RTL message and verify pinterest preview', async () => {
		await pinPage.clearMessageEditor();
		await pinPage.writePinMessage(ltrRtlMessage);
		await pinPage.verifyPinPreview(ltrRtlMessage, 'bbc.com');
		await page.waitForTimeout(500);
	});

	await test.step('Write a RTL message in one line and verify pinterest preview', async () => {
		await pinPage.clearMessageEditor();
		await pinPage.writePinMessage(ltrRtlOneLine);
		await pinPage.verifyPinPreview(ltrRtlOneLine, 'bbc.com');
	});

});
