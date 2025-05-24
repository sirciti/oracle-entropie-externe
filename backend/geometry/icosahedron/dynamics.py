import numpy as np
from typing import Tuple, Optional, List, Set, Dict

def compute_vertex_neighbors(faces: np.ndarray, num_vertices: int) -> List[Set[int]]:
    """
    Calcule la liste des voisins pour chaque sommet.
    """
    neighbors = [set() for _ in range(num_vertices)]
    for tri in faces:
        i, j, k = tri
        neighbors[i].update([j, k])
        neighbors[j].update([i, k])
        neighbors[k].update([i, j])
    return neighbors

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
    psi: np.ndarray,
    phi: np.ndarray,
    neighbors: List[Set[int]],
    dt: float,
    params: Dict[str, float]
) -> Tuple[np.ndarray, np.ndarray]:
    """
    Effectue un pas RK4 pour les équations différentielles.
    """

    def dpsi_dt(psi_local: np.ndarray, phi_local: np.ndarray) -> np.ndarray:
        dpsi = np.zeros_like(psi_local)
        for i, neigh in enumerate(neighbors):
            if not neigh:
                continue
            avg_neighbor = np.mean(psi_local[list(neigh)], axis=0)
            dpsi[i] = params['sigma'] * (avg_neighbor - psi_local[i]) + params['epsilon'] * (phi_local[i]**2) * np.ones(3)
        return dpsi

    def dphi_dt(psi_local: np.ndarray, phi_local: np.ndarray) -> np.ndarray:
        lap_phi = laplacian_phi(phi_local, neighbors)
        return params['rho'] * np.linalg.norm(psi_local, axis=1) - phi_local - np.linalg.norm(psi_local, axis=1) * phi_local + params['zeta'] * lap_phi

    k1_psi = dpsi_dt(psi, phi)
    k1_phi = dphi_dt(psi, phi)
    k2_psi = dpsi_dt(psi + 0.5 * dt * k1_psi, phi + 0.5 * dt * k1_phi)
    k2_phi = dphi_dt(psi + 0.5 * dt * k1_psi, phi + 0.5 * dt * k1_phi)
    k3_psi = dpsi_dt(psi + 0.5 * dt * k2_psi, phi + 0.5 * dt * k2_phi)
    k3_phi = dphi_dt(psi + 0.5 * dt * k2_psi, phi + 0.5 * dt * k2_phi)
    k4_psi = dpsi_dt(psi + dt * k3_psi, phi + dt * k3_phi)
    k4_phi = dphi_dt(psi + dt * k3_psi, phi + dt * k3_phi)

    psi_new = psi + (dt / 6) * (k1_psi + 2*k2_psi + 2*k3_psi + k4_psi)
    phi_new = phi + (dt / 6) * (k1_phi + 2*k2_phi + 2*k3_phi + k4_phi)

    return psi_new, phi_new

def update_vertices(
    vertices: np.ndarray,
    faces: np.ndarray,
    phi: np.ndarray,
    dt: float,
    params: Dict[str, float]
) -> Tuple[np.ndarray, np.ndarray]:
    """
    Met à jour les positions des sommets et les valeurs phi selon la dynamique chaotique.
    """
    neighbors = compute_vertex_neighbors(faces, len(vertices))
    psi_new, phi_new = rk4_step(vertices, phi, neighbors, dt, params)
    return psi_new, phi_new
