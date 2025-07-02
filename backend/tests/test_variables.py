# backend/tests/test_variables.py
import unittest
import glob
import re

class TestVariableDeclaration(unittest.TestCase):
    def test_no_undeclared_js_variables(self):
        """Vérifie qu'aucune variable non déclarée n'existe dans les fichiers JS"""
        js_files = glob.glob('frontend/src/**/*.js', recursive=True)
        undeclared_vars = []

        for file in js_files:
            with open(file, 'r') as f:
                content = f.read()
                # Détection des variables sans let/const/var
                matches = re.findall(r'(?<![a-zA-Z0-9_\$])(\b\w+\b)(?=\s*[=;])', content)
                if matches:
                    undeclared_vars.append((file, matches))

        self.assertEqual(len(undeclared_vars), 0, 
            f"Variables non déclarées détectées: {undeclared_vars}")
