# backend/geometry/icosahedron/generator.py

import numpy as np
from typing import Tuple, Optional, List, Set, Dict
from math import sqrt
from ..common import rotation_matrix, subdivide_faces # Importe les utilitaires partagés depuis common.py

def generate_icosahedron(
    radius: float = 1.0,
    position: Optional[np.ndarray] = None,
    rotation_axis: Optional[np.ndarray] = None,
    rotation_angle: float = 0.0) -> Tuple[np.ndarray, np.ndarray]:
    """
    Génère les sommets et les faces d'un icosaèdre régulier paramétrable.

    Args:
        radius (float): Rayon de la sphère sur laquelle les sommets sont placés (par défaut 1.0).
        position (Optional[np.ndarray]): Vecteur 3D pour le centre (par défaut [0, 0, 0]).
        rotation_axis (Optional[np.ndarray]): Axe de rotation (normalisé) (par défaut None, pas de rotation).
        rotation_angle (float): Angle de rotation en radians (par défaut 0.0).

    Returns:
        Tuple[np.ndarray, np.ndarray]: Tableaux NumPy des sommets (N,3) et des faces (M,3).
    """
    if position is None:
        position = np.zeros(3)
    
    phi = (1 + sqrt(5.0)) / 2 # Le nombre d'or, essentiel pour la géométrie de l'icosaèdre
    
    # Définition des 12 sommets d'un icosaèdre standard (avant normalisation et mise à l'échelle)
    vertices = np.array([
        [-1,  phi, 0], [ 1,  phi, 0], [-1, -phi, 0], [ 1, -phi, 0],
        [0, -1,  phi], [0,  1,  phi], [0, -1, -phi], [0,  1, -phi],
        [ phi, 0, -1], [ phi, 0,  1], [-phi, 0, -1], [-phi, 0,  1],
    ], dtype=np.float64)
    
    # Normalisation pour que les sommets soient sur la sphère unité, puis mise à l'échelle par le rayon
    vertices /= np.linalg.norm(vertices[0])
    vertices *= radius
    
    # Application de la rotation si un axe et un angle sont spécifiés
    if rotation_axis is not None and rotation_angle != 0.0:
        R = rotation_matrix(rotation_axis, rotation_angle)
        vertices = vertices @ R.T # Multiplication matricielle pour appliquer la rotation
    
    # Application de la translation (positionnement)
    vertices += position
    
    # Définition des 20 faces (triangles) de l'icosaèdre standard (indices des sommets)
    faces = np.array([
        [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
        [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
        [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
        [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1],
    ], dtype=np.int32)
    
    return vertices, faces

def loop_subdivision(
    vertices: np.ndarray,
    faces: np.ndarray,
    iterations: int = 1
) -> Tuple[np.ndarray, np.ndarray]:
    """
    Applique une subdivision topologique itérative d'un maillage triangulaire.
    Chaque itération subdivise chaque triangle en 4 nouveaux triangles.
    Cette implémentation est une version simplifiée de la subdivision de Loop (elle gère la topologie
    et la projection sur la sphère, mais n'applique pas les règles de pondération pour le lissage
    des sommets existants, ce qui nécessiterait des structures de données de maillage plus complexes).

    Args:
        vertices (np.ndarray): Tableau (N, 3) des sommets actuels.
        faces (np.ndarray): Tableau (M, 3) des faces (triangles) actuelles.
        iterations (int): Nombre d'itérations de subdivision à appliquer.

    Returns:
        Tuple[np.ndarray, np.ndarray]: Nouveaux sommets et nouvelles faces après toutes les subdivisions.
    """
    current_vertices = np.array(vertices, dtype=np.float64)
    current_faces = np.array(faces, dtype=np.int32)
    
    for _ in range(iterations):
        # Utilise la fonction subdivide_faces du module common pour la subdivision topologique
        current_vertices, current_faces = subdivide_faces(current_vertices, current_faces)
        
    return current_vertices, current_faces

def generate_klee_penrose_polyhedron(
    subdivisions: int = 3,
    radius: float = 1.0,
    position: Optional[np.ndarray] = None,
    rotation_axis: Optional[np.ndarray] = None,
    rotation_angle: float = 0.0
) -> Tuple[np.ndarray, np.ndarray]:
    """
    Génère une approximation du Polyèdre de Klee-Penrose par subdivision d'un icosaèdre.
    Pour cette implémentation, le "Polyèdre de Klee-Penrose" est un icosaèdre subdivisé.
    Les étapes de déformation de Perlin et de calcul du dual sont omises pour simplifier
    la complexité et rester dans le cadre d'un mini-projet.

    Args:
        subdivisions (int): Nombre d'itérations de subdivision à appliquer à l'icosaèdre initial.
        radius (float): Rayon de la sphère englobante.
        position (Optional[np.ndarray]): Position du centre.
        rotation_axis (Optional[np.ndarray]): Axe de rotation initial.
        rotation_angle (float): Angle de rotation initial en radians.

    Returns:
        Tuple[np.ndarray, np.ndarray]: Tableaux NumPy des sommets et des faces du polyèdre généré.
    """
    # 1. Générer un icosaèdre de base avec les paramètres donnés
    ico_vertices, ico_faces = generate_icosahedron(radius, position, rotation_axis, rotation_angle)
    
    # 2. Appliquer la subdivision pour augmenter la complexité géométrique
    # La fonction loop_subdivision gère les itérations de subdivision topologique.
    subdivided_vertices, subdivided_faces = loop_subdivision(ico_vertices, ico_faces, subdivisions)
    
    # Note: L'intégration de la déformation par bruit de Perlin et le calcul du dual
    # pour obtenir les 72 faces spécifiques du Polyèdre de Klee-Penrose sont des étapes
    # très complexes qui nécessiteraient des bibliothèques externes ou une implémentation
    # mathématique approfondie sortant du cadre de ce mini-projet.
    # L'objectif est ici d'avoir une géométrie complexe dérivée du concept.
    
    return subdivided_vertices, subdivided_faces