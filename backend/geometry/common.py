# backend/geometry/common.py

import numpy as np
from typing import Tuple, Optional, List, Set, Dict
from math import sqrt

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
            mid_norm = np.linalg.norm(mid)
            mid /= mid_norm if mid_norm != 0 else 1.0
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

# loop_subdivision et generate_klee_penrose_polyhedron seront dans backend/geometry/icosahedron/generator.py
# update_vertices sera dans backend/geometry/icosahedron/dynamics.py