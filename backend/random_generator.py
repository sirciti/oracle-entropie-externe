import random
import requests
import time

# URL de notre API d'entropie locale
ENTROPY_API_URL = "http://127.0.0.1:5000/entropy"

def get_external_entropy():
    """Récupère les données d'entropie de notre API locale."""
    try:
        response = requests.get(ENTROPY_API_URL)
        response.raise_for_status()  # Lève une exception pour les codes d'erreur HTTP
        entropy_data = response.json()
        return entropy_data
    except requests.exceptions.RequestException as e:
        print(f"Erreur lors de la récupération de l'entropie : {e}")
        return None

def generate_random_number_with_entropy():
    """Génère un nombre aléatoire en utilisant l'entropie externe."""
    external_entropy = get_external_entropy()
    seed = time.time()  # Utilisation du temps comme graine initiale

    if external_entropy:
        # Mélange de l'entropie externe dans la graine
        seed += sum(external_entropy.values())

    random.seed(seed)
    return random.random()

if __name__ == "__main__":
    for _ in range(5):
        random_number = generate_random_number_with_entropy()
        print(f"Nombre aléatoire généré : {random_number}")
        time.sleep(1)