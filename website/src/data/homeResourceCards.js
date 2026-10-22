// Lightweight resource records used on the home page. Full catalogue is loaded only on resource/path detail routes or when the assistant is opened.
export const homeFeaturedResources = [
{
    id: 'portswigger-academy', name: 'Web Security Academy', provider: 'PortSwigger', category: 'Bug Bounty', kind: 'Free interactive labs', level: 'Beginner → Advanced',
    description: 'Learn HTTP and common web security concepts through free interactive training labs and guided explanations.',
    skills: ['HTTP', 'Web security', 'Testing methodology'], url: 'https://portswigger.net/web-security',
    account: 'Account may help track progress', note: 'Practise within the intended Academy lab environment and follow its instructions.', image: '/images/learning/bug-bounty.svg', icon: 'bug'
  },
{
    id: 'wazuh-getting-started', name: 'Wazuh documentation', provider: 'Wazuh', category: 'SOC & SIEM', kind: 'Open source', level: 'Beginner',
    description: 'Learn endpoint monitoring, agents, security events, rules, and alerts from the official project guides.',
    skills: ['SIEM', 'Endpoint monitoring', 'Detection'], url: 'https://documentation.wazuh.com/current/getting-started/index.html',
    account: 'No account for docs', note: 'Running the complete stack needs suitable hardware. Prefer current documentation over old installation videos.', image: '/images/learning/soc-siem.svg', icon: 'radar'
  },
{
    id: 'microsoft-threat-hunting', name: 'Microsoft threat hunting overview', provider: 'Microsoft Learn', category: 'Threat Hunting', kind: 'Free documentation', level: 'Intermediate',
    description: 'Learn the stages of threat hunting and how queries help investigate telemetry in a defensive workflow.',
    skills: ['Threat hunting', 'KQL', 'Investigation'], url: 'https://learn.microsoft.com/en-us/defender-xdr/hunting-overview',
    account: 'No account for docs', note: 'The overview describes Microsoft tools; table names and access depend on the environment.', image: '/images/learning/threat-hunting.svg', icon: 'radar'
  },
{
    id: 'mitre-attack', name: 'MITRE ATT&CK knowledge base', provider: 'MITRE', category: 'Security Concepts', kind: 'Free knowledge base', level: 'Beginner → Advanced',
    description: 'Understand adversary behaviours and use the knowledge base to add context to defensive investigations.',
    skills: ['Threat modelling', 'Detection mapping', 'Investigation'], url: 'https://attack.mitre.org/',
    account: 'No account required', note: 'ATT&CK provides a common vocabulary; a technique mapping is not proof that it occurred.', image: '/images/learning/supply-chain.svg', icon: 'network'
  }
];

export const homePublicDatasetResources = [
{
    id: 'cicids2017-labeled-flows', name: 'CIC-IDS2017 labelled network-flow dataset', provider: 'Canadian Institute for Cybersecurity (UNB)', category: 'Detection Engineering', kind: 'Public research dataset', level: 'Intermediate',
    description: 'Explore a published, labelled network-flow benchmark with benign traffic, common attack categories, timestamps, protocols, and flow features.',
    skills: ['Network flows', 'Labels', 'Detection evaluation'], url: 'https://www.unb.ca/cic/datasets/ids-2017.html',
    account: 'Public dataset information page', note: 'The official page describes a five-day testbed capture and large daily packet captures. Start with labelled CSV flow data, cite the dataset, and treat its age and testbed conditions as limitations.', image: '/images/learning/detection-tuning.svg', icon: 'chart'
  },
{
    id: 'ctu13-labeled-flows', name: 'CTU-13 labelled botnet-flow dataset', provider: 'Stratosphere Laboratory', category: 'Threat Hunting', kind: 'Public research dataset', level: 'Intermediate → Advanced',
    description: 'Study 13 published scenarios with manually labelled botnet, command-and-control, normal, and background network flows.',
    skills: ['NetFlow', 'Traffic analysis', 'Label validation'], url: 'https://www.stratosphereips.org/datasets-ctu13',
    account: 'Public dataset information page', note: 'The full archive is large and the dataset page lists several file types. For beginner analysis, focus on labelled flow files; do not execute supplied binaries or replay unknown traffic. Cite the dataset.', image: '/images/learning/digital-forensics.svg', icon: 'radar'
  },
{
    id: 'splunk-botsv3-dataset', name: 'Boss of the SOC v3 dataset', provider: 'Splunk (GitHub)', category: 'SOC & SIEM', kind: 'Public scenario dataset', level: 'Intermediate',
    description: 'A security investigation dataset and capture-the-flag style scenario for practising search queries and tracing evidence across event data.',
    skills: ['Event search', 'Investigation', 'Evidence notes'], url: 'https://github.com/splunk/botsv3',
    account: 'Public repository; software setup needed', note: 'This is scenario/CTF data, not live production telemetry. Review the repository requirements and dataset size before downloading.', image: '/images/learning/soc-siem.svg', icon: 'chart'
  }
];
