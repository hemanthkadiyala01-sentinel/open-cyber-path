# OpenCyberPath Certifications & Exams Hub — smoke test

Run automated checks from `website/`:

```powershell
npm run check:certifications
npm run check
```

The data check verifies catalogue structure and links' HTTPS format. It does not prove all external URLs respond, fees are identical in every country, or a credential provider has not changed its exam between checks.

## Catalogue and discovery

- [ ] Main navigation opens **Certs & Exams** and highlights the active section.
- [ ] Search matches certification name, issuer, exam code and syllabus topic.
- [ ] Track filter can show Foundations, SOC/Blue Team, Penetration Testing, DFIR, Cloud, GRC/Audit, Application Security, Threat Intelligence/Malware, and Security Engineering.
- [ ] Cost filter distinguishes free study materials, paid professional exams, and course-completion credentials and badges.
- [ ] Level filter narrows the catalogue; reset filters restores the complete list.
- [ ] Empty search results provide a visible way to reset filters.

## Credential detail and roadmaps

- [ ] Each credential has an issuer page and official syllabus/exam-objectives link.
- [ ] Exam code, format, prerequisites, cost caveat, renewal and syllabus summary are visible.
- [ ] The preparation roadmap contains multiple steps with an intended learning output.
- [ ] “Open matching career roadmap” opens an existing OpenCyberPath path, when a mapping is defined.
- [ ] Version-change notes link to issuer sources; an effective date is not presented as timeless.
- [ ] Course-completion certificates are clearly differentiated from proctored professional certification exams.

## Local study-plan persistence

- [ ] Add/remove a credential from the study plan and confirm the local plan counter changes.
- [ ] Check a preparation step, refresh the site, reopen the same credential and confirm the step remains checked.
- [ ] Clear one credential's progress and confirm other credentials are unchanged.
- [ ] When browser storage is blocked or unavailable, the page remains usable and gives a storage notice.
- [ ] Confirm the feature only stores local credential IDs and checklist state; it does not send study-plan data to a backend.

## Visual credential imagery

- [ ] Major exam cards show a matching issuer-published badge image where available; the badge name matches the card title.
- [ ] Cards without public badge artwork display an issuer-site favicon or readable initials fallback, never an invented credential image.
- [ ] Free-course achievement badges are labelled as course credentials rather than proctored certification exams.
- [ ] Images still show a clean fallback if the network or external image host is unavailable.

## Accessibility and layout

- [ ] Use Tab and Shift+Tab through search, filters, cards, links and preparation checkboxes; visible focus remains.
- [ ] Screen-reader labels are meaningful and progress is announced as a progress bar.
- [ ] At a narrow mobile viewport, the hero, filters, cards, detail view and links fit without unintended page-wide horizontal scrolling.
- [ ] Text remains readable at enlarged browser text settings.
- [ ] Reduced-motion preference does not prevent controls from working.
- [ ] Browser console contains no uncaught errors after searching, filtering, opening details and checking the study plan.

## Accuracy and maintenance

- [ ] Open the official issuer page and confirm active exam code/version, syllabus effective date, prerequisites and renewal rules.
- [ ] Re-check regional pricing and voucher terms at the time of booking; do not treat catalogue price notes as a quote.
- [ ] Confirm free training and a free exam are not described as the same offer.
- [ ] Review upcoming syllabus-change notices when their dates approach and update the source data with a new `verifiedOn` date only after rechecking official pages.
- [ ] Do not add copied exam dumps, confidential questions or claims that completing the roadmap guarantees a pass or job.

## Test record

Record browser/version, viewport, tested credential, results and reproducible failures. Do not submit credentials, private logs or personal data in a bug report.


## Free-first resources and card artwork

- [ ] The catalogue includes a dedicated **Free digital badge / course credential** filter and it returns the IBM SkillsBuild free badge.
- [ ] The free learning library shows category filters for badges, courses, official exam prep, hands-on labs and freemium tiers.
- [ ] At least 15 resources are listed and every resource says whether it is free, freemium, exam prep, a badge or a practice lab.
- [ ] Verify the IBM SkillsBuild badge route for high-school learners rather than assuming the adult learner sign-up applies.
- [ ] Check that ISC2 One Million free CC enrollment is not advertised as open to new participants; this offer ended for new enrollment in May 2026.
- [ ] Credential cards show matching official badge artwork where a public image URL exists; other cards use an issuer website icon and an initials fallback if the image fails.
- [ ] Cards remain readable if the badge/favicons CDN is blocked; image failures do not block search, filters, detail view or study-plan controls.
- [ ] The public page no longer displays a large source-monitor dashboard or “page reachable” status beside every credential.
- [ ] The monitor continues to run in repository maintenance workflow only; its output is not presented as live enrollment or exam-seat availability.
