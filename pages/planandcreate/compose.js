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
        this.facebookPreviewSingleImage = page.locator('.vk-FacebookPreview .vk-MediaImg');
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
        this.feCallOuts = this.page.locator('#fe-lib-async-callouts-container>div>div>div>div[type="success"]');
    }
    async selectComposeButton() {
        await expect(this.composeButton).toBeVisible;
        await this.composeButton.click();
        await this.composeButton.click();
        await this.postButton.click()
        await expect(this.composeScreen).toBeVisible;
        await this.page.waitForLoadState('networkidle');
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
            await this.page.waitForLoadState('networkidle');
            await this.page.keyboard.press('Escape');
            await this.messageArea.click();
            await this.page.keyboard.type(message);
            await expect(this.page.locator('.vk-Loader')).toHaveCount(0);
    }

    async schedule() {
        await this.scheduleLaterButton.click();
        await this.scheduleDone.click();
        await this.scheduleButton.click();
        await expect(this.scheduleButton).not.toBeVisible;
        await expect(this.feCallOuts).toHaveCount(1, {timeout: 10000});
    }

    async sendNow() {
        await this.postNowButton.click();
        await expect(this.postNowButton).not.toBeVisible;
        await expect(this.feCallOuts).toHaveCount(1, {timeout: 10000});
    }

    async verifySocialProfileSelected(name) {
        await expect(this.snPilltext).toContainText(`${name}`);
        await expect(this.page.locator('.vk-Loader')).toHaveCount(0);
    }

    async verifyTwitterPreview(text) {
        await expect(this.twitterPreviewText).toContainText(`${text}`);
    }

    async verifyTwitterVideoPreview() {
        await expect(this.twitterVideoPreviewSelector).toHaveCount(1, {timeout: 20000});
    }

    async verifyTwitterImagePreview() {
        await expect(this.twitterPreviewSingleImage).toHaveJSProperty('complete', true);
        await expect(this.twitterPreviewSingleImage).not.toHaveJSProperty('naturalWidth', 0);
    }

    async verifyFacebookImagePreview() {
        await expect(this.facebookPreviewSingleImage).toHaveJSProperty('complete', true);
        await expect(this.facebookPreviewSingleImage).not.toHaveJSProperty('naturalWidth', 0);
    }

    async verifyFacebookVideoPreview() {
        await expect(this.facebookVideoPreviewSelector).toHaveCount(1, {timeout: 20000});
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
