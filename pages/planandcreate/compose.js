const { expect } = require('@playwright/test');

exports.ComposePage = class ComposePage {
    constructor(page) {
        this.page = page;
        this.composeButton = page.getByLabel('Composer', { exact: true });
        this.postButton = page.getByLabel('Post');
        this.composeScreen = page.locator('#fullScreenComposerMountPoint .vk-ComposerModal');
        this.profileDropDown = page.getByPlaceholder('Select a social account');
        this.snContentItems = page.locator('.vk-ContentItems');
        this.composerHeader = page.locator('.vk-ComposerHeader');
        this.twitterPreviewSingleImage = page.locator('.vk-TwitterPreview .vk-MediaImg');
        this.messageArea = page.getByLabel('Text');
        this.scheduleLaterButton = page.getByRole('button', { name: 'Schedule for later' });
        this.ScheduleDone = page.getByRole('button', { name: 'Done' });
        this.scheduleButton = page.getByRole('button', { name: 'Schedule', exact: true });
        this.postNowButton = page.getByRole('button', { name: 'Post now', exact: true });
        this.openCalendarButton = page.getByLabel('Open calendar');

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
        await this.ScheduleDone.click();
        await this.scheduleButton.click();
        await expect(this.scheduleButton).not.toBeVisible;
    }

    async sendNow() {
        await this.postNowButton.click();
        await expect(this.postNowButton).not.toBeVisible;
    }

    async verifySocialProfileSelected(name) {
        await expect(this.page.locator('.vk-PillText')).toContainText(`${name}`);
    }

    async verifyTwitterPreview(text) {
        await expect(this.page.locator('.vk-TwitterPreview .vk-ContentBody')).toContainText(`${text}`);
    }

    async selectMessageScheduleDate() {
        await this.scheduleLaterButton.click();
        await this.openCalendarButton.click();
        await this.page.getByLabel('Go to next month').click();
        await this.page.locator('(//button[contains(@class, "rdp-day") and text()="1"])[1]').click();
        await this.page.getByTestId('schedule-post-done-btn').click();
        await this.scheduleButton.click();
        await expect(this.scheduleButton).not.toBeVisible;
    }
};
