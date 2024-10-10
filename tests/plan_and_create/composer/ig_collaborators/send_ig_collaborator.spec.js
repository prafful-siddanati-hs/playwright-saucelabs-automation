/* Test to send an Instagram post with collaborator */

const { test, expect} = require('@playwright/test');
const tearDown = require('../../../../custom-commands/tearDown');
const {ComposePage} = require('../../../../pages/planandcreate/compose');
const {getObjectByName, plan_create} = require('../../../../globals');
const {LoginPage} = require('../../../../pages/login');
const getFixture = require('../../../../custom-commands/getFixture');

let igbProfile, igbCollaborator;

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Send instagram message with collaborator', async ({ page }) => {
	const sendText = 'Send IGB with collaborator ' + Math.floor(Math.random() * 1000);

	const addFixture = new getFixture();
	const loginPage = new LoginPage(page);
	const composePage = new ComposePage(page);

	await test.step('Setup user & accounts', async () => {
		await addFixture.command('igb_collaborator_send', 'pro_user_composer', true, 300);
		igbProfile = getObjectByName(global.fixture, 'igb_collaborator_send').instagramBusiness.username;

		do { // Ensure collaborator is different from profile
			igbCollaborator = plan_create.getInstagramBusinessCollaborator();
		} while (igbCollaborator === igbProfile);
	});

	await test.step('Login as pro user', async () => {
		await loginPage.signIn('igb_collaborator_send');
	});

	await test.step('Select compose button', async () => {
		await composePage.selectComposeButton();
	});

	await test.step('Select IGB account from social network picker', async () => {
		await composePage.profileDropDown.click();
		await expect(composePage.snContentItems).toBeVisible();
		await composePage.selectSocialProfile(igbProfile);
		await composePage.postToWrapper.click();
		await expect(composePage.profileListItemTitle).not.toBeVisible();
		await expect(composePage.emptyInstagramPreview).toBeVisible();
	});

	await test.step('Write a message and verify its preview', async () => {
		await composePage.writeMessage(sendText);
		await composePage.verifyInstagramPreview(sendText);
	});

	await test.step('Upload media to the post', async () => {
		await composePage.uploadMediaFile('test_data/publisher/images');
		await expect(composePage.mediaOverLay).toBeVisible();
	});

	await test.step('Add collaborator to message', async () => {
		await expect(composePage.inputCollaborators).toBeVisible();
		await composePage.inputCollaborators.pressSequentially(igbCollaborator);
		await composePage.inputCollaborators.press('Enter');
		await expect(composePage.collaboratorPill).toHaveText(igbCollaborator);
	});

	await test.step('Verify collaborator in preview', async () => {
		await composePage.verifyInstagramPreview(sendText);
		await expect(composePage.instagramPreviewHeaderName).toHaveText(`${igbProfile} and ${igbCollaborator}`);
	});

	await test.step('Send message to instagram with collaborator', async () => {
		await composePage.sendNow();
	});
});
