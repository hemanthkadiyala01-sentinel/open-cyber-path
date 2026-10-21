from __future__ import annotations
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ASSISTANT = ROOT / "website/src/components/SiteGuideAssistant.jsx"
STYLES = ROOT / "website/src/components/SiteGuideAssistant.css"


class SiteGuideAssistantTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.jsx = ASSISTANT.read_text(encoding="utf-8")
        cls.css = STYLES.read_text(encoding="utf-8")

    def test_capability_questions_have_a_dedicated_answer_before_search(self):
        self.assertIn("function isCapabilitiesQuestion(query)", self.jsx)
        self.assertIn("what can (?:you|u) do(?: for me)?", self.jsx)
        self.assertIn("if (capabilities)", self.jsx)
        self.assertLess(self.jsx.index("if (capabilities)"), self.jsx.index("let scored = allItems.filter((item) => cleanTitle(item.title || item.name)).map"))
        self.assertIn("suggestions = CAPABILITY_SUGGESTIONS", self.jsx)

    def test_greetings_do_not_return_arbitrary_catalogue_cards(self):
        self.assertIn("function isSimpleGreeting(query)", self.jsx)
        self.assertIn("else if (greeting)", self.jsx)
        self.assertIn("suggestions = CAPABILITY_SUGGESTIONS.slice(0, 4)", self.jsx)

    def test_sensitive_topic_search_has_exact_and_related_match_states(self):
        for topic in ("wireless-security", "bug-bounty", "dark-web", "mobile-security"):
            self.assertIn(f"id: '{topic}'", self.jsx)
        self.assertIn("function topicMatch(item, topic)", self.jsx)
        self.assertIn("const exact = topical.filter((item) => item._topicMatch === 'exact')", self.jsx)
        self.assertIn("Related topic — this source does not explicitly mention the exact subtopic.", self.jsx)

    def test_low_confidence_topic_search_does_not_promote_unrelated_items(self):
        self.assertIn("const topical = scored.filter((item) => {", self.jsx)
        self.assertIn("if (item._topicMatch === 'none'", self.jsx)
        self.assertIn("I couldn't find an exact ${topic.label} match", self.jsx)
        self.assertIn("I couldn't find a strong ${topic.label} match", self.jsx)

    def test_jobs_and_internships_are_combined_when_the_user_requests_both(self):
        self.assertIn(r"jobs?\b.*\bintern(?:ship|ships)", self.jsx)
        self.assertIn("const filterMatches = (item) => filter === 'job'", self.jsx)
        self.assertIn("['job', 'internship'].includes(item.kind)", self.jsx)

    def test_navigation_prefers_specific_route_and_tools_has_its_own_destination(self):
        self.assertIn("matches.sort((a, b) => b.term.length - a.term.length", self.jsx)
        resources_line = next(line for line in self.jsx.splitlines() if "page: 'resources'" in line)
        self.assertNotIn("'tools'", resources_line)
        self.assertIn("page: 'tools', label: 'Tools & case studies'", self.jsx)

    def test_result_actions_are_named_by_content_type_and_sources_are_disclosed(self):
        for label in ("Watch video", "View repository", "Read update", "View internship", "View event"):
            self.assertIn(label, self.jsx)
        self.assertIn("they do not mean every provider is connected to live indexing", self.jsx)

    def test_chat_panel_uses_compact_responsive_dark_scrollbars(self):
        self.assertIn("width:min(390px,calc(100vw - 28px))", self.css)
        self.assertIn("color-scheme:dark", self.css)
        self.assertIn("scrollbar-color:", self.css)
        self.assertIn("::-webkit-scrollbar-thumb", self.css)
        self.assertIn("@media(max-width:560px)", self.css)
        self.assertIn("ocp-guide-suggestions", self.css)

    def test_escape_key_closes_the_chat(self):
        self.assertIn("event.key === 'Escape'", self.jsx)
        self.assertIn("window.removeEventListener('keydown', handleKeyDown)", self.jsx)

    def test_mobile_hacking_is_a_specific_topic_and_rejects_generic_hacking_results(self):
        self.assertIn("id: 'mobile-security'", self.jsx)
        self.assertIn("mobile hacking|android hacking|iphone hacking", self.jsx)
        self.assertIn("const topical = scored.filter((item) => {", self.jsx)
        self.assertIn("if (item._topicMatch === 'none'", self.jsx)
        self.assertIn("sourceQuery: 'Android iOS mobile application security authorized testing emulator defensive learning'", self.jsx)

    def test_cybersecurity_law_queries_reject_general_security_discussions(self):
        self.assertIn("id: 'cybersecurity-law'", self.jsx)
        self.assertIn(r"cyber(?:\s*security)?\s+laws?", self.jsx)
        self.assertIn("label: 'cybersecurity laws and regulation'", self.jsx)
        self.assertIn("const exact = topical.filter((item) => item._topicMatch === 'exact')", self.jsx)

    def test_latest_search_sorts_known_dates_first_and_discloses_missing_dates(self):
        self.assertIn("function compareFreshness(a, b)", self.jsx)
        self.assertIn("function asksForLatest(query)", self.jsx)
        self.assertIn("latestRequested ? compareFreshness(a, b) : 0", self.jsx)
        self.assertIn("Publication dates are missing for some results", self.jsx)
        self.assertIn("Publication date unknown", self.jsx)

    def test_legal_queries_ask_for_jurisdiction_before_returning_generic_frameworks(self):
        self.assertIn("const needsLegalJurisdiction = topic?.id === 'cybersecurity-law'", self.jsx)
        self.assertIn("Cybersecurity and data-protection laws differ by country or region", self.jsx)
        self.assertIn("suggestions = LAW_JURISDICTION_SUGGESTIONS", self.jsx)
        self.assertIn("India Code — Digital Personal Data Protection Act, 2023", self.jsx)
        self.assertIn("EUR-Lex — EU law", self.jsx)

    def test_legal_results_require_legislation_type_and_official_jurisdiction_source(self):
        self.assertIn("function isLegislationRecord(item)", self.jsx)
        self.assertIn("function officialLegalHostMatches(host, jurisdiction)", self.jsx)
        self.assertIn("isLegislationRecord(item) && itemMatchesJurisdiction(item, jurisdiction)", self.jsx)
        self.assertIn("voluntary frameworks rather than present them as interchangeable", self.jsx)

    def test_frameworks_are_separated_from_law_results(self):
        self.assertIn("function isFrameworkIntent(query)", self.jsx)
        self.assertIn("function isFrameworkRecord(item)", self.jsx)
        self.assertIn("if (frameworkIntent) return isFrameworkRecord(item)", self.jsx)
        self.assertIn("NIST Privacy Framework", self.jsx)
        self.assertIn("Frameworks and standards provide guidance; they are not automatically laws or binding regulations.", self.jsx)

    def test_html_entities_and_corrupted_feed_titles_are_cleaned_or_hidden(self):
        self.assertIn("function decodeHtmlEntities(value)", self.jsx)
        self.assertIn("function hasCorruptedHeadline(value)", self.jsx)
        self.assertIn("function cleanTitle(value)", self.jsx)
        self.assertIn("allItems.filter((item) => cleanTitle(item.title || item.name))", self.jsx)
        self.assertIn("Headline unavailable — open the original source for details", self.jsx)

    def test_latest_sort_uses_publication_dates_not_last_seen_timestamps(self):
        self.assertIn("function publicationTimeValue(item)", self.jsx)
        self.assertIn("return dateMillis(item.publishedAt || item.published_at || item.pubDate || item.published || item.datePublished)", self.jsx)
        self.assertIn("Older material · Published", self.jsx)
        self.assertIn("Intl.DateTimeFormat('en-GB'", self.jsx)

    def test_missing_requested_type_does_not_fall_back_to_unrelated_cards(self):
        self.assertIn("const typeMatches = scored.filter((item) => filterMatches(item))", self.jsx)
        self.assertIn("matched = typeMatches", self.jsx)
        self.assertNotIn("matched = (typeMatches.length ? typeMatches : scored)", self.jsx)


    def test_source_coverage_is_rendered_once_globally_not_after_every_answer(self):
        self.assertIn("ocp-guide-source-health ocp-guide-global-health", self.jsx)
        self.assertNotIn("entry.health?.length", self.jsx)
        self.assertNotIn("health: statusItems.slice(0, 12)", self.jsx)

    def test_generic_video_search_links_use_topic_terms_not_the_full_instruction(self):
        self.assertIn("function providerSearchQuery(query, filter = '', topic = null)", self.jsx)
        self.assertIn("const sourceQuery = providerSearchQuery(query, filter, topic)", self.jsx)
        self.assertIn("with|and|or|latest", self.jsx)
        self.assertIn("sp=EgJAAQ%3D%3D", self.jsx)
        self.assertNotIn("sp=EgJAAQ%253D%253D", self.jsx)

    def test_india_legal_links_include_specific_official_act_and_rules_sources(self):
        self.assertIn("India Code — Digital Personal Data Protection Act, 2023", self.jsx)
        self.assertIn("Digital Personal Data Protection Rules, 2025", self.jsx)
        self.assertIn("linksHeading: topic?.id === 'cybersecurity-law'", self.jsx)
        self.assertIn("Official legal sources", self.jsx)
        self.assertIn("Official framework sources", self.jsx)
        self.assertIn("Frameworks provide guidance and do not automatically create legal obligations.", self.jsx)

    def test_markdown_urls_in_feed_titles_are_cleaned_and_rss_card_links_can_resolve_to_article(self):
        self.assertIn("function resultUrl(item)", self.jsx)
        self.assertIn("const embedded = [...rawTitle.matchAll", self.jsx)
        self.assertIn("const feedLike =", self.jsx)

    def test_result_metadata_wraps_cleanly_and_source_health_is_compact(self):
        self.assertIn("flex-wrap:wrap;gap:7px 10px", self.css)
        self.assertIn("ocp-guide-global-health[open]", self.css)

if __name__ == "__main__":
    unittest.main()
