# SHARES Patient Portal

The ASU SHARES Patient Portal proof of concept is a web-based user interface for patients to directly manage and preview FHIR-based consent directives as they will apply to their medical records.

Provider Portal natively supports the FHIR R5 specification. Due to significant differences with the Consent resource in prior FHIR releases, only R5 is supported.

This project is written in TypeScript using [Angular](https://angular.io), [Bootstrap](https://getbootstrap.com/), and [SCSS](http://sass-lang.com) for custom CSS. `npm` is the package manager.


PATIENT_PORTAL_DEFAULT_FHIR_URL=https://your.server.com/fhir
PATIENT_PORTAL_CONSENT_CDS_ROOT_URL=https://shares.cds.instance



# Attribution

Preston Lee

# License

Apache 2.0
