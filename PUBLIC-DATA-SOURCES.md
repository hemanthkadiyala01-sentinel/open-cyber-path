# Public cybersecurity data sources

The website links to the original publishers rather than copying large datasets into this repository. Read the source documentation, publication/citation requirements, access terms, data fields, and known limitations before using a benchmark.

## CIC-IDS2017 — labelled network-flow benchmark

- Official source: https://www.unb.ca/cic/datasets/ids-2017.html
- Publisher: Canadian Institute for Cybersecurity, University of New Brunswick.
- What it contains: labelled benign and attack traffic; the publisher provides labelled flow CSVs and packet captures, including timestamps, endpoints, ports, protocols, and flow features.
- Capture context: the publisher describes a five-day capture from 3–7 July 2017. Listed daily PCAP sizes range from about 7.8 GB to 13 GB. The experiment schedule distinguishes Monday benign activity; Tuesday FTP/SSH brute force; Wednesday DoS/DDoS and Heartbleed; Thursday web attacks/infiltration; and Friday botnet/port-scan activities.
- Beginner route: start with the labelled CSV flow data, not the large PCAPs. Read the dataset paper and document the age, testbed setup, class balance, and collection assumptions.
- Citation: Iman Sharafaldin, Arash Habibi Lashkari, and Ali A. Ghorbani, “Toward Generating a New Intrusion Detection Dataset and Intrusion Traffic Characterization,” ICISSP 2018. The official page provides the citation details.

## CTU-13 — labelled botnet-flow scenarios

- Official source: https://www.stratosphereips.org/datasets-ctu13
- Publisher: Stratosphere Laboratory.
- What it contains: thirteen scenarios mixing captured botnet traffic with normal and background traffic. The published bidirectional NetFlow files contain manually reviewed labels, including botnet, command-and-control, normal, and background.
- Size and handling: the official page lists a 1.9 GB full archive and several file types. For beginner analysis, use the labelled flow files. Do not execute supplied binaries or replay unknown traffic.
- Citation: Sebastian Garcia, Martin Grill, Jan Stiborek, and Alejandro Zunino, “An empirical comparison of botnet detection methods,” Computers & Security, 2014, Vol. 45, pp. 100–123. The official dataset page provides citation details.

## Splunk Boss of the SOC v3 — investigation scenario dataset

- Original repository: https://github.com/splunk/botsv3
- Publisher: Splunk on GitHub.
- What it contains: a public sample security dataset and capture-the-flag style investigation scenario for searching and correlating event data.
- Important distinction: scenario/CTF data is useful for reproducible practice, but it should not be described as live production telemetry.
- Before downloading: review the repository's current README, license, required software versions, and dataset size.

## How OpenCyberPath presents dataset figures

- The interactive homepage's **local event table and confusion matrix** are computed from the two small CSV files bundled with this repository. Those bundled files are deliberately synthetic teaching data.
- The public research datasets above are linked for further study; their numbers are not mixed into the local sample metrics.
- If a future revision imports public data into an interactive chart, record the exact source file/version, retrieval date, license/citation, selected fields, transformation code, and known limitations next to the chart.
- Do not claim detection performance from a tiny teaching sample. Benchmark scores depend on the dataset, label quality, class distribution, split method, and evaluation procedure.
