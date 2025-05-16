import random
import requests
import time
import json

# URL de notre API d'entropie locale (météo)
ENTROPY_API_URL = "http://127.0.0.1:5000/entropy"

# URL de l'API ANU QRNS (plan gratuit - attention aux limitations)
ANU_QRNG_API_URL = "https://qrng.anu.edu.au/API/jsonI.php?length=1&type=uint8"

def get_external_entropy_weather():
    """Récupère les données d'entropie de notre API météo locale."""
    try:
        response = requests.get(ENTROPY_API_URL)
        response.raise_for_status()
        entropy_data = response.json()
        return entropy_data
    except requests.exceptions.RequestException as e:
        print(f"Erreur lors de la récupération de l'entropie météo : {e}")
        return None

def get_quantum_entropy():
    """Récupère un nombre aléatoire quantique de l'API ANU (AWS)."""
    ANU_QRNG_API_URL = "https://qrng.anu.edu.au/API/jsonI.php?length=1&type=uint8"
    try:
        response = requests.get(ANU_QRNG_API_URL)
        response.raise_for_status()
        data = response.json()
        if data and data['data']:
            return data['data'][0] / 255.0  # Normaliser entre 0 et 1 (uint8 -> 0-255)
        else:
            print("Erreur : Données QRNG non valides.")
            return None
    except requests.exceptions.RequestException as e:
        print(f"Erreur lors de la récupération de l'entropie quantique : {e}")
        return None

def generate_random_number_with_entropy():
    """Génère un nombre aléatoire en utilisant l'entropie externe (météo et quantique)."""
    weather_entropy = get_external_entropy_weather()
    quantum_entropy = get_quantum_entropy()
    seed = time.time()

    if weather_entropy:
        seed += sum(weather_entropy.values())

    if quantum_entropy is not None:
        seed += quantum_entropy

    random.seed(seed)
    return random.random()

if __name__ == "__main__":
    for _ in range(5):
        random_number = generate_random_number_with_entropy()
        print(f"Nombre aléatoire généré (avec QRNG) : {random_number}")
        time.sleep(1)