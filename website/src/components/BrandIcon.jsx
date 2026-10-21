import { useState } from 'react';
import './OcpBrandIconVisuals_FIX3.css';

const ID_DOMAINS = {
  wireshark: 'wireshark.org', nmap: 'nmap.org', zap: 'zaproxy.org', burp: 'portswigger.net',
  metasploit: 'metasploit.com', sysmon: 'learn.microsoft.com', autopsy: 'autopsy.com', ghidra: 'ghidra-sre.org',
  zeek: 'zeek.org', cyberchef: 'gchq.github.io', 'mitre-attack': 'attack.mitre.org', python: 'python.org',
  vscode: 'code.visualstudio.com', github: 'github.com', wazuh: 'wazuh.com', sigma: 'sigmahq.io',
  suricata: 'suricata.io', 'security-onion': 'securityonionsolutions.com', osquery: 'osquery.io',
  volatility3: 'volatilityfoundation.org', sleuthkit: 'sleuthkit.org', 'zimmerman-tools': 'ericzimmerman.github.io',
  crtsh: 'crt.sh', wayback: 'web.archive.org', greynoise: 'greynoise.io', shodan: 'shodan.io',
  virustotal: 'virustotal.com', hibp: 'haveibeenpwned.com', prowler: 'prowler.com',
  'grafana-prometheus': 'grafana.com', abuseipdb: 'abuseipdb.com', otx: 'otx.alienvault.com',
  'osint-framework': 'osintframework.com', linux: 'kernel.org', ubuntu: 'ubuntu.com', debian: 'debian.org',
  fedora: 'fedoraproject.org', arch: 'archlinux.org', kali: 'kali.org', parrot: 'parrotsec.org',
  freebsd: 'freebsd.org', openbsd: 'openbsd.org', macos: 'apple.com', windows: 'microsoft.com',
  android: 'android.com', qnx: 'blackberry.qnx.com', rtos: 'freertos.org', server: 'microsoft.com'
};

const BRAND_DOMAINS = {
  wireshark: 'wireshark.org', 'wireshark foundation': 'wireshark.org', nmap: 'nmap.org', 'nmap project': 'nmap.org',
  'owasp zap': 'zaproxy.org', zaproxy: 'zaproxy.org', owasp: 'owasp.org', 'burp suite community edition': 'portswigger.net',
  portswigger: 'portswigger.net', 'web security academy': 'portswigger.net', metasploit: 'metasploit.com', rapid7: 'rapid7.com',
  'microsoft sysmon': 'learn.microsoft.com', 'microsoft learn': 'microsoft.com', microsoft: 'microsoft.com',
  autopsy: 'autopsy.com', 'the sleuth kit': 'sleuthkit.org', ghidra: 'ghidra-sre.org', nsa: 'nsa.gov', zeek: 'zeek.org',
  cyberchef: 'gchq.github.io', gchq: 'gchq.gov.uk', 'mitre attck': 'attack.mitre.org', mitre: 'mitre.org',
  python: 'python.org', 'visual studio code': 'code.visualstudio.com', vscode: 'code.visualstudio.com', github: 'github.com',
  wazuh: 'wazuh.com', sigma: 'sigmahq.io', suricata: 'suricata.io', 'security onion': 'securityonionsolutions.com',
  osquery: 'osquery.io', volatility: 'volatilityfoundation.org', 'eric zimmerman': 'ericzimmerman.github.io',
  'internet archive wayback machine': 'web.archive.org', 'internet archive': 'archive.org', greynoise: 'greynoise.io',
  shodan: 'shodan.io', virustotal: 'virustotal.com', 'have i been pwned': 'haveibeenpwned.com', prowler: 'prowler.com',
  grafana: 'grafana.com', prometheus: 'prometheus.io', abuseipdb: 'abuseipdb.com', alienvault: 'alienvault.com',
  'open threat exchange': 'otx.alienvault.com', 'osint framework': 'osintframework.com', tryhackme: 'tryhackme.com',
  'hack the box': 'hackthebox.com', hackthebox: 'hackthebox.com', cyberdefenders: 'cyberdefenders.org', splunk: 'splunk.com',
  cisco: 'cisco.com', isc2: 'isc2.org', compTIA: 'comptia.org', comptia: 'comptia.org', aws: 'aws.amazon.com',
  'amazon web services': 'aws.amazon.com', isaca: 'isaca.org', 'ec-council': 'eccouncil.org', 'offensive security': 'offsec.com',
  sans: 'sans.org', 'cloudflare learning center': 'cloudflare.com', 'owasp juice shop': 'owasp.org', 'bugcrowd': 'bugcrowd.com',
  hackerone: 'hackerone.com', overthewire: 'overthewire.org', 'over the wire': 'overthewire.org'
};

const normalize = (value) => String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

function resolveDomain({ id, name, provider, creator, url }) {
  const idKey = normalize(id).replace(/ /g, '-');
  if (ID_DOMAINS[idKey]) return ID_DOMAINS[idKey];
  const values = [provider, creator, name].filter(Boolean).map(normalize);
  const aliases = Object.keys(BRAND_DOMAINS).sort((a, b) => b.length - a.length);
  for (const value of values) {
    for (const alias of aliases) {
      const normalizedAlias = normalize(alias);
      if (value === normalizedAlias || value.includes(normalizedAlias)) return BRAND_DOMAINS[alias];
    }
  }
  try {
    const hostname = new URL(url).hostname.toLowerCase().replace(/^www\./, '');
    return hostname || '';
  } catch {
    return '';
  }
}

export function brandIconUrl(input = {}) {
  const domain = resolveDomain(input);
  return domain ? `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128` : '';
}

function initials(label) {
  const parts = String(label || 'Brand').replace(/[+&/]/g, ' ').trim().split(/\s+/).filter(Boolean);
  const value = parts.length > 1 ? `${parts[0][0]}${parts[1][0]}` : (parts[0] || 'B').slice(0, 2);
  return value.toUpperCase();
}

export default function BrandIcon({ id, name, provider, creator, url, size = 34, className = '' }) {
  const [failed, setFailed] = useState(false);
  const label = name || provider || creator || id || 'Provider';
  const src = brandIconUrl({ id, name, provider, creator, url });
  return (
    <span
      className={`ocp-brand-icon ${className}`.trim()}
      style={{ width: `${size}px`, height: `${size}px` }}
      role="img"
      aria-label={`${label} logo`}
      title={`${label} logo`}
    >
      {src && !failed ? (
        <img src={src} alt="" aria-hidden="true" loading="lazy" decoding="async" referrerPolicy="no-referrer" onError={() => setFailed(true)} />
      ) : (
        <span aria-hidden="true">{initials(label)}</span>
      )}
    </span>
  );
}
