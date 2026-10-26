import './auth/auth.css';
import AccountActions from './auth/AccountActions.jsx';
import LearningAccessGate from './auth/LearningAccessGate.jsx';
import { useAuth } from './auth/AuthProvider.jsx';
import { cloudProgressSignature, mergeModuleProgress, moduleProgressCloudBaseline, moduleProgressFromCloudItems, moduleProgressToCloudRecords } from './auth/learningProgressSync.js';
import './styles/path-aesthetic-v1.css';
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { homeFeaturedResources, homePublicDatasetResources } from './data/homeResourceCards.js';
import { homeFeaturedLabs } from './data/homeLabCards.js';

import { careerPaths as learningPaths } from './data/careerPaths.js';
import { cybersecurityPillars, isc2CisspDomains } from './data/cybersecurityDomains.js';
import StartHereGuide from './components/StartHereGuide.jsx';
import AdaptiveLearningPlanner from './components/AdaptiveLearningPlanner.jsx'; // adaptive-learning-engine-v1


import ResourceHealthStatus from './components/ResourceHealthStatus.jsx';

import { buildResourceReportUrl } from './utils/resourceFeedback.js';
import './utils/registerOfflineServiceWorker.js'; // offline-learning-v1

import './components/CreatorIdentity.css';
import './components/TemporaryAnimeBrand.css'; // temporary-anime-brand-v1.1
import './components/VisualRhythm.css'; // opencyberpath-visual-rhythm-ctf-v1
import SiteGuideAssistant from './components/DeferredSiteGuideAssistant.jsx';



const LearningStudio = lazy(() => import('./components/LearningStudio.jsx'));
const FirstVisitTour = lazy(() => import('./components/FirstVisitTour.jsx'));
const LearningProgressBackup = lazy(() => import('./components/LearningProgressBackup.jsx'));
const CareerPathLabDirectory = lazy(() => import('./components/CareerPathLabDirectory.jsx'));
const ApplicationLab = lazy(() => import('./components/CareerExperience.jsx').then((m) => ({ default: m.ApplicationLab })));
const CareerHub = lazy(() => import('./components/CareerExperience.jsx').then((m) => ({ default: m.CareerHub })));
const JobsHub = lazy(() => import('./components/CareerExperience.jsx').then((m) => ({ default: m.JobsHub })));
const ResumeStudio = lazy(() => import('./components/CareerExperience.jsx').then((m) => ({ default: m.ResumeStudio })));
const ToolsThreats = lazy(() => import('./components/ToolsThreats.jsx').then((m) => ({ default: m.ToolsThreats })));
const SystemsAcademy = lazy(() => import('./components/SystemsAcademy.jsx').then((m) => ({ default: m.SystemsAcademy })));
const ExternalLabLinks = lazy(() => import('./components/ExternalLabLinks.jsx'));

const InteractiveLabWorkbench = lazy(() => import('./components/InteractiveLabWorkbench.jsx'));
const OfflineLearning = lazy(() => import('./components/OfflineLearning.jsx'));
const LiveOps = lazy(() => import('./components/LiveOps.jsx')); // cyberpath-liveops-v1
const CyberPulse = lazy(() => import('./components/CyberPulse.jsx')); // cyberpulse-auto-freshness-v1

const YouTubeLiveLearning = lazy(() => import('./components/YouTubeLiveLearning.jsx')); // youtube-live-learning-v1
const CTFArcade = lazy(() => import('./components/CTFArcade.jsx')); // ctf-arcade-v1
const SkillProof = lazy(() => import('./components/SkillProof.jsx')); // skillproof-portfolio-v1 // offline-learning-v1
const CyberRange = lazy(() => import('./components/CyberRange.jsx')); // cyberrange-v1
const CaseLab = lazy(() => import('./components/CaseLab.jsx')); // caselab-mvp-v1
const CuratedVideosLibrary = lazy(() => import('./components/CuratedVideosLibrary.jsx'));
const CareerVideoLibrary = lazy(() => import('./components/CareerVideoLibrary.jsx'));
 const CreatorIdentity = lazy(() => import('./components/CreatorIdentity.jsx'));
const CertificationsHub = lazy(() => import('./components/CertificationsHub.jsx'));

const levelRanks = { beginner: 1, intermediate: 2, advanced: 3 };
function matchesLevel(label, selected, allLabel) {
  if (selected === allLabel) return true;
  const normalized = String(label || '').toLowerCase();
  const wanted = selected.toLowerCase();
  if (normalized.includes(wanted)) return true;
  const range = normalized.split('â†’').map((part) => part.trim());
  if (range.length < 2) return false;
  const selectedRank = levelRanks[wanted];
  const start = levelRanks[range[0]] || 1;
  const end = levelRanks[range[1]] || start;
  return selectedRank >= start && selectedRank <= end;
}

const iconArt = {
  home: <><path d="m3 10 9-7 9 7"/><path d="M5 9.5V21h14V9.5"/><path d="M9 21v-7h6v7"/></>,
  book: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21z"/><path d="M4 5.5V21M8 7h8M8 11h8"/></>,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></>,
  code: <><path d="m8 8-4 4 4 4M16 8l4 4-4 4M14 5l-4 14"/></>,
  'book-open': <><path d="M12 7v14M3 5.5A2.5 2.5 0 0 1 5.5 3H12v18H5.5A2.5 2.5 0 0 0 3 23z"/><path d="M21 5.5A2.5 2.5 0 0 0 18.5 3H12v18h6.5a2.5 2.5 0 0 1 2.5 2z"/></>,
  'notebook-pen': <><path d="M4 3h13a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H4z"/><path d="M8 3v18M11 8h5M11 12h4"/><path d="m15.5 17.5 4-4 2 2-4 4-2.5.5z"/></>,
  shield: <><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11z"/></>,
  'shield-check': <><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11z"/><path d="m8.5 12 2.3 2.3 4.8-5"/></>,
  radar: <><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5.5"/><circle cx="12" cy="12" r="1.5"/><path d="m12 12 6-6M12 3v3M21 12h-3"/></>,
  search: <><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></>,
  bug: <><path d="M8 8 6 6M16 8l2-2M4 13H2M22 13h-2M5 18H3M21 18h-2M12 4V2"/><rect x="7" y="7" width="10" height="14" rx="5"/><path d="M7 12h10M7 16h10"/></>,
  terminal: <><rect x="3" y="4" width="18" height="16" rx="2"/><path d="m7 9 3 3-3 3M13 15h4"/></>,
  network: <><circle cx="12" cy="5" r="2.5"/><circle cx="5" cy="18" r="2.5"/><circle cx="19" cy="18" r="2.5"/><path d="M10.8 7.2 6.2 15.7M13.2 7.2l4.6 8.5M7.5 18h9"/></>,
  'file-text': <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h8"/></>,
  clipboard: <><rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4.5V3h6v1.5M8 10h8M8 14h8M8 18h5"/></>,
  chart: <><path d="M3 3v18h18"/><path d="m7 14 4-4 3 3 6-7"/><path d="M16 6h4v4"/></>,
  'monitor-check': <><rect x="3" y="3" width="18" height="13" rx="2"/><path d="M8 21h8M12 16v5M8 9l2.3 2.3L15 7"/></>,
  laptop: <><rect x="4" y="4" width="16" height="12" rx="2"/><path d="M2 20h20l-2-4H4z"/></>,
  sliders: <><path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3"/><path d="M2 14h4M10 8h4M18 16h4"/></>,
  clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
  download: <><path d="M12 3v12M7 10l5 5 5-5M4 20h16"/></>,
  'external-link': <><path d="M14 3h7v7M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></>,
  'arrow-right': <><path d="M4 12h15M13 5l7 7-7 7"/></>,
  'arrow-up-right': <><path d="M7 17 17 7M7 7h10v10"/></>,
  users: <><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="10" cy="7" r="4"/><path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></>,
  route: <><circle cx="6" cy="18" r="3"/><circle cx="18" cy="6" r="3"/><path d="M8.5 16.5 10 14a4 4 0 0 1 3.5-2h1a3 3 0 0 0 3-3V9"/></>,
  target: <><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/></>,
  lock: <><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/></>,
  spark: <><path d="m12 2 1.9 7.1L21 12l-7.1 1.9L12 21l-1.9-7.1L3 12l7.1-2.9z"/><path d="m19 2 .8 2.2L22 5l-2.2.8L19 8l-.8-2.2L16 5l2.2-.8z"/></>,
  'check-circle': <><circle cx="12" cy="12" r="9"/><path d="m8 12 2.5 2.5L16 9"/></>,
  'film': <><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 4v16M17 4v16M3 9h4M3 15h4M17 9h4M17 15h4"/></>,
  'minus': <path d="M5 12h14"/>,
  'flask-conical': <><path d="M9 3h6M10 3v6L4.5 18a2 2 0 0 0 1.7 3h11.6a2 2 0 0 0 1.7-3L14 9V3"/><path d="M7 15h10"/></>,
  'shield-alert': <><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11z"/><path d="M12 8v5M12 16h.01"/></>,
  'alert-triangle': <><path d="m10.3 3.9-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.7-3.1l-8-14a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/></>,
  share: <><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 10.7 6.8-4.4M8.6 13.3l6.8 4.4"/></>,
  copy: <><rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/></>,
  graduation: <><path d="m2 10 10-5 10 5-10 5z"/><path d="M6 12v5c3.5 3 8.5 3 12 0v-5M22 10v6"/></>,
  globe: <><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"/></>,
  eye: <><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z"/><circle cx="12" cy="12" r="2.5"/></>,
  lightbulb: <><path d="M9 18h6M10 22h4M8.2 14.5A6 6 0 1 1 15.8 14.5c-.9.7-1.4 1.5-1.6 2.5h-4.4c-.2-1-.7-1.8-1.6-2.5z"/><path d="M12 2v2M4.9 4.9l1.4 1.4M19.1 4.9l-1.4 1.4"/></>,
  'briefcase-business': <><rect x="3" y="7" width="18" height="14" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18M10 12v2h4v-2"/></>,
  'scan-text': <><path d="M4 7V5a2 2 0 0 1 2-2h2M16 3h2a2 2 0 0 1 2 2v2M20 17v2a2 2 0 0 1-2 2h-2M8 21H6a2 2 0 0 1-2-2v-2"/><path d="M8 9h8M8 12h6M8 15h8"/></>,
  circle: <circle cx="12" cy="12" r="9"/>,
  plus: <><path d="M12 5v14M5 12h14"/></>,
  save: <><path d="M5 3h12l4 4v14H3V3z"/><path d="M7 3v6h9V3M7 21v-8h10v8"/></>,
  'git-compare-arrows': <><path d="M7 3v18M7 3l-3 3M7 3l3 3M17 21V3M17 21l-3-3M17 21l3-3M7 8h7a3 3 0 0 1 3 3v2M17 13l-3-3M17 13l3-3"/></>,
};
function Icon({ name = 'spark', size = 20, className = '' }) {
  return <svg className={`icon ${className}`} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{iconArt[name] || iconArt.spark}</svg>;
}

function handleArtworkError(event) {
  const image = event.currentTarget;
  if (image.dataset.fallbackApplied === 'true') {
    image.style.visibility = 'hidden';
    return;
  }
  image.dataset.fallbackApplied = 'true';
  image.src = '/images/learning/cyber-foundations.svg';
  image.classList.add('artwork-fallback');
}

const attackPatterns = [
  {
    id: "basics-phishing", icon: "mail", title: "Phishing & social engineering", family: "IDENTITY & TRUST", level: "Beginner",
    short: "Messages impersonate a trusted person or service and try to rush someone into clicking, paying, or sharing information.",
    cause: "Attackers exploit urgency, authority, familiar branding, and sender details that are difficult to verify at a glance.",
    example: "A fake delivery notice links to a sign-in page on an unrelated domain.",
    defend: "Open the official app or type the known address yourself, verify unexpected requests through a second channel, and use MFA or passkeys.",
    nextStep: "Inspect a fictional message: mark the sender domain, requested action, urgency language, and a safe way to verify it.",
    image: "/images/learning/basics/basics-phishing.webp"
  },
  {
    id: "basics-password-reuse", icon: "lock", title: "Password reuse", family: "IDENTITY & TRUST", level: "Beginner",
    short: "A password exposed on one service can be tried against another account where the same person reused it.",
    cause: "Password reuse turns a breach at one service into a risk for other accounts; weak recovery controls can add exposure.",
    example: "A password used on a low-risk forum is reused on the person's primary email account.",
    defend: "Use unique passwords stored in a password manager, enable MFA or passkeys, and secure the email account used for recovery.",
    nextStep: "Make a fictional account-security checklist: unique credential, MFA, recovery method, and breach-response plan.",
    image: "/images/learning/basics/basics-password-reuse.webp"
  },
  {
    id: "basics-mfa-fatigue", icon: "shield-check", title: "Multi-factor authentication fatigue", family: "IDENTITY & TRUST", level: "Beginner",
    short: "Repeated approval prompts may pressure a person into approving a sign-in they did not initiate.",
    cause: "Repeated prompts, unclear context, and weak rate limits can make an unexpected request look routine.",
    example: "A user receives several push notifications while not trying to sign in.",
    defend: "Deny and report unexpected prompts, review account sessions, rate-limit challenges, and prefer phishing-resistant MFA where available.",
    nextStep: "Write the three actions a user should take after an unsolicited MFA prompt: deny, report, and review the account through the official service.",
    image: "/images/learning/basics/basics-mfa.webp"
  },
  {
    id: "basics-credential-stuffing", icon: "lock", title: "Credential stuffing & brute-force attempts", family: "IDENTITY & TRUST", level: "Beginner â†’ Intermediate",
    short: "Repeated sign-in attempts may reuse leaked credentials or guess weak passwords at scale.",
    cause: "Weak passwords, reused credentials, missing rate limits, and limited sign-in monitoring make account attacks easier to miss.",
    example: "A sample sign-in log contains many failed attempts followed by a success that needs investigation.",
    defend: "Use unique passwords and MFA; monitor failure patterns, apply risk-aware rate limits, and review successful sign-ins after unusual failures.",
    nextStep: "With a supplied synthetic log, group failures by account and time window, compare with normal activity, and document uncertainty before concluding.",
    image: "/images/learning/basics/basics-credential-stuffing.webp"
  },
  {
    id: "basics-injection", icon: "code", title: "Injection flaws", family: "WEB APPLICATIONS", level: "Beginner â†’ Intermediate",
    short: "An application treats untrusted input as part of a command or query instead of ordinary data.",
    cause: "Unsafe string concatenation blurs the boundary between program instructions and user-supplied values.",
    example: "A search page builds a database query by joining raw user input into the query string.",
    defend: "Use parameterized queries, safe APIs, least-privilege database accounts, and tests that cover unusual input.",
    nextStep: "Compare a toy vulnerable query with a parameterized version in a local or designated training lab; do not test a live application without permission.",
    image: "/images/learning/basics/basics-injection.webp"
  },
  {
    id: "basics-xss", icon: "code", title: "Cross-site scripting (XSS)", family: "WEB APPLICATIONS", level: "Beginner â†’ Intermediate",
    short: "A browser interprets untrusted page content as active markup or script instead of displaying it as data.",
    cause: "Unsafe HTML insertion and missing context-aware output encoding can let user content alter a page's behaviour.",
    example: "A comment is rendered as markup when it should have appeared as plain text.",
    defend: "Use safe templating, context-aware output encoding, careful HTML sanitization where needed, and defence-in-depth security headers.",
    nextStep: "In a deliberately vulnerable training page, compare how plain text and safely encoded output render. Record the fix, not only the symptom.",
    image: "/images/learning/basics/basics-xss.webp"
  },
  {
    id: "basics-access-control", icon: "users", title: "Broken access control", family: "WEB APPLICATIONS", level: "Beginner â†’ Intermediate",
    short: "A user can access a record or action outside the permissions assigned to their role or account.",
    cause: "The server may trust a client-supplied record identifier or check authentication without enforcing authorization.",
    example: "A user who owns one training record can view another fictional user's record by changing an identifier.",
    defend: "Check authorization on the server for every sensitive action, deny by default, and test owner/other-user and low/high-privilege cases.",
    nextStep: "Build a small access-control test matrix for owner, peer, and administrator roles in an intentionally vulnerable lab.",
    image: "/images/learning/basics/basics-access-control.webp"
  },
  {
    id: "basics-session-cookies", icon: "lock", title: "Session & cookie security", family: "WEB APPLICATIONS", level: "Beginner â†’ Intermediate",
    short: "A stolen or poorly protected session token can let someone act as a logged-in user.",
    cause: "Insecure transport, permissive cookie settings, long-lived tokens, and weak session rotation increase risk.",
    example: "A session remains active on a shared computer after the user walks away.",
    defend: "Use HTTPS, appropriate Secure/HttpOnly/SameSite cookie attributes, sensible expiration, session rotation, and a working logout/revocation flow.",
    nextStep: "Review cookie attributes in developer tools on an application you own or an authorized training instance; never share real session tokens in notes.",
    image: "/images/learning/basics/basics-session-cookies.webp"
  },
  {
    id: "basics-csrf", icon: "shield-check", title: "Cross-site request forgery (CSRF)", family: "WEB APPLICATIONS", level: "Beginner â†’ Intermediate",
    short: "A browser may send an unwanted state-changing request while a person is already authenticated to a service.",
    cause: "Browsers can attach credentials automatically, while an application may fail to verify that the action was intentionally initiated.",
    example: "A signed-in training account receives an unexpected settings-change request from another page.",
    defend: "Use anti-CSRF tokens or equivalent framework protections, appropriate SameSite cookies, and re-authentication for high-risk actions.",
    nextStep: "In a controlled web-security lab, compare a protected state-changing request with the lab's intentionally unprotected example.",
    image: "/images/learning/basics/basics-csrf.webp"
  },
  {
    id: "basics-dns", icon: "globe", title: "DNS resolution risks", family: "NETWORKING", level: "Beginner",
    short: "DNS translates names into records such as IP addresses; incorrect or manipulated answers can misdirect clients.",
    cause: "Untrusted resolver settings, spoofed answers, or misconfiguration can produce results that differ from expectations.",
    example: "A known training hostname resolves to an unexpected address, prompting a careful second check.",
    defend: "Use trusted resolvers, maintain DNS configuration, validate HTTPS certificates, and consider DNSSEC where supported; one lookup alone is not proof of compromise.",
    nextStep: "Use nslookup or dig on a known public training domain, record the resolver and timestamp, and compare results without targeting private systems.",
    image: "/images/learning/basics/basics-dns-resolution.webp"
  },
  {
    id: "basics-tls", icon: "shield-check", title: "Secure transport & TLS", family: "NETWORKING", level: "Beginner",
    short: "Without properly validated encryption, network intermediaries may observe or alter traffic in transit.",
    cause: "Plaintext protocols, certificate mistakes, or ignored browser warnings undermine transport protection.",
    example: "A login form is submitted over an unencrypted connection on a public network.",
    defend: "Use HTTPS/TLS, keep certificates valid, fix certificate warnings rather than bypassing them, and remember that a VPN does not replace TLS validation.",
    nextStep: "Inspect HTTPS and certificate status on a site you own or an authorized practice service and note the issuer, validity, and warning state.",
    image: "/images/learning/basics/basics-secure-transport.webp"
  },
  {
    id: "basics-cloud-exposure", icon: "shield-check", title: "Misconfiguration & exposed data", family: "CLOUD & CONFIGURATION", level: "Beginner â†’ Intermediate",
    short: "A service, storage location, or account permits more access than its owner intended.",
    cause: "Default settings, broad permissions, forgotten resources, and weak identity boundaries can expose data.",
    example: "A fictional project backup is stored in a shared location that anyone with the link can read.",
    defend: "Apply least privilege, private-by-default storage, asset inventory, logging, and periodic configuration reviews.",
    nextStep: "Review a fictional cloud policy and mark which permissions should be narrowed before deployment; avoid creating real cloud resources for this exercise.",
    image: "/images/learning/basics/basics-cloud-exposure.webp"
  },
  {
    id: "basics-ransomware", icon: "shield-alert", title: "Malware & ransomware", family: "ENDPOINT SECURITY", level: "Beginner",
    short: "Unwanted software can steal information, disrupt systems, or make data unavailable.",
    cause: "Unsafe downloads, exploited weaknesses, stolen credentials, or excessive permissions may enable an incident.",
    example: "A workstation shows unexpected file changes and endpoint protection generates an alert.",
    defend: "Patch systems, limit privileges, use reputable endpoint protection, maintain tested offline or immutable backups, and rehearse recovery.",
    nextStep: "Use a benign sample report or synthetic alert to record the detection source, host, timestamp, containment question, and recovery evidence. Do not download unknown samples.",
    image: "/images/learning/basics/basics-ransomware.webp"
  },
  {
    id: "basics-supply-chain", icon: "git-compare-arrows", title: "Supply-chain compromise", family: "SOFTWARE SECURITY", level: "Beginner â†’ Intermediate",
    short: "A trusted dependency, update path, build service, or supplier is misused to affect downstream users.",
    cause: "Projects depend on packages, build systems, credentials, and services maintained by many parties.",
    example: "A project receives an unexpected dependency version with unexplained changes.",
    defend: "Review and pin dependencies, validate provenance where available, monitor advisories, restrict build permissions, and keep a component inventory or SBOM.",
    nextStep: "Inspect a public project's lockfile or SBOM and write down one dependency, its pinned version, and a trusted place to check advisories.",
    image: "/images/learning/basics/basics-supply-chain.webp"
  },
  {
    id: "basics-dos", icon: "network", title: "Denial of service (DoS)", family: "RESILIENCE", level: "Beginner â†’ Intermediate",
    short: "Excessive or expensive requests can exhaust a service's capacity and reduce availability for legitimate users.",
    cause: "Limited capacity, unbounded expensive operations, or insufficient upstream protection can amplify traffic spikes.",
    example: "A service's synthetic metrics show a sudden rise in requests and latency while successful responses fall.",
    defend: "Use rate limits, sensible quotas, caching/CDN protection, upstream DDoS mitigation, alerting, and a documented incident plan.",
    nextStep: "Review fictional request-rate and latency graphs; distinguish a traffic spike from confirmed malicious activity before escalating.",
    image: "/images/learning/basics/basics-denial-of-service.webp"
  },
  {
    id: "basics-incident-response", icon: "radar", title: "Logging & incident response", family: "DETECTION & RESPONSE", level: "Beginner â†’ Intermediate",
    short: "Useful, time-aligned logs help teams reconstruct events, test hypotheses, and explain what remains unknown.",
    cause: "Disabled logging, inconsistent timestamps, narrow retention, or missing context can leave investigators with gaps.",
    example: "An alert exists, but the team cannot tell which account or process produced the surrounding activity.",
    defend: "Centralize relevant logs, synchronize time, restrict log access, set appropriate retention, and maintain tested response playbooks.",
    nextStep: "Create a timeline from five synthetic events and label each statement as an observed fact, an inference, or an unanswered question.",
    image: "/images/learning/basics/basics-incident-response.webp"
  }
];

// Original, action-oriented learner encouragement written for OpenCyberPath.
// These are not quotations attributed to external people.
const gratitudeQuotes = [
  { id: 'stuck', number: '01', label: 'WHEN YOU FEEL STUCK', icon: 'target', tone: 'coral', quote: 'Stuck does not mean incapable. It means you have reached the edge of what you know. Turn the problem into one small question, test one idea, and keep moving.', nextStep: 'Write down one question you can answer next.' },
  { id: 'starting', number: '02', label: 'STARTING FROM ZERO', icon: 'route', tone: 'blue', quote: 'You do not need a perfect setup or a paid course to begin. Start with one trusted resource, one safe lab, and the curiosity to ask why.', nextStep: 'Choose one beginner resource and spend 20 focused minutes with it.' },
  { id: 'lab', number: '03', label: 'WHEN A LAB DOESN’T WORK', icon: 'terminal', tone: 'violet', quote: 'A failed test is feedback-not a verdict on your ability. Read the error, change one thing at a time, and learn what the result tells you.', nextStep: 'Explain the error in your own words before trying again.' },
  { id: 'portfolio', number: '04', label: 'BUILDING YOUR PORTFOLIO', icon: 'chart', tone: 'amber', quote: 'A small project you can explain is stronger than a giant project you barely understand. Show your evidence, decisions, limits, and what you learned.', nextStep: 'Document one finding, screenshot, or lesson from today.' },
  { id: 'comparison', number: '05', label: 'WHEN OTHERS SEEM AHEAD', icon: 'spark', tone: 'teal', quote: 'Do not compare your first chapter to someone else’s tenth year. Measure progress by what you can explain today that confused you yesterday.', nextStep: 'Write down one thing you understand now that was confusing last week.' },
  { id: 'gratitude', number: '06', label: 'PASS THE KNOWLEDGE ON', icon: 'users', tone: 'gold', quote: 'When a tutorial, tool, or kind answer helps you, acknowledge the people behind it. Credit the source, respect its terms, then make the path clearer for the next learner.', nextStep: 'Share one useful resource and credit the person or project behind it.' },
];

function slugify(value = '') {
  return String(value).toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
function resourceMonogram(name = '') {
  return String(name)
    .split(/\s+/)
    .map((word) => {
      const match = word.match(/[A-Za-z0-9]/);
      return match ? match[0].toUpperCase() : '';
    })
    .filter(Boolean)
    .slice(0, 4)
    .join('');
}
function ExternalLink({ href, children, className = '', title }) {
  return <a className={className} href={href} target="_blank" rel="noreferrer" title={title}>{children}</a>;
}
function publicPath(path) {
  if (!path) return '#';
  return path.startsWith('/') ? path : `/${path}`;
}
function Logo({ onClick }) {
  return <a className="brand" href="#top" onClick={(event) => { event.preventDefault(); onClick('home'); }} aria-label="OpenCyberPath home">
    <span className="brand-mark brand-mark-temporary-anime"><img className="brand-mark-image" src="/images/temporary-anime-icon.png" alt="" aria-hidden="true" /></span>
    <span className="brand-name">OpenCyberPath<small>LEARN · PRACTISE · GROW TOGETHER</small></span>
  </a>;
}
/* OCP RESOURCE VISUAL UPGRADE V2 */
const RESOURCE_CARD_ART = {
  soc: '/images/resource-cards/soc-dashboard.webp',
  cloud: '/images/resource-cards/cloud-security.webp',
  appsec: '/images/resource-cards/appsec-proxy.webp',
  learning: '/images/resource-cards/cyber-learning.webp',
  pentest: '/images/resource-cards/pentest-lab.webp',
  packets: '/images/resource-cards/packet-analysis.webp',
  network: '/images/resource-cards/network-operations.webp',
  endpoint: '/images/resource-cards/endpoint-defense.webp',
  forensics: '/images/resource-cards/forensics-timeline.webp',
  grc: '/images/resource-cards/governance-risk.webp',
  intel: '/images/resource-cards/threat-intelligence.webp',
  code: '/images/resource-cards/secure-code.webp',
  crypto: '/images/resource-cards/cryptography.webp',
  linux: '/images/resource-cards/linux-admin.webp',
  architecture: '/images/resource-cards/cloud-architecture.webp',
  malware: '/images/resource-cards/malware-reverse.webp'
};

function resourceCardArtwork(resource) {
  const text = `${resource?.id || ''} ${resource?.name || ''} ${resource?.provider || ''} ${resource?.category || ''} ${resource?.kind || ''} ${(resource?.skills || []).join(' ')}`.toLowerCase();
  if (/microsoft defender|endpoint protection|endpoint detection|wazuh/.test(text)) return RESOURCE_CARD_ART.endpoint;
  if (/wireshark|packet analysis|pcap|netflow|network-flow|zeek network/.test(text)) return RESOURCE_CARD_ART.packets;
  if (/nmap|subfinder|nuclei|network discovery|port scan|dns enumeration/.test(text)) return RESOURCE_CARD_ART.network;
  if (/splunk|sigma detection|\bsiem\b|soc & siem|detection engineering/.test(text)) return RESOURCE_CARD_ART.soc;
  if (/sentinel|kql|azure security|aws security|cloudflare learning|cloud security training/.test(text)) return RESOURCE_CARD_ART.cloud;
  if (/tryhackme|hack the box|pwn\.college|over.?the.?wire|cyberdefenders|juice shop|webgoat|crapi|ctf platform/.test(text)) return RESOURCE_CARD_ART.learning;
  if (/owasp zap|mitmproxy|web security academy|hackerone|bugcrowd|proxy|application security verification|api security top 10/.test(text)) return RESOURCE_CARD_ART.appsec;
  if (/sqlmap|metasploit|penetration testing|pentest|ffuf|exploit framework/.test(text)) return RESOURCE_CARD_ART.pentest;
  if (/remnux|malware analysis|reverse engineering|ghidra|yara|disassembly/.test(text)) return RESOURCE_CARD_ART.malware;
  if (/autopsy|digital forensic|incident response|\bdfir\b|evidence handling|forensic technique/.test(text)) return RESOURCE_CARD_ART.forensics;
  if (/threat intelligence|mitre att&ck|known exploited vulnerabilit|vulnerability database|botnet|intel feed/.test(text)) return RESOURCE_CARD_ART.intel;
  if (/secure coding|codeql|github actions|devsecops|software assurance|secure development|source code review/.test(text)) return RESOURCE_CARD_ART.code;
  if (/cryptograph|cryptohack|cryptool|encryption|cipher|hash algorithm/.test(text)) return RESOURCE_CARD_ART.crypto;
  if (/linux|powershell|command line|shell basics|system administration|over.?the.?wire bandit/.test(text)) return RESOURCE_CARD_ART.linux;
  if (/governance|risk management|\bgrc\b|nist cybersecurity framework|nist csf|cis controls|compliance|policy framework/.test(text)) return RESOURCE_CARD_ART.grc;
  if (/cloud|aws|azure|gcp|kubernetes|identity and access|infrastructure security/.test(text)) return RESOURCE_CARD_ART.architecture;
  const category = (resource?.category || '').toLowerCase();
  if (category.includes('soc') || category.includes('detection')) return RESOURCE_CARD_ART.soc;
  if (category.includes('cloud')) return RESOURCE_CARD_ART.cloud;
  if (category.includes('bug bounty') || category.includes('web') || category.includes('penetration')) return RESOURCE_CARD_ART.appsec;
  if (category.includes('hands-on') || category.includes('lab')) return RESOURCE_CARD_ART.learning;
  if (category.includes('dfir') || category.includes('forensic')) return RESOURCE_CARD_ART.forensics;
  if (category.includes('grc') || category.includes('governance')) return RESOURCE_CARD_ART.grc;
  if (category.includes('threat hunting') || category.includes('threat intelligence')) return RESOURCE_CARD_ART.intel;
  if (category.includes('engineering')) return RESOURCE_CARD_ART.code;
  if (category.includes('crypt')) return RESOURCE_CARD_ART.crypto;
  if (category.includes('foundation') || category.includes('networking')) return RESOURCE_CARD_ART.linux;
  if (category.includes('security concepts')) return RESOURCE_CARD_ART.code;
  return RESOURCE_CARD_ART.learning;
}

function resourceMatchesAccess(resource, selected) {
  if (selected === 'All access types') return true;
  const kind = (resource?.kind || '').toLowerCase();
  const account = (resource?.account || '').toLowerCase();
  const note = (resource?.note || '').toLowerCase();
  if (selected === 'Free') return kind.includes('free') && !kind.includes('tier') && !kind.includes('varies');
  if (selected === 'Free (account needed)') return kind.includes('free') && /account|sign.?in|registration|required/.test(account);
  if (selected === 'Open source') return kind.includes('open source');
  if (selected === 'Free tier / varies') return kind.includes('tier') || kind.includes('varies') || /access varies|free tier/.test(note);
  if (selected === 'Paid / Subscription') return /paid|subscription|commercial|exam fee|voucher fee/.test(`${kind} ${account} ${note}`);
  return true;
}

function resourceMatchesType(resource, selected) {
  if (!selected || selected === 'All') return true;
  const text = `${resource?.name || ''} ${resource?.provider || ''} ${resource?.category || ''} ${resource?.kind || ''} ${resource?.description || ''}`.toLowerCase();
  if (selected === 'Courses') return /course|training|learning path|curriculum|tutorial series/.test(text);
  if (selected === 'Labs') return /\blab\b|hands-on|interactive exercise|sandbox|training app|practice room/.test(text);
  if (selected === 'Documentation') return /documentation|official reference|technical guide|quick-start|getting started|standard|knowledge base/.test(text);
  if (selected === 'Tools') return /open source tool|open-source tool|scanner|proxy|framework|command-line tool|toolkit/.test(text);
  if (selected === 'Practice Platforms') return /tryhackme|hack the box|pwn\.college|over.?the.?wire|cyberdefenders|web security academy|practice platform/.test(text);
  if (selected === 'Certifications') return /certification|certificate|credential|exam voucher|professional exam|digital badge/.test(text);
  if (selected === 'Datasets') return /dataset|research data|benchmark capture|netflow|pcap archive/.test(text);
  if (selected === 'Frameworks') return /framework|standard|critical security controls|attack framework|maturity model/.test(text);
  if (selected === 'Career') return /career|job role|work role|skills framework|career pathway|resume/.test(text);
  if (selected === 'Videos') return /video|webinar|lecture recording|youtube/.test(text);
  return true;
}
function ResourceCard({ resource }) {
  const kind = resource.kind.toLowerCase();
  const providerFavicon = (() => {
    try {
      const host = new URL(resource.url).hostname;
      return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=128`;
    } catch {
      return '';
    }
  })();
  const accessClass = kind.includes('open source') ? 'open' : kind.includes('tier') || kind.includes('varies') ? 'limited' : kind.includes('dataset') ? 'research' : 'free';
  return <article className={`resource-card resource-${slugify(resource.category)}`}>
    <div className="resource-art"><img src={resourceCardArtwork(resource)} alt="" loading="lazy" onError={handleArtworkError} /><span className="art-icon"><Icon name={resource.icon || 'book'} size={20} /></span><span className="level-label">{resource.level}</span>
      <div className="resource-art-heading">
        <span className="resource-provider-logo" title={resource.provider} aria-label={`${resource.provider} official site`}>
          {providerFavicon && <img src={providerFavicon} alt="" loading="lazy" referrerPolicy="no-referrer" onLoad={(event) => event.currentTarget.parentElement?.classList.add('has-favicon')} onError={(event) => { event.currentTarget.hidden = true; }} />}
          <span className="resource-provider-fallback">{resource.monogram || resourceMonogram(resource.provider || resource.name)}</span>
        </span>
        <div className="resource-art-title">
          <span className="resource-art-category">{resource.category}</span>
          <h3>{resource.name}</h3>
          <div className="provider-name">BY {resource.provider.toUpperCase()}</div>
        </div>
      </div></div>
    <div className="resource-card-body">
      <div className="card-category">{resource.category}</div><span className="resource-provider-logo" title={resource.provider} aria-label={`${resource.provider} official site`}>
        {providerFavicon && <img src={providerFavicon} alt="" loading="lazy" referrerPolicy="no-referrer" onLoad={(event) => event.currentTarget.parentElement?.classList.add('has-favicon')} onError={(event) => { event.currentTarget.hidden = true; }} />}
        <span className="resource-provider-fallback">{resource.monogram || resourceMonogram(resource.provider || resource.name)}</span>
      </span><h3>{resource.name}</h3><div className="provider-name">BY {resource.provider.toUpperCase()}</div>
      <p className="card-description">{resource.description}</p>
      <div className="skill-tags">{resource.skills.slice(0, 3).map((skill) => <span key={skill}>{skill}</span>)}</div>
      <div className="access-line"><span className={`access-badge ${accessClass}`}><Icon name={accessClass === 'open' ? 'check-circle' : accessClass === 'limited' ? 'alert-triangle' : 'book'} size={13} />{resource.kind}</span><span className="account-note">{resource.account}</span></div>
      <p className="resource-note">{resource.note}</p>
      <details className="resource-detail-panel">
        <summary><span className="resource-detail-summary-copy"><small>RESOURCE FIELD GUIDE</small><strong>What you will learn &amp; how to begin</strong></span><span className="resource-detail-chevron" aria-hidden="true">+</span></summary>
        <div className="resource-detail-body">
          <section className="resource-detail-section"><small>SKILLS COVERED</small><div className="resource-detail-skill-list">{(resource.skills || []).map((skill) => <span key={`${resource.id}-${skill}`}>{skill}</span>)}</div></section>
          <section className="resource-detail-section"><small>ACCESS &amp; SETUP</small><p><b>{resource.kind}</b> · {resource.account || 'Check the provider page for current sign-in requirements.'}</p></section>
          <section className="resource-detail-section"><small>PROVIDER NOTE</small><p>{resource.note || 'Review the provider page for current prerequisites, terms, and setup instructions.'}</p></section>
          <section className="resource-detail-section"><small>HOW TO BEGIN</small><ol className="resource-detail-steps"><li>Review the provider page for its intended audience, current structure, and prerequisites.</li><li>Start with the overview or introductory material the provider recommends for your level.</li><li>Before hands-on work, check any account, cost, lab-permission, and environment requirements.</li></ol></section>
          <p className="resource-detail-disclaimer">This is an external resource. OpenCyberPath does not host or control the provider’s content, access policy, prices, or availability. Always check the original page.</p>
        </div>
      </details>
      <ExternalLink className="card-link" href={resource.url}>Open resource <Icon name="arrow-up-right" size={16} /></ExternalLink>
      {resource.practiceUrl && <ExternalLink className="card-link card-link-practice" href={resource.practiceUrl} title={`Guided practice for ${resource.name}`}>Guided practice <Icon name="arrow-up-right" size={16} /></ExternalLink>}
      <ResourceHealthStatus url={resource.url} />
      <a className="resource-report-link" href={buildResourceReportUrl({ id: resource.id, title: resource.name, provider: resource.provider, url: resource.url, type: resource.kind })} target="_blank" rel="noreferrer">Report a link or access problem ↗</a>
    </div>
  </article>;
}
// path-artwork-explicit-by-id-v1.3: card artwork must honor these two path-specific illustrations.
function pathArtwork(path) {
  const pathSpecificArtwork = {
    'soc-blue-team': '/images/learning/career-soc-blue-team-distinct-v1.svg',
    'threat-hunting-detection-engineering': '/images/learning/career-threat-hunting-distinct-v1.svg',
  };
  if (path?.id && pathSpecificArtwork[path.id]) return pathSpecificArtwork[path.id];
  return resourceCardArtwork({ ...path, name: path?.title || path?.name || '', category: path?.title || path?.category || '', skills: path?.topics || [], kind: 'learning path' });
}
function labArtwork(lab) {
  return resourceCardArtwork({ ...lab, name: lab?.title || lab?.name || '', description: lab?.summary || lab?.description || '', skills: lab?.tags || [], category: lab?.category || '', kind: lab?.kind || 'practice lab' });
}
function PathCard({ path, onClick }) {
  return <article className={`path-card path-${path.id}`}>
    <div className="path-art"><img src={pathArtwork(path)} alt={`${path.title} learning path`} loading="lazy" onError={handleArtworkError} /><div className="path-art-shade"/><span className="path-icon"><Icon name={path.icon} size={23} /></span><span className="path-number">{path.number} / LEARNING PATH</span></div>
    <div className="path-body"><div className="path-card-top"><span className="level-label">{path.level}</span><Icon name="arrow-up-right" size={18} /></div>
      <h3>{path.title}</h3><p>{path.desc}</p><div className="topic-list">{path.topics.map((topic) => <span key={topic}><Icon name="check-circle" size={14} />{topic}</span>)}</div>
      <div className="path-outcome"><small>YOUR MILESTONE</small><p>{path.outcome}</p></div>
      <button className="button button-card" onClick={() => onClick(path.id)}>Explore this path <Icon name="arrow-right" size={16} /></button>
    </div>
  </article>;
}
function LabCard({ lab, compact = false }) {
  return <article className={`lab-card lab-${slugify(lab.category || 'notes')} lab-item-${slugify(lab.id)} ${compact ? 'lab-card-compact' : ''}`}>
    <div className="lab-art"><img src={labArtwork(lab)} alt="" loading="lazy" onError={handleArtworkError} /><div className="lab-art-shade"/><span className="lab-icon"><Icon name={lab.icon || 'file-text'} size={23} /></span><span className="lab-kind">{lab.kind}</span></div>
    <div className="lab-body"><div className="lab-card-top"><span className="lab-category">{lab.category || 'Learning notes'}</span><span className="level-label">{lab.level}</span></div>
      <h3>{lab.title}</h3><p className="card-description">{lab.summary}</p>
      <div className="lab-meta"><span><Icon name="clock" size={13} />{lab.estimated}</span><span><Icon name="target" size={13} />{lab.skill}</span></div>
      <div className="lab-tags">{(lab.tags || []).map((tag) => <span key={tag}>{tag}</span>)}</div>
      <div className="download-row"><a className="download-button primary-download" href={publicPath(lab.pdf)} download><Icon name="download" size={15} />PDF</a><a className="download-button" href={publicPath(lab.docx)} download><Icon name="download" size={15} />DOCX</a></div>
      {(lab.dataset || lab.script || lab.worksheet) && <div className="lab-extra">{lab.dataset && <a href={publicPath(lab.dataset)} download>Sample data <Icon name="arrow-up-right" size={13} /></a>}{lab.script && <a href={publicPath(lab.script)} download>Evaluation script <Icon name="arrow-up-right" size={13} /></a>}{lab.worksheet && <a href={publicPath(lab.worksheet)} download>Scope worksheet <Icon name="arrow-up-right" size={13} /></a>}</div>}
      <Suspense fallback={<p className="section-loading">Loading related lab links...</p>}><ExternalLabLinks labId={lab.id} /></Suspense>
    </div>
  </article>;
}
function PageHeading({ kicker, title, emphasis, description }) {
  return <div className="section-heading"><div><div className="section-kicker">{kicker}</div><h2>{title}<br /><em>{emphasis}</em></h2></div><p>{description}</p></div>;
}

function parseCsvText(text = '') {
  const records = [];
  let fields = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (char === '"') {
      if (quoted && text[i + 1] === '"') { field += '"'; i += 1; }
      else quoted = !quoted;
    } else if (char === ',' && !quoted) {
      fields.push(field); field = '';
    } else if (char === '\n' && !quoted) {
      fields.push(field.replace(/\r$/, ''));
      if (fields.some((value) => value.trim() !== '')) records.push(fields);
      fields = []; field = '';
    } else {
      field += char;
    }
  }
  if (field.length || fields.length) {
    fields.push(field.replace(/\r$/, ''));
    if (fields.some((value) => value.trim() !== '')) records.push(fields);
  }
  if (!records.length) return [];
  const headers = records.shift().map((header, index) => (index === 0 ? header.replace(/^\uFEFF/, '') : header).trim());
  return records.map((values) => Object.fromEntries(headers.map((header, index) => [header, (values[index] || '').trim()] )));
}

function evaluateSampleRule(rows) {
  const result = { tp: 0, fp: 0, tn: 0, fn: 0, ambiguous: 0, scored: 0 };
  for (const row of rows) {
    const label = String(row.activity_label || '').trim().toLowerCase();
    const process = String(row.process || '').trim().replace(/\//g, '\\').split('\\').pop().toLowerCase();
    const command = String(row.command_line || '').toLowerCase();
    const predicts = process === 'powershell.exe' && /(?:^|\s)-(?:enc|encodedcommand)(?:\s|$)/.test(command);
    if (label === 'ambiguous') { result.ambiguous += 1; continue; }
    if (!['benign', 'suspicious'].includes(label)) continue;
    result.scored += 1;
    if (label === 'suspicious' && predicts) result.tp += 1;
    else if (label === 'suspicious' && !predicts) result.fn += 1;
    else if (label === 'benign' && predicts) result.fp += 1;
    else result.tn += 1;
  }
  const div = (a, b) => b ? a / b : 0;
  result.accuracy = div(result.tp + result.tn, result.scored);
  result.precision = div(result.tp, result.tp + result.fp);
  result.recall = div(result.tp, result.tp + result.fn);
  result.specificity = div(result.tn, result.tn + result.fp);
  result.f1 = div(2 * result.precision * result.recall, result.precision + result.recall);
  return result;
}


const MODULE_PROGRESS_STORAGE_KEY = 'open-cyber-path-module-checkpoints-v1';
const MODULE_CHECKPOINT_FIELDS = ['understood', 'practised', 'evidence'];
const ACCOUNT_REQUIRED_PAGES = new Set(['learning-studio', 'path-detail', 'labs', 'ctf-lab', 'systems-academy', 'cyberrange', 'skillproof', 'offline-learning']);
const ACCOUNT_REQUIRED_LABELS = { 'learning-studio': 'My Learning', 'path-detail': 'this learning path', labs: 'the lab library', 'ctf-lab': 'CTF Practice', 'systems-academy': 'Systems Academy', cyberrange: 'CyberRange', skillproof: 'SkillProof', 'offline-learning': 'Offline Learning' };
const PENDING_LEARNING_ROUTE_KEY = 'opencyberpath-pending-learning-route-v1';

const NAVIGATION_STATE_STORAGE_KEY = 'opencyberpath-current-navigation-v1';
const NAVIGABLE_PAGES = new Set([
  'home', 'learning-studio', 'roadmap', 'path-detail', 'resources', 'labs', 'ctf-lab',
  'liveops', 'cyber-pulse', 'youtube-live-learning', 'certifications', 'systems-academy',
  'tools', 'career-hub', 'resume-studio', 'job-hub', 'application-demo', 'cyberrange', 'caselab',
  'offline-learning', 'skillproof', 'concepts', 'creator', 'learning-access',
]);

function readStoredPendingLearningDestination() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(PENDING_LEARNING_ROUTE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || !ACCOUNT_REQUIRED_PAGES.has(parsed.page)) return null;
    const options = {};
    if (typeof parsed.options?.activeLearningPathId === 'string' && parsed.options.activeLearningPathId.length <= 160) {
      options.activeLearningPathId = parsed.options.activeLearningPathId;
    }
    if (typeof parsed.options?.academyPathId === 'string' && parsed.options.academyPathId.length <= 160) {
      options.academyPathId = parsed.options.academyPathId;
    }
    return { page: parsed.page, options };
  } catch {
    return null;
  }
}

function readSavedNavigation() {
  const fallback = {
    page: 'home',
    pendingLearningDestination: null,
    activeLearningPathId: 'soc-blue-team',
    academyPathId: 'all',
  };
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.sessionStorage.getItem(NAVIGATION_STATE_STORAGE_KEY);
    if (!raw) return fallback;
    const saved = JSON.parse(raw);
    if (!saved || typeof saved !== 'object' || Array.isArray(saved)) return fallback;

    const activeLearningPathId = typeof saved.activeLearningPathId === 'string'
      && learningPaths.some((path) => path.id === saved.activeLearningPathId)
      ? saved.activeLearningPathId
      : fallback.activeLearningPathId;
    const academyPathId = typeof saved.academyPathId === 'string' && saved.academyPathId.length <= 160
      ? saved.academyPathId
      : fallback.academyPathId;
    const storedPending = readStoredPendingLearningDestination();
    const requestedPage = NAVIGABLE_PAGES.has(saved.page) ? saved.page : 'home';

    // Never render a protected workspace before the current auth state is known.
    if (requestedPage === 'learning-access') {
      return storedPending
        ? { ...fallback, page: 'learning-access', pendingLearningDestination: storedPending, activeLearningPathId, academyPathId }
        : { ...fallback, activeLearningPathId, academyPathId };
    }
    if (ACCOUNT_REQUIRED_PAGES.has(requestedPage)) {
      const pendingLearningDestination = storedPending || {
        page: requestedPage,
        options: { activeLearningPathId, academyPathId },
      };
      return { ...fallback, page: 'learning-access', pendingLearningDestination, activeLearningPathId, academyPathId };
    }
    return { ...fallback, page: requestedPage, activeLearningPathId, academyPathId };
  } catch {
    return fallback;
  }
}

function moduleProgressKey(pathId, moduleTitle) {
  return `${pathId}::${moduleTitle}`;
}

function readModuleProgress() {
  if (typeof window === 'undefined') return {};
  try {
    const saved = JSON.parse(window.localStorage.getItem(MODULE_PROGRESS_STORAGE_KEY) || '{}');
    const raw = saved && typeof saved === 'object' ? (saved.modules || saved) : {};
    const known = new Set(learningPaths.flatMap((path) => path.modules.map((item) => moduleProgressKey(path.id, item.title))));
    const safe = {};
    for (const [key, value] of Object.entries(raw || {})) {
      if (!known.has(key) || !value || typeof value !== 'object') continue;
      safe[key] = {
        ...Object.fromEntries(MODULE_CHECKPOINT_FIELDS.map((field) => [field, value[field] === true])),
        ...(typeof value.updatedAt === 'string' && Number.isFinite(Date.parse(value.updatedAt)) ? { updatedAt: value.updatedAt } : {}),
      };
    }
    return safe;
  } catch {
    return {};
  }
}

function LearningModuleCard({ pathId, module, index, progress = {}, onCheckpointChange }) {
  const allDone = MODULE_CHECKPOINT_FIELDS.every((field) => progress[field] === true);
  const inputPrefix = `${pathId}-${slugify(module.title)}`;
  return <article className={`career-module ${allDone ? 'is-checkpoint-complete' : ''}`}>
    <div className="career-module-head"><span className="career-module-number">{String(index + 1).padStart(2, '0')}</span><div><small>MODULE {String(index + 1).padStart(2, '0')}</small><h3>{module.title}</h3><p>{module.objective}</p></div><span className={`career-module-status ${allDone ? 'is-complete' : ''}`}>{allDone ? 'SELF-CHECK COMPLETE' : 'IN PROGRESS'}</span></div>
    <div className="career-module-grid">
      <div><span><Icon name="book-open" size={14}/> LEARN</span><ul>{module.learn.map((item) => <li key={item}>{item}</li>)}</ul></div>
      <div><span><Icon name="target" size={14}/> PRACTISE</span><p>{module.practice}</p></div>
      <div><span><Icon name="file-text" size={14}/> EVIDENCE TO SAVE</span><p>{module.evidence}</p></div>
    </div>
    <div className="career-module-checkpoints" aria-label={`Self-reported checkpoints for ${module.title}`}>
      <div className="career-module-checkpoints-heading"><div><b>Learning checkpoints</b><small>Mark each item after you complete it. These are personal notes, not a grade or certification.</small></div><span>{MODULE_CHECKPOINT_FIELDS.filter((field) => progress[field] === true).length}/3</span></div>
      <div className="career-module-checkpoint-list">
        <label htmlFor={`${inputPrefix}-understood`}><input id={`${inputPrefix}-understood`} type="checkbox" checked={progress.understood === true} onChange={(event) => onCheckpointChange(pathId, module.title, 'understood', event.target.checked)} /><span><b>I can explain it</b><small>In my own words, without copying the lesson.</small></span></label>
        <label htmlFor={`${inputPrefix}-practised`}><input id={`${inputPrefix}-practised`} type="checkbox" checked={progress.practised === true} onChange={(event) => onCheckpointChange(pathId, module.title, 'practised', event.target.checked)} /><span><b>I practised it</b><small>Using the supplied sample, local lab, or explicitly authorised environment.</small></span></label>
        <label htmlFor={`${inputPrefix}-evidence`}><input id={`${inputPrefix}-evidence`} type="checkbox" checked={progress.evidence === true} onChange={(event) => onCheckpointChange(pathId, module.title, 'evidence', event.target.checked)} /><span><b>I recorded evidence</b><small>I saved my observation and noted a limitation or next check.</small></span></label>
      </div>
      <details className="career-module-reflection"><summary>Knowledge check & reflection</summary><ol><li>What does this module teach you to identify or decide?</li><li>Which observation, source, or exercise supports your answer?</li><li>What could that evidence not prove on its own, and what would you check next?</li></ol><p>Explain the answers in your own words. OpenCyberPath does not grade these reflections automatically.</p></details>
    </div>
  </article>;
}

function App() {
  const auth = useAuth();
  const [initialNavigation] = useState(() => readSavedNavigation());
  const [page, setPage] = useState(initialNavigation.page);
  const [pendingLearningDestination, setPendingLearningDestination] = useState(initialNavigation.pendingLearningDestination);
  const [labCatalogue, setLabCatalogue] = useState(null);
  const [labCatalogueError, setLabCatalogueError] = useState(false);
  useEffect(() => {
    if (page !== 'labs' && page !== 'path-detail') return undefined;
    let cancelled = false;
    import('./data/labs.js')
      .then((module) => {
        if (cancelled) return;
        setLabCatalogue(module.labs);
        setLabCatalogueError(false);
      })
      .catch((error) => {
        if (cancelled) return;
        console.error('Unable to load the lab catalogue.', error);
        setLabCatalogueError(true);
      });
    return () => { cancelled = true; };
  }, [page]);
  const labs = labCatalogue ?? [];
  const [resourceCatalogue, setResourceCatalogue] = useState(null);
  const [resourceCatalogueError, setResourceCatalogueError] = useState(false);
  useEffect(() => {
    if (page !== 'resources' && page !== 'path-detail') return undefined;
    let cancelled = false;
    import('./data/resources.js')
      .then((module) => {
        if (cancelled) return;
        setResourceCatalogue({ resources: module.resources, categories: module.categories });
        setResourceCatalogueError(false);
      })
      .catch((error) => {
        if (cancelled) return;
        console.error('Unable to load the resource catalogue.', error);
        setResourceCatalogueError(true);
      });
    return () => { cancelled = true; };
  }, [page]);
  const resources = resourceCatalogue?.resources ?? [];
  const categories = resourceCatalogue?.categories ?? ['All resources'];
  // The introduction is opt-in: first-time learners get a quiet invitation, not a blocking modal.
  const [showWelcomeTour, setShowWelcomeTour] = useState(false);
  const [showTourInvitation, setShowTourInvitation] = useState(() => {
    try {
      return typeof window !== 'undefined'
        && window.localStorage.getItem('opencyberpath-discovery-tour-v2') !== 'done'
        && window.localStorage.getItem('opencyberpath-discovery-tour-invitation-dismissed-v1') !== 'done';
    } catch {
      return false;
    }
  });
  const dismissWelcomeTour = () => {
    try {
      window.localStorage.setItem('opencyberpath-discovery-tour-v2', 'done');
    } catch {
      // The tour can still be dismissed in memory if storage is unavailable.
    }
    setShowWelcomeTour(false);
    setShowTourInvitation(false);
  };
  const openWelcomeTour = () => {
    setShowTourInvitation(false);
    setShowWelcomeTour(true);
  };
  const dismissTourInvitation = () => {
    try {
      window.localStorage.setItem('opencyberpath-discovery-tour-invitation-dismissed-v1', 'done');
    } catch {
      // The invitation remains dismissed for this render even when storage is unavailable.
    }
    setShowTourInvitation(false);
  };
  const handleTourNavigate = (destination) => {
    dismissWelcomeTour();
    navigate(destination);
  };
  const [moduleProgress, setModuleProgress] = useState(() => readModuleProgress());
  const [cloudProgressStatus, setCloudProgressStatus] = useState('idle');
  const [cloudProgressReady, setCloudProgressReady] = useState(false);
  const [cloudRetryNonce, setCloudRetryNonce] = useState(0);
  const [cloudSyncNonce, setCloudSyncNonce] = useState(0);
  const moduleProgressRef = useRef(moduleProgress);
  moduleProgressRef.current = moduleProgress;
  const cloudProgressReadyRef = useRef(false);
  const cloudBaselineRef = useRef(new Map());
  const cloudInFlightRef = useRef(new Map());
  const [activeLearningPathId, setActiveLearningPathId] = useState(initialNavigation.activeLearningPathId);
  const [academyPathId, setAcademyPathId] = useState(initialNavigation.academyPathId);
  const [domainQuery, setDomainQuery] = useState('');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All resources');
  const [resourceType, setResourceType] = useState('All');
  const [sortBy, setSortBy] = useState('relevance');
  const [cost, setCost] = useState('All access types');
  const [level, setLevel] = useState('All levels');
  const [labLevel, setLabLevel] = useState('All labs');
  const [labCategory, setLabCategory] = useState('All topics');
  const [shareNotice, setShareNotice] = useState('');
  const [copiedGratitudeQuote, setCopiedGratitudeQuote] = useState('');
  const [gratitudeCopyNotice, setGratitudeCopyNotice] = useState('');
  const [huntRows, setHuntRows] = useState([]);
  const [ruleMetrics, setRuleMetrics] = useState(null);
  const [datasetState, setDatasetState] = useState('Loading the included training files...');
  const searchInputRef = useRef(null);
  const navigationHistoryRef = useRef([]);
  const currentNavigationRef = useRef(null);
  currentNavigationRef.current = { page, activeLearningPathId, academyPathId };

  // Keep transient navigation within this browser tab so refresh restores the last screen.
  // Learning progress remains separately stored/synced; this key stores no credentials.
  useEffect(() => {
    try {
      window.sessionStorage.setItem(NAVIGATION_STATE_STORAGE_KEY, JSON.stringify({ page, activeLearningPathId, academyPathId }));
    } catch {
      // Navigation restoration is a convenience; the app remains usable if storage is disabled.
    }
  }, [page, activeLearningPathId, academyPathId]);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return undefined;

    let listenerHandle;
    let disposed = false;

    const registerBackButton = async () => {
      const handle = await CapacitorApp.addListener('backButton', async ({ canGoBack }) => {
        // Let the WebView handle real browser history when it exists.
        if (canGoBack) {
          window.history.back();
          return;
        }

        // Otherwise navigate through OpenCyberPath's internal screens.
        const previous = navigationHistoryRef.current.pop();
        if (previous) {
          currentNavigationRef.current = previous;
          setPage(previous.page);
          setActiveLearningPathId(previous.activeLearningPathId);
          setAcademyPathId(previous.academyPathId);
          window.scrollTo({ top: 0, behavior: 'auto' });
          return;
        }

        // If no earlier screen exists, go home before allowing exit.
        const current = currentNavigationRef.current;
        if (current && current.page !== 'home') {
          const home = {
            page: 'home',
            activeLearningPathId: current.activeLearningPathId,
            academyPathId: current.academyPathId,
          };
          navigationHistoryRef.current = [];
          currentNavigationRef.current = home;
          setPage(home.page);
          setActiveLearningPathId(home.activeLearningPathId);
          setAcademyPathId(home.academyPathId);
          window.scrollTo({ top: 0, behavior: 'auto' });
          return;
        }

        // Exit only when already at Home with no earlier screen.
        await CapacitorApp.exitApp();
      });

      if (disposed) {
        await handle.remove();
      } else {
        listenerHandle = handle;
      }
    };

    registerBackButton().catch((error) => {
      console.error('Unable to register Android back-button handler:', error);
    });

    return () => {
      disposed = true;
      if (listenerHandle) void listenerHandle.remove();
    };
  }, []);

  useEffect(() => {
    const handleShortcut = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        navigate('resources');
        window.setTimeout(() => searchInputRef.current?.focus(), 0);
      }
    };
    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(MODULE_PROGRESS_STORAGE_KEY, JSON.stringify({ version: 1, modules: moduleProgress, savedAt: new Date().toISOString() }));
    } catch {
      // Checkpoints still work in memory if the browser disables local storage.
    }
  }, [moduleProgress]);

  useEffect(() => {
    if (auth.status !== 'authenticated') {
      cloudProgressReadyRef.current = false;
      setCloudProgressReady(false);
      setCloudProgressStatus('idle');
      cloudBaselineRef.current = new Map();
      cloudInFlightRef.current = new Map();
      return undefined;
    }
    if (auth.apiStatus !== 'ready') {
      cloudProgressReadyRef.current = false;
      setCloudProgressReady(false);
      setCloudProgressStatus(auth.apiStatus === 'error' ? 'error' : 'loading');
      return undefined;
    }

    let active = true;
    const controller = new AbortController();
    cloudProgressReadyRef.current = false;
    setCloudProgressReady(false);
    setCloudProgressStatus('loading');

    async function loadAccountProgress() {
      try {
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
        if (!apiBaseUrl) throw new Error('api_base_url_missing');
        const token = await auth.getAccessToken();
        const response = await fetch(`${apiBaseUrl.replace(/\/+$/, '')}/v1/progress`, {
          headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
          credentials: 'omit',
          signal: controller.signal,
        });
        const body = await response.json().catch(() => null);
        if (!response.ok || !Array.isArray(body?.items)) throw new Error('progress_load_failed');
        if (!active) return;
        const remote = moduleProgressFromCloudItems(body.items, learningPaths);
        const merged = mergeModuleProgress(moduleProgressRef.current, remote);
        cloudBaselineRef.current = moduleProgressCloudBaseline(body.items, learningPaths);
        moduleProgressRef.current = merged;
        setModuleProgress(merged);
        cloudProgressReadyRef.current = true;
        setCloudProgressReady(true);
        setCloudProgressStatus('synced');
      } catch {
        if (!active || controller.signal.aborted) return;
        cloudProgressReadyRef.current = false;
        setCloudProgressReady(false);
        setCloudProgressStatus('error');
      }
    }

    void loadAccountProgress();
    return () => { active = false; controller.abort(); };
  }, [auth.status, auth.user?.id, auth.apiStatus, cloudRetryNonce]);

  useEffect(() => {
    if (auth.status !== 'authenticated' || auth.apiStatus !== 'ready' || !cloudProgressReady || !cloudProgressReadyRef.current) return undefined;
    const records = moduleProgressToCloudRecords(moduleProgress);
    const dirty = records.filter((record) => cloudBaselineRef.current.get(record.localKey) !== cloudProgressSignature(record.payload) && !cloudInFlightRef.current.has(record.localKey));
    if (!dirty.length) return undefined;

    setCloudProgressStatus('syncing');
    // Mark the whole batch before the first await to prevent duplicate uploads under StrictMode/rerenders.
    for (const record of dirty) cloudInFlightRef.current.set(record.localKey, cloudProgressSignature(record.payload));
    async function uploadDirtyRecords() {
      let failed = false;
      try {
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
        if (!apiBaseUrl) throw new Error('api_base_url_missing');
        const token = await auth.getAccessToken();
        let index = 0;
        const worker = async () => {
          while (index < dirty.length) {
            const record = dirty[index++];
            const signature = cloudProgressSignature(record.payload);
            try {
              const response = await fetch(`${apiBaseUrl.replace(/\/+$/, '')}/v1/progress/${encodeURIComponent(record.itemId)}`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', Accept: 'application/json' },
                credentials: 'omit',
                body: JSON.stringify({ status: record.payload.status, percent: record.payload.percent, metadata: record.payload.metadata }),
              });
              if (!response.ok) throw new Error('progress_save_failed');
              cloudBaselineRef.current.set(record.localKey, signature);
            } catch {
              failed = true;
            } finally {
              cloudInFlightRef.current.delete(record.localKey);
            }
          }
        };
        await Promise.all(Array.from({ length: Math.min(4, dirty.length) }, () => worker()));
        setCloudProgressStatus(failed ? 'error' : 'synced');
        if (!failed) setCloudSyncNonce((value) => value + 1);
      } catch {
        for (const record of dirty) cloudInFlightRef.current.delete(record.localKey);
        setCloudProgressStatus('error');
      }
    }
    void uploadDirtyRecords();
    return undefined;
  }, [auth.status, auth.user?.id, auth.apiStatus, cloudProgressReady, moduleProgress, cloudSyncNonce]);

  useEffect(() => {
    let active = true;
    const fetchCsv = async (path) => {
      const response = await fetch(path);
      if (!response.ok) throw new Error(`Could not load ${path} (${response.status})`);
      return parseCsvText(await response.text());
    };
    Promise.all([
      fetchCsv('/labs/threat-hunt-auth-dns-samples.csv'),
      fetchCsv('/labs/detection-evaluation-cases.csv'),
    ]).then(([hunt, detection]) => {
      if (!active) return;
      setHuntRows(hunt);
      setRuleMetrics(evaluateSampleRule(detection));
      setDatasetState('Loaded from included CSV files');
    }).catch(() => {
      if (active) setDatasetState('Sample files could not be loaded. Check the local Vite server and /labs paths.');
    });
    return () => { active = false; };
  }, []);

  const huntSummary = useMemo(() => {
    const labels = { benign: 0, suspicious: 0, ambiguous: 0 };
    for (const row of huntRows) {
      const label = String(row.label || '').toLowerCase();
      if (Object.prototype.hasOwnProperty.call(labels, label)) labels[label] += 1;
    }
    return {
      total: huntRows.length,
      failures: huntRows.filter((row) => row.event_type === 'login' && row.result === 'failure').length,
      successes: huntRows.filter((row) => row.event_type === 'login' && row.result === 'success').length,
      dns: huntRows.filter((row) => row.event_type === 'dns_lookup').length,
      labels,
    };
  }, [huntRows]);

  const visibleResources = useMemo(() => {
    const filtered = resources.filter((r) => {
      const searchable = `${r.name} ${r.provider} ${r.category} ${r.description} ${r.skills.join(' ')} ${r.note} ${r.practiceUrl || ''}`.toLowerCase();
      const matchesQuery = searchable.includes(query.trim().toLowerCase());
      const matchesCategory = category === 'All resources' || r.category === category;
      const matchesCost = resourceMatchesAccess(r, cost);
      const matchesSelectedLevel = matchesLevel(r.level, level, 'All levels');
      const matchesType = resourceMatchesType(r, resourceType);
      return matchesQuery && matchesCategory && matchesCost && matchesSelectedLevel && matchesType;
    });
    return filtered.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'beginner') {
        const rank = (item) => /beginner/i.test(item.level) ? 0 : /intermediate/i.test(item.level) ? 1 : 2;
        return rank(a) - rank(b) || a.name.localeCompare(b.name);
      }
      return 0;
    });
  }, [resources, query, category, cost, level, resourceType, sortBy]);
  const visibleLabs = labs.filter((lab) => matchesLevel(lab.level, labLevel, 'All labs') && (labCategory === 'All topics' || lab.category === labCategory));
  const visibleCybersecurityPillars = useMemo(() => {
    const term = domainQuery.trim().toLowerCase();
    if (!term) return cybersecurityPillars;
    return cybersecurityPillars.filter((pillar) => [pillar.title, pillar.summary, pillar.level, ...pillar.specializations.flatMap((item) => [item.name, item.description, item.firstStep])].join(' ').toLowerCase().includes(term));
  }, [domainQuery]);
  const showLearningAccessGate = (destination, options = {}) => {
    const pending = {
      page: destination,
      options: {
        ...(typeof options.activeLearningPathId === 'string' ? { activeLearningPathId: options.activeLearningPathId } : {}),
        ...(typeof options.academyPathId === 'string' ? { academyPathId: options.academyPathId } : {}),
      },
    };
    setPendingLearningDestination(pending);
    try { window.sessionStorage.setItem(PENDING_LEARNING_ROUTE_KEY, JSON.stringify(pending)); } catch { /* In-memory gate still works if session storage is unavailable. */ }
    setPage('learning-access');
    currentNavigationRef.current = { page: 'learning-access', activeLearningPathId, academyPathId };
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigate = (next, options = {}) => {
    if (ACCOUNT_REQUIRED_PAGES.has(next) && auth.status !== 'authenticated') {
      showLearningAccessGate(next, options);
      return;
    }
    if (next === 'home') {
      try { window.sessionStorage.removeItem(PENDING_LEARNING_ROUTE_KEY); } catch { /* Storage may be unavailable. */ }
      setPendingLearningDestination(null);
    }
    const current = currentNavigationRef.current || {
      page,
      activeLearningPathId,
      academyPathId,
    };

    const target = {
      page: next,
      activeLearningPathId: options.activeLearningPathId ?? current.activeLearningPathId,
      academyPathId: options.academyPathId ?? current.academyPathId,
    };

    const changed =
      current.page !== target.page ||
      current.activeLearningPathId !== target.activeLearningPathId ||
      current.academyPathId !== target.academyPathId;

    // Home is the root screen, so clear previous navigation when returning there.
    if (target.page === 'home') {
      navigationHistoryRef.current = [];
    } else if (changed) {
      navigationHistoryRef.current.push(current);
    }

    currentNavigationRef.current = target;
    setPage(target.page);

    if (options.activeLearningPathId !== undefined) {
      setActiveLearningPathId(options.activeLearningPathId);
    }
    if (options.academyPathId !== undefined) {
      setAcademyPathId(options.academyPathId);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  useEffect(() => {
    if (auth.status === 'loading') return;
    let pending = pendingLearningDestination;
    try {
      const stored = window.sessionStorage.getItem(PENDING_LEARNING_ROUTE_KEY);
      if (stored) pending = JSON.parse(stored);
    } catch { /* Keep the in-memory pending destination when possible. */ }
    if (!pending || !ACCOUNT_REQUIRED_PAGES.has(pending.page)) return;
    if (auth.status === 'authenticated') {
      try { window.sessionStorage.removeItem(PENDING_LEARNING_ROUTE_KEY); } catch { /* Storage may be unavailable. */ }
      setPendingLearningDestination(null);
      navigate(pending.page, pending.options || {});
    } else if (page !== 'learning-access') {
      setPendingLearningDestination(pending);
      setPage('learning-access');
    }
  }, [auth.status, page, pendingLearningDestination]);

  useEffect(() => {
    if (auth.status === 'authenticated' || auth.status === 'loading') return;
    if (ACCOUNT_REQUIRED_PAGES.has(page)) showLearningAccessGate(page, { activeLearningPathId, academyPathId });
  }, [auth.status, page, activeLearningPathId, academyPathId]);

  const clearFilters = () => { setQuery(''); setCategory('All resources'); setCost('All access types'); setLevel('All levels'); setResourceType('All'); setSortBy('relevance'); };
  const openLearningPath = (pathId) => {
    navigate('path-detail', { activeLearningPathId: pathId });
  };
  const updateModuleCheckpoint = (pathId, moduleTitle, field, checked) => {
    if (!MODULE_CHECKPOINT_FIELDS.includes(field)) return;
    const key = moduleProgressKey(pathId, moduleTitle);
    setModuleProgress((current) => ({ ...current, [key]: { ...(current[key] || {}), [field]: checked === true, updatedAt: new Date().toISOString() } }));
  };
  const openPathAcademy = (pathId) => navigate('systems-academy', { academyPathId: pathId });
  const openPathLabs = (path) => {
    const matched = labs.filter((lab) => path.labIds.includes(lab.id));
    const topics = [...new Set(matched.map((lab) => lab.category))];
    setLabCategory(topics.length === 1 ? topics[0] : 'All topics');
    setLabLevel('All labs');
    navigate('labs');
  };
  const shareSite = async () => {
    try {
      if (navigator.share) await navigator.share({ title: 'OpenCyberPath', text: 'Learn cybersecurity with free resources, hands-on labs, and structured learning paths.', url: window.location.origin });
      else if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(window.location.origin); setShareNotice('Site link copied. Share it with another learner.'); }
      else setShareNotice(`Share this site: ${window.location.origin}`);
    } catch (err) {
      if (err?.name !== 'AbortError') setShareNotice(`Share this site: ${window.location.origin}`);
    }
  };
  const copyGratitudeQuote = async (quote) => {
    const shareText = `“${quote}”\n- OpenCyberPath (original reflection)`;
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard access is unavailable');
      await navigator.clipboard.writeText(shareText);
      setCopiedGratitudeQuote(quote);
      setGratitudeCopyNotice('Boost copied. Send it to a learner who needs encouragement.');
    } catch {
      setCopiedGratitudeQuote('');
      setGratitudeCopyNotice('Clipboard access is unavailable here. Select the boost text and copy it manually.');
    }
  };
  const featuredResources = homeFeaturedResources;
  const featuredLabs = homeFeaturedLabs;
  const publicDatasetResources = homePublicDatasetResources;
  const activeLearningPath = learningPaths.find((path) => path.id === activeLearningPathId) || learningPaths[0];
  const activePathResources = resources.filter((resource) => activeLearningPath.resourceIds.includes(resource.id));
  const activePathLabs = labs.filter((lab) => activeLearningPath.labIds.includes(lab.id));
  const suggestedNextPaths = learningPaths.filter((path) => activeLearningPath.nextPathIds.includes(path.id));

  return <div className={`app-shell ${Capacitor.isNativePlatform() ? 'native-app-shell' : 'web-app-shell'}`} id="top">
    <header className="site-header">
      <Logo onClick={navigate} />
            <nav className="nav-links nav-links-compact" aria-label="Main navigation">
        {[['home','Home'],['learning-studio','Learn'],['roadmap','Paths'],['resources','Resources'],['labs','Labs'],['ctf-lab','CTF Practice'],['liveops','LiveOps']].map(([key,label]) => <button key={key} className={`nav-link nav-key-${key} ${page === key || (page === 'path-detail' && key === 'roadmap') || (page === 'application-demo' && key === 'job-hub') ? 'active' : ''}`} onClick={() => { if (key === 'systems-academy') setAcademyPathId('all'); navigate(key); }}>{label}</button>)}
        <details className="nav-more-menu">
          <summary className={`nav-link nav-more-summary ${page === 'cyber-pulse' || ['resources','ctf-lab','liveops','certifications','systems-academy','tools','career-hub','resume-studio','job-hub','cyberrange','caselab','offline-learning','skillproof','concepts'].includes(page) || (page === 'application-demo' && ['certifications','systems-academy','tools','career-hub','resume-studio','job-hub','cyberrange','offline-learning','skillproof','concepts'].includes('job-hub')) ? 'active' : ''}`}><span>Discover</span><span aria-hidden="true">⌄</span></summary>
          <div className="nav-more-panel" role="group" aria-label="More site sections">
            {[['resources','Resources'],['ctf-lab','CTF Practice'],['liveops','LiveOps'],['certifications','Certs & Exams'],['systems-academy','OS + Networks'],['tools','Tools & films'],['career-hub','Career hub'],['resume-studio','Resume'],['job-hub','Jobs'],['cyberrange','CyberRange'],['caselab','CaseLab'],['offline-learning','Offline learning'],['skillproof','SkillProof'],['concepts','Basics']].map(([key,label]) => <button type="button" key={key} className={`nav-link nav-key-${key} ${page === key || (page === 'application-demo' && key === 'job-hub') ? 'active' : ''}`} onClick={(event) => { event.currentTarget.closest('details')?.removeAttribute('open'); if (key === 'systems-academy') setAcademyPathId('all'); navigate(key); }}>{label}</button>)}
                      <button type="button" className={`nav-link ${page === 'cyber-pulse' ? 'active' : ''}`} onClick={(event) => { event.currentTarget.closest('details')?.removeAttribute('open'); navigate('cyber-pulse'); }}>CyberPulse Ã‚· News & freshness</button>            <button type="button" className={`nav-link ${page === 'youtube-live-learning' ? 'active' : ''}`} onClick={(event) => { event.currentTarget.closest('details')?.removeAttribute('open'); navigate('youtube-live-learning'); }}>YouTube Live Learning</button></div>
        </details>
      </nav>
      <div className="header-actions"><label className="header-search"><Icon name="search" size={16} /><input value={query} onChange={(e) => { setQuery(e.target.value); if (page !== 'resources') navigate('resources'); }} onFocus={() => { if (page !== 'resources') navigate('resources'); }} placeholder="Search skills, labs, topics..." aria-label="Search resources" /><kbd>Ctrl K</kbd></label><ExternalLink className="github-link" href="https://github.com/hemanthkadiyala01-sentinel/open-cyber-path"><Icon name="network" size={15} /> GitHub</ExternalLink><AccountActions /></div>
    </header>

    <main>
      {(page === 'labs' || (page === 'path-detail' && resourceCatalogue)) && !labCatalogue && <section className="section-wrap" role="status"><p className="section-loading">{labCatalogueError ? 'The lab catalogue could not be loaded. Refresh this page to retry.' : 'Loading the lab catalogue...'}</p></section>}
      {(page === 'resources' || page === 'path-detail') && !resourceCatalogue && <section className="section-wrap" role="status"><p className="section-loading">{resourceCatalogueError ? 'The resource catalogue could not be loaded. Refresh this page to retry.' : 'Loading the resource catalogue...'}</p></section>}
      {page === 'learning-access' && <LearningAccessGate destinationLabel={ACCOUNT_REQUIRED_LABELS[pendingLearningDestination?.page] || 'this learning workspace'} onReturnToDiscovery={() => navigate('home')} />}
      {page === 'certifications' && <Suspense fallback={<p className='section-loading'>Loading certifications and exam roadmaps...</p>}><CertificationsHub onOpenCareerPath={openLearningPath} /></Suspense>}
      {page === 'learning-studio' && <><section className={`ocp-learning-sync-note ocp-learning-sync-${cloudProgressStatus}`} role="status"><span>{cloudProgressStatus === 'loading' ? 'Loading progress from your account…' : cloudProgressStatus === 'syncing' ? 'Saving checkpoints to your account…' : cloudProgressStatus === 'synced' ? 'Your module checkpoints are synced with your account when the API is available.' : cloudProgressStatus === 'error' ? 'Cloud sync is unavailable. Your checkpoints remain saved on this device; retry when your connection is restored.' : 'Sign in to sync module checkpoints across sessions.'}</span>{cloudProgressStatus === 'error' && <button type="button" onClick={() => { auth.retryApiConnection(); setCloudRetryNonce((value) => value + 1); }}>Retry sync</button>}</section><Suspense fallback={<p className='section-loading'>Loading learning studio...</p>}><LearningStudio paths={learningPaths} moduleProgress={moduleProgress} onCheckpointChange={updateModuleCheckpoint} onOpenPath={openLearningPath} onOpenLabs={() => navigate('labs')} /></Suspense></>}
      {page === 'home' && <>
        <section className="hero">
          <div className="hero-content">
            <div className="eyebrow"><span className="eyebrow-dot" /> OPEN · FREE TO EXPLORE · COMMUNITY BUILT</div>
            <h1>Learn cybersecurity for <em>real skills,</em> real opportunities.</h1>
            <p className="hero-copy">Free learning resources, practical labs, notebook-style notes, and clear learning paths - from first steps to deeper investigation. Learn, practise, build evidence, and help another learner grow.</p>
            <div className="hero-actions"><button className="button button-primary" onClick={() => document.getElementById('start-here')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>Start learning free <Icon name="arrow-right" size={17} /></button><button type="button" className="button button-quiet" onClick={() => navigate('learning-studio')}><Icon name="route" size={16} /> My Learning</button><button className="button button-quiet" onClick={() => navigate('resources')}>Explore resources <Icon name="arrow-up-right" size={16} /></button><button className="button button-quiet" onClick={() => navigate('certifications')}>Certs &amp; exams <Icon name="arrow-up-right" size={16} /></button><button type="button" className="button button-quiet" onClick={openWelcomeTour}><Icon name="spark" size={16} /> Take guided tour</button></div>
            <div className="hero-note"><Icon name="users" size={17} /> No fake ratings or job promises. Start with useful material and build at your own pace.</div>
          </div>
          <div className="hero-visual"><img className="hero-image" src="/images/learning/detection-engineering-lab.webp" alt="Analyst reviewing detection outcomes, event charts, and alert logic" onError={handleArtworkError} /><div className="hero-image-vignette"/><div className="hero-sticker sticker-top"><Icon name="book-open" size={19} /><span><small>LEARN</small><b>Understand the basics</b></span></div><div className="hero-sticker sticker-bottom"><Icon name="target" size={19} /><span><small>PRACTISE</small><b>Build evidence of skill</b></span></div><div className="hero-quote"><Icon name="spark" size={19} /><p>Learn it.<br />Practise it.<br /><b>Share what you discover.</b></p></div></div>
        </section>
        {showTourInvitation && <section className="tour-invitation" aria-labelledby="tour-invitation-title">
          <div className="tour-invitation-art" aria-hidden="true"><span className="tour-invitation-art-symbol">✦</span><small>SCENE 01 - PLAY INTRO</small></div>
          <div className="tour-invitation-copy"><div className="tour-invitation-kicker">OPTIONAL · 7-SCENE DISCOVERY TOUR</div><h2 id="tour-invitation-title">Find the part of cybersecurity that calls to you.</h2><p>A short, cinematic guide to the main sections, including learning paths, resources, exams, labs, tools, and career support. It will suggest a starting point based on your interest, without locking you into a route.</p></div>
          <div className="tour-invitation-actions"><button type="button" className="tour-invitation-play" onClick={openWelcomeTour}><span aria-hidden="true">▶</span> Play the intro <span aria-hidden="true">↗</span></button><button type="button" className="tour-invitation-later" onClick={dismissTourInvitation}>Not now</button></div>
        </section>}
        <section className="principle-strip" aria-label="What learners can expect">
          <div><span className="principle-icon"><Icon name="book-open" /></span><span><b>Free to explore</b><small>Clear access labels and caveats</small></span></div>
          <div><span className="principle-icon"><Icon name="terminal" /></span><span><b>Practice-first</b><small>Samples, worksheets, and labs</small></span></div>
          <div><span className="principle-icon"><Icon name="route" /></span><span><b>Choose your path</b><small>Learn foundations then specialise</small></span></div>
          <div><span className="principle-icon"><Icon name="shield-check" /></span><span><b>Practise responsibly</b><small>Authorised environments only</small></span></div>
        </section>

        <StartHereGuide paths={learningPaths} onOpenPath={openLearningPath} />
        <AdaptiveLearningPlanner paths={learningPaths} moduleProgress={moduleProgress} onOpenPath={openLearningPath} />

        <section className="quote-spotlight" aria-labelledby="quote-spotlight-title">
          <div className="quote-spotlight-mark" aria-hidden="true">“</div>
          <div className="quote-spotlight-copy">
            <div className="quote-spotlight-kicker"><Icon name="spark" size={15} /> A NOTE FOR THE BEGINNING</div>
            <h2 id="quote-spotlight-title">You do not need to learn <em>everything today.</em></h2>
            <blockquote>Choose one path. Practise one safe lab. Save one piece of evidence that shows what you learned.</blockquote>
          </div>
          <div className="quote-spotlight-action">
            <span>YOUR NEXT STEP</span>
            <p>Start small and make your learning visible. That is how a portfolio begins.</p>
            <div><button className="button button-primary" type="button" onClick={() => navigate('roadmap')}>Choose a path <Icon name="arrow-right" size={15}/></button><button className="button button-quiet" type="button" onClick={() => navigate('labs')}>Try a safe lab <Icon name="flask-conical" size={15}/></button></div>
          </div>
        </section>

        <section className="home-career-toolkit">
          <div className="home-career-toolkit-copy"><div className="section-kicker">NEW · LEARNING TO CAREER TOOLKIT</div><h2>From first concepts<br /><em>to your first application.</em></h2><p>Follow a beginner checklist, compare security roles, build an ATS-friendly resume, explore job-search platforms, and rehearse the application process with a fictional demo.</p><button className="button button-primary" onClick={() => navigate('career-hub')}>Explore the career journey <Icon name="arrow-right" size={16}/></button></div>
          <div className="home-career-toolkit-cards"><button onClick={() => navigate('career-hub')}><Icon name="route" size={21}/><span><b>Career explorer</b><small>Red, Blue, Purple and specialist paths</small></span><Icon name="arrow-up-right" size={15}/></button><button onClick={() => navigate('resume-studio')}><Icon name="file-text" size={21}/><span><b>Free resume studio</b><small>Local-first editor and keyword review</small></span><Icon name="arrow-up-right" size={15}/></button><button onClick={() => navigate('job-hub')}><Icon name="briefcase-business" size={21}/><span><b>Job search hub</b><small>Curated external internship and junior-role links</small></span><Icon name="arrow-up-right" size={15}/></button><button onClick={() => navigate('application-demo')}><Icon name="clipboard" size={21}/><span><b>Application practice</b><small>Fictional demo and private tracker</small></span><Icon name="arrow-up-right" size={15}/></button><button onClick={() => navigate('tools')}><Icon name="terminal" size={21}/><span><b>Tools & movie cases</b><small>Real tool literacy, safe use, and film fact-checks</small></span><Icon name="arrow-up-right" size={15}/></button></div>
        </section>

        <section className="section-wrap home-paths">
          <PageHeading kicker="START WHERE YOU ARE" title="Choose your learning" emphasis="path." description="You do not have to learn everything at once. Pick a direction, follow a sequence, and practise with material that fits your current level." />
          <div className="path-grid">{learningPaths.map((path) => <PathCard key={path.id} path={path} onClick={openLearningPath} />)}</div>
        </section>

        <section className="section-wrap evidence-section">
          <div className="section-heading">
            <div><div className="section-kicker">OPEN DATA · REPRODUCIBLE PRACTICE</div><h2>Look at the evidence.<br /><em>Not a decorative dashboard.</em></h2></div>
            <p>These visuals are calculated from the CSV training files shipped with this project. They are synthetic learning examples, not live telemetry or estimates of real-world attack rates.</p>
          </div>
          <div className="evidence-grid">
            <article className="evidence-panel evidence-hunt">
              <div className="evidence-panel-heading"><span className="evidence-panel-icon"><Icon name="radar" size={22} /></span><div><span className="dataset-kicker">AUTHENTICATION + DNS</span><h3>Investigate the sample records</h3></div><span className={`dataset-status ${datasetState.startsWith('Loaded') ? 'loaded' : ''}`}>{datasetState.startsWith('Loaded') ? 'CSV loaded' : 'Checking files'}</span></div>
              <p className="evidence-lede">Each row below comes from <code>threat-hunt-auth-dns-samples.csv</code>. The summary updates from the file rather than showing made-up totals.</p>
              <div className="evidence-kpis">
                <div><span>Sample rows</span><strong>{huntSummary.total || '-'}</strong></div>
                <div><span>Failed sign-ins</span><strong className="num-fail">{huntSummary.failures || '-'}</strong></div>
                <div><span>Successful sign-ins</span><strong className="num-pass">{huntSummary.successes || '-'}</strong></div>
                <div><span>DNS events</span><strong className="num-dns">{huntSummary.dns || '-'}</strong></div>
              </div>
              <div className="evidence-hunt-layout">
                <div className="evidence-table-wrap">
                  <div className="evidence-subheading"><h4>Event records</h4><span>UTC · first 6 rows</span></div>
                  {huntRows.length ? <table className="evidence-table"><thead><tr><th>Time</th><th>Host</th><th>Event / result</th><th>Label</th></tr></thead><tbody>{huntRows.slice(0, 6).map((row) => <tr key={row.case_id}><td>{(row.timestamp_utc || '').split('T')[1]?.slice(0, 5) || '-'}</td><td>{row.host || '-'}</td><td><b>{row.event_type}</b><small>{row.result}</small></td><td><span className={`signal-label signal-${slugify(row.label)}`}>{row.label}</span></td></tr>)}</tbody></table> : <p className="data-empty">{datasetState}</p>}
                </div>
                <div className="evidence-label-breakdown"><div className="evidence-subheading"><h4>Training labels</h4><span>from CSV</span></div>{Object.entries(huntSummary.labels).map(([label, count]) => <div className={`label-bar-row label-bar-${label}`} key={label}><div><span>{label}</span><b>{count}</b></div><div className="label-bar-track"><span style={{ width: `${huntSummary.total ? (count / huntSummary.total) * 100 : 0}%` }} /></div></div>)}<div className="interpretation-note"><Icon name="lightbulb" size={17} /><p>Repeated failures are a signal to investigate-not proof that an account was compromised. Compare with baseline and surrounding events.</p></div></div>
              </div>
              <div className="evidence-panel-footer"><span><Icon name="shield-check" size={15} /> Synthetic training data · no live accounts or hosts</span><a href="/labs/threat-hunt-auth-dns-samples.csv" download>Download source CSV <Icon name="download" size={14} /></a></div>
            </article>

            <article className="evidence-panel evidence-detection">
              <div className="evidence-panel-heading"><span className="evidence-panel-icon"><Icon name="chart" size={22} /></span><div><span className="dataset-kicker">DETECTION ENGINEERING</span><h3>Evaluate a narrow rule</h3></div><span className={`dataset-status ${ruleMetrics ? 'loaded' : ''}`}>{ruleMetrics ? 'Reproducible' : 'Checking files'}</span></div>
              <p className="evidence-lede">A small rule looks for an encoded-command argument in <code>powershell.exe</code>. The score below is recalculated from the included labelled cases.</p>
              {ruleMetrics ? <>
                <div className="confusion-matrix" aria-label="Confusion matrix from synthetic training cases"><div className="matrix-heading">ACTUAL LABEL Ã— RULE PREDICTION</div><div className="matrix-grid"><div className="matrix-cell matrix-tp"><span>True positives</span><strong>{ruleMetrics.tp}</strong><small>Suspicious + alert</small></div><div className="matrix-cell matrix-fp"><span>False positives</span><strong>{ruleMetrics.fp}</strong><small>Benign + alert</small></div><div className="matrix-cell matrix-fn"><span>False negatives</span><strong>{ruleMetrics.fn}</strong><small>Suspicious + missed</small></div><div className="matrix-cell matrix-tn"><span>True negatives</span><strong>{ruleMetrics.tn}</strong><small>Benign + no alert</small></div></div></div>
                <div className="rate-grid">{[['Accuracy', ruleMetrics.accuracy], ['Precision', ruleMetrics.precision], ['Recall', ruleMetrics.recall], ['Specificity', ruleMetrics.specificity], ['F1', ruleMetrics.f1]].map(([name,value]) => <div className="rate-card" key={name}><span>{name}</span><strong>{(value * 100).toFixed(1)}%</strong><div className="rate-track"><span style={{ width: `${Math.max(0, Math.min(100, value * 100))}%` }} /></div></div>)}</div>
                <p className="ambiguous-note">{ruleMetrics.scored} cases scored · {ruleMetrics.ambiguous} ambiguous case excluded. These tiny synthetic metrics are for learning only, not real-world performance.</p>
              </> : <p className="data-empty">{datasetState}</p>}
              <div className="evidence-panel-footer"><span><Icon name="file-text" size={15} /> Narrow example rule · context still matters</span><a href="/labs/detection-evaluation-cases.csv" download>Download cases <Icon name="download" size={14} /></a><a href="/labs/evaluate-detection-cases.py" download>Rule script <Icon name="download" size={14} /></a></div>
            </article>
          </div>
        </section>

        <section className="section-wrap public-dataset-section">
          <PageHeading kicker="PUBLISHED RESEARCH DATA" title="Move beyond small samples." emphasis="Learn from cited datasets." description="The dashboard above is intentionally small and synthetic. When you are ready for larger research exercises, start from these original dataset owners and read their documentation before downloading anything." />
          <div className="resource-grid public-dataset-grid">{publicDatasetResources.map((resource) => <ResourceCard key={resource.id} resource={resource} />)}</div>
          <div className="benchmark-schedule">
            <div className="benchmark-schedule-heading"><div><span className="dataset-kicker">PUBLISHED SOURCE METADATA · CIC-IDS2017</span><h3>One real research timeline. Five recorded days.</h3><p>These are the experiment dates and activity categories documented by the dataset publisher-not live internet activity or counts from the local synthetic CSV.</p></div><a href="https://www.unb.ca/cic/datasets/ids-2017.html" target="_blank" rel="noreferrer">Official dataset page <Icon name="arrow-up-right" size={14} /></a></div>
            <div className="benchmark-days">
              <article className="benchmark-day benchmark-baseline"><span>MON · 03 JUL 2017</span><h4>Benign baseline</h4><p>Normal activity</p><small>Reference day</small></article>
              <article className="benchmark-day benchmark-auth"><span>TUE · 04 JUL 2017</span><h4>Authentication attacks</h4><p>FTP and SSH brute force</p><small>Login pattern analysis</small></article>
              <article className="benchmark-day benchmark-volume"><span>WED · 05 JUL 2017</span><h4>Availability + protocol</h4><p>DoS / DDoS and Heartbleed</p><small>Traffic and service context</small></article>
              <article className="benchmark-day benchmark-web"><span>THU · 06 JUL 2017</span><h4>Web + infiltration</h4><p>Brute force, XSS, SQL injection and infiltration</p><small>Application traffic labels</small></article>
              <article className="benchmark-day benchmark-botnet"><span>FRI · 07 JUL 2017</span><h4>Botnet + scanning</h4><p>Botnet activity and port scanning</p><small>Network flow investigation</small></article>
            </div>
          </div>

          <div className="public-data-note"><Icon name="book-open" size={20} /><p><b>Keep the source and limitations beside the chart.</b> Published benchmarks were recorded under particular conditions and may be large or dated; they do not represent all current internet traffic. OpenCyberPath links to the original publishers rather than silently copying data or inventing metrics.</p></div>
        </section>

        <section className="section-wrap home-resources">

          <div className="section-heading section-heading-inline"><div><div className="section-kicker">TRUSTED STARTING POINTS</div><h2>Good places to learn.<br /><em>One clear directory.</em></h2></div><button className="text-button" onClick={() => navigate('resources')}>View all resources <Icon name="arrow-up-right" size={16} /></button></div>
          <p className="section-lede">We link to original docs and training providers. Check their current access conditions before creating accounts or cloud resources.</p>
          <div className="resource-grid home-resource-grid">{featuredResources.map((resource) => <ResourceCard key={resource.id} resource={resource} />)}</div>
        </section>

        <section className="section-wrap home-labs">
          <div className="section-heading section-heading-inline"><div><div className="section-kicker">LEARN BY DOING</div><h2>Small steps. <em>Practical skills.</em></h2></div><button className="text-button" onClick={() => navigate('labs')}>Open labs & notes <Icon name="arrow-up-right" size={16} /></button></div>
          <p className="section-lede">Download a guide, try the exercise with the provided sample, then write down what you learned and what remains unknown.</p>
          <div className="lab-grid home-lab-grid">{featuredLabs.map((lab) => <LabCard key={lab.id} lab={lab} compact />)}</div>
        </section>

        <section className="section-wrap attack-preview">
          <PageHeading kicker="SECURITY IN PLAIN LANGUAGE" title="Understand the pattern," emphasis="then the defence." description="Short, friendly explanations help new learners understand why common security problems happen and which controls reduce risk." />
          <div className="attack-grid">{attackPatterns.slice(0,3).map((attack) => <article className={`attack-card attack-${slugify(attack.title)}`} key={attack.title}><div className="attack-card-top"><span className="attack-icon"><Icon name={attack.icon} size={21} /></span><span className="plain-tag">PLAIN-LANGUAGE GUIDE</span></div><h3>{attack.title}</h3><p>{attack.short}</p><div className="attack-example"><b>Example</b><span>{attack.example}</span></div><div className="attack-defense"><Icon name="shield-check" size={16} /><span>{attack.defend}</span></div></article>)}</div>
          <button className="button button-quiet section-cta" onClick={() => navigate('concepts')}>Explore attack basics <Icon name="arrow-right" size={16} /></button>
        </section>

        <section className="section-wrap gratitude-section" id="gratitude" aria-labelledby="gratitude-title">
          <div className="gratitude-heading">
            <div className="gratitude-heading-copy">
              <div className="section-kicker"><Icon name="spark" size={14} /> MOMENTUM · GRATITUDE · GROWTH</div>
              <h2 id="gratitude-title">Keep going.<br /><em>Your next skill starts with one step.</em></h2>
              <p>Cybersecurity is a big field, and nobody masters it in a day. Pick one concept, practise safely, write down what you learned, and return tomorrow. Progress is built-not wished for.</p>
            </div>
            <aside className="gratitude-featured">
              <span className="gratitude-feature-label"><Icon name="target" size={15} /> YOUR REMINDER FOR TODAY</span>
              <span className="gratitude-feature-mark" aria-hidden="true">“</span>
              <blockquote>You do not have to master cybersecurity today. Learn one concept. Practise one safe lab. Write down one thing you discovered. Do it again tomorrow.</blockquote>
              <span className="gratitude-attribution">ONE STEP TODAY. MORE CONFIDENCE TOMORROW.</span>
              <div className="gratitude-feature-actions">
                <button className="button button-primary" type="button" onClick={() => navigate('labs')}>Practise one lab <Icon name="arrow-right" size={15} /></button>
                <button className="button button-quiet" type="button" onClick={() => navigate('roadmap')}>Choose your path <Icon name="route" size={15} /></button>
              </div>
            </aside>
          </div>
          <div className="gratitude-section-intro"><span>YOUR NEXT MOVE</span><p>Choose the reminder you need today. Then do the small action underneath it.</p></div>
          <div className="gratitude-grid">
            {gratitudeQuotes.map((item) => <article className={`gratitude-card gratitude-tone-${item.tone}`} key={item.id}>
              <div className="gratitude-card-head"><span className="gratitude-icon"><Icon name={item.icon} size={20} /></span><span className="gratitude-kind">{item.label}</span><span className="gratitude-index">{item.number}</span></div>
              <blockquote>{item.quote}</blockquote>
              <div className="gratitude-next-step"><span><Icon name="arrow-right" size={12} /> DO THIS NEXT</span><p>{item.nextStep}</p></div>
              <div className="gratitude-card-foot"><span>OPENCYBERPATH ORIGINAL</span><button className="gratitude-copy" type="button" onClick={() => copyGratitudeQuote(item.quote)} aria-label={`Copy encouragement: ${item.label.toLowerCase()}`}><Icon name={copiedGratitudeQuote === item.quote ? 'check-circle' : 'copy'} size={14} />{copiedGratitudeQuote === item.quote ? 'Copied' : 'Share this boost'}</button></div>
            </article>)}
          </div>
          {gratitudeCopyNotice && <p className="gratitude-copy-notice" role="status">{gratitudeCopyNotice}</p>}
          <p className="gratitude-note">Original OpenCyberPath encouragement-not quotes attributed to famous people. Thank the people who help you learn, then pass useful knowledge forward.</p>
        </section>

        <section className="community-band"><div className="community-mark"><Icon name="users" size={31} /></div><div className="community-copy"><div className="section-kicker">BUILT BY LEARNERS, FOR LEARNERS</div><h2>Find something useful.<br /><em>Pass it forward.</em></h2><p>Share a roadmap, a lab, or a resource that helped you. Contributions that improve clarity and accuracy make the whole directory more useful.</p></div><div className="community-actions"><button className="button button-primary" onClick={shareSite}><Icon name="share" size={16} /> Share OpenCyberPath</button><ExternalLink className="button button-quiet" href="https://github.com/hemanthkadiyala01-sentinel/open-cyber-path">Contribute on GitHub <Icon name="arrow-up-right" size={16} /></ExternalLink>{shareNotice && <p className="share-notice" role="status">{shareNotice}</p>}</div></section>
      </>}

      {page === 'resources' && resourceCatalogue && <section className="section-wrap resource-page">
        <div className="resource-directory-layout">
        <aside className="resource-directory-sidebar" aria-label="Resource directory filters">
          <div className="resource-sidebar-intro">
            <span className="resource-sidebar-mark"><Icon name="box" size={21} /></span>
            <div><strong>Resource Directory</strong><span>{resources.length} learning resources</span></div>
          </div>
          <nav className="resource-sidebar-topics" aria-label="Resource topics">
            <button type="button" className={`resource-sidebar-link ${category === 'All resources' ? 'is-active' : ''}`} onClick={() => { setCategory('All resources'); setResourceType('All'); }}>
              <Icon name="grid" size={15} /><span>All Resources</span><b>{resources.length}</b>
            </button>
            {categories.filter((item) => item !== 'All resources').map((item) => (
              <button type="button" key={item} className={`resource-sidebar-link ${category === item ? 'is-active' : ''}`} onClick={() => { setCategory(item); setResourceType('All'); }}>
                <Icon name={item === 'SOC & SIEM' ? 'chart' : item === 'Threat Hunting' ? 'radar' : item === 'Bug Bounty' || item === 'Penetration Testing' ? 'bug' : item === 'Foundations' ? 'book-open' : item === 'Security Concepts' ? 'shield-check' : item === 'Detection Engineering' ? 'terminal' : item === 'Hands-on Labs' ? 'target' : item === 'DFIR' ? 'clipboard' : item === 'Cloud Security' ? 'cloud' : 'layers'} size={15} />
                <span>{item}</span><b>{resources.filter((resource) => resource.category === item).length}</b>
              </button>
            ))}
          </nav>
          <div className="resource-sidebar-filter">
            <h3>Filter by Access</h3>
            {[
              { label: 'Free', value: 'Free' },
              { label: 'Free (account needed)', value: 'Free (account needed)' },
              { label: 'Open source', value: 'Open source' },
              { label: 'Paid / Subscription', value: 'Paid / Subscription' },
              { label: 'Varies by tier or lab', value: 'Free tier / varies' }
            ].map((option) => (
              <button type="button" key={option.value} className={`resource-filter-choice ${cost === option.value ? 'is-active' : ''}`} aria-pressed={cost === option.value} onClick={() => setCost(cost === option.value ? 'All access types' : option.value)}>
                <span className="resource-filter-box" /> <span>{option.label}</span><b>{resources.filter((resource) => resourceMatchesAccess(resource, option.value)).length}</b>
              </button>
            ))}
          </div>
          <div className="resource-sidebar-filter">
            <h3>Filter by Level</h3>
            {[
              { label: 'Beginner', value: 'Beginner', tone: 'beginner' },
              { label: 'Intermediate', value: 'Intermediate', tone: 'intermediate' },
              { label: 'Advanced', value: 'Advanced', tone: 'advanced' }
            ].map((option) => (
              <button type="button" key={option.value} className={`resource-filter-choice resource-level-choice ${level === option.value ? 'is-active' : ''}`} aria-pressed={level === option.value} onClick={() => setLevel(level === option.value ? 'All levels' : option.value)}>
                <span className={`resource-level-dot ${option.tone}`} /> <span>{option.label}</span><b>{resources.filter((resource) => matchesLevel(resource.level, option.value, 'All levels')).length}</b>
              </button>
            ))}
          </div>
          <button className="resource-sidebar-reset" type="button" onClick={clearFilters}><Icon name="rotate-ccw" size={14} /> Reset filters</button>
        </aside>
        <main className="resource-directory-main">
          <div className="resource-directory-hero">
            <PageHeading kicker="CYBERSECURITY RESOURCE DIRECTORY" title="Cybersecurity Learning" emphasis="Resources" description="Curated courses, labs, documentation, tools, and official learning platforms to help you build real skills." />
          </div>
        <div className="resource-search-toolbar">
          <label className="search-box"><Icon name="search" size={19} /><input ref={searchInputRef} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search resources, tools, topicsÃ¢â‚¬Â¦" aria-label="Search resources" /><kbd>Ctrl K</kbd></label>
          <label className="select-wrap resource-sort-wrap"><span className="sr-only">Sort resources</span><select value={sortBy} onChange={(e) => setSortBy(e.target.value)} aria-label="Sort resources"><option value="relevance">Most Relevant</option><option value="name">Name A-Z</option><option value="beginner">Beginner First</option></select></label>
        </div>
        <div className="resource-type-filters" role="group" aria-label="Filter resource types">
          {['All', 'Courses', 'Labs', 'Documentation', 'Tools', 'Practice Platforms', 'Certifications', 'Datasets', 'Frameworks', 'Career', 'Videos'].map((item) => (
            <button type="button" key={item} className={`resource-type-chip ${resourceType === item ? 'is-active' : ''}`} aria-pressed={resourceType === item} onClick={() => { setResourceType(item); setCategory('All resources'); }}>{item}</button>
          ))}
        </div>
        <div className="results-caption"><span><b>{visibleResources.length}</b> resources to explore</span><span>External links open the original provider <Icon name="arrow-up-right" size={13} /></span></div>
        
        <div className="resource-grid">{visibleResources.map((resource) => <ResourceCard key={resource.id} resource={resource} />)}</div>
        {visibleResources.length === 0 && <div className="empty-state"><Icon name="search" size={28} /><h3>No matching resources yet</h3><p>Try another topic or remove a filter.</p><button className="button button-primary" onClick={clearFilters}>Clear filters</button></div>}
        <div className="verification-note"><Icon name="alert-triangle" size={19} /><p><b>Access can change.</b> Providers may change free tiers, account requirements, lab availability, or terms. Check the original site before signing up; OpenCyberPath does not control external services or promise jobs or bounty rewards.</p></div>
      
        <section className="section-wrap resource-workflow" aria-labelledby="workflow-heading">
          <div className="section-heading">
            <div>
              <div className="section-kicker">AUTHORISED TESTING WORKFLOW</div>
              <h2 id="workflow-heading">Think like a tester.<br /><em>Prove it in a lab.</em></h2>
              <p>Each stage below assumes a system you own, or a target expressly assigned by a training provider. Practice targets are configured by the learner or the provider; OpenCyberPath does not host, assign, or scan external targets.</p>
            </div>
          </div>
          <ol className="workflow-stages">
            <li>
              <h4>1. Define scope</h4>
              <p>Use a system you own or a target expressly assigned by a training provider. Record permitted hosts, test types, time windows, and prohibited actions before any testing begins.</p>
            </li>
            <li>
              <h4>2. Prepare the lab</h4>
              <p>Use a local, isolated instance of an intentionally vulnerable application, such as OWASP Juice Shop or DVWA. Keep vulnerable services bound to localhost or an appropriate isolated lab network.</p>
            </li>
            <li>
              <h4>3. Map the application</h4>
              <p>Understand the app, its routes, services, and normal behaviour before attempting any tests.</p>
            </li>
            <li>
              <h4>4. Test carefully</h4>
              <p>Choose the tool that matches the learning goal. Start with manual observation and low-impact checks; avoid unnecessary automation and destructive tests. No tool is harmless by default, and an open-source licence does not grant permission to test a system.</p>
            </li>
            <li>
              <h4>5. Record evidence</h4>
              <p>Save sanitised request and response details, timestamps, the observed result, and any uncertainty. Never publish passwords, session tokens, personal data, or sensitive captures.</p>
            </li>
            <li>
              <h4>6. Fix and retest</h4>
              <p>Explain the impact, propose a mitigation, repeat the relevant test in the lab, and document whether the issue is resolved.</p>
            </li>
          </ol>
          <div className="workflow-reminder"><Icon name="shield-alert" size={17} /><div><b>Authorisation comes first.</b><p>Public websites, school networks, college networks, workplace systems, and third-party services are not automatically authorised testing targets. Only test what you own or what a provider has expressly assigned to you.</p></div></div>
          <div className="workflow-practice"><div className="workflow-practice-label"><b>DESIGNATED PRACTICE</b><span>LEARN IN AN AUTHORISED ENVIRONMENT</span></div><div className="workflow-practice-copy"><p>Set up a local lab such as <ExternalLink href="https://owasp.org/projects/juice-shop/">OWASP Juice Shop</ExternalLink> or complete guided labs at <ExternalLink href="https://portswigger.net/web-security">PortSwigger Web Security Academy</ExternalLink>.</p><p className="workflow-practice-safety">Only test systems you own or targets a provider has expressly assigned to you. Do not scan or test unrelated public systems.</p></div></div>
        </section>
        </main>
      </div>
      </section>}

      {page === 'roadmap' && <section className="section-wrap roadmap-section">
        <PageHeading kicker="THE CYBERSECURITY DOMAIN MAP" title="Explore the complete cybersecurity" emphasis="landscape." description="Start with the 8 broad pillars, then choose from 10 career visions with guided modules, safe practice, portfolio evidence, and a capstone. You do not need to learn every area at once." />
        <section className="domain-quick-map" aria-labelledby="domain-quick-map-title"><div className="domain-quick-map-heading"><div><div className="section-kicker">THE COMPLETE FIELD AT A GLANCE</div><h2 id="domain-quick-map-title">All <em>8 cybersecurity pillars</em></h2><p>These are eight OpenCyberPath career-exploration categories. Select any card to open the specialisations and beginner first steps below.</p></div><div className="domain-quick-map-stats"><strong>08</strong><span>PILLARS</span><i>â†˜</i><strong>10</strong><span>CAREER VISIONS</span></div></div><div className="domain-quick-card-grid">{cybersecurityPillars.map((pillar) => <button className={`domain-quick-card domain-tone-${pillar.tone}`} key={pillar.id} type="button" onClick={() => { const target = document.getElementById(`pillar-${pillar.id}`); if (target) { target.open = true; target.scrollIntoView({ behavior: 'smooth', block: 'start' }); } }}><span className="domain-quick-number">{pillar.number}</span><span className="domain-quick-card-main"><b>{pillar.title}</b><small>{pillar.specializations.length} specialisations · {pillar.level}</small></span><Icon name="arrow-right" size={17}/></button>)}</div></section>
        <div className="domain-framework-note"><div className="domain-framework-icon"><Icon name="book-open" size={20}/></div><div><b>A quick framework distinction</b><p>The OpenCyberPath map is not the official ISC2 CISSP domain list. It is an independent career-exploration framework, not the official (ISC)² CISSP exam-domain list. Consult the current (ISC)² CISSP exam outline for authoritative exam requirements.</p><details className="isc2-domain-reference"><summary>View the official CISSP domain names <Icon name="arrow-right" size={13}/></summary><ol>{isc2CisspDomains.map((domain) => <li key={domain}>{domain}</li>)}</ol><ExternalLink href="https://www.isc2.org/certifications/cissp/cissp-certification-exam-outline" className="domain-official-link">Check the current (ISC)Â² exam outline <Icon name="arrow-up-right" size={13}/></ExternalLink></details></div></div>
        <label className="domain-search"><Icon name="search" size={17}/><input value={domainQuery} onChange={(event) => setDomainQuery(event.target.value)} placeholder="Search pillars or specialisations..." aria-label="Search cybersecurity pillars and specialisations"/><span>{visibleCybersecurityPillars.length} of 8 pillars</span></label>
        <div className="domain-pillars-grid">{visibleCybersecurityPillars.map((pillar) => <details id={`pillar-${pillar.id}`} className={`domain-pillar domain-tone-${pillar.tone}`} key={pillar.id}>
          <summary className="domain-pillar-summary"><span className="domain-pillar-icon"><Icon name={pillar.icon} size={21}/></span><span className="domain-pillar-heading"><small>PILLAR {pillar.number} · {pillar.level}</small><strong>{pillar.title}</strong><em>{pillar.summary}</em><span className="domain-pillar-count">{pillar.specializations.length} specialisations <Icon name="plus" size={13}/></span></span></summary>
          <div className="domain-pillar-content"><div className="domain-specializations">{pillar.specializations.map((specialty) => <article className="domain-specialty" key={specialty.name}><h4>{specialty.name}</h4><p>{specialty.description}</p><div className="domain-first-step"><b>Beginner first step</b><span>{specialty.firstStep}</span></div></article>)}</div><div className="domain-related"><b>Related OpenCyberPath routes</b><p>{pillar.relatedPathNote}</p><div>{pillar.relatedPathIds.map((pathId) => { const related = learningPaths.find((path) => path.id === pathId); return related ? <button type="button" key={pathId} onClick={() => openLearningPath(pathId)}>{related.shortTitle} <Icon name="arrow-up-right" size={13}/></button> : null; })}</div></div></div>
        </details>)}</div>
        {visibleCybersecurityPillars.length === 0 && <div className="empty-state"><Icon name="search" size={26}/><h3>No matching pillar found</h3><p>Try another specialisation or clear your search.</p><button className="button button-primary" type="button" onClick={() => setDomainQuery('')}>Clear search</button></div>}
        <div className="domain-career-path-heading"><div className="section-kicker">GUIDED LEARNING ROUTES</div><h2>Choose one of the <em>10 career visions.</em></h2><p>The eight pillars are a broad map of the field. Each vision provides sequenced learning modules, safe practice, evidence to keep, and a capstone. The paths overlap by design; choose one main route and add adjacent skills as you progress.</p></div>
        <div className="path-grid roadmap-path-grid">{learningPaths.map((path) => <PathCard key={path.id} path={path} onClick={openLearningPath} />)}</div>
        <div className="path-model-heading"><div><div className="section-kicker">ONE CONSISTENT LEARNING MODEL</div><h2>Every path ends with <em>evidence, not just a checklist.</em></h2></div><p>Each roadmap uses the same module contract. The subject, diagram, resources, worksheets, and capstone change to fit the path.</p></div>
        <div className="path-model-grid">
          {[['01','Understand','Learn the concept, vocabulary, and prerequisites.','book-open'],['02','Practise safely','Use supplied samples, local exercises, or the provider’s authorised training lab.','target'],['03','Save evidence','Keep notes, steps, outputs, assumptions, and limitations.','file-text'],['04','Explain the result','Describe what you learned, what remains unknown, and the next useful step.','check-circle']].map(([number,title,description,icon]) => <article className="path-model-card" key={number}><span><Icon name={icon} size={20}/></span><small>STEP {number}</small><h3>{title}</h3><p>{description}</p></article>)}
        </div>
        <div className="roadmap-footer"><Icon name="lightbulb" size={21}/><p><b>Keep the claims honest.</b> The time estimates are suggested study pacing, not guarantees. A roadmap or completed lab does not guarantee a job, client, certification, or bounty reward. Publish work you can reproduce and explain.</p></div>
      </section>}

      {page === 'path-detail' && labCatalogue && resourceCatalogue && activeLearningPath && <section className={`section-wrap career-detail career-tone-${activeLearningPath.tone}`}>
        <div className="career-back-row"><button className="back-to-paths" onClick={() => navigate('roadmap')}><Icon name="arrow-right" size={15} /> All 10 career visions</button><span>{activeLearningPath.number} / 10 CAREER VISIONS</span></div>
        <header className="career-detail-hero">
          <div className="career-detail-copy">
            <div className="career-detail-kicker"><span className="career-detail-icon"><Icon name={activeLearningPath.icon} size={20}/></span><span>{activeLearningPath.badge}</span></div>
            <h1>{activeLearningPath.title}</h1>
            <p className="career-detail-desc">{activeLearningPath.desc}</p>
            <div className="career-detail-meta"><span>{activeLearningPath.level}</span><span>{activeLearningPath.pace}</span><span>{activeLearningPath.modules.length} guided modules</span></div>
            <div className="career-prereq"><b>Before you start</b><p>{activeLearningPath.prerequisites}</p></div>
            <div className="career-hero-actions"><button className="button button-primary" onClick={() => openPathLabs(activeLearningPath)}>Open matching labs <Icon name="arrow-right" size={16}/></button><button className="button button-quiet" onClick={() => openPathAcademy(activeLearningPath.id)}>OS + Networks for this path <Icon name="network" size={15}/></button><button className="button button-quiet" onClick={() => shareSite()}><Icon name="share" size={15}/> Share OpenCyberPath</button></div>
          </div>
          <div className="career-detail-art"><img src={activeLearningPath.image} alt={`${activeLearningPath.title} concept illustration`} loading="lazy" onError={handleArtworkError}/><div className="career-art-label"><Icon name="target" size={16}/><span><small>PORTFOLIO OUTCOME</small><b>{activeLearningPath.outcome}</b></span></div></div>
        </header>
        <div className="career-path-principle"><Icon name="shield-check" size={19}/><p><b>Safe, evidence-led practice.</b> Use the sample data included with OpenCyberPath, local labs, or explicitly authorised provider environments. Do not test arbitrary public systems or put real sensitive data into practice reports.</p></div>
        <div className="career-learning-progress" aria-live="polite"><div><span className="section-kicker">YOUR LOCAL LEARNING CHECKPOINTS</span><b>{activeLearningPath.modules.filter((item) => MODULE_CHECKPOINT_FIELDS.every((field) => moduleProgress[moduleProgressKey(activeLearningPath.id, item.title)]?.[field] === true)).length} of {activeLearningPath.modules.length} modules self-checked</b><p>Checkpoints are saved in this browser only. They reflect your own progress and are not externally verified.</p></div><div className="career-learning-progress-track" role="progressbar" aria-label="Completed self-checks for this path" aria-valuemin={0} aria-valuemax={activeLearningPath.modules.length} aria-valuenow={activeLearningPath.modules.filter((item) => MODULE_CHECKPOINT_FIELDS.every((field) => moduleProgress[moduleProgressKey(activeLearningPath.id, item.title)]?.[field] === true)).length}><span style={{ width: `${activeLearningPath.modules.length ? (activeLearningPath.modules.filter((item) => MODULE_CHECKPOINT_FIELDS.every((field) => moduleProgress[moduleProgressKey(activeLearningPath.id, item.title)]?.[field] === true)).length / activeLearningPath.modules.length) * 100 : 0}%` }} /></div></div>
        <div className="career-section-header"><div><div className="section-kicker">THE ROADMAP</div><h2>Learn it in <em>small, connected steps.</em></h2></div><p>Each module tells you what to learn, what to try, and what evidence to keep. Work at your own pace and skip nothing you need for safe practice.</p></div>
        <div className="career-module-list">{activeLearningPath.modules.map((module, index) => <LearningModuleCard key={module.title} pathId={activeLearningPath.id} module={module} index={index} progress={moduleProgress[moduleProgressKey(activeLearningPath.id, module.title)] || {}} onCheckpointChange={updateModuleCheckpoint} />)}</div>
        <Suspense fallback={<p className="section-loading">Loading progress backup tools...</p>}>
          <LearningProgressBackup
          paths={learningPaths}
          moduleProgress={moduleProgress}
          onImport={(imported) => setModuleProgress((current) => {
            const merged = { ...current };
            for (const [key, value] of Object.entries(imported)) {
              const before = merged[key] || {};
              merged[key] = {
                understood: before.understood === true || value.understood === true,
                practised: before.practised === true || value.practised === true,
                evidence: before.evidence === true || value.evidence === true,
              };
            }
            return merged;
          })}
        />
        </Suspense>
        <Suspense fallback={<p className="section-loading">Loading career-path video lessons...</p>}>
          <CareerVideoLibrary pathId={activeLearningPath.id} pathTitle={activeLearningPath.shortTitle || activeLearningPath.title} />
        </Suspense>
                <Suspense fallback={<div className="career-lab-directory-loading">Loading external labs for this path...</div>}>
          <CareerPathLabDirectory path={activeLearningPath} />
        </Suspense>
        <section className="career-capstone"><div className="career-capstone-mark"><Icon name="graduation" size={27}/></div><div className="career-capstone-copy"><div className="section-kicker">CAPSTONE / PORTFOLIO EVIDENCE</div><h2>{activeLearningPath.capstoneTitle}</h2><p>{activeLearningPath.capstone}</p><div className="career-deliverables">{activeLearningPath.deliverables.map((item) => <span key={item}><Icon name="check-circle" size={14}/>{item}</span>)}</div></div></section>
        <section className="career-related-section"><div className="career-section-header"><div><div className="section-kicker">TRUSTED STARTING POINTS</div><h2>Resources for <em>this path.</em></h2></div><p>These cards link to their original providers. Access labels and lab requirements can change, so check current terms and costs before signing up.</p></div>
          <div className="resource-grid career-resource-grid">{activePathResources.map((resource) => <ResourceCard key={resource.id} resource={resource}/>)}</div>
          {activePathResources.length===0 && <div className="empty-state"><p>Resource links for this path are being curated. Start with the modules above and browse the full resource library.</p><button className="button button-primary" onClick={() => navigate('resources')}>Browse resources</button></div>}
        </section>
        <section className="career-related-section"><div className="career-section-header"><div><div className="section-kicker">PRACTICE & WORKSHEETS</div><h2>Build something <em>you can explain.</em></h2></div><p>Use these OpenCyberPath handouts and sample exercises to turn reading into reproducible practice.</p></div>
          <div className="lab-grid career-lab-grid">{activePathLabs.map((lab) => <LabCard key={lab.id} lab={lab}/>)}</div>
          {activePathLabs.length===0 && <div className="empty-state"><p>There are no dedicated handouts yet for this path. Browse the complete lab library for related practice material.</p><button className="button button-primary" onClick={() => navigate('labs')}>Browse labs & notes</button></div>}
        </section>
        <section className="career-next-section"><div className="career-section-header"><div><div className="section-kicker">WHERE TO GO NEXT</div><h2>Related <em>career paths.</em></h2></div><p>Specialisations overlap. Continue with a related path once you can explain the current capstone and the evidence behind it.</p></div><div className="path-grid career-next-grid">{suggestedNextPaths.map((path) => <PathCard key={path.id} path={path} onClick={openLearningPath}/>)}</div></section>
      </section>}

      {page === 'career-hub' && <Suspense fallback={<p className='section-loading'>Loading career hub...</p>}><CareerHub Icon={Icon} onOpenPath={openLearningPath} onOpenResume={() => navigate('resume-studio')} onOpenJobs={() => navigate('job-hub')} onOpenDemo={() => navigate('application-demo')} /></Suspense>}
      {page === 'resume-studio' && <Suspense fallback={<p className='section-loading'>Loading resume studio...</p>}><ResumeStudio Icon={Icon} onOpenJobs={() => navigate('job-hub')} /></Suspense>}
      {page === 'job-hub' && <Suspense fallback={<p className='section-loading'>Loading job hub...</p>}><JobsHub Icon={Icon} onOpenResume={() => navigate('resume-studio')} onOpenDemo={() => navigate('application-demo')} onOpenTracker={() => { navigate('application-demo'); window.setTimeout(() => document.getElementById('application-tracker')?.scrollIntoView({ behavior: 'smooth' }), 180); }} /></Suspense>}
      {page === 'application-demo' && <Suspense fallback={<p className='section-loading'>Loading application lab...</p>}><ApplicationLab Icon={Icon} onOpenResume={() => navigate('resume-studio')} onOpenJobs={() => navigate('job-hub')} /></Suspense>}
      {page === 'tools' && <Suspense fallback={<p className='section-loading'>Loading security tools...</p>}><ToolsThreats Icon={Icon} /></Suspense>}
      {page === 'systems-academy' && <Suspense fallback={<p className='section-loading'>Loading OS and networks academy...</p>}><SystemsAcademy Icon={Icon} careerPaths={learningPaths} initialPathId={academyPathId} onOpenLabs={() => navigate('labs')} /></Suspense>}

      {page === 'cyberrange' && <Suspense fallback={<p className="section-loading">Loading CyberRange practice cases...</p>}><CyberRange /></Suspense>}

      {page === 'caselab' && <Suspense fallback={<p className="section-loading">Loading CaseLab investigation...</p>}><CaseLab /></Suspense>}

      {page === 'labs' && labCatalogue && <section className="section-wrap labs-section">
        <PageHeading kicker="PRACTISE AT YOUR OWN PACE" title="Notes, labs &" emphasis="field guides." description="Start with a notebook, use supplied sample data, and practise in a local or explicitly authorised training environment. Each guide is available as a PDF and editable DOCX." />
        <div className="notes-banner"><img src="/images/learning/handwritten-notes-study.svg" alt="Notebook-style SOC triage notes with event, context, evidence, and decision steps" onError={handleArtworkError}/><div className="notes-banner-copy"><div className="section-kicker">NOTEBOOK MODE</div><h3>Notes that feel easier to revise.</h3><p>Handwritten-script notebook pages on ruled paper, plain-language definitions, worked examples, checklists, practice questions, and answer checks. Start with fictional records; you do not need a full SIEM installation to begin learning.</p></div><span className="notes-format"><Icon name="notebook-pen" size={18} /> PDF + DOCX</span></div>
        <Suspense fallback={<p className="section-loading">Loading interactive lab workbench...</p>}><InteractiveLabWorkbench /></Suspense>
        <div className="lab-filter-panel"><div><div className="section-kicker">LAB & NOTE LIBRARY</div><p>Filter by experience level or learning topic.</p></div><div className="lab-filter-controls"><label className="select-wrap"><span className="sr-only">Filter labs by topic</span><select value={labCategory} onChange={(e) => setLabCategory(e.target.value)}><option>All topics</option>{[...new Set(labs.map((lab) => lab.category))].map((topic) => <option key={topic}>{topic}</option>)}</select></label><label className="select-wrap"><span className="sr-only">Filter labs by level</span><select value={labLevel} onChange={(e) => setLabLevel(e.target.value)}><option>All labs</option><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select></label></div></div>
        <div className="lab-results-caption">Showing <b>{visibleLabs.length}</b> learning items <span>•</span> every guide has PDF + DOCX</div>
        <div className="lab-grid">{visibleLabs.map((lab) => <LabCard key={lab.id} lab={lab} />)}</div>
        {visibleLabs.length === 0 && <div className="empty-state"><Icon name="search" size={26} /><h3>No labs in this filter</h3><button className="button button-primary" onClick={() => { setLabCategory('All topics'); setLabLevel('All labs'); }}>Show all labs</button></div>}
        <Suspense fallback={<p className="section-loading">Loading curated concept videos...</p>}><CuratedVideosLibrary /></Suspense>
        <div className="verification-note"><Icon name="alert-triangle" size={19} /><p><b>Practice safely.</b> Threat-hunting data shipped here is synthetic. Bug-bounty activities must stay inside an explicitly authorised scope or the designated training lab. Do not test random public systems.</p></div>
      </section>}

      {page === 'offline-learning' && <Suspense fallback={<p className="section-loading">Loading Offline Learning...</p>}><OfflineLearning /></Suspense>}

      {page === 'skillproof' && <Suspense fallback={<p className="section-loading">Loading SkillProof portfolio builder...</p>}><SkillProof /></Suspense>}

      {page === 'liveops' && <Suspense fallback={<p className="section-loading">Loading LiveOps problem statements...</p>}><LiveOps Icon={Icon} /></Suspense>}

      {page === 'ctf-lab' && <Suspense fallback={<p className="section-loading">Loading CTF Arcade...</p>}><CTFArcade /></Suspense>}

      {page === 'cyber-pulse' && <Suspense fallback={<p className="section-loading">Loading CyberPulse news and freshness status...</p>}><CyberPulse /></Suspense>}

      {page === 'youtube-live-learning' && <Suspense fallback={<p className="section-loading">Loading YouTube Live Learning...</p>}><YouTubeLiveLearning /></Suspense>}

      {page === 'concepts' && <section className="section-wrap concepts-section">
        <PageHeading kicker="SECURITY IN PLAIN LANGUAGE" title="Understand the cause." emphasis="Learn the defence." description="Explore 16 illustrated security basics. Each card explains the cause, a real-world example, defensive controls, and a safe next step for beginners." />
        <div className="concept-intro"><Icon name="book-open" size={24} /><div><b>Think in patterns, not movie scenes.</b><p>Each topic is a starting point for learning. An indicator is not proof by itself; use evidence and authorised practice.</p></div><a className="download-button" href="/notes/common-attack-patterns-beginner-guide.pdf" download><Icon name="download" size={15} /> Full guide</a></div>
        <div className="attack-grid concept-grid">{attackPatterns.map((attack) => <article className={`attack-card attack-${slugify(attack.title)}`} key={attack.title}><div className="attack-illustration"><img src={attack.image} alt={`${attack.title} concept illustration`} loading="lazy" onError={handleArtworkError}/><div className="attack-art-shade"/><span className="attack-icon"><Icon name={attack.icon === 'code' ? 'terminal' : attack.icon} size={22} /></span></div><div className="concept-identifiers"><span>{attack.family}</span><span>{attack.level}</span></div><h3>{attack.title}</h3><p>{attack.short}</p><div className="concept-section"><small>WHY IT HAPPENS</small><p>{attack.cause}</p></div><div className="concept-section"><small>EVERYDAY EXAMPLE</small><p>{attack.example}</p></div><div className="concept-next-step"><small>TRY THIS NEXT</small><p>{attack.nextStep}</p></div><div className="attack-defense"><Icon name="shield-check" size={17} /><span>{attack.defend}</span></div></article>)}</div>
        <div className="verification-note"><Icon name="alert-triangle" size={19} /><p><b>For awareness and defence.</b> These examples are intentionally high level. For hands-on learning, use the official training environments listed in the resource directory and follow their current rules.</p></div>
      </section>}
      {page === 'creator' && <Suspense fallback={<p className="section-loading">Loading creator profile...</p>}><CreatorIdentity /></Suspense>}
    </main>

    {showWelcomeTour && page === 'home' && <Suspense fallback={null}><FirstVisitTour onClose={dismissWelcomeTour} onNavigate={handleTourNavigate} /></Suspense>}

    <footer className="site-footer"><div className="footer-top"><Logo onClick={navigate} /><p>A learner-built guide to resources that already exist. Learn openly. Practise responsibly. Help the next learner.</p><div className="footer-links"><button onClick={() => navigate('resources')}>Resources</button><button onClick={() => navigate('certifications')}>Certifications &amp; exams</button><button onClick={() => navigate('roadmap')}>Learning paths</button><button onClick={() => navigate('career-hub')}>Career hub</button><button onClick={() => navigate('resume-studio')}>Resume studio</button><button onClick={() => navigate('job-hub')}>Jobs</button><button onClick={() => navigate('labs')}>Labs & notes</button><button onClick={() => navigate('concepts')}>Attack basics</button><button onClick={() => navigate('tools')}>Tools & film case studies</button><button onClick={() => navigate('creator')}>About the creator</button>
<ExternalLink href="https://github.com/hemanthkadiyala01-sentinel/open-cyber-path">Contribute <Icon name="arrow-up-right" size={13} /></ExternalLink></div></div><div className="copyright"><span>Independent community learning project</span><span className="footer-creator-credit">Created by Hemanth Kadiyala | NYXOVAR</span><span>External resources belong to their providers · Verify current terms · No job or reward guarantees</span></div></footer>
    <SiteGuideAssistant onOpenPage={navigate} onOpenPath={openLearningPath} />
  </div>;
}

export default App;
