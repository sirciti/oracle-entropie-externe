# backend/entropy_oracle.py

import numpy as np
import hashlib
from typing import Tuple, Optional, List, Dict, Any
import json
import time # Pour time.time_ns

# Importer les fonctions et classes nécessaires des modules de géométrie réorganisés
from .geometry.icosahedron.generator import generate_klee_penrose_polyhedron # Utilise la fonction pour l'icosaèdre subdivisé
from .geometry.pyramids.generator import generate_pyramids_system # Générateur de pyramides
from .geometry.pyramids.dynamics import update_pyramids_dynamics # Dynamique des pyramides

# Autres sources d'entropie
from .fractal_lsystem import FractalLSystem
from .quantum_nodes import QuantumNode
from .temporal_entropy import get_world_timestamps, mix_timestamps # <-- NOUVEL IMPORT DE LA SOURCE TEMPORELLE

# Note: les fonctions de logging (log_info, log_warning, log_error) seront importées depuis app.py si nécessaire,
# ou passées en paramètre, ou ce module aura son propre logger.
# Pour le moment, nous allons les supposer accessibles ou les afficher via print pour le débogage.


# Paramètres par défaut pour la dynamique (partagés par les deux géométries si applicable)
DEFAULT_GEOMETRY_PARAMS = {
    'sigma': 10.0,
    'epsilon': 0.3,
    'rho': 28.0,
    'zeta': 2.1,
    'dt': 0.01,
    'chaos_factor': 0.05, # Ajouté pour la dynamique des pyramides
    'noise_level': 0.1 # Ajouté pour la dynamique des pyramides
}


def generate_quantum_geometric_entropy(
    icosa_subdivisions: int = 1,
    pyramid_layers: int = 3,
    lsystem_iterations: int = 2
) -> bytes: # Retourne des bytes (le hash final)
    """
    Génère une valeur d'entropie combinant la géométrie dynamique (icosaèdre, pyramides),
    les fractales et la mécanique quantique simulée.
    """
    try:
        # 1. Générer le polyèdre de Klee-Penrose (icosaèdre subdivisé)
        kp_vertices, kp_faces = generate_klee_penrose_polyhedron(subdivisions=icosa_subdivisions)
        
        # 2. Générer le système de pyramides dynamique
        pyramids_system = generate_pyramids_system(num_layers=pyramid_layers) # Paramètres de base
        
        # 3. Générer les fractales L-system (pour l'instant, juste la chaîne)
        lsystem = FractalLSystem(axiom="F", rules={"F": "F[+F]F[-F][F]"})
        fractal_string = lsystem.generate(iterations=lsystem_iterations)
        
        # 4. Initialiser les nœuds quantiques (un par sommet du polyèdre de Klee-Penrose)
        quantum_nodes = [QuantumNode(i) for i in range(len(kp_vertices))]
        
        # 5. Dynamique chaotique : Mise à jour des états quantiques (influence par la fractale et les pyramides)
        # On va dériver un chaos_param combiné des géométries et fractales.
        chaos_param_from_fractal = len(fractal_string) / 1000.0 if fractal_string else 0.1
        
        # Utiliser une propriété des pyramides pour influencer le chaos_param
        # Par exemple, le nombre total de briques dans le système
        total_bricks = sum(len(p["bricks"]) for p in pyramids_system["pyramids"])
        chaos_param_from_pyramids = total_bricks / 50.0 # Exemple
        
        combined_chaos_param = (chaos_param_from_fractal + chaos_param_from_pyramids) / 2.0
        if combined_chaos_param == 0: combined_chaos_param = 0.1 # Éviter 0
        
        for node in quantum_nodes:
            node.apply_decoherence(combined_chaos_param)
            
        # 6. Mesure de l'entropie totale des qubits
        total_qubit_entropy = sum(node.measure_entropy() for node in quantum_nodes)
        
        # 7. Créer une "signature géométrique" des pyramides à un instant donné (ex: après 1 step de dynamique)
        # Pour une signature, on peut prendre l'état après une petite évolution
        temp_pyramids_system = generate_pyramids_system(num_layers=pyramid_layers) # Générer un état initial pour la signature
        dynamic_pyramids_state = update_pyramids_dynamics(temp_pyramids_system, time_step=DEFAULT_GEOMETRY_PARAMS['dt'], 
                                                          chaos_factor=DEFAULT_GEOMETRY_PARAMS['chaos_factor'], 
                                                          noise_level=DEFAULT_GEOMETRY_PARAMS['noise_level'])
        
        # Extraire des informations pour la signature géométrique des pyramides
        pyramids_signature_data = []
        for p in dynamic_pyramids_state["pyramids"]:
            for b in p["bricks"]:
                pyramids_signature_data.extend(b["position"]) # Coordonnées des briques
        
        # --- NOUVELLE SOURCE: ENTROPIE TEMPORELLE MONDIALE ---
        timestamps_list = get_world_timestamps() # Récupérer les timestamps mondiaux
        mixed_timestamps_string = mix_timestamps(timestamps_list, mode='hybrid') # Mélanger
        # Assurez-vous que mixed_timestamps_string n'est pas vide
        if not mixed_timestamps_string:
            # Dans un environnement de production, utiliser un logger global.
            print("WARNING: Aucune entropie temporelle mondiale générée.")
            
        # 8. Combiner toutes les informations pour le hachage final
        entropy_string_for_hash = (
            str(total_qubit_entropy) + 
            str(len(kp_vertices)) + 
            str(len(kp_faces)) + 
            fractal_string + 
            json.dumps(pyramids_signature_data) +
            mixed_timestamps_string + # Ajout de la nouvelle source d'entropie temporelle
            str(time.time_ns()) # Ajout d'un timestamp local précis pour la variabilité
        )
        
        # Retourner un haché de cette chaîne pour une entropie finale robuste (en bytes)
        return hashlib.blake2b(entropy_string_for_hash.encode(), digest_size=32).digest()

    except Exception as e:
        # Dans un environnement de production, utiliser un logger global ici.
        print(f"ERROR: Erreur lors de la génération de l'entropie quantique-géométrique: {e}")
        return None