import numpy as np
import warnings
from typing import Optional, Any

# Solution professionnelle avec fallback si Qiskit manquant
try:
    from qiskit import QuantumCircuit, Aer, execute
    QISKIT_AVAILABLE = True
except ImportError:
    QISKIT_AVAILABLE = False
    warnings.warn("Qiskit non installé. Utilisation du mode simulation simplifié.")

class QuantumNode:
    """
    Représente un nœud quantique avec un qubit associé, gérant la décohérence
    et la mesure d'entropie, avec un fallback si Qiskit n'est pas disponible.
    """
    def __init__(self, node_id: int):
        self.node_id = node_id
        self.qubit: Optional[QuantumCircuit] = None
        self.state: Optional[np.ndarray] = None # Pour le mode fallback

        if QISKIT_AVAILABLE:
            self.qubit = QuantumCircuit(1)
        else:
            # État initial |0> pour le mode fallback
            self.state = np.array([1+0j, 0+0j], dtype=complex) 

    def apply_decoherence(self, chaos_param: float):
        """
        Applique des opérations simulant la décohérence influencée par un paramètre de chaos.
        Args:
            chaos_param: Paramètre numérique issu de la dynamique chaotique.
        """
        # Utilisation de np.random.weibull pour une distribution influencée par chaos_param
        # np.random.weibull(a) où 'a' est le paramètre de forme.
        # Plus 'a' est petit, plus la distribution est concentrée vers 0.
        # Plus 'a' est grand, plus la distribution s'étale.
        # chaos_param peut influencer la "force" de la décohérence.
        
        # Assurez-vous que chaos_param est > 0 pour np.random.weibull
        if chaos_param <= 0:
            chaos_param = 0.1 # Valeur par défaut pour éviter les erreurs
        
        theta = np.pi * np.random.weibull(chaos_param) # Angle pour la rotation

        if QISKIT_AVAILABLE:
            if self.qubit: # S'assurer que le qubit est initialisé
                self.qubit.h(0) # Porte Hadamard
                self.qubit.rx(theta, 0) # Rotation autour de l'axe X
            else:
                warnings.warn(f"Qubit non initialisé pour le nœud {self.node_id} en mode Qiskit.")
        else:
            # Simulation de la rotation pour le mode fallback
            # Matrice de rotation Rx
            if self.state is not None:
                rotation_matrix_rx = np.array([
                    [np.cos(theta/2), -1j*np.sin(theta/2)],
                    [-1j*np.sin(theta/2), np.cos(theta/2)]
                ], dtype=complex)
                self.state = rotation_matrix_rx @ self.state
            else:
                warnings.warn(f"État non initialisé pour le nœud {self.node_id} en mode fallback.")


    def measure_entropy(self) -> float:
        """
        Mesure l'entropie de Shannon de l'état du qubit.
        Returns:
            L'entropie de Shannon.
        """
        probs: np.ndarray
        if QISKIT_AVAILABLE:
            if self.qubit:
                # Utiliser un simulateur d'état-vecteur pour obtenir les probabilités
                backend = Aer.get_backend('statevector_simulator')
                job = execute(self.qubit, backend)
                result = job.result()
                state = result.get_statevector()
                probs = np.abs(state)**2
            else:
                warnings.warn(f"Qubit non initialisé pour le nœud {self.node_id} en mode Qiskit, retour 0 entropie.")
                probs = np.array([1.0, 0.0]) # État connu, 0 entropie
        else:
            if self.state is not None:
                probs = np.abs(self.state)**2
            else:
                warnings.warn(f"État non initialisé pour le nœud {self.node_id} en mode fallback, retour 0 entropie.")
                probs = np.array([1.0, 0.0]) # État connu, 0 entropie
        
        # Éviter log2(0) en ajoutant une petite valeur aux probabilités nulles
        # ou en filtrant les probabilités > 0
        probs = probs[probs > 0] 
        if len(probs) == 0: # Si toutes les probabilités sont 0 (cas rare mais possible après des opérations)
            return 0.0

        return -np.sum(probs * np.log2(probs))