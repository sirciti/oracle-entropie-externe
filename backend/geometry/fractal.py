import random
from typing import Dict, List, Any

# Les fonctions de logging seront gérées par le logger principal
# via entropy_oracle.py ou définies localement si nécessaire.
# from backend.core.utils.utils import logger # Si vous voulez un logger ici.


class FractalLSystem:
    """
    Générateur de fractales L-system.
    Produit des chaînes complexes basées sur des règles de réécriture.
    """
    def __init__(self, axiom: str, rules: Dict[str, str]):
        self.axiom = axiom
        self.rules = rules

    def generate(self, iterations: int) -> str:
        """
        Génère la chaîne fractale après un certain nombre d'itérations.
        """
        current_string = self.axiom
        for _ in range(iterations):
            next_string = []
            for char in current_string:
                next_string.append(self.rules.get(char, char))
            current_string = "".join(next_string)
        return current_string

# Pour le test direct du module
if __name__ == "__main__":
    print("--- Test Fractal L-System ---")
    
    # Exemple de L-system pour une fougère simple
    # F: Avancer et dessiner
    # +: Tourner à gauche
    # -: Tourner à droite
    # [: Sauvegarder la position et l'angle
    # ]: Restaurer la dernière position et l'angle
    
    # Règles inspirées de la fougère de Barnsley (simplifié pour la chaîne)
    fractal_rules = {
        "F": "F[+F]F[-F]F"
    }

    lsystem = FractalLSystem(axiom="F", rules=fractal_rules)
    
    print("\nChaîne après 0 itération:", lsystem.generate(0))
    print("Chaîne après 1 itération:", lsystem.generate(1))
    print("Chaîne après 2 itérations:", lsystem.generate(2))
    print("Chaîne après 3 itérations (partiel):", lsystem.generate(3)[:100] + "...")