# Security Engineering, DevSecOps & Identity and Access Management

**Level:** beginner to intermediate · **Primary focus:** designing safeguards into systems and software delivery.

## Before you start

Basic operating systems, networking, Git, and a little command-line confidence help. Start with diagrams and sample repositories; cloud labs may incur charges, so read billing limits first.

## Learning sequence

### Module 1 — Security design and trust boundaries
Learn assets, users, data flows, trust boundaries, attack surface, secure defaults, and defence in depth.
**Practice:** mark trust boundaries on a fictional web-service diagram.
**Evidence:** a threat-model sketch with assets, entry points, and questions to verify.

### Module 2 — Identity and least privilege
Learn accounts versus identities, roles, MFA, service identities, single sign-on, secrets, key rotation, and break-glass access.
**Practice:** review fictional role assignments and recommend narrower access.
**Evidence:** an access matrix showing role, business need, risk, and proposed change.

### Module 3 — Put security checks in the development workflow
Understand dependency checks, static analysis, secret detection, peer review, and what pipeline results do and do not prove.
**Practice:** inspect the results from a training repository or sample report. Do not upload private code or secrets to an unapproved service.
**Evidence:** a short pipeline checklist and finding-to-fix map.

### Module 4 — Logging, backup, and recovery by design
Learn audit events, useful context, retention, alert ownership, backup isolation, restore tests, and how to validate that controls work.
**Practice:** design a log and recovery plan for a fictional application.
**Evidence:** event-source table and recovery validation checklist.

### Module 5 — Engineering capstone
**Capstone:** create a safe design review for a small fictional service, combining trust boundaries, identity, a basic security-check pipeline, logging, and recovery.
**Deliverables:** architecture diagram, risk list, control choices, evidence plan, and limitations.

## Ready to move on when

You can explain why a control exists, where it belongs, which evidence would prove it operates, and how to make the system safer without claiming a design review proves everything secure.
