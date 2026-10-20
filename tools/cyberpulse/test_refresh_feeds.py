import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch
from datetime import datetime, timezone

from tools.cyberpulse import refresh_feeds as rf

class CyberPulseTests(unittest.TestCase):
    def test_self_test(self):
        rf.self_test()

    def test_source_registry_has_expected_sites_and_no_author_fields(self):
        labels = {s['label'] for s in rf.SOURCES}
        self.assertIn('BleepingComputer', labels)
        self.assertIn('The Hacker News', labels)
        self.assertIn('CERT-In advisories', labels)
        for src in rf.SOURCES:
            self.assertNotIn('author', src)
            self.assertNotIn('reporter', src)

    def test_refresh_preserves_previous_items_if_all_sources_fail(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            (root / 'public' / 'data').mkdir(parents=True)
            (root / 'src' / 'data').mkdir(parents=True)
            (root / 'public' / 'data' / 'cyberpulse-feed.json').write_text(json.dumps({
                'schemaVersion':1,'status':'ok','generatedAt':'2026-10-19T00:00:00Z','lastSuccessfulSyncAt':'2026-10-19T00:00:00Z',
                'items':[{'id':'prev:1','sourceId':'bleepingcomputer','title':'Old item','url':'https://example.org','firstSeenAt':'2026-10-19T00:00:00Z'}],
                'sources':[{'id':s['id'],'lastSuccessAt':'2026-10-19T00:00:00Z'} for s in rf.SOURCES]
            }), encoding='utf-8')
            with patch.object(rf, 'fetch_source', side_effect=OSError('offline')):
                feed, freshness, successes = rf.refresh(root)
            self.assertEqual(successes,0)
            self.assertEqual(feed['status'],'stale')
            self.assertEqual(feed['items'][0]['id'],'prev:1')
            self.assertIsNotNone(freshness['generatedAt'])

    def test_only_http_source_urls_are_retained(self):
        self.assertIsNone(rf.safe_http_url('javascript:alert(1)'))
        self.assertIsNone(rf.safe_http_url('data:text/html,hi'))

    def test_short_excerpt_has_no_html_or_author_metadata(self):
        raw = b'<rss><channel><item><title>Latest security update</title><link>https://example.org/update</link><description>&lt;p&gt;A short and &lt;b&gt;useful&lt;/b&gt; summary.&lt;/p&gt;</description><author>someone@example.org</author></item></channel></rss>'
        source = {'id':'test','label':'Test','kind':'rss','url':'https://example.org/feed','type':'news','confidence':'publisher','topic':'News'}
        item = rf.parse_rss(raw, source, '2026-10-20T00:00:00Z')[0]
        self.assertEqual(item['summary'],'A short and useful summary.')
        self.assertNotIn('author', item)
        self.assertNotIn('someone@example.org', json.dumps(item))

if __name__ == '__main__':
    unittest.main()
