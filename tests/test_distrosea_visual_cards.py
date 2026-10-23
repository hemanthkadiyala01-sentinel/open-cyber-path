import pathlib
import unittest

ROOT = pathlib.Path(__file__).resolve().parents[1]


class DistroSeaVisualCardTests(unittest.TestCase):
    def read(self, relative):
        return (ROOT / relative).read_text(encoding="utf-8-sig")

    def test_cards_use_distrosea_logos_with_graceful_initials_fallback(self):
        component = self.read("website/src/components/DistroSeaDirectory.jsx")
        self.assertIn("https://distrosea.com/distro-icons/${slug}.svg", component)
        self.assertIn('className="dsx-logo-image"', component)
        self.assertIn("className: 'dsx-logo-fallback'", component)
        self.assertRegex(component, r'onError=\{\(\) => setCandidateIndex\(\(index\) =>\s*Math\.min\(index \+ 1, candidates\.length\)\)\}')

    def test_logo_images_are_lazy_and_decorative(self):
        component = self.read("website/src/components/DistroSeaDirectory.jsx")
        self.assertIn('loading="lazy"', component)
        self.assertIn('decoding="async"', component)
        self.assertIn('alt=""', component)
        self.assertIn('referrerPolicy="no-referrer"', component)

    def test_catalogue_cards_have_per_system_colour_accents_and_responsive_layout(self):
        component = self.read("website/src/components/DistroSeaDirectory.jsx")
        styles = self.read("website/src/components/DistroSeaDirectory.css")
        self.assertIn("function systemAccent(system)", component)
        self.assertIn("'--dsx-accent': systemAccent(system)", component)
        self.assertIn(".dsx-card-art", styles)
        self.assertIn("var(--dsx-accent)", styles)
        self.assertIn(".dsx-grid{grid-template-columns:1fr}", styles)

    def test_filtering_and_original_third_party_destination_are_preserved(self):
        component = self.read("website/src/components/DistroSeaDirectory.jsx")
        self.assertIn("const visibleSystems = useMemo", component)
        self.assertIn('href={system.url}', component)
        self.assertIn('rel="noopener noreferrer"', component)
        self.assertIn("DistroSea controls queue times, versions, and session availability.", component)


if __name__ == "__main__":
    unittest.main()
