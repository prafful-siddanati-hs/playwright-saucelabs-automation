const { expect } = require('@playwright/test');
const deleteDraftById = require('../../custom-commands/deleteDraftById');
const getDrafts = require('../../custom-commands/getDrafts');
const draftMessage = require('../../custom-commands/draftMessage');
const { plan_create } = require('../../globals');

exports.DraftsPage = class DraftsPage {
	constructor(page) {
		this.page = page;
		this.draftListView = page.getByTestId('ListView');
		this.cardList = page.locator('[data-testid="card-list"]');
		this.userName = page.getByTestId('Username');
		this.summary = page.getByTestId('Summary');
		this.createButton = page.getByTestId('ListView').getByTestId('create-button');
		this.postButton = page.locator('//*[contains(@class,vk-NewPostPlaceholderDropdown)]//*[contains(@role,"menuitem")]//*[text()="Post"]');
		this.draftItem = page.getByTestId('CardWrapper');
		this.editButtonOnListView = page.getByLabel('Edit post');
		this.deleteButtonOnSidePane = page.getByTestId('DeleteButton');
		this.editButtonOnSidePane = page.getByTestId('DetailPaneRenderer').getByLabel('Edit post');
		this.moreActionsButtonOnSidePane = page.getByTestId('DetailPaneRenderer').getByLabel('More actions');
		this.duplicateButtonOnSidePane = page.locator('//*[contains(@data-testid, DetailPaneRenderer)]//*[contains(@class,vk-ListItemWrapper)]//*[text()="Duplicate"]');
		this.previewMessageText = page.getByTestId('DetailPaneRenderer').locator('.vk-PreviewMessageText');
		this.previewMedia = page.getByTestId('DetailPaneRenderer').locator('img');
		this.confirmationModalSubmitButton = page.getByRole('button', { name: 'Delete post' });
		this.tagContainerText = page.locator('.vk-Planner [data-testid="DetailPaneRenderer"] .vk-TagContainer label');
		this.instagramPreviewMedia = page.getByTestId('DetailPaneRenderer').getByLabel('Instagram post preview').getByLabel('Image and Tagging Area, media 1 of 1, tagging disabled');
		this.instagramPreviewText = page.locator('[data-testid = "DetailPaneRenderer"] [aria-label ="Instagram post preview"] p');
		this.instagramCollaborators = page.locator('[data-testid = "DetailPaneRenderer"] [data-testid ="Info"] .vk-InstagramCollaboratorsDetails p');
		this.instagramAltText = page.locator('[data-testid = "DetailPaneRenderer"] [data-testid ="Info"] .vk-AltText p');
		this.facebookPreviewText = page.locator('[data-testid = "DetailPaneRenderer"] .vk-FacebookPreview .vk-ContentBody p');
	}

	async selectCreateButton() {
		await expect(this.createButton).toBeVisible();
		await this.createButton.click();
		await expect(this.postButton).toBeVisible();
		await this.postButton.click();
	}

	async deleteDraftsViaApi(memberId) {
		const deleteDraftMessages = new deleteDraftById();
		const getAllDraftMessages = new getDrafts();
		let draftsToDelete = [];
		/* Get list of messages & delete them by messageId */
		await getAllDraftMessages.command(
			parseInt(memberId, 10)).then(
			response =>
				draftsToDelete = response)
			.catch(draftError => console.log(`Error getting drafts: ${draftError}`));

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
		await expect(this.draftListView, 'Draft list view is visible').toBeVisible();
	}

	async verifyDraftMessage(profile, text, user ) {
		const userSelector= `//*[contains(@data-testid,"Summary") and contains(text(),"${text}")]//following::*[contains(@data-testid,"CreationDetails") and contains(text(),"${user}")]`;
		await expect(this.page.getByTestId('Username').getByText(profile), 'Draft user name is visible').toBeVisible();
		await expect(this.page.getByTestId('Summary').getByText(text), 'Draft summary is  visible').toBeVisible();
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
		await expect(this.draftItem, 'Failed to delete draft').toHaveCount(0);
	}

	/**
	 * Creates a draft message via API by network.
	 * 'attachments' is an optional parameter. For text-only drafts default value is [].
	 * 'draftScheduleTime' is an optional parameter to create either scheduled or unscheduled draft.
	 */
	async createDraftViaApiByNetwork(memberId, orgId, snId, message, socialNetwork, attachments = [], draftScheduleTime = null) {
		const createDraft = new draftMessage();
		const orgid = orgId ? orgId : null;

		const draftOptions = {
			socialProfileIds: [
				parseInt(snId, 10)
			],
			organizationId: orgid,
			scheduledDate: draftScheduleTime,
			draftMessage: {
				text: message,
				messageType: 'draft',
				messages: [
					{
						message: message,
						snType: socialNetwork.toUpperCase(),
						snId: snId.toString()
					}
				],
				attachments: [attachments]
			}
		};
		if (draftScheduleTime) {
			draftOptions.scheduledDate = draftScheduleTime;
		}
		await createDraft.command(parseInt(memberId, 10), draftOptions);
	}

	/**
	 * Create a draft message via API for Instagram Business.
	 * 'draftScheduleTime' is an optional parameter to create either scheduled or unscheduled draft.
	 * 'firstCommentText' is an optional parameter to add first comment to the draft post.
	 * @param feedOrPushType - IG_FEED or IG_PUSH
	 */
	async createIGBDraftViaApi(memberId, orgId, snId, feedOrPushType, message, socialNetwork, draftScheduleTime = null, firstCommentText = null) {
		const createDraft = new draftMessage();
		const orgid = orgId ? orgId : null;

		const draftOptions = {
			socialProfileIds: [
				parseInt(snId, 10)
			],
			organizationId: orgid,
			scheduledDate: draftScheduleTime,
			draftMessage: {
				text: message,
				messageType: 'draft',
				postType: feedOrPushType.toUpperCase(),
				publishingMode: 'IG_API',
				firstComment: {'text' : firstCommentText },
				messages: [
					{
						message: message,
						snType: socialNetwork.toUpperCase(),
						snId: snId.toString()
					}
				],
				attachments: [plan_create.mediaUrls.imageAttachment],
			}
		};
		if (draftScheduleTime) {
			draftOptions.scheduledDate = draftScheduleTime;
		}
		if (firstCommentText) {
			draftOptions.draftMessage.firstComment = { 'text' : firstCommentText };
		}
		await createDraft.command(parseInt(memberId, 10), draftOptions);
	}
};
