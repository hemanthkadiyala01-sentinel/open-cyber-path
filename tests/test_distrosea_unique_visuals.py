import pathlib
import unittest

ROOT = pathlib.Path(__file__).resolve().parents[1]


class DistroSeaUniqueVisualsTests(unittest.TestCase):
    def read(self, relative):
        return (ROOT / relative).read_text(encoding="utf-8-sig")

    def test_actual_logo_and_fallback_use_the_same_centered_slot(self):
        component = self.read("website/src/components/DistroSeaDirectory.jsx")
        styles = self.read("website/src/components/DistroSeaDirectory.css")
        self.assertIn("function DistroSeaLogo({ system })", component)
        self.assertIn("!loaded && <SystemFallbackMark system={system} />", component)
        self.assertIn("className: 'dsx-logo-fallback'", component)
        self.assertIn(".dsx-logo-wrap", styles)
        self.assertIn(".dsx-logo-image", styles)

    def test_letter_only_fallback_is_removed(self):
        component = self.read("website/src/components/DistroSeaDirectory.jsx")
        self.assertNotIn("systemInitials(system.name)", component)
        self.assertNotIn("className=\"dsx-logo-fallback\">{systemInitials", component)
        self.assertIn("function SystemFallbackMark({ system })", component)

    def test_each_card_owns_its_palette_and_pattern(self):
        component = self.read("website/src/components/DistroSeaDirectory.jsx")
        styles = self.read("website/src/components/DistroSeaDirectory.css")
        self.assertIn("'--dsx-accent': systemAccent(system)", component)
        self.assertIn("'--dsx-secondary': systemAccentSecondary(system)", component)
        self.assertIn('data-dsx-pattern={systemPattern(system)}', component)
        for pattern in range(8):
            self.assertIn(f'data-dsx-pattern="{pattern}"', styles)
        self.assertIn("color-mix(in srgb, var(--dsx-secondary)", styles)

    def test_distrosea_and_simple_icons_remain_fallback_candidates(self):
        component = self.read("website/src/components/DistroSeaDirectory.jsx")
        self.assertIn("https://cdn.simpleicons.org/${simpleIconSlug}/${colour}", component)
        self.assertIn("https://distrosea.com/distro-icons/${slug}.svg", component)
        for name in ("Big Linux", "blendOS", "Endless OS", "Mageia", "Nitrux", "Nobara Linux", "SliTaz", "SparkyLinux"):
            self.assertIn(f"'{name}'", component)

    def test_existing_filters_links_and_card_coverage_remain(self):
        component = self.read("website/src/components/DistroSeaDirectory.jsx")
        styles = self.read("website/src/components/DistroSeaDirectory.css")
        self.assertIn("const visibleSystems = useMemo", component)
        self.assertIn('href={system.url}', component)
        self.assertIn('rel="noopener noreferrer"', component)
        self.assertIn(".dsx-grid > .dsx-card:last-child:nth-child(3n + 1)", styles)
        self.assertIn("DistroSea controls queue times, versions, and session availability.", component)


if __name__ == "__main__":
    unittest.main()
