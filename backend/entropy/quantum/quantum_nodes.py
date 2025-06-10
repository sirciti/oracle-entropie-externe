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
            self.state = np.array([1+0j, 0+0j], dtype=complex) 

    def apply_decoherence(self, chaos_param: float):
        if chaos_param <= 0:
            chaos_param = 0.1
        theta = np.pi * np.random.weibull(chaos_param)
        if QISKIT_AVAILABLE:
            if self.qubit:
                self.qubit.h(0)
                self.qubit.rx(theta, 0)
            else:
                warnings.warn(f"Qubit non initialisé pour le nœud {self.node_id} en mode Qiskit.")
        else:
            if self.state is not None:
                rotation_matrix_rx = np.array([
                    [np.cos(theta/2), -1j*np.sin(theta/2)],
                    [-1j*np.sin(theta/2), np.cos(theta/2)]
                ], dtype=complex)
                self.state = rotation_matrix_rx @ self.state
            else:
                warnings.warn(f"État non initialisé pour le nœud {self.node_id} en mode fallback.")

    def measure_entropy(self) -> float:
        probs: np.ndarray
        if QISKIT_AVAILABLE:
            if self.qubit:
                backend = Aer.get_backend('statevector_simulator')
                job = execute(self.qubit, backend)
                result = job.result()
                state = result.get_statevector()
                probs = np.abs(state)**2
            else:
                probs = np.array([1.0, 0.0])
        else:
            probs = np.abs(self.state)**2 if self.state is not None else np.array([1.0, 0.0])
        probs = probs[probs > 0]
        return -np.sum(probs * np.log2(probs)) if len(probs) > 0 else 0.0

# --- Fonction exportée pour import externe ---
def get_quantum_entropy(node_count: int = 1, chaos_param: float = 1.0) -> float:
    """
    Calcule l'entropie moyenne de node_count nœuds quantiques.
    Args:
        node_count: Nombre de nœuds quantiques à générer
        chaos_param: Paramètre influençant la décohérence
    Returns:
        Entropie moyenne (en bits)
    """
    nodes = [QuantumNode(i) for i in range(node_count)]
    for node in nodes:
        node.apply_decoherence(chaos_param)
    entropies = [node.measure_entropy() for node in nodes]
    return float(np.mean(entropies))
