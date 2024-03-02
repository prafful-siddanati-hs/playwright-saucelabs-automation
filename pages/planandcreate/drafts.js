const { expect } = require('@playwright/test');
const deleteDraftById = require('../../custom-commands/deleteDraftById');
const getDrafts = require('../../custom-commands/getDrafts');

exports.DraftPage = class DraftPage {
	constructor(page) {
		this.page = page;
		this.draftListView = page.getByTestId('ListView');
		this.draftItem = page.getByTestId('CardWrapper');
		this.editButtonOnListView = page.getByLabel('Edit post');
		this.deleteButtonOnSidePane = page.getByTestId('DeleteButton');
		this.confirmationModalSubmitButton = page.getByRole('button', { name: 'Delete post' });
	}

	async deleteDraftsViaApi(memberId) {
		const deleteDraftMessages = new deleteDraftById();
		const getAllDraftMessages = new getDrafts();
		let draftsToDelete = [];
		/* Get list of messages & delete them by messageId */
		await getAllDraftMessages.command(
			parseInt(memberId, 10)).then(
			response =>
				draftsToDelete = response);

		let draftIdsToDelete = draftsToDelete.map(d => (d.draft.id));

		if (draftIdsToDelete.length !== 0) {
			for (const draftId of draftIdsToDelete) {
				console.log(`Deleting message ID: ${draftId.toString()}`);
				await deleteDraftMessages.command(parseInt(memberId, 10), draftId.toString());
			}
		}
	}

	async visit() {
		await this.page.goto('/dashboard#/planner?view=drafts');
		await expect(this.draftListView).toBeVisible();
	}

	async verifyDraftMessage(profile, text, user ) {
		const userSelector= `//*[contains(@data-testid,"Summary") and contains(text(),"${text}")]//following::*[contains(@data-testid,"CreationDetails") and contains(text(),"${user}")]`;
		await expect(this.page.getByTestId('Username').getByText(profile)).toBeVisible();
		await expect(this.page.getByTestId('Summary').getByText(text)).toBeVisible();
		await expect(this.page.locator(userSelector)).toBeVisible();
	}

	async showPreviewPane(text) {
		await this.page.getByText(text).click();
	}

	async editDraftByContent(text) {
		await this.page.getByText(text).hover();
		await this.editButtonOnListView.click();
	}

	async deleteDraft(){
		await this.deleteButtonOnSidePane.click();
		await this.confirmationModalSubmitButton.click();
		await expect(this.draftItem).toHaveCount(0);
	}
};
