/* This test is to edit a linked mention with a new one for linkedin */
/* Test to edit an existing mention and link a new one for facebook page */
const { test, expect } = require('@playwright/test');
const getFixture = require('../../../../custom-commands/getFixture');
const tearDown = require('../../../../custom-commands/tearDown');
const { LoginPage } = require('../../../../pages/login');
const { ComposePage } = require('../../../../pages/planandcreate/compose');
const {PlannerPage} = require('../../../../pages/planandcreate/planner');
const { getObjectByName, plan_create } = require('../../../../globals');

let liAccount, memberId;

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Edit an existing mention and link two new ones for linkedin profile', async ({ page }) => {
	const initialMention = plan_create.getLinkedinMention();
	const scheduleText = `Unlink this mention  ${plan_create.getRandomUrl()} ${plan_create.getRandomHashTag()} ${plan_create.getRandomUrl()} and link a new one `;
	let newMention, secondMention;
	do { // Ensure new mention is different from initial mention
		newMention = plan_create.getLinkedinMention();
	} while (newMention === initialMention);

	do { // Ensure second mention is different from initial mention & new mention
		secondMention = plan_create.getLinkedinMention();
	} while (secondMention === initialMention || secondMention === newMention);

	const addFixture = new getFixture();
	const loginPage = new LoginPage(page);
	const composePage = new ComposePage(page);
	const plannerPage = new PlannerPage(page);

	await test.step('Setup user & accounts', async () => {
		await addFixture.command('li_edit_linked_mention', 'plan_create_facebookpage_mentions', true, 300);
		liAccount = getObjectByName(global.fixture, 'li_edit_linked_mention').linkedinProfile.username;
		memberId = global.member[0].memberId;
	});

	await test.step('Login as pro user', async () => {
		await loginPage.signInAsProUser('li_edit_linked_mention');
	});

	await test.step('Delete residual scheduled messages via API', async () => {
		await plannerPage.deleteScheduleMessagesViaAPI(memberId);
	});

	await test.step('Open composer', async () => {
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
		await expect(composePage.emptyLinkedInPreview).toBeVisible();
	});

	await test.step('Write a message with mention', async () => {
		await composePage.writeMessage(`${scheduleText}`);
		await composePage.messageArea.pressSequentially(`@${initialMention}`);
		await composePage.verifyLinkedInPreview(`${scheduleText}@${initialMention}`);
	});

	await test.step('Select and link the mention', async () => {
		await composePage.selectMention(initialMention);
		await composePage.verifyLinkedInMentionPreview(initialMention);
	});

	await test.step('Schedule the message', async () => {
		await composePage.schedule();
	});

	await test.step('Verify linked mention in planner preview pane', async () => {
		await expect(composePage.feCallOuts).not.toBeVisible();
		await plannerPage.verifyLinkedInMentionInPreviewPane(initialMention);
	});

	await test.step('Open the scheduled message for editing', async () => {
		await plannerPage.editFromPreviewPane();
	});

	await test.step('Edit by updating the linked mention', async () => {
		await composePage.removeCharacters(initialMention.length + 1);
		await page.waitForTimeout(1000);
		await composePage.verifyLinkedInPreview(`${scheduleText}`);
		await composePage.messageArea.pressSequentially(`@${newMention} `, {delay : 100});
		await composePage.selectMention(newMention);
		await composePage.verifyLinkedInMentionPreview(newMention);
	});

	await test.step('Add a second mention', async () => {
		await composePage.messageArea.pressSequentially(` @${secondMention}`, {delay : 100});
		await composePage.verifyLinkedInPreview(`${scheduleText}${newMention} @${secondMention}`);
		await composePage.selectMention(secondMention);
		await expect(composePage.linkedInMentionLink).toHaveCount(2);
	});

	await test.step('Save the edited message', async () => {
		await composePage.saveEditedMessage();
	});

	await test.step('Verify message has updated linked mention in preview pane', async () => {
		await expect(composePage.feCallOuts).not.toBeVisible();
		await expect(plannerPage.linkedInMentionLink).toHaveCount(2);
	});

	await test.step('Delete the scheduled message', async () => {
		await plannerPage.deleteFromPreviewPane();
	});
});
