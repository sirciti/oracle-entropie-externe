import pytz # Bibliothèque pour les fuseaux horaires
from datetime import datetime, timezone
import random
import hashlib
from typing import List, Dict, Any

# Les fonctions de logging seront gérées par le logger principal via entropy_oracle.py
# ou définies localement si nécessaire. Pour l'instant, on n'importe pas logger directement.

# Liste des fuseaux horaires pertinents pour l'entropie mondiale
# Cette liste peut être étendue ou configurée.
WORLD_TIMEZONES = [
    'America/New_York', 'Europe/London', 'Asia/Tokyo', 'Australia/Sydney',
    'Africa/Johannesburg', 'America/Sao_Paulo', 'Asia/Dubai', 'Europe/Paris',
    'America/Los_Angeles', 'Asia/Shanghai', 'Asia/Kolkata', 'Europe/Moscow'
]

def get_world_timestamps() -> List[str]:
    """
    Récupère les horodatages UTC actuels pour une sélection de fuseaux horaires mondiaux.
    """
    timestamps = []
    for tz_name in WORLD_TIMEZONES:
        try:
            tz = pytz.timezone(tz_name)
            now = datetime.now(tz)
            timestamps.append(now.isoformat()) # Format ISO pour une représentation standard
        except pytz.UnknownTimeZoneError:
            # Gérer les fuseaux horaires inconnus (si la liste est modifiée manuellement)
            print(f"WARNING: Fuseau horaire inconnu: {tz_name}")
            continue
        except Exception as e:
            print(f"ERROR: Erreur lors de la récupération du timestamp pour {tz_name}: {e}")
            continue
    return timestamps

def mix_timestamps(timestamps: List[str], mode: str = 'hybrid') -> str:
    """
    Mélange une liste d'horodatages pour produire une chaîne d'entropie.
    Mode 'hybrid' : Combine hachage et mélange des bits/caractères.
    """
    if not timestamps:
        return ""

    combined_string = "".join(timestamps)
    
    if mode == 'hybrid':
        # Hachage initial pour un mélange cryptographique
        initial_hash = hashlib.sha256(combined_string.encode()).hexdigest()

        # Mélange et recombinaison de bits/caractères du hash pour l'aléa
        # Pour une entropie plus fine, on peut manipuler les bits.
        # Pour cet exemple, on mélange la chaîne hexadécimale.
        shuffled_chars = list(initial_hash)
        random.shuffle(shuffled_chars) # random.shuffle utilise SystemRandom si disponible
        
        return "".join(shuffled_chars)
    else: # mode simple (par défaut ou si mode inconnu)
        return hashlib.sha256(combined_string.encode()).hexdigest()

if __name__ == "__main__":
    # Test unitaire simple
    print("--- Test d'entropie temporelle ---")
    timestamps = get_world_timestamps()
    print(f"Timestamps collectés: {len(timestamps)}")
    
    mixed_entropy = mix_timestamps(timestamps, mode='hybrid')
    print(f"Entropie temporelle mélangée (hex): {mixed_entropy}")
    print(f"Longueur de l'entropie: {len(mixed_entropy)}")
    
    # Vérifier si l'entropie est toujours la même avec la même graine (non, car time.time_ns)
    # C'est une source d'aléa, pas un PRNG reproductible avec une graine fixe.