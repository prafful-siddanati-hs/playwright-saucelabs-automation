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
    }
};
