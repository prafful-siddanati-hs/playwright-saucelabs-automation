const { expect } = require('@playwright/test');
const { format, addDays } = require('date-fns');
const { utcToZonedTime } = require('date-fns-tz');
const timeZone = 'America/Vancouver';

exports.PlannerPage = class PlannerPage {
    constructor(page) {
        this.page = page;
        this.plannerButton = page.getByLabel('Planner', { exact: true });
        this.deleteButton = page.getByTestId('DeleteButton');
        this.sidePaneCloseButton = page.getByTestId('CloseButton');
        this.deletePostButton = page.getByRole('button', { name: 'Delete post' });
        this.addMediaButton = page.getByTestId('ContentButton');
        this.firstFreeImage = page.locator('.-mediaRow img[draggable="true"]').first();
        this.draftCard = page.getByText('No account');
        this.closeSaveDraftPopup = page.locator('#DraftSavedPopover [aria-label="Close Draft saved"]');
    }

    async dragAndDropCard(message) {
        const nextDayDate = format(utcToZonedTime(addDays(new Date(), 1), timeZone), 'eeee, d MMMM');
        const nextDayTime = format(utcToZonedTime(addDays(new Date(), 1), timeZone), 'ha');
        await this.plannerButton.click();

        await expect(this.page.getByText(message)).toBeVisible;

        const source = this.page.getByText(message);
        const destination = this.page.getByRole('gridcell', { name: `0 posts, ${nextDayDate} at ${nextDayTime}` });
        await this.page.waitForTimeout(1000);

        await source.hover();
        await this.page.mouse.down();

        await destination.hover();
        await destination.hover();
        await destination.hover();

        await this.page.mouse.up();
        await this.page.waitForTimeout(1000);

        await this.page.getByText(message).click();

        await this.deleteButton.click();
        await this.deletePostButton.click();
        await this.page.waitForTimeout(1000);
        await expect(this.page.getByText(message)).not.toBeVisible;
    }

    async dragAndDropMedia() {
        const nextDayDate = format(utcToZonedTime(addDays(new Date(), 1), timeZone), 'eeee, d MMMM');
        await this.plannerButton.click();
        await this.page.waitForLoadState();
        await this.addMediaButton.click();
        await this.page.waitForLoadState('domcontentloaded');
        await expect(this.firstFreeImage).toHaveJSProperty('complete', true);
        await expect(this.firstFreeImage).not.toHaveJSProperty('naturalWidth', 0);

        const source = this.firstFreeImage;
        const destination = this.page.getByRole('gridcell', { name: `0 posts, ${nextDayDate} at 12AM` });

        await source.dragTo(destination);

        await this.page.waitForTimeout(2000);
        await expect(this.closeSaveDraftPopup).toBeVisible;
        await this.sidePaneCloseButton.click();
        await expect(this.draftCard).toBeVisible;
        await this.draftCard.click();

        await this.deleteButton.click();
        await this.deletePostButton.click();
        await this.page.waitForTimeout(1000);
    }
};
