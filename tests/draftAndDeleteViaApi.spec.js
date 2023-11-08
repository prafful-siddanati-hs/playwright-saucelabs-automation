const { test } = require('@playwright/test');
const fs = require('fs');
const { formatISO, addHours, addDays, subDays } = require('date-fns');
const { LoginPage } = require("../pages/login");
const draftMessage = require("../custom-commands/draftMessage");
const getDrafts = require('../custom-commands/getDrafts');
const deleteDraftById = require("../custom-commands/deleteDraftById")

function readJson(fileName) {
  let rawData = fs.readFileSync(fileName, 'utf-8');
  return JSON.parse(rawData)
}

test('Create & delete a draft message via API', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const createDraftMessage = new draftMessage();
    const deleteDraftMessages = new deleteDraftById();
    const getAllDraftMessages = new getDrafts();

    const user = readJson('fixtures/accounts.json')

    const scheduleTime = addHours(new Date(), 1);

    const draftText = `This is draft text via API in PlayWright ${scheduleTime}`;

    let draftsToDelete = [];

    let apiAuthorizationValue = await loginPage.login(user[0].email, user[0].password).then(() => {
         let apiAuthorization = loginPage.cookie.find(({name}) => name === "apiAuthorization");
        return apiAuthorization.value;
    });

    /* Create a scheduled message */
    await createDraftMessage.command(
        parseInt(user[0].memberId, 10),
        {
            socialProfileIds: [parseInt(user[0].socialProfileId, 10)],
            organizationId: null,
            scheduledDate: scheduleTime,
            draftMessage: {
                text: draftText,
                messageType: 'draft',
                publishingMode: null,
                messages: [
                    {
                        snType: 'TWITTER',
                        snId: user[0].socialProfileId.toString()
                    }
                ]
            }
        },
        apiAuthorizationValue
        );

    /* Get list of messages & delete them by messageId */
    await getAllDraftMessages.command(
        parseInt(user[0].memberId, 10),
        apiAuthorizationValue).then(
        response =>
            draftsToDelete = response);

    let draftIdsToDelete = draftsToDelete.map(d => (d.draft.id));

    if (draftIdsToDelete.length !== 0) {
        for (const draftId of draftIdsToDelete) {
            console.log(`Deleting message ID: ${draftId.toString()}`);
            await deleteDraftMessages.command(parseInt(user[0].memberId, 10), draftId.toString(), apiAuthorizationValue);
        }
    }

    await page.close();
});
