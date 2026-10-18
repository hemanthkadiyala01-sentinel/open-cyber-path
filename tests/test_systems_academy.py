import re
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / 'website' / 'src' / 'data' / 'systemsAcademy.js'
COMPONENT = ROOT / 'website' / 'src' / 'components' / 'SystemsAcademy.jsx'
APP = ROOT / 'website' / 'src' / 'App.jsx'
STYLES = ROOT / 'website' / 'src' / 'styles.css'
CAREERS = ROOT / 'website' / 'src' / 'data' / 'careerPaths.js'


class SystemsAcademyTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.data = DATA.read_text(encoding='utf-8')
        cls.component = COMPONENT.read_text(encoding='utf-8')
        cls.app = APP.read_text(encoding='utf-8')
        cls.styles = STYLES.read_text(encoding='utf-8')
        cls.careers = CAREERS.read_text(encoding='utf-8')

    def test_requested_operating_systems_are_present(self):
        for os_name in ['Windows', 'Linux fundamentals', 'Ubuntu', 'Arch Linux', 'Kali Linux', 'Parrot OS']:
            self.assertIn(f"name:'{os_name}'", self.data)
        self.assertGreaterEqual(self.data.count("docs:'https://"), 8)

    def test_network_curriculum_has_expected_core_topics(self):
        for topic in ['OSI and TCP/IP models', 'IPv4, IPv6 and subnetting', 'ARP, DNS, DHCP and ICMP', 'TCP, UDP, ports and sockets', 'Routing, switching and VLANs', 'HTTP, HTTPS and TLS', 'Firewalls and network security', 'Packet analysis and troubleshooting']:
            self.assertIn(topic, self.data)

    def test_every_network_module_points_to_a_practice_exercise(self):
        module_block = self.data.split('export const networkModules = [', 1)[1].split('export const practiceExercises = [', 1)[0]
        exercise_block = self.data.split('export const practiceExercises = [', 1)[1]
        module_labs = re.findall(r"lab:'([^']+)'", module_block)
        exercise_ids = set(re.findall(r"id:'([^']+)'", exercise_block))
        self.assertGreaterEqual(len(module_labs), 8)
        self.assertTrue(set(module_labs).issubset(exercise_ids), f'Missing exercises: {set(module_labs) - exercise_ids}')

    def test_path_references_exist_in_career_catalogue(self):
        career_ids = set(re.findall(r"id: '([^']+)'", self.careers))
        os_block = self.data.split('export const operatingSystems = [', 1)[1].split('export const networkModules = [', 1)[0]
        paths = re.findall(r"'([a-z0-9-]+)'", re.search(r'bestFor:\[(.*?)\]', os_block, re.S).group(1))
        self.assertTrue(set(paths).issubset(career_ids), f'Unknown career IDs: {set(paths) - career_ids}')
        module_block = self.data.split('export const networkModules = [', 1)[1].split('export const practiceExercises = [', 1)[0]
        all_module_paths = set()
        for group in re.findall(r'paths:\[(.*?)\]', module_block, re.S):
            all_module_paths.update(re.findall(r"'([a-z0-9-]+)'", group))
        self.assertTrue(all_module_paths.issubset(career_ids), f'Unknown career IDs: {all_module_paths - career_ids}')

    def test_examples_are_observational_not_destructive(self):
        command_block = self.data.split('export const networkModules = [', 1)[0]
        for unsafe in ['rm -rf', 'format c:', 'diskpart clean', 'mkfs.', 'shutdown /s', 'del /f /s']:
            self.assertNotIn(unsafe, command_block.lower())
        self.assertIn('Practice safely.', self.component)

    def test_pwn_college_is_linked_as_external_training_not_hosted_labs(self):
        resources = (ROOT / 'website' / 'src' / 'data' / 'resources.js').read_text(encoding='utf-8')
        self.assertIn("id: 'pwn-college'", resources)
        self.assertIn("url: 'https://pwn.college/'", resources)
        self.assertIn('does not host or control pwn.college lab sessions', resources)
        self.assertIn("'pwn-college'", self.careers)

    def test_academy_is_reachable_from_main_navigation(self):
        self.assertIn("['systems-academy','OS + Networks']", self.app)
        self.assertIn("page === 'systems-academy'", self.app)
        self.assertIn("const SystemsAcademy = lazy(() => import('./components/SystemsAcademy.jsx')", self.app)
        self.assertIn('.systems-academy', self.styles)


if __name__ == '__main__':
    unittest.main()
