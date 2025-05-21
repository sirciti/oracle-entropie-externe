import numpy as np
from typing import Tuple, Optional, List, Set, Dict
from math import sqrt # Pour sqrt dans generate_icosahedron

def rotation_matrix(axis: np.ndarray, theta: float) -> np.ndarray:
    """
    Calcule la matrice de rotation 3D autour d'un axe donné (axe normalisé) d'un angle theta (radians).
    """
    axis = axis / np.linalg.norm(axis)
    a = np.cos(theta / 2)
    b, c, d = -axis * np.sin(theta / 2)
    return np.array([
        [a*a + b*b - c*c - d*d, 2*(b*c - a*d),       2*(b*d + a*c)],
        [2*(b*c + a*d),         a*a + c*c - b*b - d*d, 2*(c*d - a*b)],
        [2*(b*d - a*c),         2*(c*d + a*b),       a*a + d*d - b*b - c*c]
    ])

def generate_icosahedron(
    radius: float = 1.0,
    position: Optional[np.ndarray] = None,
    rotation_axis: Optional[np.ndarray] = None,
    rotation_angle: float = 0.0) -> Tuple[np.ndarray, np.ndarray]:
    """
    Génère les sommets et les faces d'un icosaèdre régulier paramétrable.
    """
    if position is None:
        position = np.zeros(3)
    phi = (1 + sqrt(5.0)) / 2
    vertices = np.array([
        [-1, phi, 0], [1, phi, 0], [-1, -phi, 0], [1, -phi, 0],
        [0, -1, phi], [0, 1, phi], [0, -1, -phi], [0, 1, -phi],
        [phi, 0, -1], [phi, 0, 1], [-phi, 0, -1], [-phi, 0, 1],
    ], dtype=np.float64)
    vertices /= np.linalg.norm(vertices[0])
    vertices *= radius
    if rotation_axis is not None and rotation_angle != 0.0:
        R = rotation_matrix(rotation_axis, rotation_angle)
        vertices = vertices @ R.T
    vertices += position
    faces = np.array([
        [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
        [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
        [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
        [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1],
    ], dtype=np.int32)
    return vertices, faces

# --- Implémentation de la subdivision simple (anciennement subdivide_faces) ---
def subdivide_faces(
    vertices: np.ndarray,
    faces: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
    """
    Effectue une subdivision simple : chaque triangle est subdivisé en 4 triangles.
    """
    midpoint_cache = {}
    new_vertices_list = list(vertices)
    new_faces_list = []

    def get_or_create_midpoint(i1: int, i2: int) -> int:
        key = tuple(sorted((i1, i2)))
        if key not in midpoint_cache:
            mid = (new_vertices_list[i1] + new_vertices_list[i2]) / 2.0
            # Projection sur sphère unité si les sommets sont censés rester sur une surface sphérique
            mid_norm = np.linalg.norm(mid)
            mid /= mid_norm if mid_norm != 0 else 1.0 # Éviter division par zéro
            midpoint_cache[key] = len(new_vertices_list)
            new_vertices_list.append(mid)
        return midpoint_cache[key]

    for tri in faces:
        v1, v2, v3 = tri
        m12 = get_or_create_midpoint(v1, v2)
        m23 = get_or_create_midpoint(v2, v3)
        m31 = get_or_create_midpoint(v3, v1)

        new_faces_list.append([v1, m12, m31])
        new_faces_list.append([v2, m23, m12])
        new_faces_list.append([v3, m31, m23])
        new_faces_list.append([m12, m23, m31])
    
    return np.array(new_vertices_list), np.array(new_faces_list)


# --- Implémentation simplifiée de la subdivision de Loop (pour être utilisée par Klee-Penrose) ---
# Ceci est une version simplifiée qui utilise la subdivision topologique.
# La vraie Loop Subdivision implique des règles de pondération pour le lissage qui sont complexes sans librairie.
def loop_subdivision(
    vertices: np.ndarray,
    faces: np.ndarray,
    iterations: int = 1
) -> Tuple[np.ndarray, np.ndarray]:
    """
    Applique une subdivision topologique similaire à la première étape de Loop Subdivision.
    Chaque triangle est subdivisé en 4 nouveaux triangles.
    Args:
        vertices: Tableau (N,3) des sommets actuels.
        faces: Tableau (M,3) des faces (triangles) actuelles.
        iterations: Nombre d'itérations de subdivision.
    Returns:
        Tuple (new_vertices, new_faces) : Nouveaux sommets et faces après subdivision.
    """
    current_vertices = np.array(vertices, dtype=np.float64)
    current_faces = np.array(faces, dtype=np.int32)
    
    for _ in range(iterations):
        current_vertices, current_faces = subdivide_faces(current_vertices, current_faces)
        
    return current_vertices, current_faces

# --- Implémentation du Polyèdre de Klee-Penrose (simplifiée) ---
def generate_klee_penrose_polyhedron(
    subdivisions: int = 3,
    radius: float = 1.0,
    position: Optional[np.ndarray] = None,
    rotation_axis: Optional[np.ndarray] = None,
    rotation_angle: float = 0.0
) -> Tuple[np.ndarray, np.ndarray]:
    """
    Génère une approximation du Polyèdre de Klee-Penrose par subdivision d'un icosaèdre.
    (Omet la déformation de Perlin et le calcul du dual pour la complexité initiale).
    """
    ico_vertices, ico_faces = generate_icosahedron(radius, position, rotation_axis, rotation_angle)
    
    # Applique la subdivision pour augmenter la complexité
    subdivided_vertices, subdivided_faces = loop_subdivision(ico_vertices, ico_faces, subdivisions)
    
    # NOTE: Les étapes de déformation de Perlin et de calcul du dual sont omises ici
    # car elles sont très complexes à implémenter sans bibliothèques dédiées
    # et dépassent le cadre de cette étape initiale.
    # La subdivision seule augmente déjà significativement la complexité du maillage.
    
    return subdivided_vertices, subdivided_faces

if __name__ == '__main__':
    # Test de generate_klee_penrose_polyhedron
    kp_vertices, kp_faces = generate_klee_penrose_polyhedron(subdivisions=1) # 1 itération pour un test rapide
    print(f"Polyèdre de Klee-Penrose (simplifié) - Sommets: {len(kp_vertices)}, Faces: {len(kp_faces)}")
    # Après 1 subdivision d'un icosaèdre (12V, 20F), on devrait obtenir:
    # 42 sommets (12 anciens + 30 midpoints)
    # 80 faces (20 * 4)
    kp_vertices, kp_faces = generate_klee_penrose_polyhedron(subdivisions=2) # 2 itérations
    print(f"Polyèdre de Klee-Penrose (simplifié, 2 subdiv) - Sommets: {len(kp_vertices)}, Faces: {len(kp_faces)}")
    # Pour 2 subdivisions: 42 + 30*4 + 20*4*3/2 = 162 + 120 = 282 sommets
    # Non. Chaque subdivision crée 3 midpoints par face originale (3*20=60).
    # 1e iter: 12 + 30 = 42V, 80F
    # 2e iter: 42 + (80 * 3) = 42 + 240 = 282V, 320F
    # Il faut vérifier les calculs exacts des sommets et faces après plusieurs subdivisions.
    # Pour 1 itération: V_new = V_old + (3 * F_old) / 2 = 12 + (3 * 20) / 2 = 12 + 30 = 42
    # F_new = F_old * 4 = 20 * 4 = 80
    # Pour 2 itérations: V_new = 42 + (3 * 80) / 2 = 42 + 120 = 162
    # F_new = 80 * 4 = 320
    # Les prints ci-dessus sont des checks utiles.