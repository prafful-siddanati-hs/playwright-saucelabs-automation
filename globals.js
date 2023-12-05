// globals.js

module.exports = {
    som: 'https://som-staging.hootops.com:504',
    som_bridge: 'https://som-staging.hootops.com:504',
    tops_skyline: 'https://organization.staging.hootops.com',
    broker_member_service: 'https://member.staging.hootops.com',
    service_message_publishing: 'https://staging-api-auth.hootsuite.com/publisher',
    service_drafts: 'https://staging-api-auth.hootsuite.com/publisher/drafts',
    service_trail: 'https://staging-api-auth.hootsuite.com/publisher',
    launch_url_cms: 'https://www-staging.hootsuite.com',
    login_url: 'https://staging.hootsuite.com/login?lang=en',
    defaultPassword: 'Passw0rd',
    testOrgPrefix: 'PW_TEST_ORG_',
    isOrgSafeToDelete: function (org, memberId, testOrgPrefix) {
        const DO_NOT_DELETE_STAGING_ORG = [1866699];
        
        let orgInWhiteList = DO_NOT_DELETE_STAGING_ORG.includes(org.id);
        let orgNameHasPrefix = org.name.startsWith(testOrgPrefix);
        let isOrgOwner = org.paymentMemberId === memberId;

        if ((!orgInWhiteList) && orgNameHasPrefix && isOrgOwner) {
            return true;
        } else {
            console.log(`!!!ORG SAFETY CHECK FAILED!!! orgInWhiteList: ${orgInWhiteList} orgNameHasPrefix: ${orgNameHasPrefix} isOrgOwner: ${isOrgOwner}`);
            return false;
        }
    },
};
