// @ts-check
const { test } = require('@playwright/test');
const { formatISO, startOfWeek, addWeeks } = require('date-fns');
const {LoginPage} = require('../../../pages/login');
const {PlannerPage} = require('../../../pages/planandcreate/planner');
const scheduleV3Message = require('../../../custom-commands/scheduleV3Message');
const createUser = require('../../../custom-commands/createUser');
const getFixture = require('../../../custom-commands/getFixture');
const {getObjectByName} = require('../../../globals');
const tearDown = require('../../../custom-commands/tearDown');


/** @type {import('@playwright/test').Page} */
test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Drag and drop card on week view', async ({page}) => {
	const createNewUser = new createUser();
	const addFixture = new getFixture();
	const loginPage = new LoginPage(page);
	const plannerPage = new PlannerPage(page);
	const createScheduleMessage = new scheduleV3Message();

	await createNewUser.command('dnd_user', 'professional');
	await addFixture.command('twitter_dnd','twitter', true, 300);

	await loginPage.signInAsProUser('dnd_user');

	const scheduleTime = startOfWeek(addWeeks(new Date(), 1)); //Schedule for first day of next week
	const composeText = `test drag and drop card on planner week view ${Date.now()}`;

	/* Create a scheduled message */
	await createScheduleMessage.command(
		parseInt(global.member[0].memberId, 10),
		{
			messages: [
				{
					socialProfileId: getObjectByName(global.fixture, 'twitter_dnd').socialProfile.socialProfileId,
					text: composeText,
					scheduledSendTime: formatISO(scheduleTime)
				}
			]
		}
	);

	await plannerPage.plannerButton.click();
	await page.waitForLoadState();
	await plannerPage.switchToExpandedView(global.member[0].memberId);

	await plannerPage.dragAndDropCard(composeText, scheduleTime.getHours(), global.member[0].memberId);
});
