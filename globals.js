// globals.js

module.exports = {
    som: 'https://som-staging.hootops.com:504',
    som_bridge: 'https://som-staging.hootops.com:504',
    tops_skyline: 'https://organization.staging.hootops.com',
    broker_member_service: 'https://member.staging.hootops.com',
    service_message_publishing: 'https://message-publishing.staging.hootops.com',
    service_drafts: 'https://drafts.staging.hootops.com',
    service_trail: 'https://trail.staging.hootops.com',
    launch_url_cms: 'https://www-staging.hootsuite.com',
    login_url: 'https://staging.hootsuite.com/login?lang=en',
    defaultPassword: 'Passw0rd',
    testOrgPrefix: 'TEMP_ORG_',
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
    // Check whether or not HSAPI responded with error
    hasResponseErrors: function (res) {
        if (typeof res !== 'object') {
            console.log('Unable to parse response object.');
            return true;
        }
        // Check for errors in the body and non-200 status codes.
        return ((res.body && res.body.errors) || (res.statusCode && res.statusCode !== 200));
    },
};
