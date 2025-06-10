import numpy as np
import matplotlib.pyplot as plt
from typing import Dict

class FractalLSystem:
    def __init__(self, axiom: str = "F", rules: Dict[str, str] = None, angle: float = 25.0):
        """
        Initialise un système L-system fractal.
        Args:
            axiom: La chaîne de départ du L-system.
            rules: Dictionnaire des règles de production (ex: {"F": "F[+F]F[-F][F]"}).
            angle: Angle de rotation en degrés pour la visualisation (par défaut 25.0).
        """
        self.axiom = axiom
        self.rules = rules if rules is not None else {"F": "F[+F]F[-F][F]"}
        self.angle = angle

    def generate(self, iterations: int = 3) -> str:
        """
        Génère la chaîne L-system après un nombre donné d'itérations.
        Args:
            iterations: Nombre d'itérations.
        Returns:
            La chaîne L-system finale.
        """
        current = self.axiom
        for _ in range(iterations):
            current = "".join([self.rules.get(c, c) for c in current])
        return current

    def plot_2d(self, lstring: str):
        """
        Visualisation 2D basique d'une chaîne L-system avec matplotlib.
        Args:
            lstring: La chaîne L-system à visualiser.
        """
        x, y = 0.0, 0.0
        current_angle = 90.0 # Angle initial (vers le haut)
        stack = [] # Pour stocker les états (x, y, angle)
        
        # Pour tracer les segments, on stocke les points de début et de fin
        segments = []
        
        for cmd in lstring:
            if cmd == "F": # Avancer et dessiner
                x_new = x + np.cos(np.radians(current_angle))
                y_new = y + np.sin(np.radians(current_angle))
                segments.append([(x, y), (x_new, y_new)])
                x, y = x_new, y_new
            elif cmd == "+": # Tourner à droite
                current_angle -= self.angle
            elif cmd == "-": # Tourner à gauche
                current_angle += self.angle
            elif cmd == "[": # Pousser l'état actuel sur la pile
                stack.append((x, y, current_angle))
            elif cmd == "]": # Pop l'état de la pile et revenir
                if stack:
                    x, y, current_angle = stack.pop()
        
        # Affichage avec matplotlib
        plt.figure(figsize=(8, 8))
        for seg_start, seg_end in segments:
            plt.plot([seg_start[0], seg_end[0]], [seg_start[1], seg_end[1]], 'g-') # Dessine en vert
        
        plt.axis('equal') # Assure un ratio d'aspect égal
        plt.title(f"L-System 2D (Iterations: {len(lstring) / len(self.axiom) if self.axiom else 0})") # Titre indicatif
        plt.show()

    def to_3d_mesh(self, lstring: str):
        """
        Conversion de la chaîne L-system en maillage 3D (À implémenter).
        Ceci est une tâche complexe qui dépendra de la géométrie du polyèdre.
        """
        pass # Implémentation future