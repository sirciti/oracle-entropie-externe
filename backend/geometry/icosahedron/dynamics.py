# backend/geometry/icosahedron/dynamics.py

import numpy as np
from typing import Tuple, Optional, List, Set, Dict, Any

# Importe les fonctions utilitaires nécessaires de common.py
# compute_vertex_neighbors est essentiel pour calculer les voisins dans la dynamique
from ..common import compute_vertex_neighbors 

def laplacian_phi(phi: np.ndarray, neighbors: List[Set[int]]) -> np.ndarray:
    """
    Calcule le laplacien discret de phi sur le maillage.
    Il représente une diffusion ou une interaction locale des valeurs de phi.

    Args:
        phi (np.ndarray): Tableau (N,) des valeurs scalaires de phi associées à chaque sommet.
        neighbors (List[Set[int]]): Liste des ensembles de voisins pour chaque sommet.

    Returns:
        np.ndarray: Tableau (N,) du laplacien discret de phi pour chaque sommet.
    """
    lap_phi = np.zeros_like(phi)
    for i, neigh in enumerate(neighbors):
        if not neigh: # Gérer le cas d'un sommet sans voisins (devrait pas arriver dans un maillage fermé)
            continue
        # Le laplacien discret est la moyenne des différences entre phi du sommet et phi de ses voisins
        lap_phi[i] = sum(phi[j] - phi[i] for j in neigh) / len(neigh)
    return lap_phi


def rk4_step(
    psi_local: np.ndarray,
    phi_local: np.ndarray,
    neighbors_local: List[Set[int]],
    dt_local: float,
    params_local: Dict[str, float]
) -> Tuple[np.ndarray, np.ndarray]:
    """
    Effectue un pas d'intégration RK4 (Runge-Kutta d'ordre 4) pour les équations différentielles couplées :
        dΨ/dt = σ(Ψ_j - Ψ_i) + ε|Φ|^2
        dΦ/dt = ρΨ_i - Φ - Ψ_iΦ + ζ∇²Φ
    Ces équations sont inspirées des systèmes chaotiques et sont appliquées à chaque sommet.

    Args:
        psi_local (np.ndarray): Positions actuelles des sommets (N,3) (représente Ψ).
        phi_local (np.ndarray): Valeurs scalaires actuelles aux sommets (N,) (représente Φ).
        neighbors_local (List[Set[int]]): Liste des voisins pour chaque sommet.
        dt_local (float): Pas de temps pour l'intégration.
        params_local (Dict[str, float]): Dictionnaire contenant les paramètres scalaires (sigma, epsilon, rho, zeta).

    Returns:
        Tuple[np.ndarray, np.ndarray]: Nouvelles positions (psi_new) et nouvelles valeurs scalaires (phi_new) après le pas de temps dt.
    """

    def dpsi_dt(psi_inner: np.ndarray, phi_inner: np.ndarray) -> np.ndarray:
        """Calcule le taux de changement de la position (dΨ/dt)."""
        dpsi = np.zeros_like(psi_inner)
        for i, neigh in enumerate(neighbors_local):
            if not neigh: continue
            avg_neighbor = np.mean(psi_inner[list(neigh)], axis=0) # Moyenne des positions des voisins
            # Équation dΨ/dt
            dpsi[i] = params_local['sigma'] * (avg_neighbor - psi_inner[i]) + \
                      params_local['epsilon'] * (phi_inner[i]**2) * np.ones(3) # phi_inner[i]**2 multiplié par un vecteur [1,1,1]
        return dpsi

    def dphi_dt(psi_inner: np.ndarray, phi_inner: np.ndarray) -> np.ndarray:
        """Calcule le taux de changement de la valeur scalaire (dΦ/dt)."""
        lap_phi_val = laplacian_phi(phi_inner, neighbors_local) # Calcul du laplacien de phi
        # Équation dΦ/dt
        return params_local['rho'] * np.linalg.norm(psi_inner, axis=1) - \
               phi_inner - \
               np.linalg.norm(psi_inner, axis=1) * phi_inner + \
               params_local['zeta'] * lap_phi_val

    # Calcul des pentes (k1, k2, k3, k4) pour RK4
    k1_psi = dpsi_dt(psi_local, phi_local)
    k1_phi = dphi_dt(psi_local, phi_local)

    k2_psi = dpsi_dt(psi_local + 0.5 * dt_local * k1_psi, phi_local + 0.5 * dt_local * k1_phi)
    k2_phi = dphi_dt(psi_local + 0.5 * dt_local * k1_psi, phi_local + 0.5 * dt_local * k1_phi)

    k3_psi = dpsi_dt(psi_local + 0.5 * dt_local * k2_psi, phi_local + 0.5 * dt_local * k2_phi)
    k3_phi = dphi_dt(psi_local + 0.5 * dt_local * k2_psi, phi_local + 0.5 * dt_local * k2_phi)

    k4_psi = dpsi_dt(psi_local + dt_local * k3_psi, phi_local + dt_local * k3_phi)
    k4_phi = dphi_dt(psi_local + dt_local * k3_psi, phi_local + dt_local * k3_phi)

    # Combinaison des pentes pour la nouvelle position et la nouvelle valeur phi
    psi_new = psi_local + (dt_local / 6) * (k1_psi + 2*k2_psi + 2*k3_psi + k4_psi)
    phi_new = phi_local + (dt_local / 6) * (k1_phi + 2*k2_phi + 2*k3_phi + k4_phi)
    
    return psi_new, phi_new


def update_icosahedron_dynamics(
    vertices: np.ndarray,
    faces: np.ndarray,
    phi: np.ndarray,
    dt: float,
    params: Dict[str, float]
) -> Tuple[np.ndarray, np.ndarray]:
    """
    Met à jour les positions des sommets de l'icosaèdre et les valeurs phi selon la dynamique chaotique.
    Cette fonction est l'interface principale pour la mise à jour dynamique de l'icosaèdre.

    Args:
        vertices (np.ndarray): Positions actuelles des sommets (N, 3).
        faces (np.ndarray): Tableau des faces (M, 3) (utilisé pour déterminer les voisins).
        phi (np.ndarray): Valeurs scalaires associées aux sommets (N,).
        dt (float): Pas de temps pour la simulation.
        params (Dict[str, float]): Dictionnaire contenant les paramètres de la dynamique (sigma, epsilon, rho, zeta).

    Returns:
        Tuple[np.ndarray, np.ndarray]: Nouvelles positions des sommets et nouvelles valeurs phi après l'update.
    """
    # Calcule les voisins des sommets, nécessaire pour le laplacien
    neighbors = compute_vertex_neighbors(faces, len(vertices)) 
    
    # Effectue un pas d'intégration RK4 pour mettre à jour les états
    psi_new, phi_new = rk4_step(vertices, phi, neighbors, dt, params)
    
    return psi_new, phi_new