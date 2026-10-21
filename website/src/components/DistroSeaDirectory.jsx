import { useMemo, useState } from 'react';
import './DistroSeaDirectory.css';

const DISTROSEA_SNAPSHOT_DATE = '20 October 2026';
const FILTERS = [
  'All systems',
  'Beginner-friendly',
  'Lightweight',
  'Server & infrastructure',
  'Gaming',
  'Privacy & freedom',
  'Rolling release',
  'Alternative OS',
];

const DISTROSEA_SYSTEMS = [
  {
    "name": "AerynOS",
    "url": "https://distrosea.com/select/aerynos/",
    "family": "Independent rolling Linux",
    "tags": [
      "Rolling release",
      "Alternative OS"
    ],
    "focus": "Explore an independent rolling-release system."
  },
  {
    "name": "Alma Linux",
    "url": "https://distrosea.com/select/alma/",
    "family": "Enterprise Linux / RHEL-compatible",
    "tags": [
      "Server & infrastructure"
    ],
    "focus": "Enterprise server conventions and compatibility."
  },
  {
    "name": "Alpine Linux",
    "url": "https://distrosea.com/select/alpine/",
    "family": "Minimal, security-oriented Linux",
    "tags": [
      "Lightweight",
      "Server & infrastructure"
    ],
    "focus": "Minimal systems, containers, and efficient server setups."
  },
  {
    "name": "AnduinOS",
    "url": "https://distrosea.com/select/anduinos/",
    "family": "Ubuntu-based Linux",
    "tags": [
      "Beginner-friendly"
    ],
    "focus": "A Windows-familiar desktop workflow on a Linux base."
  },
  {
    "name": "antiX Linux",
    "url": "https://distrosea.com/select/antix/",
    "family": "Debian-based Linux",
    "tags": [
      "Beginner-friendly",
      "Lightweight"
    ],
    "focus": "Low-resource desktop concepts and alternative init systems."
  },
  {
    "name": "Archcraft",
    "url": "https://distrosea.com/select/archcraft/",
    "family": "Arch-based Linux",
    "tags": [
      "Lightweight",
      "Rolling release"
    ],
    "focus": "Minimal desktop environments and window-manager workflows."
  },
  {
    "name": "Arch Linux",
    "url": "https://distrosea.com/select/archlinux/",
    "family": "Independent rolling Linux",
    "tags": [
      "Rolling release",
      "Server & infrastructure"
    ],
    "focus": "Linux internals, packages, and hands-on configuration."
  },
  {
    "name": "Arco Linux",
    "url": "https://distrosea.com/select/arcolinux/",
    "family": "Arch-based Linux",
    "tags": [
      "Beginner-friendly",
      "Rolling release"
    ],
    "focus": "Explore Arch-style setup through multiple editions."
  },
  {
    "name": "Artix Linux",
    "url": "https://distrosea.com/select/artixlinux/",
    "family": "Arch-based Linux without systemd by default",
    "tags": [
      "Rolling release",
      "Alternative OS"
    ],
    "focus": "Compare init-system choices and service management."
  },
  {
    "name": "Bazzite",
    "url": "https://distrosea.com/select/bazzite/",
    "family": "Fedora Atomic / gaming Linux",
    "tags": [
      "Gaming"
    ],
    "focus": "Gaming-focused Linux, immutable desktop concepts, and hardware support."
  },
  {
    "name": "Big Linux",
    "url": "https://distrosea.com/select/biglinux/",
    "family": "Ubuntu-based Linux",
    "tags": [
      "Beginner-friendly"
    ],
    "focus": "A preconfigured desktop aimed at an approachable daily-driver experience."
  },
  {
    "name": "blendOS",
    "url": "https://distrosea.com/select/blendos/",
    "family": "Arch-based, container-oriented Linux",
    "tags": [
      "Alternative OS"
    ],
    "focus": "Explore an immutable-style system with multiple app environments."
  },
  {
    "name": "Bodhi Linux",
    "url": "https://distrosea.com/select/bodhi/",
    "family": "Ubuntu-based lightweight Linux",
    "tags": [
      "Beginner-friendly",
      "Lightweight"
    ],
    "focus": "Lightweight desktop design and the Moksha environment."
  },
  {
    "name": "BunsenLabs Linux",
    "url": "https://distrosea.com/select/bunsenlabs/",
    "family": "Debian-based lightweight Linux",
    "tags": [
      "Lightweight"
    ],
    "focus": "Openbox, small resource usage, and streamlined desktop workflows."
  },
  {
    "name": "CachyOS",
    "url": "https://distrosea.com/select/cachyos/",
    "family": "Arch-based performance-oriented Linux",
    "tags": [
      "Gaming",
      "Rolling release"
    ],
    "focus": "Performance-focused Linux and desktop variants."
  },
  {
    "name": "CentOS Stream",
    "url": "https://distrosea.com/select/centosstream/",
    "family": "Enterprise Linux / RHEL family",
    "tags": [
      "Server & infrastructure"
    ],
    "focus": "Enterprise Linux, server administration, and upstream RHEL workflows."
  },
  {
    "name": "Chimera Linux",
    "url": "https://distrosea.com/select/chimeralinux/",
    "family": "Independent Linux with musl / FreeBSD-inspired components",
    "tags": [
      "Lightweight",
      "Alternative OS"
    ],
    "focus": "Compare alternative userland and packaging design decisions."
  },
  {
    "name": "Debian",
    "url": "https://distrosea.com/select/debian/",
    "family": "Debian Linux",
    "tags": [
      "Beginner-friendly",
      "Server & infrastructure"
    ],
    "focus": "Stable releases, package management, and server foundations."
  },
  {
    "name": "Deepin Linux",
    "url": "https://distrosea.com/select/deepin/",
    "family": "Debian-based Linux",
    "tags": [
      "Beginner-friendly"
    ],
    "focus": "Desktop experience, integrated apps, and user-interface design."
  },
  {
    "name": "Devuan Linux",
    "url": "https://distrosea.com/select/devuan/",
    "family": "Debian-based Linux with alternative init choices",
    "tags": [
      "Server & infrastructure",
      "Alternative OS"
    ],
    "focus": "Compare service-management choices in a Debian-derived system."
  },
  {
    "name": "DragonFlyBSD",
    "url": "https://distrosea.com/select/dragonflybsd/",
    "family": "BSD / Unix-like operating system",
    "tags": [
      "Alternative OS",
      "Server & infrastructure"
    ],
    "focus": "Explore BSD design, storage, and kernel concepts."
  },
  {
    "name": "Edubuntu",
    "url": "https://distrosea.com/select/edubuntu/",
    "family": "Official Ubuntu education flavor",
    "tags": [
      "Beginner-friendly"
    ],
    "focus": "An education-oriented Linux desktop and included learning software."
  },
  {
    "name": "elementary OS",
    "url": "https://distrosea.com/select/elementary/",
    "family": "Ubuntu-based Linux",
    "tags": [
      "Beginner-friendly"
    ],
    "focus": "A polished desktop experience and consistent app design."
  },
  {
    "name": "Emmabuntüs",
    "url": "https://distrosea.com/select/emmabuntus/",
    "family": "Debian/Ubuntu-derived Linux",
    "tags": [
      "Beginner-friendly",
      "Lightweight"
    ],
    "focus": "Community-focused desktop reuse and accessibility."
  },
  {
    "name": "EndeavourOS",
    "url": "https://distrosea.com/select/endeavouros/",
    "family": "Arch-based Linux",
    "tags": [
      "Beginner-friendly",
      "Rolling release"
    ],
    "focus": "A guided entry into Arch-derived Linux and desktop environments."
  },
  {
    "name": "Endless OS",
    "url": "https://distrosea.com/select/endless/",
    "family": "Debian-based Linux",
    "tags": [
      "Beginner-friendly"
    ],
    "focus": "Desktop learning and resilient user-focused workflows."
  },
  {
    "name": "Fedora Linux",
    "url": "https://distrosea.com/select/fedora/",
    "family": "Fedora / RPM Linux",
    "tags": [
      "Beginner-friendly",
      "Server & infrastructure"
    ],
    "focus": "Modern Linux platform technologies, developer workflows, and security defaults."
  },
  {
    "name": "FreeBSD",
    "url": "https://distrosea.com/select/freebsd/",
    "family": "BSD / Unix-like operating system",
    "tags": [
      "Alternative OS",
      "Server & infrastructure"
    ],
    "focus": "Networking, storage, services, and a coherent base system."
  },
  {
    "name": "Garuda Linux",
    "url": "https://distrosea.com/select/garuda/",
    "family": "Arch-based Linux",
    "tags": [
      "Gaming",
      "Rolling release"
    ],
    "focus": "A preconfigured Arch-derived desktop with gaming-oriented variants."
  },
  {
    "name": "Gentoo Linux",
    "url": "https://distrosea.com/select/gentoo/",
    "family": "Independent source-based Linux",
    "tags": [
      "Rolling release",
      "Server & infrastructure"
    ],
    "focus": "Source-based packaging and detailed system customization."
  },
  {
    "name": "Haiku",
    "url": "https://distrosea.com/select/haiku/",
    "family": "BeOS-inspired alternative operating system",
    "tags": [
      "Alternative OS",
      "Lightweight"
    ],
    "focus": "Explore an alternative desktop OS and its distinctive interface."
  },
  {
    "name": "HoloISO",
    "url": "https://distrosea.com/select/holoiso/",
    "family": "SteamOS-inspired Linux project",
    "tags": [
      "Gaming",
      "Alternative OS"
    ],
    "focus": "A Steam Deck-inspired desktop experience on compatible hardware."
  },
  {
    "name": "KDE Neon",
    "url": "https://distrosea.com/select/kdeneon/",
    "family": "Ubuntu LTS-based KDE platform",
    "tags": [
      "Beginner-friendly"
    ],
    "focus": "KDE Plasma and application-stack updates on an Ubuntu base."
  },
  {
    "name": "KolibriOS",
    "url": "https://distrosea.com/select/kolibrios/",
    "family": "Tiny alternative operating system",
    "tags": [
      "Alternative OS",
      "Lightweight"
    ],
    "focus": "An unusually compact OS and minimal desktop environment."
  },
  {
    "name": "Kubuntu",
    "url": "https://distrosea.com/select/kubuntu/",
    "family": "Official Ubuntu flavor with KDE Plasma",
    "tags": [
      "Beginner-friendly"
    ],
    "focus": "Learn Ubuntu foundations with KDE Plasma."
  },
  {
    "name": "Linux Lite",
    "url": "https://distrosea.com/select/linuxlite/",
    "family": "Ubuntu LTS-based Linux",
    "tags": [
      "Beginner-friendly",
      "Lightweight"
    ],
    "focus": "A desktop transition path for learners coming from Windows."
  },
  {
    "name": "Linux Mint",
    "url": "https://distrosea.com/select/linuxmint/",
    "family": "Ubuntu-based Linux",
    "tags": [
      "Beginner-friendly"
    ],
    "focus": "A familiar desktop, package management, and everyday Linux foundations."
  },
  {
    "name": "Linux Mint Debian Edition",
    "url": "https://distrosea.com/select/lmde/",
    "family": "Debian-based Linux Mint edition",
    "tags": [
      "Beginner-friendly"
    ],
    "focus": "Compare a familiar Mint desktop on a Debian base."
  },
  {
    "name": "Lubuntu",
    "url": "https://distrosea.com/select/lubuntu/",
    "family": "Official Ubuntu flavor with LXQt",
    "tags": [
      "Beginner-friendly",
      "Lightweight"
    ],
    "focus": "Lightweight desktop environments and efficient resource use."
  },
  {
    "name": "Mageia",
    "url": "https://distrosea.com/select/mageia/",
    "family": "Independent community Linux",
    "tags": [
      "Beginner-friendly",
      "Server & infrastructure"
    ],
    "focus": "A community distribution with desktop and server use cases."
  },
  {
    "name": "Manjaro",
    "url": "https://distrosea.com/select/manjaro/",
    "family": "Arch-based Linux",
    "tags": [
      "Beginner-friendly",
      "Rolling release"
    ],
    "focus": "An approachable Arch-derived desktop and package workflow."
  },
  {
    "name": "MX Linux",
    "url": "https://distrosea.com/select/mxlinux/",
    "family": "Debian-based Linux",
    "tags": [
      "Beginner-friendly",
      "Lightweight"
    ],
    "focus": "A practical desktop system with performance and maintenance tools."
  },
  {
    "name": "Nitrux",
    "url": "https://distrosea.com/select/nitrux/",
    "family": "Debian-based Linux desktop",
    "tags": [
      "Beginner-friendly"
    ],
    "focus": "Explore a distinct desktop design and AppImage-centric software approach."
  },
  {
    "name": "NixOS",
    "url": "https://distrosea.com/select/nixos/",
    "family": "Declarative Linux using Nix",
    "tags": [
      "Server & infrastructure",
      "Alternative OS"
    ],
    "focus": "Reproducible declarative configuration and package management."
  },
  {
    "name": "Nobara Linux",
    "url": "https://distrosea.com/select/nobara/",
    "family": "Fedora-based Linux",
    "tags": [
      "Gaming"
    ],
    "focus": "Gaming and multimedia-oriented Fedora-based desktop workflows."
  },
  {
    "name": "OpenIndiana",
    "url": "https://distrosea.com/select/openindiana/",
    "family": "illumos / Solaris lineage",
    "tags": [
      "Alternative OS",
      "Server & infrastructure"
    ],
    "focus": "ZFS, DTrace, and the illumos/Solaris ecosystem."
  },
  {
    "name": "OpenMandriva",
    "url": "https://distrosea.com/select/openmandriva/",
    "family": "Independent RPM-based Linux",
    "tags": [
      "Beginner-friendly",
      "Server & infrastructure"
    ],
    "focus": "Explore an independent RPM-based distribution."
  },
  {
    "name": "openSUSE",
    "url": "https://distrosea.com/select/opensuse/",
    "family": "SUSE Linux family",
    "tags": [
      "Beginner-friendly",
      "Server & infrastructure",
      "Rolling release"
    ],
    "focus": "Compare Leap-style releases with Tumbleweed rolling releases."
  },
  {
    "name": "PCLinuxOS",
    "url": "https://distrosea.com/select/pclinuxos/",
    "family": "Independent Linux",
    "tags": [
      "Beginner-friendly"
    ],
    "focus": "A desktop-focused distribution and package-management workflow."
  },
  {
    "name": "pearOS",
    "url": "https://distrosea.com/select/pearos/",
    "family": "Linux desktop distribution",
    "tags": [
      "Beginner-friendly"
    ],
    "focus": "Explore a visually distinctive desktop distribution."
  },
  {
    "name": "PeppermintOS",
    "url": "https://distrosea.com/select/peppermint/",
    "family": "Debian/Ubuntu-derived lightweight Linux",
    "tags": [
      "Beginner-friendly",
      "Lightweight"
    ],
    "focus": "Lightweight desktop work and web-app-centric workflows."
  },
  {
    "name": "PikaOS",
    "url": "https://distrosea.com/select/pikaos/",
    "family": "Debian-derived Linux",
    "tags": [
      "Gaming"
    ],
    "focus": "Gaming and desktop performance-oriented Linux."
  },
  {
    "name": "Pop!_OS",
    "url": "https://distrosea.com/select/popos/",
    "family": "Ubuntu-based Linux from System76",
    "tags": [
      "Beginner-friendly",
      "Gaming"
    ],
    "focus": "Desktop productivity, GPU support, and developer workflows."
  },
  {
    "name": "Porteus Linux",
    "url": "https://distrosea.com/select/porteus/",
    "family": "Slackware-based portable Linux",
    "tags": [
      "Lightweight"
    ],
    "focus": "Portable live-system concepts and small installations."
  },
  {
    "name": "PrimTux",
    "url": "https://distrosea.com/select/primtux/",
    "family": "Education-focused Debian-derived Linux",
    "tags": [
      "Beginner-friendly"
    ],
    "focus": "Education-focused desktop software and learning environments."
  },
  {
    "name": "Puppy Linux",
    "url": "https://distrosea.com/select/puppylinux/",
    "family": "Lightweight Linux family with multiple bases",
    "tags": [
      "Lightweight"
    ],
    "focus": "Live-system workflows and low-resource desktops."
  },
  {
    "name": "PureOS",
    "url": "https://distrosea.com/select/pureos/",
    "family": "Debian-based privacy/freedom-focused Linux",
    "tags": [
      "Privacy & freedom"
    ],
    "focus": "Software freedom, privacy-oriented defaults, and platform transparency."
  },
  {
    "name": "Q4OS",
    "url": "https://distrosea.com/select/q4os/",
    "family": "Debian-based Linux",
    "tags": [
      "Beginner-friendly",
      "Lightweight"
    ],
    "focus": "Classic desktop layouts and efficient system requirements."
  },
  {
    "name": "ReactOS",
    "url": "https://distrosea.com/select/reactos/",
    "family": "Windows-compatible alternative OS",
    "tags": [
      "Alternative OS"
    ],
    "focus": "Explore a Windows-compatible open-source operating-system project."
  },
  {
    "name": "RebornOS",
    "url": "https://distrosea.com/select/rebornos/",
    "family": "Arch-based Linux",
    "tags": [
      "Beginner-friendly",
      "Rolling release"
    ],
    "focus": "A configurable Arch-derived system with an installer-led setup."
  },
  {
    "name": "Redox OS",
    "url": "https://distrosea.com/select/redox/",
    "family": "Rust-based microkernel operating system",
    "tags": [
      "Alternative OS"
    ],
    "focus": "Explore a Rust-based alternative OS and microkernel architecture."
  },
  {
    "name": "Rocky Linux",
    "url": "https://distrosea.com/select/rockylinux/",
    "family": "Enterprise Linux / RHEL-compatible",
    "tags": [
      "Server & infrastructure"
    ],
    "focus": "Enterprise server administration and RHEL-compatible workflows."
  },
  {
    "name": "Siduction Linux",
    "url": "https://distrosea.com/select/siduction/",
    "family": "Debian Sid-based rolling Linux",
    "tags": [
      "Rolling release",
      "Server & infrastructure"
    ],
    "focus": "Rolling-release maintenance and Debian unstable workflows."
  },
  {
    "name": "Slackware Linux",
    "url": "https://distrosea.com/select/slackware/",
    "family": "Independent traditional Linux",
    "tags": [
      "Server & infrastructure"
    ],
    "focus": "Traditional Linux administration and hands-on system configuration."
  },
  {
    "name": "Slax",
    "url": "https://distrosea.com/select/slax/",
    "family": "Portable Linux with Debian/Slackware bases",
    "tags": [
      "Lightweight"
    ],
    "focus": "Portable live Linux and modular system concepts."
  },
  {
    "name": "SliTaz",
    "url": "https://distrosea.com/select/slitaz/",
    "family": "Independent minimal Linux",
    "tags": [
      "Lightweight"
    ],
    "focus": "Minimal Linux and in-memory live-system design."
  },
  {
    "name": "Solus",
    "url": "https://distrosea.com/select/solus/",
    "family": "Independent desktop Linux",
    "tags": [
      "Beginner-friendly",
      "Rolling release"
    ],
    "focus": "A curated desktop experience and the Budgie environment."
  },
  {
    "name": "SparkyLinux",
    "url": "https://distrosea.com/select/sparkylinux/",
    "family": "Debian-based Linux",
    "tags": [
      "Beginner-friendly",
      "Lightweight"
    ],
    "focus": "Desktop variants, package management, and a balance of speed and usability."
  },
  {
    "name": "SpiralLinux",
    "url": "https://distrosea.com/select/spirallinux/",
    "family": "Debian-based Linux spins",
    "tags": [
      "Beginner-friendly"
    ],
    "focus": "Explore Debian desktop variants with out-of-the-box configuration."
  },
  {
    "name": "Tails",
    "url": "https://distrosea.com/select/tails/",
    "family": "Debian-based live privacy OS",
    "tags": [
      "Privacy & freedom"
    ],
    "focus": "Study live-session privacy design and its limitations."
  },
  {
    "name": "Tiny Core Linux",
    "url": "https://distrosea.com/select/tinycore/",
    "family": "Minimal modular Linux",
    "tags": [
      "Lightweight",
      "Alternative OS"
    ],
    "focus": "Minimal operating-system concepts and modular configuration."
  },
  {
    "name": "Trisquel GNU/Linux",
    "url": "https://distrosea.com/select/trisquel/",
    "family": "Ubuntu-based fully free-software distribution",
    "tags": [
      "Privacy & freedom"
    ],
    "focus": "Software freedom, package choices, and removing proprietary components."
  },
  {
    "name": "Tuxedo OS",
    "url": "https://distrosea.com/select/tuxedoos/",
    "family": "Ubuntu-based Linux desktop",
    "tags": [
      "Beginner-friendly"
    ],
    "focus": "KDE Plasma desktop workflows and hardware-oriented configuration."
  },
  {
    "name": "Ubuntu",
    "url": "https://distrosea.com/select/ubuntu/",
    "family": "Ubuntu Linux",
    "tags": [
      "Beginner-friendly",
      "Server & infrastructure"
    ],
    "focus": "A common starting point for Linux fundamentals, cloud, and server learning."
  },
  {
    "name": "Ubuntu Budgie",
    "url": "https://distrosea.com/select/ubuntubudgie/",
    "family": "Official Ubuntu flavor with Budgie",
    "tags": [
      "Beginner-friendly"
    ],
    "focus": "Compare desktop environments on the same Ubuntu base."
  },
  {
    "name": "Ubuntu Cinnamon",
    "url": "https://distrosea.com/select/ubuntucinnamon/",
    "family": "Official Ubuntu flavor with Cinnamon",
    "tags": [
      "Beginner-friendly"
    ],
    "focus": "A traditional desktop workflow on Ubuntu."
  },
  {
    "name": "Ubuntu Kylin",
    "url": "https://distrosea.com/select/ubuntukylin/",
    "family": "Official Ubuntu flavor",
    "tags": [
      "Beginner-friendly"
    ],
    "focus": "Explore an Ubuntu flavor with a distinct desktop ecosystem."
  },
  {
    "name": "Ubuntu MATE",
    "url": "https://distrosea.com/select/ubuntumate/",
    "family": "Official Ubuntu flavor with MATE",
    "tags": [
      "Beginner-friendly"
    ],
    "focus": "A traditional desktop layout and Ubuntu fundamentals."
  },
  {
    "name": "Ubuntu Studio",
    "url": "https://distrosea.com/select/ubuntustudio/",
    "family": "Official Ubuntu flavor for creative production",
    "tags": [
      "Beginner-friendly"
    ],
    "focus": "Explore a creative-production desktop and specialized software."
  },
  {
    "name": "Ubuntu Unity",
    "url": "https://distrosea.com/select/ubuntuunity/",
    "family": "Ubuntu flavor with Unity desktop",
    "tags": [
      "Beginner-friendly"
    ],
    "focus": "Compare desktop-shell design on an Ubuntu base."
  },
  {
    "name": "VanillaOS",
    "url": "https://distrosea.com/select/vanillaos/",
    "family": "Linux distribution with immutable / transactional design",
    "tags": [
      "Alternative OS",
      "Beginner-friendly"
    ],
    "focus": "Explore a system design focused on managed base-system changes."
  },
  {
    "name": "Void Linux",
    "url": "https://distrosea.com/select/void/",
    "family": "Independent rolling Linux",
    "tags": [
      "Rolling release",
      "Server & infrastructure"
    ],
    "focus": "Runit, package management, and independent rolling-release workflows."
  },
  {
    "name": "Voyager Live",
    "url": "https://distrosea.com/select/voyager/",
    "family": "Ubuntu/Debian-derived Linux",
    "tags": [
      "Beginner-friendly"
    ],
    "focus": "Explore a highly customized desktop and live-system experience."
  },
  {
    "name": "Xubuntu",
    "url": "https://distrosea.com/select/xubuntu/",
    "family": "Official Ubuntu flavor with Xfce",
    "tags": [
      "Beginner-friendly",
      "Lightweight"
    ],
    "focus": "A lightweight traditional desktop and Ubuntu foundations."
  },
  {
    "name": "Zorin OS",
    "url": "https://distrosea.com/select/zorin/",
    "family": "Ubuntu-based Linux",
    "tags": [
      "Beginner-friendly"
    ],
    "focus": "A desktop designed to make transition from Windows or macOS easier."
  }
];

/**
 * Additive catalogue of the operating-system listings on DistroSea's public directory.
 * OpenCyberPath only links to the third-party tryout pages; it does not host remote OS sessions.
 */
export function DistroSeaDirectory({ Icon }) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All systems');

  const visibleSystems = useMemo(() => {
    const term = query.trim().toLowerCase();
    return DISTROSEA_SYSTEMS.filter((system) => {
      const matchesFilter = filter === 'All systems' || system.tags.includes(filter);
      const haystack = [system.name, system.family, system.focus, ...system.tags].join(' ').toLowerCase();
      return matchesFilter && (!term || haystack.includes(term));
    });
  }, [query, filter]);

  return (
    <section className="distrosea-directory" aria-labelledby="distrosea-heading">
      <header className="dsx-hero">
        <div className="dsx-hero-copy">
          <span className="section-kicker">BROWSER-BASED OS TRYOUTS</span>
          <h2 id="distrosea-heading">Explore more systems. <em>Try before installing.</em></h2>
          <p>Browse the DistroSea catalogue from inside OpenCyberPath. Search a distribution, check its learning angle, then open its official DistroSea listing in a new tab to see currently offered versions and start options.</p>
          <div className="dsx-actions">
            <a className="dsx-primary-action" href="https://distrosea.com/" target="_blank" rel="noopener noreferrer">Open DistroSea <Icon name="arrow-up-right" size={15} /></a>
            <span className="dsx-source-note">Third-party service · not hosted by OpenCyberPath</span>
          </div>
        </div>
        <div className="dsx-hero-stat"><strong>{DISTROSEA_SYSTEMS.length}</strong><span>catalogue listings</span><small>Snapshot: {DISTROSEA_SNAPSHOT_DATE}</small></div>
      </header>

      <div className="dsx-explainer">
        <span className="dsx-explainer-icon"><Icon name="shield-check" size={18} /></span>
        <p><strong>How this works:</strong> these are links to DistroSea's own listing pages, not embedded virtual machines. DistroSea controls queue times, versions, and session availability. Never enter personal passwords, API keys, private data, or production credentials into a third-party trial session.</p>
      </div>

      <div className="dsx-toolbar">
        <label className="dsx-search">
          <Icon name="search" size={17} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search distro, family, or learning goal…" aria-label="Search DistroSea operating systems" />
        </label>
        <label className="dsx-filter">
          <span>Learning focus</span>
          <select value={filter} onChange={(event) => setFilter(event.target.value)} aria-label="Filter DistroSea operating systems by learning focus">
            {FILTERS.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
        <span className="dsx-count" aria-live="polite">{visibleSystems.length} of {DISTROSEA_SYSTEMS.length}</span>
      </div>

      <div className="dsx-grid">
        {visibleSystems.map((system) => (
          <article className="dsx-card" key={system.name}>
            <div className="dsx-card-top">
              <span className="dsx-mark" aria-hidden="true">{system.name.replace(/[^A-Za-z0-9]/g, '').slice(0, 2).toUpperCase()}</span>
              <span className="dsx-card-kicker">DISTROSEA LISTING</span>
            </div>
            <h3>{system.name}</h3>
            <p className="dsx-family">{system.family}</p>
            <p className="dsx-focus">{system.focus}</p>
            <div className="dsx-tags">{system.tags.slice(0, 2).map((tag) => <span key={tag}>{tag}</span>)}</div>
            <a className="dsx-open-link" href={system.url} target="_blank" rel="noopener noreferrer">Try {system.name} on DistroSea <Icon name="arrow-up-right" size={15} /></a>
          </article>
        ))}
      </div>
      {visibleSystems.length === 0 && (
        <div className="dsx-empty"><Icon name="search" size={24} /><h3>No matching operating system</h3><p>Try a different name or select “All systems”.</p><button type="button" onClick={() => { setQuery(''); setFilter('All systems'); }}>Clear filters</button></div>
      )}

      <footer className="dsx-footer">
        <p><strong>Accuracy note:</strong> the catalogue is a dated snapshot of names linked from DistroSea's public directory. Links, releases, session queues and supported desktop variants may change. OpenCyberPath does not imply endorsement, availability guarantees, or ownership of the external systems.</p>
        <a href="https://distrosea.com/" target="_blank" rel="noopener noreferrer">Verify the live catalogue on DistroSea <Icon name="arrow-up-right" size={14} /></a>
      </footer>
    </section>
  );
}
