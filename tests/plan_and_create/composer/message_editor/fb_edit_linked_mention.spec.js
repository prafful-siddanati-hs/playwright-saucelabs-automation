/* Test to edit an existing mention and link a new one for facebook page */
const { test, expect } = require('@playwright/test');
const getFixture = require('../../../../custom-commands/getFixture');
const tearDown = require('../../../../custom-commands/tearDown');
const { LoginPage } = require('../../../../pages/login');
const { ComposePage } = require('../../../../pages/planandcreate/compose');
const {PlannerPage} = require('../../../../pages/planandcreate/planner');
const { getObjectByName, plan_create } = require('../../../../globals');

let fbAccount;

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Edit an existing mention and link a new one for facebook page', async ({ page }) => {
	const initialMention = plan_create.getFaceBookPageMention();
	const scheduleText = `Unlink this mention ${plan_create.getRandomUrl()} ${plan_create.getRandomHashTag()} ${plan_create.getRandomUrl()} and link a new one `;
	let newMention, secondMention;
	do { // Ensure new mention is different from initial mention
		newMention = plan_create.getFaceBookPageMention();
	} while (newMention === initialMention);

	do { // Ensure second mention is different from initial mention & new mention
		secondMention = plan_create.getFaceBookPageMention();
	} while (secondMention === initialMention || secondMention === newMention);

	const addFixture = new getFixture();
	const loginPage = new LoginPage(page);
	const composePage = new ComposePage(page);
	const plannerPage = new PlannerPage(page);

	await test.step('Setup user & accounts', async () => {
		await addFixture.command('fb_edit_linked_mention', 'plan_create_facebookpage_mentions', true, 300);
		fbAccount = getObjectByName(global.fixture, 'fb_edit_linked_mention').facebookPage.username;
	});

	await test.step('Login as pro user', async () => {
		await loginPage.signInAsProUser('fb_edit_linked_mention');
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

	await test.step('Write a message with mention', async () => {
		await composePage.writeMessage(`${scheduleText}@${initialMention}`);
		await composePage.verifyFacebookPreview(`${scheduleText}@${initialMention}`);
	});

	await test.step('Select and link the mention', async () => {
		await composePage.selectMention(initialMention);
		await composePage.verifyFacebookMentionPreview(initialMention);
	});

	await test.step('Schedule the message', async () => {
		await composePage.schedule();
	});

	await test.step('Verify linked mention in planner preview pane', async () => {
		await expect(composePage.feCallOuts).not.toBeVisible();
		await plannerPage.verifyFacebookMentionInPreviewPane(initialMention);
	});

	await test.step('Open the scheduled message for editing', async () => {
		await plannerPage.editFromPreviewPane();
	});

	await test.step('Edit by updating the linked mention', async () => {
		await composePage.removeCharacters(initialMention.length + 1);
		await composePage.writeMessage(`@${newMention} `);
		await page.waitForTimeout(1000);
		await composePage.selectMention(newMention);
		await composePage.verifyFacebookMentionPreview(newMention);
	});

	await test.step('Add a second mention', async () => {
		await composePage.writeMessage(` @${secondMention} `);
		await page.waitForTimeout(1000);
		await composePage.selectMention(secondMention);
		await expect(composePage.facebookMentionLink).toHaveCount(2);
	});

	await test.step('Save the edited message', async () => {
		await composePage.saveEditedMessage();
	});

	await test.step('Verify message has updated linked mention in preview pane', async () => {
		await expect(composePage.feCallOuts).not.toBeVisible();
		await expect(plannerPage.facebookMentionLink).toHaveCount(2);
	});

	await test.step('Delete the scheduled message', async () => {
		await plannerPage.deleteFromPreviewPane();
	});
});
