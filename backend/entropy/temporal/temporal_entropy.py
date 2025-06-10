# backend/temporal_entropy.py

import pytz
from datetime import datetime
import random
from typing import List, Dict, Tuple, Any

def get_world_timestamps() -> List[str]:
    """
    Récupère les heures et dates actuelles de plusieurs fuseaux horaires mondiaux.
    Utilise pytz et datetime pour une récupération locale sans API externe.

    Returns:
        Une liste de chaînes de caractères, chaque chaîne représentant
        l'horodatage complet (YYYY-MM-DD HH:MM:SS.ffffff) d'un fuseau horaire.
    """
    # Liste de fuseaux horaires majeurs (représentatifs des différents continents/régions)
    # Cette liste peut être étendue ou configurée selon les besoins.
    timezones = [
        'UTC',
        'Europe/Paris',          # Europe
        'America/New_York',      # Amérique du Nord (Est)
        'America/Los_Angeles',   # Amérique du Nord (Ouest)
        'America/Sao_Paulo',     # Amérique du Sud
        'Africa/Johannesburg',   # Afrique
        'Asia/Tokyo',            # Asie (Est)
        'Asia/Dubai',            # Asie (Moyen-Orient)
        'Australia/Sydney',      # Australie
        'Pacific/Auckland'       # Océanie (Nouvelle-Zélande)
    ]
    
    timestamps = []
    for tz_name in timezones:
        try:
            tz = pytz.timezone(tz_name)
            now = datetime.now(tz)
            timestamps.append(now.strftime('%Y-%m-%d %H:%M:%S.%f'))
        except pytz.UnknownTimeZoneError:
            print(f"Fuseau horaire inconnu: {tz_name}") # Pour le débogage si un nom est incorrect
        except Exception as e:
            print(f"Erreur lors de la récupération de l'heure pour {tz_name}: {e}")
            
    return timestamps

def mix_timestamps(timestamps: List[str], mode: str = 'random') -> str:
    """
    Mélange une liste d'horodatages selon un mode spécifié.

    Args:
        timestamps: Liste des horodatages sous forme de chaînes.
        mode: Le mode de mélange ('random', 'shuffle', 'hybrid', 'custom').

    Returns:
        Une chaîne de caractères représentant l'entropie mélangée.
    """
    mixed_timestamps = list(timestamps) # Créer une copie pour ne pas modifier l'original

    if not mixed_timestamps:
        return "" # Retourne une chaîne vide si pas de timestamps

    if mode == 'shuffle':
        random.shuffle(mixed_timestamps)
    elif mode == 'random':
        # Crée une nouvelle liste en choisissant aléatoirement parmi les timestamps existants
        mixed_timestamps = [random.choice(mixed_timestamps) for _ in range(len(mixed_timestamps))]
    elif mode == 'hybrid':
        # Combinaison de shuffle et de sélection aléatoire
        random.shuffle(mixed_timestamps) # Mélange l'ordre
        # Puis, sélectionne aléatoirement quelques-uns pour les répéter ou les omettre
        num_to_select = random.randint(len(mixed_timestamps) // 2, len(mixed_timestamps))
        mixed_timestamps = [random.choice(mixed_timestamps) for _ in range(num_to_select)]
        random.shuffle(mixed_timestamps) # Re-mélange après sélection
    elif mode == 'custom':
        # Ici, vous pourriez intégrer l'influence de votre géométrie dynamique ou des qubits simulés.
        # Par exemple, utiliser une valeur de l'icosaèdre pour déterminer la permutation ou la pondération.
        # Pour l'instant, c'est un placeholder.
        random.shuffle(mixed_timestamps) # Placeholder pour le mode custom
    else:
        # Mode par défaut ou inconnu
        random.shuffle(mixed_timestamps) 
        
    return ''.join(mixed_timestamps)

if __name__ == '__main__':
    # Exemple d'utilisation et de test
    print("--- Test de get_world_timestamps ---")
    ts_list = get_world_timestamps()
    print("Timestamps bruts :")
    for ts in ts_list:
        print(f" - {ts}")
    
    print("\n--- Test de mix_timestamps ---")
    
    print("\nMode 'shuffle' :")
    mixed_shuffled = mix_timestamps(ts_list, mode='shuffle')
    print(f"Chaîne mélangée : {mixed_shuffled[:100]}...") # Affiche une partie pour ne pas surcharger

    print("\nMode 'random' :")
    mixed_random = mix_timestamps(ts_list, mode='random')
    print(f"Chaîne mélangée : {mixed_random[:100]}...")

    print("\nMode 'hybrid' :")
    mixed_hybrid = mix_timestamps(ts_list, mode='hybrid')
    print(f"Chaîne mélangée : {mixed_hybrid[:100]}...")
    
    print("\nMode 'custom' (placeholder) :")
    mixed_custom = mix_timestamps(ts_list, mode='custom')
    print(f"Chaîne mélangée : {mixed_custom[:100]}...")