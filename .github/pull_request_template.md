## What and why

<!-- What does this change do, and which roadmap sub-phase (e.g. 1.2) does it belong to? -->

## How it was tested

<!-- Commands run, screenshots at 360px and 1280px for UI changes. -->

## ISO checklist (docs/ISO-COMPLIANCE.md §5)

- [ ] No secrets, keys or personal data in code, tests, fixtures or logs
- [ ] New personal-data fields are justified and added to the data inventory (§3)
- [ ] Every new API route has an authorization check and zod validation
- [ ] Admin and scorer write paths write an audit record
- [ ] No new third-party service or runtime CDN without ISMS review
- [ ] UI changes checked on a phone-width screen (360px) and status is never shown by color alone
