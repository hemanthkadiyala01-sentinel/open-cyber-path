# OpenCyberPath CaseLab — Product Specification

Status: Proposed next major milestone. This document is a design contract; it does not claim the module or new APIs have been implemented.

## Purpose

CaseLab connects verified public incident reporting to defensive investigation, hands-on simulation, assessment, and a learner's portfolio. It should connect CyberPulse, LiveOps, CyberRange, and SkillProof rather than replace them.

## Learner journey

1. Discover a case from CyberPulse or a curated case catalogue.
2. Read the original source(s), publication date, event date where known, confidence, and what is not yet confirmed.
3. Start an investigation using a versioned synthetic evidence pack.
4. Build a UTC timeline with evidence references; distinguish observations from inferences and alternative explanations.
5. Make containment, detection, mitigation, and recovery decisions with explicit trade-offs.
6. Submit a report and validation plan.
7. Receive rubric-based feedback, review the model solution, retry, and unlock the next mission when proficiency criteria are met.
8. Export or save a SkillProof portfolio artifact that documents sources, methodology, findings, limitations, remediation, and next checks.

## Case record requirements

Each published case should contain:

- Stable case ID and immutable version/revision ID.
- Title, topic, difficulty, estimated time, prerequisite skills, and learning objectives.
- Primary source URL(s), source publisher, publication date, observed incident date (if known), date checked, and source confidence.
- Evidence labels: `confirmed`, `reported`, `alleged`, `unknown`, or `not independently verified` as appropriate.
- A clear statement that the lab evidence is synthetic and does not represent telemetry acquired from the affected organization.
- Synthetic evidence pack with deterministic filenames, UTC timestamps, event IDs, schema/version, and checksums where useful.
- Scenario tasks, rubric criteria and weights (total 100), hints, model reasoning, acceptable alternative answers, and limitations.
- Safety scope and what learners must not do against real systems.
- Reviewer identity/role and review date; automatically generated candidate exercises cannot be shown as fully reviewed until a human review passes.

## Evidence and assessment principles

- A conclusion should cite the specific events or artefacts that support it.
- Reward uncertainty calibration and alternative hypotheses; penalize unsupported certainty.
- Evaluate evidence quality, timeline accuracy, reasoning, detection/control design, validation tests, remediation priority, and report clarity.
- A correct multiple-choice answer alone is not mastery.
- Hints should teach and permit retries. Progression should encourage continued learning, not permanently trap a learner at beginner level.
- A rubric score must be explainable. If AI feedback is introduced later, it must be labelled as automated assistance, constrained by a published rubric, reviewable by the learner, and not represented as independent certification.

## Proposed API contract (not implemented yet)

- `GET /v1/cases`: published case catalogue, with filters/pagination.
- `GET /v1/cases/:caseId`: case metadata and current published revision.
- `GET /v1/cases/:caseId/evidence`: authorized or public training pack as appropriate; no secrets or live victim telemetry.
- `POST /v1/cases/:caseId/submissions`: create a submission for the authenticated `sub`, including case revision, timeline, findings, decisions, validation plan, and evidence references.
- `GET /v1/me/cases`: current learner's submissions and progress only.
- `GET /v1/me/cases/:submissionId`: one submission owned by the authenticated learner.
- `POST /v1/me/cases/:submissionId/revisions`: a new immutable attempt/revision, rather than silently overwriting prior work.

Names are provisional and should be reconciled with current backend conventions before implementation. All writes must derive user identity from the verified JWT subject, never a client-supplied `user_id`. Validate request schemas, apply rate limits, use parameterized SQL, keep account isolation enforced, and add tests for cross-user access denial. Do not store bearer/refresh tokens in case records or logs.

## Proposed persistence model

- `cases`: stable identity, publication state, metadata.
- `case_revisions`: immutable versioned source metadata, objectives, rubrics, and evidence-pack references/checksums.
- `case_submissions`: learner subject, case revision, attempt number, state, timestamps, structured answer/report, rubric feedback, and score.
- `case_submission_events` (optional): append-only status transitions/assessment audit.

The final schema must align with the repository's current migration conventions and row-level-security approach. Apply migrations using the separate migration/owner identity; the runtime API must use its restricted database role.

## MVP scope

One reviewed intermediate-level defensive investigation case with:

- 2+ trustworthy source references, accurately dated and described.
- One synthetic evidence package with a deterministic expected analysis.
- A timeline builder, evidence references, hypotheses, and response recommendations.
- A rubric with visible criteria and actionable feedback.
- Persistent submission + retry + progress sync across devices.
- A SkillProof export that includes provenance and limitations.
- Unit/API tests, accessibility checks, and a documented smoke test.

Do not begin with dozens of cases, complex AI agents, public leaderboards, or attack execution against real targets. Validate the complete journey first.

## Definition of done

- All facts are source-backed and source status is clearly described.
- No synthetic evidence is falsely labelled as real victim telemetry.
- A learner can complete the case on desktop and mobile.
- A learner can sign in on a second device and retrieve the saved submission.
- Cross-account access tests prove that one learner cannot read or modify another learner's submissions.
- Rubric scoring is deterministic for objective criteria and documented for subjective criteria.
- A case update creates a new revision and does not silently alter prior submission context.
- Errors and offline states are useful and truthful.
- All tests, deployment checks, and manual smoke tests are documented; no secrets are committed.
