const { request } = require('playwright');
const { tags_service } = require('../globals');

/**
 * Create a tag via tag service
 *
 * @param {string}    tagName    Name of the tag to create
 * @param {string}    tagDescription Optional tag description. Default is empty string.
 * @param {number}    ownerId    ID of the organization that owns the tag
 * @param {number}    createdByMemberId ID of the member creating the tag
 *
 * @return {object}    Returns the ID and name of the created tag
 */
exports.CreateTag = class CreateTag {

	async createTag(tagName, tagDescription = '', ownerId, createdByMemberId) {
		try {
			const apiRequestContext = await request.newContext();
			const response = await apiRequestContext.post(tags_service, {
				headers: {
					'Content-Type': 'application/json',
				},
				data: {
					name: tagName,
					description: tagDescription,
					contextType: 'MESSAGE',
					ownerId: ownerId,
					ownerType: 'ORGANIZATION',
					createdByMemberId: parseInt(createdByMemberId, 10)
				},
			});
			if (response.status() !== 200) {
				throw new Error(`Failed to create tag: ${response.status()} - ${await response.text()}`);
			}
			const { id, name } = await response.json();
			return {id, name};
		} catch (tagCreationError) {
			console.error('Error creating tag: ', tagCreationError);
		}
	}
};
