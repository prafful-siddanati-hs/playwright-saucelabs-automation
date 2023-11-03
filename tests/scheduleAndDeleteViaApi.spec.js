const { test } = require('@playwright/test');
const fs = require('fs');
const { formatISO, addHours, addDays, subDays } = require('date-fns');
const { LoginPage } = require("../pages/login");
const scheduleV3Message = require("../custom-commands/scheduleV3Message");
const getScheduledMessages = require('../custom-commands/getScheduledMessages');
const deleteScheduledMessageById = require("../custom-commands/deleteScheduledMesssagesById")

function readJson(fileName) {
  let rawData = fs.readFileSync(fileName, 'utf-8');
  return JSON.parse(rawData)
}

test('Schedule & Delete a message via API', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const createScheduleMessage = new scheduleV3Message();
    const deleteScheduledMessages = new deleteScheduledMessageById();
    const getAllScheduledMessages = new getScheduledMessages();

    const user = readJson('fixtures/accounts.json')
    
    const scheduleTime = addHours(new Date(), 24);
    const startTime = subDays(new Date(), 1)
    const endTime = addDays(new Date(), 3)

    const scheduleText = `This is scheduled via API in PlayWright ${scheduleTime}`;

    let messagesToDelete = [];

    let apiAuthorizationValue = await loginPage.login(user[2].email, user[2].password).then(() => {
         let apiAuthorization = loginPage.cookie.find(({name}) => name === "apiAuthorization");
        return apiAuthorization.value;
    });
    console.log('- - - apiAuthorization value retrieved - - -');

    /* Create a scheduled message */
    await createScheduleMessage.command(
        parseInt(user[2].memberId, 10),
        {
            messages: [
                {
                    socialProfileId: user[2].socialProfileId,
                    text: scheduleText,
                    scheduledSendTime: formatISO(scheduleTime)
                }
            ]
        },
        apiAuthorizationValue
        );

    /* Get list of messages & delete them by messageId */
    await getAllScheduledMessages.command(
        parseInt(user[2].memberId, 10),
        formatISO(startTime), 
        formatISO(endTime), 
        user[2].socialProfileId, 
        'SCHEDULED', 
        15,
        apiAuthorizationValue).then(
            response => 
            messagesToDelete = response);
    
    let messageIdsToDelete = messagesToDelete.map(message => Number(message.id))

    if (messageIdsToDelete.length !== 0) {
        console.log('Deleting scheduled messages');
        for (const messageId of messageIdsToDelete) {
            console.log(`Deleting message ID: ${messageId}`);
            await deleteScheduledMessages.command(parseInt(user[2].memberId, 10), messageId, apiAuthorizationValue);
        }
    } 

    await page.close();
});
