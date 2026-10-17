# Bug-bounty foundations learning path

This path is for learning web security and responsible reporting. A bounty, payment, or finding is never guaranteed.

## Stage 1 — Learn the basics
- HTTP requests and responses, cookies, sessions, authentication, authorisation, and browser developer tools.
- Learn common web risks through plain-language explanations and the OWASP Top 10.

## Stage 2 — Practise in a defined training environment
- Use PortSwigger Web Security Academy's intended labs, or run OWASP Juice Shop locally and keep it isolated.
- Use only lab-provided accounts and instructions.

## Stage 3 — Learn scope before any program testing
- Read the precise in-scope assets, excluded assets, allowed methods, rate limits, data-handling rules, and disclosure policy.
- If something is unclear, stop and ask the program team rather than guessing.

## Stage 4 — Document findings carefully
- Short title and affected feature
- Exact authorised asset or training lab
- Minimal reproducible steps
- Expected vs observed behaviour
- Evidence with secrets and personal data redacted
- Realistic impact and a defensive fix idea
- Limitations and what was not tested

## Stop conditions
Do not continue if the asset is not in scope, the test could disrupt a service, real user data may be exposed, or the rules are unclear. Avoid destructive testing and do not probe random public systems.

## Resources
- [PortSwigger Web Security Academy](https://portswigger.net/web-security)
- [OWASP Web Security Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)
- [OWASP Juice Shop](https://owasp.org/projects/juice-shop)
- [HackerOne scope guidance](https://docs.hackerone.com/en/articles/8494552-defining-scope)
- [Bugcrowd engagement details](https://docs.bugcrowd.com/researchers/engagement-management/details/)
