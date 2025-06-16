# backend/geometry/icosahedron/dynamics.py

import numpy as np
from typing import Tuple, Optional, List, Set, Dict, Any
from flask import jsonify

# Importe les fonctions utilitaires nécessaires de common.py
from ..common import compute_vertex_neighbors # compute_vertex_neighbors est dans common.py

def laplacian_phi(phi: np.ndarray, neighbors: List[Set[int]]) -> np.ndarray:
    """
    Calcule le laplacien discret de phi sur le maillage.
    """
    lap_phi = np.zeros_like(phi)
    for i, neigh in enumerate(neighbors):
        if not neigh:
            continue
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
    Ici Ψ est un tableau (N,3) des positions, Φ un tableau (N,) des scalaires.
    """

    def dpsi_dt(psi_inner: np.ndarray, phi_inner: np.ndarray) -> np.ndarray:
        """Calcule le taux de changement de la position (dΨ/dt)."""
        dpsi = np.zeros_like(psi_inner)
        for i, neigh in enumerate(neighbors_local):
            if not neigh: continue
            avg_neighbor = np.mean(psi_inner[list(neigh)], axis=0)
            dpsi[i] = params_local['sigma'] * (avg_neighbor - psi_inner[i]) + \
                      params_local['epsilon'] * (phi_inner[i]**2) * np.ones(3)
        return dpsi

    def dphi_dt(psi_inner: np.ndarray, phi_inner: np.ndarray) -> np.ndarray:
        """Calcule le taux de changement de la valeur scalaire (dΦ/dt)."""
        lap_phi_val = laplacian_phi(phi_inner, neighbors_local) 
        return params_local['rho'] * np.linalg.norm(psi_inner, axis=1) - \
               phi_inner - \
               np.linalg.norm(psi_inner, axis=1) * phi_inner + \
               params_local['zeta'] * lap_phi_val

    k1_psi = dpsi_dt(psi_local, phi_local)
    k1_phi = dphi_dt(psi_local, phi_local)

    k2_psi = dpsi_dt(psi_local + 0.5 * dt_local * k1_psi, phi_local + 0.5 * dt_local * k1_phi)
    k2_phi = dphi_dt(psi_local + 0.5 * dt_local * k1_psi, phi_local + 0.5 * dt_local * k1_phi)

    k3_psi = dpsi_dt(psi_local + 0.5 * dt_local * k2_psi, phi_local + 0.5 * dt_local * k2_phi)
    k3_phi = dphi_dt(psi_local + 0.5 * dt_local * k2_psi, phi_local + 0.5 * dt_local * k2_phi)

    k4_psi = dpsi_dt(psi_local + dt_local * k3_psi, phi_local + dt_local * k3_phi)
    k4_phi = dphi_dt(psi_local + dt_local * k3_psi, phi_local + dt_local * k3_phi)

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
    """
    neighbors = compute_vertex_neighbors(faces, len(vertices)) 
    psi_new, phi_new = rk4_step(vertices, phi, neighbors, dt, params)
    return psi_new, phi_new


