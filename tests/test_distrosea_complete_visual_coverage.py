import pathlib
import unittest

ROOT = pathlib.Path(__file__).resolve().parents[1]


class DistroSeaVisualCoverageTests(unittest.TestCase):
    def read(self, relative):
        return (ROOT / relative).read_text(encoding="utf-8-sig")

    def test_logo_candidates_try_known_brand_assets_then_distrosea(self):
        component = self.read("website/src/components/DistroSeaDirectory.jsx")
        self.assertIn("SIMPLE_ICON_SLUG_BY_NAME", component)
        self.assertIn("https://cdn.simpleicons.org/${simpleIconSlug}/${colour}", component)
        self.assertIn("https://distrosea.com/distro-icons/${slug}.svg", component)
        self.assertIn("function DistroSeaLogo({ system })", component)

    def test_no_card_has_an_empty_logo_panel_when_remote_images_fail(self):
        component = self.read("website/src/components/DistroSeaDirectory.jsx")
        styles = self.read("website/src/components/DistroSeaDirectory.css")
        self.assertIn('!loaded && <SystemFallbackMark system={system} />', component)
        self.assertRegex(component, r'onError=\{\(\) => setCandidateIndex\(\(index\) =>\s*Math\.min\(index \+ 1, candidates\.length\)\)\}')
        self.assertIn(".dsx-logo-wrap", styles)
        self.assertIn("position: absolute", styles)
        self.assertIn(".dsx-logo-image[hidden]", styles)

    def test_distrosea_incomplete_rows_expand_to_use_all_columns(self):
        styles = self.read("website/src/components/DistroSeaDirectory.css")
        self.assertIn(".dsx-grid > .dsx-card:last-child:nth-child(3n + 1)", styles)
        self.assertIn(".dsx-card:nth-last-child(2):nth-child(3n + 1)", styles)
        self.assertIn("grid-template-areas:", styles)

    def test_visual_explorer_incomplete_rows_expand_to_use_all_columns(self):
        styles = self.read("website/src/styles.css")
        self.assertIn(".osx-system-card:last-child:nth-child(3n + 1)", styles)
        self.assertIn(".osx-system-card:nth-last-child(2):nth-child(3n + 1)", styles)
        self.assertIn("osx-art", styles)

    def test_existing_catalogue_links_and_filtering_remain_in_place(self):
        component = self.read("website/src/components/DistroSeaDirectory.jsx")
        self.assertIn("const visibleSystems = useMemo", component)
        self.assertIn('href={system.url}', component)
        self.assertIn('rel="noopener noreferrer"', component)
        self.assertIn("DistroSea controls queue times, versions, and session availability.", component)


if __name__ == "__main__":
    unittest.main()
