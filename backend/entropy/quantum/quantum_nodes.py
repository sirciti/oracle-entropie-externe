import warnings
import math
import hashlib
import os
import time
import random
from typing import Optional

# Tente d'importer Qiskit, sinon utilise un mode simplifié
try:
    # from qiskit import QuantumCircuit, transpile, Aer # Importations spécifiques à Qiskit
    # from qiskit_aer import AerSimulator # Remplacé par AerSimulator pour la compatibilité Qiskit 1.0+
    # from qiskit.quantum_info import Statevector, entropy as qiskit_entropy
    QISKIT_AVAILABLE = False # Met à False pour l'instant car l'import pose des problèmes récurrents

    # Si vous installez Qiskit, mettez ceci à True et adaptez le code.
    # Pour l'instant, on se concentre sur le fallback.
except ImportError:
    QISKIT_AVAILABLE = False
    warnings.warn("Qiskit non installé. Utilisation du mode simulation simplifié.")

class QuantumNode:
    """
    Simule un nœud quantique (qubit) avec un état de superposition et de la décohérence.
    """
    def __init__(self, node_id: int):
        self.node_id = node_id
        # Représente l'état du qubit comme une superposition simple |alpha|^2 + |beta|^2 = 1
        # Pour une simulation simplifiée, on peut utiliser un nombre réel
        self.alpha_squared = random.random() # Probabilité d'être dans l'état |0>
        self.beta_squared = 1.0 - self.alpha_squared # Probabilité d'être dans l'état |1>
        self.coherence = 1.0 # Représente la cohérence, diminue avec la décohérence

    def apply_decoherence(self, chaos_factor: float):
        """
        Applique un facteur de décohérence au nœud quantique.
        Un chaos_factor élevé réduit la cohérence et rend l'état plus "classique".
        """
        self.coherence = max(0, self.coherence - chaos_factor * random.random())
        # Quand la cohérence est faible, l'état tend vers un état mesuré (0 ou 1)
        if self.coherence < 0.1:
            if random.random() < self.alpha_squared:
                self.alpha_squared = 1.0
                self.beta_squared = 0.0
            else:
                self.alpha_squared = 0.0
                self.beta_squared = 1.0

    def measure_entropy(self) -> float:
        """
        Mesure l'entropie de Shannon de l'état du qubit.
        L'entropie est maximale quand alpha_squared est proche de 0.5 (superposition pure)
        et minimale (0) quand c'est 0 ou 1 (état classique).
        """
        if self.alpha_squared == 0 or self.alpha_squared == 1:
            return 0.0 # Entropie nulle pour un état pur
        
        # Entropie de Shannon: -p*log2(p) - (1-p)*log2(1-p)
        entropy_shannon = -self.alpha_squared * math.log2(self.alpha_squared) \
                          - self.beta_squared * math.log2(self.beta_squared)
        return entropy_shannon

# --- Fonction get_quantum_entropy ---
# Cette fonction est maintenant définie ici et exportée.
def get_quantum_entropy(max_retries: int = 3, initial_delay: int = 1) -> Optional[float]:
    """
    Récupère un nombre aléatoire quantique normalisé [0,1]
    ou retourne une valeur du PRNG de secours.
    """
    if QISKIT_AVAILABLE:
        # Logique Qiskit (si Qiskit est installé et fonctionne)
        # Actuellement désactivé pour la stabilité
        warnings.warn("Qiskit est disponible mais la logique est désactivée pour la stabilité.")
        pass # Laisser la logique Qiskit ici pour une activation future
        
    # Logique de fallback (PRNG de secours)
    warnings.warn("L'API ANU QRNG est désactivée/instable. Utilisation du PRNG de secours.")
    fallback_seed = os.urandom(FALLBACK_PRNG_SEED_LENGTH // 8) + str(time.time_ns()).encode()
    random.seed(hashlib.sha256(fallback_seed).hexdigest())
    return random.random() # Retourne une valeur du PRNG de secours

FALLBACK_PRNG_SEED_LENGTH = 256  # ou une valeur adaptée

if __name__ == "__main__":
    # Test simple des nœuds quantiques
    print("--- Test des nœuds quantiques ---")
    node1 = QuantumNode(1)
    print(f"Initial Node 1: alpha_squared={node1.alpha_squared:.2f}, coherence={node1.coherence:.2f}, entropy={node1.measure_entropy():.2f}")
    
    node1.apply_decoherence(0.5) # Applique une décohérence
    print(f"After decoherence (0.5): alpha_squared={node1.alpha_squared:.2f}, coherence={node1.coherence:.2f}, entropy={node1.measure_entropy():.2f}")

    node2 = QuantumNode(2)
    node2.apply_decoherence(0.9) # Forte décohérence
    print(f"After strong decoherence (0.9): alpha_squared={node2.alpha_squared:.2f}, coherence={node2.coherence:.2f}, entropy={node2.measure_entropy():.2f}")

    # Test de get_quantum_entropy
    print("\n--- Test get_quantum_entropy ---")
    entropy_val = get_quantum_entropy()
    print(f"Entropie quantique (simulée): {entropy_val}")