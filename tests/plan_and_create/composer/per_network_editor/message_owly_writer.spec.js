//This test is to compose message using owly writer and verify the message preview
const { test, expect } = require('@playwright/test');
const getFixture = require('../../../../custom-commands/getFixture');
const tearDown = require('../../../../custom-commands/tearDown');
const { LoginPage } = require('../../../../pages/login');
const { ComposePage } = require('../../../../pages/planandcreate/compose');
const { getObjectByName} = require('../../../../globals');
let twAccount, updatedMessage;

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Verify creating message using owly writer AI on composer', async ({ page }) => {
	const composeText = 'Hootsuite Canada';
	const addFixture = new getFixture();
	const loginPage = new LoginPage(page);
	const composePage = new ComposePage(page);

	await test.step('Setup user & account', async () => {
		await addFixture.command('owly_writer', 'pro_user_composer', true, 300);
		twAccount = getObjectByName(global.fixture, 'owly_writer').twitter.username;
	});

	await test.step('Login as pro user', async () => {
		await loginPage.signIn('owly_writer');
	});

	await test.step('Select compose button', async () => {
		await composePage.selectComposeButton();
	});

	await test.step('Select twitter account from social network picker', async () => {
		await composePage.profileDropDown.click();
		await expect(composePage.snContentItems).toBeVisible();
		await composePage.selectSocialProfile(twAccount);
		await composePage.postToWrapper.click();
		await expect(composePage.profileListItemTitle).not.toBeVisible();
		await expect(composePage.emptyTwitterPreview).toBeVisible();
	});

	await test.step('Verify composer preview after selecting profiles', async () => {
		await composePage.writeMessage(composeText);
		await composePage.verifyTwitterPreview(composeText);
	});

	await test.step('Update compose message using owly writer AI', async () => {
		await expect(composePage.OwlyWriterAI).toBeVisible();
		await composePage.OwlyWriterAI.click();
		await expect(composePage.optimizeLength).toBeVisible();
		await composePage.optimizeLength.click();
		updatedMessage = await composePage.aiContent.textContent();
		await expect(composePage.UseThisContentButton).toBeVisible();
		await composePage.UseThisContentButton.click();
		await expect(composePage.closeAIPanel).toBeVisible();
		await composePage.closeAIPanel.click();
	});

	await test.step('Verify updated message preview after using owly writer AI', async () => {
		await composePage.verifyTwitterPreview(updatedMessage);
		await expect(composePage.messageArea,).toContainText(updatedMessage);
	});
});
