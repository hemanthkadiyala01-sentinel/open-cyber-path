import base64
import datetime as dt
import json
import tempfile
import unittest
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import patch

from refresh_live_case_intelligence import (
    UTC,
    classify_case_type,
    parse_cisa_kev,
    parse_certin_html,
    parse_rss,
    refresh,
    source_records,
    CERTIN_URL,
    BLEEPING_FEED,
    CISA_ADVISORIES_FEED,
    CISA_ADVISORIES_FEEDS,
    CISA_RSS_ACCEPT,
    USER_AGENT,
    fetch_url,
    fetch_cisa_with_powershell,
    CISA_KEV_JSON,
    NCSC_RSS,
    THERECORD_FEED,
    HACKER_NEWS_FEED,
)

NOW = dt.datetime(2026, 10, 24, 12, 0, tzinfo=UTC)


class LiveCaseIntelligenceTests(unittest.TestCase):
    def test_classifies_different_live_incident_families(self):
        self.assertEqual(classify_case_type("Compromise of LiteLLM PyPI Package and Docker Images"), "dependency-compromise")
        self.assertEqual(classify_case_type("PHP remote code execution vulnerabilities"), "vulnerability")
        self.assertEqual(classify_case_type("eMudhra Intermediate CA Certificates compromise"), "certificate-compromise")
        self.assertEqual(classify_case_type("AI Agents as Attack Vectors"), "ai-agent")
        self.assertEqual(classify_case_type("Payment and disbursement APIs used for unauthorized transfers"), "api-abuse")
        self.assertEqual(classify_case_type("Third-party vendor data breach"), "third-party-breach")

    def test_parses_certin_listing_and_retains_official_links(self):
        page = '''<ul><li><a href="s2cMainServlet?VLCODE=CIAD-2026-0053&amp;pageid=PUBVLNOTES02">CERT-In Advisory CIAD-2026-0053</a> (October 23, 2026) Compromise of LiteLLM PyPI Package and Docker Images</li></ul>'''
        rows = parse_certin_html(page, now=NOW)
        self.assertEqual(len(rows), 1)
        self.assertIn("LiteLLM", rows[0]["title"])
        self.assertEqual(rows[0]["caseType"], "dependency-compromise")
        self.assertTrue(rows[0]["url"].startswith("https://www.cert-in.org.in/"))

    def test_parses_rss_and_rejects_untrusted_url(self):
        xml = '''<rss><channel><item><title>GitLab RCE vulnerability fixed</title><link>https://www.bleepingcomputer.com/news/security/gitlab-rce/</link><pubDate>Thu, 22 Oct 2026 10:00:00 GMT</pubDate><description><![CDATA[The vendor released a security patch for the vulnerability.]]></description></item><item><title>Security story redirect</title><link>https://example.com/fake</link><pubDate>Thu, 22 Oct 2026 10:00:00 GMT</pubDate><description>cyber incident</description></item></channel></rss>'''
        rows = parse_rss(xml, now=NOW)
        self.assertEqual(len(rows), 1)
        self.assertEqual(rows[0]["publisher"], "BleepingComputer")
        self.assertEqual(rows[0]["caseType"], "vulnerability")

    def test_parses_recent_cisa_kev_records(self):
        payload = json.dumps({"vulnerabilities": [{
            "cveID": "CVE-2026-110264", "vendorProject": "GitLab", "product": "GitLab",
            "vulnerabilityName": "Remote Code Execution", "dateAdded": "2026-10-22",
            "shortDescription": "Code execution flaw", "requiredAction": "Apply vendor fixes",
        }]})
        rows = parse_cisa_kev(payload, now=NOW)
        self.assertEqual(len(rows), 1)
        self.assertEqual(rows[0]["caseType"], "vulnerability")
        self.assertIn("CVE-2026-110264", rows[0]["title"])


    def test_parses_rss_for_each_allowlisted_news_source_and_rejects_off_domain_links(self):
        cases = [
            ("UK NCSC", "ncsc-uk", {"www.ncsc.gov.uk"}, "https://www.ncsc.gov.uk/news/cyber-incident", "official-publication"),
            ("The Record", "therecord", {"therecord.media"}, "https://therecord.media/cyber-incident", "reported"),
            ("The Hacker News", "thehackernews", {"thehackernews.com"}, "https://thehackernews.com/2026/10/cyber-incident.html", "reported"),
            ("CISA", "cisa-advisories", {"www.cisa.gov"}, "https://www.cisa.gov/news-events/cybersecurity-advisories/sample", "official-advisory"),
        ]
        for publisher, source_id, hosts, trusted_url, confidence in cases:
            with self.subTest(source_id=source_id):
                xml = f'''<rss><channel>
                <item><title>Cyber incident response advisory update</title><link>{trusted_url}</link>
                <pubDate>Fri, 23 Oct 2026 10:00:00 GMT</pubDate><description>Reported cyber incident and security investigation.</description></item>
                <item><title>Cyber incident fake mirror</title><link>https://example.org/fake</link>
                <pubDate>Fri, 23 Oct 2026 10:00:00 GMT</pubDate><description>Reported cyber incident.</description></item>
                </channel></rss>'''
                signal = "Official source publication" if confidence != "reported" else None
                rows = parse_rss(
                    xml, publisher, NOW, source_id=source_id, allowed_hosts=hosts,
                    signal_type=signal, confidence=confidence,
                )
                self.assertEqual(len(rows), 1)
                self.assertEqual(rows[0]["sourceId"], source_id)
                self.assertEqual(rows[0]["url"], trusted_url)
                self.assertEqual(rows[0]["confidence"], confidence)

    def test_source_records_configures_seven_automated_sources(self):
        certin = '''<ul><li><a href="s2cMainServlet?VLCODE=CIAD-2026-0053&amp;pageid=PUBVLNOTES02">CERT-In Advisory CIAD-2026-0053</a> (October 23, 2026) Compromise of LiteLLM PyPI Package and Docker Images</li></ul>'''
        def rss(host, path):
            return f'''<rss><channel><item><title>Cyber incident security investigation</title><link>https://{host}/{path}</link><pubDate>Fri, 23 Oct 2026 10:00:00 GMT</pubDate><description>Reported cyber incident, security response and investigation.</description></item></channel></rss>'''
        kev = json.dumps({"vulnerabilities": [{
            "cveID": "CVE-2026-110264", "vendorProject": "GitLab", "product": "GitLab",
            "vulnerabilityName": "Remote Code Execution", "dateAdded": "2026-10-22",
            "shortDescription": "Code execution flaw", "requiredAction": "Apply vendor fixes",
        }]})
        fixtures = {
            CERTIN_URL: certin.encode(),
            BLEEPING_FEED: rss("www.bleepingcomputer.com", "news/security/sample/").encode(),
            THERECORD_FEED: rss("therecord.media", "sample-incident").encode(),
            HACKER_NEWS_FEED: rss("thehackernews.com", "2026/10/sample.html").encode(),
            NCSC_RSS: rss("www.ncsc.gov.uk", "news/sample").encode(),
            CISA_ADVISORIES_FEEDS[0]: rss("www.cisa.gov", "news-events/cybersecurity-advisories/sample-primary").encode(),
            CISA_ADVISORIES_FEEDS[1]: rss("www.cisa.gov", "cybersecurity-advisories/sample-secondary").encode(),
            CISA_ADVISORIES_FEEDS[2]: rss("www.cisa.gov", "news-events/cybersecurity-advisories/sample-alert").encode(),
            CISA_KEV_JSON: kev.encode(),
        }
        with patch("refresh_live_case_intelligence.fetch_url", side_effect=lambda url: fixtures[url]):
            items, sources = source_records(now=NOW)
        self.assertEqual(len(sources), 7)
        self.assertEqual({s["id"] for s in sources}, {
            "cert-in", "bleepingcomputer", "therecord", "thehackernews",
            "ncsc-uk", "cisa-advisories", "cisa-kev",
        })
        self.assertTrue(all(s["status"] == "ok" for s in sources), sources)
        self.assertGreaterEqual(len(items), 7)

    def test_cisa_rss_requests_use_accept_header_that_worked_in_powershell_probe(self):
        class FakeResponse:
            def __enter__(self):
                return self
            def __exit__(self, *_args):
                return False
            def read(self, _limit):
                return b"<rss><channel></channel></rss>"

        for url in CISA_ADVISORIES_FEEDS:
            with self.subTest(url=url):
                # This test targets urllib header construction, so force the non-Windows branch.
                # On Windows, fetch_url intentionally uses the native PowerShell transport first.
                with patch("refresh_live_case_intelligence.IS_WINDOWS", False), \
                     patch("refresh_live_case_intelligence.urllib.request.urlopen", return_value=FakeResponse()) as open_mock:
                    fetch_url(url)
                request = open_mock.call_args.args[0]
                self.assertEqual(request.get_header("Accept"), CISA_RSS_ACCEPT)
                self.assertEqual(request.get_header("User-agent"), USER_AGENT)


    def test_windows_cisa_rss_prefers_native_powershell_transport(self):
        url = CISA_ADVISORIES_FEEDS[1]
        payload = b"<rss><channel><item></item></channel></rss>"
        with patch("refresh_live_case_intelligence.IS_WINDOWS", True), \
             patch("refresh_live_case_intelligence.fetch_cisa_with_powershell", return_value=payload) as native_fetch, \
             patch("refresh_live_case_intelligence.urllib.request.urlopen") as urllib_fetch:
            self.assertEqual(fetch_url(url), payload)
        native_fetch.assert_called_once_with(url)
        urllib_fetch.assert_not_called()

    def test_powershell_cisa_transport_uses_safe_request_and_decodes_payload(self):
        url = CISA_ADVISORIES_FEEDS[2]
        payload = b"<rss><channel><item><title>Advisory</title></item></channel></rss>"
        completed = SimpleNamespace(returncode=0, stdout=base64.b64encode(payload).decode("ascii"), stderr="")
        with patch("refresh_live_case_intelligence.subprocess.run", return_value=completed) as run_mock:
            result = fetch_cisa_with_powershell(url)
        self.assertEqual(result, payload)
        command = run_mock.call_args.args[0]
        self.assertIn("-NoProfile", command)
        self.assertIn("-NonInteractive", command)
        self.assertIn("-UseBasicParsing", command[-1])
        self.assertIn(CISA_RSS_ACCEPT, command[-1])
        self.assertIn(url, command[-1])

    def test_powershell_cisa_transport_rejects_non_allowlisted_url(self):
        with self.assertRaises(ValueError):
            fetch_cisa_with_powershell("https://example.org/cybersecurity-advisories.xml")

    def test_windows_cisa_fetch_falls_back_to_urllib_if_powershell_fails(self):
        url = CISA_ADVISORIES_FEEDS[1]
        payload = b"<rss><channel><item><title>Fallback</title></item></channel></rss>"
        class FakeResponse:
            def __enter__(self): return self
            def __exit__(self, *_args): return False
            def read(self, _limit): return payload
        with patch("refresh_live_case_intelligence.IS_WINDOWS", True), \
             patch("refresh_live_case_intelligence.fetch_cisa_with_powershell", side_effect=OSError("simulated native request failure")), \
             patch("refresh_live_case_intelligence.urllib.request.urlopen", return_value=FakeResponse()):
            self.assertEqual(fetch_url(url), payload)

    def test_cisa_advisories_uses_alternative_feeds_when_primary_fails_and_deduplicates(self):
        certin = '''<ul><li><a href="s2cMainServlet?VLCODE=CIAD-2026-0053&amp;pageid=PUBVLNOTES02">CERT-In Advisory CIAD-2026-0053</a> (October 23, 2026) Compromise of LiteLLM PyPI Package and Docker Images</li></ul>'''
        def rss(host, path, title="Cyber incident security advisory"):
            return f'''<rss><channel><item><title>{title}</title><link>https://{host}/{path}</link>
            <pubDate>Fri, 23 Oct 2026 10:00:00 GMT</pubDate>
            <description>Security advisory about a cyber incident and remediation.</description></item></channel></rss>'''
        kev = json.dumps({"vulnerabilities": [{
            "cveID": "CVE-2026-110264", "vendorProject": "GitLab", "product": "GitLab",
            "vulnerabilityName": "Remote Code Execution", "dateAdded": "2026-10-22",
            "shortDescription": "Code execution flaw", "requiredAction": "Apply vendor fixes",
        }]})
        fixtures = {
            CERTIN_URL: certin.encode(),
            BLEEPING_FEED: rss("www.bleepingcomputer.com", "news/security/sample/").encode(),
            THERECORD_FEED: rss("therecord.media", "sample-incident").encode(),
            HACKER_NEWS_FEED: rss("thehackernews.com", "2026/10/sample.html").encode(),
            NCSC_RSS: rss("www.ncsc.gov.uk", "news/sample").encode(),
            CISA_ADVISORIES_FEEDS[1]: rss("www.cisa.gov", "cybersecurity-advisories/fallback-1").encode(),
            CISA_ADVISORIES_FEEDS[2]: rss("www.cisa.gov", "news-events/cybersecurity-advisories/fallback-2").encode(),
            CISA_KEV_JSON: kev.encode(),
        }
        def fetch_with_primary_failure(url):
            if url == CISA_ADVISORIES_FEEDS[0]:
                raise OSError("simulated primary endpoint outage")
            return fixtures[url]
        with patch("refresh_live_case_intelligence.fetch_url", side_effect=fetch_with_primary_failure):
            items, sources = source_records(now=NOW)
        cisa = next(source for source in sources if source["id"] == "cisa-advisories")
        self.assertEqual(cisa["status"], "ok", cisa)
        self.assertEqual(cisa["successfulFeedCount"], 2)
        self.assertTrue(cisa["partialFeedErrors"])
        cisa_items = [item for item in items if item["sourceId"] == "cisa-advisories"]
        self.assertEqual(len(cisa_items), 2)
        self.assertTrue(all(item["confidence"] == "official-advisory" for item in cisa_items))

    def test_partial_source_failure_keeps_usable_sources(self):
        certin = '''<ul><li><a href="s2cMainServlet?VLCODE=CIAD-2026-0053&amp;pageid=PUBVLNOTES02">CERT-In Advisory CIAD-2026-0053</a> (October 23, 2026) Compromise of LiteLLM PyPI Package and Docker Images</li></ul>'''
        def broken(url):
            if url == CERTIN_URL:
                return certin.encode()
            raise OSError("temporary source outage")
        with patch("refresh_live_case_intelligence.fetch_url", side_effect=broken):
            items, sources = source_records(now=NOW)
        self.assertTrue(items)
        self.assertEqual(next(s for s in sources if s["id"] == "cert-in")["status"], "ok")
        self.assertTrue(any(s["status"] == "error" for s in sources))

    def test_keeps_existing_snapshot_if_all_sources_fail(self):
        with tempfile.TemporaryDirectory() as temp:
            output = Path(temp) / "feed.json"
            output.write_text('{"items": [{"id": "preserve-me"}], "sources": []}', encoding="utf-8")
            with self.assertRaises(RuntimeError):
                refresh(output, now=NOW, fetched=([], [
                    {"id": "cert-in", "name": "CERT-In", "status": "error", "itemCount": 0},
                    {"id": "bleepingcomputer", "name": "BleepingComputer", "status": "error", "itemCount": 0},
                    {"id": "therecord", "name": "The Record", "status": "error", "itemCount": 0},
                    {"id": "thehackernews", "name": "The Hacker News", "status": "error", "itemCount": 0},
                    {"id": "ncsc-uk", "name": "UK NCSC", "status": "error", "itemCount": 0},
                    {"id": "cisa-advisories", "name": "CISA Advisories", "status": "error", "itemCount": 0},
                    {"id": "cisa-kev", "name": "CISA KEV", "status": "error", "itemCount": 0},
                ]))
            self.assertIn("preserve-me", output.read_text(encoding="utf-8"))


if __name__ == "__main__":
    unittest.main()
