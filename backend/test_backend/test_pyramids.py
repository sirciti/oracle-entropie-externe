# Fichier temporaire : test_pyramids.py
from backend.geometry.pyramids.generator import generate_pyramids_system
from backend.geometry.pyramids.dynamics import update_pyramids_dynamics

# Génération initiale
system = generate_pyramids_system(base_size=5.0, num_layers=3, brick_size=1.0, seed=42)
print("Pyramide 0, Brique 0 position initiale:", system["pyramids"][0]["bricks"][0]["position"])

# Application de la dynamique
updated_system = update_pyramids_dynamics(system, time_step=0.1, chaos_factor=0.1)
print("Pyramide 0, Brique 0 position après update:", updated_system["pyramids"][0]["bricks"][0]["position"])
