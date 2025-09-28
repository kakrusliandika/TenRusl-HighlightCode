// consent-base.js
// Google Consent Mode v2 baseline (default: denied).
// Integrate with a Google-certified CMP (Cookiebot/OneTrust/etc.).
// Then call gtag('consent','update', {...}) based on the user's choice.

window.dataLayer = window.dataLayer || [];
function gtag() {
    dataLayer.push(arguments);
}

// default: denied until the user grants consent via your CMP
gtag("consent", "default", {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "denied",
    functionality_storage: "denied",
    security_storage: "granted", // generally OK for basic security
});

// Example API your CMP can call after the user agrees:
window.updateConsent = function (consent = {}) {
    // consent: {ad_storage, ad_user_data, ad_personalization, analytics_storage}
    gtag(
        "consent",
        "update",
        Object.assign(
            {
                ad_storage: "granted",
                ad_user_data: "granted",
                ad_personalization: "granted",
                analytics_storage: "granted",
            },
            consent
        )
    );
};
