const { expect } = require('@playwright/test');

exports.ComposePage = class ComposePage {
    constructor(page) {
        this.page = page;
        this.composeButton = page.getByLabel('Composer', { exact: true });
        this.postButton = page.getByLabel('Post');
        this.composeScreen = page.locator('#fullScreenComposerMountPoint .vk-ComposerModal');
        this.profileDropDown = page.getByPlaceholder('Select a social account');
        this.snContentItems = page.locator('.vk-ContentItems');
        this.snPilltext = page.locator('.vk-PillText');
        this.composerHeader = page.locator('.vk-ComposerHeader');
        this.twitterPreviewSingleImage = page.locator('.vk-TwitterPreview .vk-MediaImg');
        this.messageArea = page.getByLabel('Text');
        this.scheduleLaterButton = page.getByRole('button', { name: 'Schedule for later' });
        this.scheduleDone = page.getByRole('button', { name: 'Done' });
        this.scheduleDoneButton = page.getByTestId('schedule-post-done-btn');
        this.scheduleButton = page.getByRole('button', { name: 'Schedule', exact: true });
        this.postNowButton = page.getByRole('button', { name: 'Post now', exact: true });
        this.openCalendarButton = page.getByLabel('Open calendar');
        this.nextMonthButton = page.getByLabel('Go to next month');
        this.firstDayOfNextMonth = page.locator('(//button[contains(@class, "rdp-day") and text()="1"])[1]');
        this.twitterVideoPreviewSelector = page.locator('.rc-Composer .vk-TwitterPreview .vk-VideoContainer');
        this.facebookVideoPreviewSelector = page.locator('.rc-Composer .vk-FacebookPreview .vk-VideoContainer .vk-VideoPlayer');
        this.twitterPreviewText = this.page.locator('.vk-TwitterPreview .vk-ContentBody');
        this.facebookPreviewText = this.page.locator('.vk-FacebookPreview .vk-ContentBody');
        this.exitButton = this.page.getByRole('button', { name: 'Exit tutorial' });
    }
    async selectComposeButton() {
        await expect(this.composeButton).toBeVisible;
        await this.composeButton.click();
        await this.composeButton.click();
        await this.postButton.click()
        await expect(this.composeScreen).toBeVisible;
    }
    async selectSocialProfile(name) {
        const profileSelectorItem = this.page.getByTestId('MessageEditArea').getByText(`${name}`).first();

        await this.profileDropDown.click()
        await expect(this.snContentItems).toBeVisible;
        await profileSelectorItem.click();
        await this.composerHeader.click()
    }

    async uploadFile(name) {
        await this.page.setInputFiles('.vk-MediaUpload input[type="file"]',`${name}`);
    }

    async writeMessage(message) {
        await this.messageArea.click();
        await this.messageArea.fill(message);
    }

    async schedule() {
        await this.scheduleLaterButton.click();
        await this.scheduleDone.click();
        await this.scheduleButton.click();
        await expect(this.scheduleButton).not.toBeVisible;
    }

    async sendNow() {
        await this.postNowButton.click();
        await expect(this.postNowButton).not.toBeVisible;
    }

    async verifySocialProfileSelected(name) {
        await expect(this.snPilltext).toContainText(`${name}`);
    }

    async verifyTwitterPreview(text) {
        await expect(this.twitterPreviewText).toContainText(`${text}`);
    }

    async verifyTwitterVideoPreview() {
        await expect(this.twitterVideoPreviewSelector).toHaveCount(1);
    }

    async verifyTwitterImagePreview() {
        await expect(this.twitterPreviewSingleImage).toHaveJSProperty('complete', true);
        await expect(this.twitterPreviewSingleImage).not.toHaveJSProperty('naturalWidth', 0);
    }

    async verifyFacebookVideoPreview() {
        await expect(this.facebookVideoPreviewSelector).toHaveCount(1);
    }

    async verifyFacebookPreview(text) {
        await expect(this.facebookPreviewText).toContainText(`${text}`);
    }

    async selectMessageScheduleDate() {
        await this.scheduleLaterButton.click();
        await expect(this.openCalendarButton).toHaveCount(1);
        await this.openCalendarButton.hover();
        await this.openCalendarButton.click();
        await this.nextMonthButton.click();
        await this.firstDayOfNextMonth.click();
        await this.scheduleDoneButton.click();
        await this.scheduleButton.click();
        await expect(this.scheduleButton).not.toBeVisible;
    }
};
