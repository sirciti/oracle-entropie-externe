# backend/geometry/common.py

import numpy as np
from typing import Tuple, Optional, List, Set, Dict
from math import sqrt

def rotation_matrix(axis: np.ndarray, theta: float) -> np.ndarray:
    """
    Calcule la matrice de rotation 3D autour d'un axe donné (axe normalisé) d'un angle theta (radians).
    Utilise la représentation par quaternion pour éviter le gimbal lock.

    Args:
        axis (np.ndarray): Vecteur 3D (normalisé) représentant l'axe de rotation.
        theta (float): Angle de rotation en radians.

    Returns:
        np.ndarray: Matrice de rotation 3x3.
    """
    axis = axis / np.linalg.norm(axis) if np.linalg.norm(axis) != 0 else np.array([0,0,1]) # Gérer axe nul
    a = np.cos(theta / 2)
    b, c, d = -axis * np.sin(theta / 2)
    return np.array([
        [a*a + b*b - c*c - d*d, 2*(b*c - a*d),       2*(b*d + a*c)],
        [2*(b*c + a*d),         a*a + c*c - b*b - d*d, 2*(c*d - a*b)],
        [2*(b*d - a*c),         2*(c*d + a*b),       a*a + d*d - b*b - c*c]
    ])

def subdivide_faces(
    vertices: np.ndarray,
    faces: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
    """
    Effectue une subdivision simple topologique d'un maillage triangulaire.
    Chaque triangle est remplacé par 4 nouveaux triangles, créant des sommets au milieu des arêtes.
    Les nouveaux sommets sont projetés sur une sphère (utile pour les formes sphériques comme l'icosaèdre).

    Args:
        vertices (np.ndarray): Tableau (N, 3) des sommets actuels.
        faces (np.ndarray): Tableau (M, 3) des faces (triangles) actuelles.

    Returns:
        Tuple[np.ndarray, np.ndarray]: Nouveaux sommets et nouvelles faces après subdivision.
    """
    midpoint_cache = {} # Cache pour stocker les nouveaux sommets d'arête déjà calculés
    new_vertices_list = list(vertices) # Copie des sommets existants, les nouveaux seront ajoutés ici
    new_faces_list = [] # Liste pour les nouvelles faces

    def get_or_create_midpoint(i1: int, i2: int) -> int:
        """
        Calcule ou récupère l'indice d'un point médian sur une arête.
        Projette le point médian sur la sphère unité.
        """
        key = tuple(sorted((i1, i2))) # Utilise un tuple trié pour la clé de cache (arête v1-v2 est la même que v2-v1)
        if key not in midpoint_cache:
            mid = (new_vertices_list[i1] + new_vertices_list[i2]) / 2.0
            mid_norm = np.linalg.norm(mid)
            # Projection sur sphère unité (si norme non nulle)
            mid /= mid_norm if mid_norm != 0 else 1.0 
            midpoint_cache[key] = len(new_vertices_list) # L'indice du nouveau sommet
            new_vertices_list.append(mid)
        return midpoint_cache[key]

    # Parcourir chaque face (triangle)
    for tri in faces:
        v1, v2, v3 = tri # Indices des trois sommets du triangle

        # Calculer ou créer les points médians des trois arêtes du triangle
        m12 = get_or_create_midpoint(v1, v2)
        m23 = get_or_create_midpoint(v2, v3)
        m31 = get_or_create_midpoint(v3, v1)

        # Créer les 4 nouveaux triangles à partir du triangle original
        new_faces_list.append([v1, m12, m31]) # Coin supérieur
        new_faces_list.append([v2, m23, m12]) # Coin gauche
        new_faces_list.append([v3, m31, m23]) # Coin droit
        new_faces_list.append([m12, m23, m31]) # Triangle central
    
    # Convertir les listes de sommets et de faces en tableaux NumPy pour la sortie
    return np.array(new_vertices_list, dtype=np.float64), np.array(new_faces_list, dtype=np.int32)

def compute_vertex_neighbors(faces: np.ndarray, num_vertices: int) -> List[Set[int]]:
    """
    Calcule la liste des voisins (sommets connectés par une arête) pour chaque sommet d'un maillage.

    Args:
        faces (np.ndarray): Tableau (M, 3) des indices des sommets formant les faces.
        num_vertices (int): Nombre total de sommets dans le maillage.

    Returns:
        List[Set[int]]: Une liste de sets, où neighbors[i] est l'ensemble des indices
                        des sommets voisins du sommet d'indice i.
    """
    neighbors = [set() for _ in range(num_vertices)] # Initialise un set de voisins pour chaque sommet
    for tri in faces:
        # Pour chaque triangle (v1, v2, v3), chaque sommet est voisin des deux autres
        i, j, k = tri
        neighbors[i].update([j, k])
        neighbors[j].update([i, k])
        neighbors[k].update([i, j])
    return neighbors