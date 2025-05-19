import numpy as np
from typing import Tuple, Optional

def rotation_matrix(axis: np.ndarray, theta: float) -> np.ndarray:
    """
    Calcule la matrice de rotation 3D autour d'un axe donné pour un angle spécifié.

    Args:
        axis: Vecteur 3D (normalisé) représentant l'axe de rotation.
        theta: Angle de rotation en radians.

    Returns:
        Matrice de rotation 3x3 (numpy.ndarray).
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
    rotation_angle: float = 0.0
) -> Tuple[np.ndarray, np.ndarray]:
    """
    Génère les sommets et les faces d'un icosaèdre régulier paramétrable.

    Args:
        radius: Rayon de la sphère sur laquelle les sommets sont placés (par défaut 1.0).
        position: Vecteur 3D pour le centre (par défaut [0, 0, 0]).
        rotation_axis: Axe de rotation (normalisé) (par défaut None, pas de rotation).
        rotation_angle: Angle de rotation en radians (par défaut 0.0).

    Returns:
        Tuple contenant :
            - vertices: Tableau de shape (N, 3) contenant les coordonnées des sommets.
            - faces: Tableau de shape (M, 3) contenant les indices des sommets formant les faces.
    """
    if position is None:
        position = np.zeros(3)

    phi = (1 + 5 ** 0.5) / 2  # Nombre d'or

    # Définition des sommets de l'icosaèdre (avant normalisation)
    vertices = np.array([
        [-1,  phi, 0],
        [ 1,  phi, 0],
        [-1, -phi, 0],
        [ 1, -phi, 0],
        [0, -1,  phi],
        [0,  1,  phi],
        [0, -1, -phi],
        [0,  1, -phi],
        [ phi, 0, -1],
        [ phi, 0,  1],
        [-phi, 0, -1],
        [-phi, 0,  1],
    ], dtype=np.float64)

    # Normalisation et mise à l'échelle
    vertices /= np.linalg.norm(vertices[0])
    vertices *= radius

    # Application de la rotation si spécifiée
    if rotation_axis is not None and rotation_angle != 0.0:
        R = rotation_matrix(rotation_axis, rotation_angle)
        vertices = vertices @ R.T  # multiplication matricielle

    # Translation (positionnement)
    vertices += position

    # Liste des faces (indices des sommets)
    faces = np.array([
        [0, 11, 5],
        [0, 5, 1],
        [0, 1, 7],
        [0, 7, 10],
        [0, 10, 11],
        [1, 5, 9],
        [5, 11, 4],
        [11, 10, 2],
        [10, 7, 6],
        [7, 1, 8],
        [3, 9, 4],
        [3, 4, 2],
        [3, 2, 6],
        [3, 6, 8],
        [3, 8, 9],
        [4, 9, 5],
        [2, 4, 11],
        [6, 2, 10],
        [8, 6, 7],
        [9, 8, 1],
    ], dtype=np.int32)

    return vertices, faces

def subdivide_faces(
    vertices: np.ndarray,
    faces: np.ndarray
) -> Tuple[np.ndarray, np.ndarray]:
    """
    Effectue une subdivision simple : chaque triangle est subdivisé en 4 triangles.

    Args:
        vertices: Tableau (N, 3) des sommets actuels.
        faces: Tableau (M, 3) des indices des sommets formant les faces.

    Returns:
        Tuple contenant :
            - new_vertices: Tableau (N', 3) des nouveaux sommets.
            - new_faces: Tableau (M', 3) des nouvelles faces.
    """
    midpoint_cache = {}
    new_vertices = list(vertices)
    new_faces = []

    def midpoint(i1: int, i2: int) -> int:
        key = tuple(sorted((i1, i2)))
        if key not in midpoint_cache:
            mid = (vertices[i1] + vertices[i2]) / 2
            mid /= np.linalg.norm(mid)  # Projection sur sphère unité
            midpoint_cache[key] = len(new_vertices)
            new_vertices.append(mid)
        return midpoint_cache[key]

    for tri in faces:
        v1, v2, v3 = tri
        a = midpoint(v1, v2)
        b = midpoint(v2, v3)
        c = midpoint(v3, v1)
        new_faces.append([v1, a, c])
        new_faces.append([v2, b, a])
        new_faces.append([v3, c, b])
        new_faces.append([a, b, c])

    return np.array(new_vertices), np.array(new_faces)

if __name__ == "__main__":
    # Exemple d'utilisation
    radius = 2.0
    position = np.array([1.0, 1.0, 1.0])
    rotation_axis = np.array([0.0, 0.0, 1.0])
    rotation_angle = np.pi / 4  # 45 degrés

    verts, faces = generate_icosahedron(radius, position, rotation_axis, rotation_angle)
    print("Icosaèdre initial :")
    print("Sommets :", verts)
    print("Faces :", faces)

    verts_subdiv, faces_subdiv = subdivide_faces(verts, faces)
    print("\nAprès subdivision :")
    print("Nombre de sommets :", len(verts_subdiv))
    print("Nombre de faces :", len(faces_subdiv))
