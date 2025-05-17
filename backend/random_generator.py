import random
import requests
import time
import hashlib
import json
import os

# URL de l'API Flask locale qui fournit l'entropie météo
ENTROPY_API_URL = "http://127.0.0.1:5000/entropy"

# URL de l'API quantique ANU QRNG
ANU_QRNG_API_URL = "https://qrng.anu.edu.au/API/jsonI.php?length=1&type=uint8"

def get_external_entropy_weather():
    """Récupère les données d'entropie météo depuis l'API locale."""
    try:
        response = requests.get(ENTROPY_API_URL, timeout=5)
        response.raise_for_status()
        entropy_data = response.json()
        if "error" in entropy_data:
            print("Erreur de l'API météo :", entropy_data["error"])
            return None
        return entropy_data
    except requests.exceptions.RequestException as e:
        print(f"Erreur lors de la récupération de l'entropie météo : {e}")
        return None

def get_quantum_entropy(max_retries=3, initial_delay=1):
    """Récupère un nombre aléatoire quantique normalisé [0,1] depuis l'API ANU QRNG."""
    retries = 0
    delay = initial_delay
    while retries < max_retries:
        try:
            response = requests.get(ANU_QRNG_API_URL, timeout=5)
            response.raise_for_status()
            data = response.json()
            if data and data.get('data'):
                return data['data'][0] / 255.0
            else:
                print("Erreur : Données QRNG non valides.")
                return None
        except requests.exceptions.RequestException as e:
            print(f"Erreur lors de la récupération de l'entropie quantique (tentative {retries + 1}/{max_retries}) : {e}")
            retries += 1
            time.sleep(delay)
            delay *= 2
    print("Échec de la récupération de l'entropie quantique après plusieurs tentatives.")
    return None

def generate_random_number_with_entropy(verbose=False):
    """
    Génère un nombre aléatoire robuste basé sur :
      - entropie météo (API locale)
      - entropie quantique (ANU)
      - horodatage précis
      - bruit local (os.urandom)
    """
    weather_entropy = get_external_entropy_weather()
    quantum_entropy_value = get_quantum_entropy()
    timestamp = time.time_ns()  # Horodatage très précis (nanosecondes)[4]
    local_noise = os.urandom(16)  # 16 octets de bruit système (toujours gratuit et dispo)

    # Construction de la graine
    seed_string = str(timestamp)
    if weather_entropy:
        seed_string += json.dumps(weather_entropy, sort_keys=True)
    if quantum_entropy_value is not None:
        seed_string += str(quantum_entropy_value)
    seed_string += local_noise.hex()

    # Hash robuste (SHA-256 ou BLAKE2b)
    hashed_entropy = hashlib.sha256(seed_string.encode()).hexdigest()  # ou hashlib.blake2b(seed_string.encode()).hexdigest()[1][5]
    seed = int(hashed_entropy[:16], 16)
    random.seed(seed)
    result = random.random()

    if verbose:
        print("----- ENTROPIE UTILISÉE -----")
        print("Horodatage :", timestamp)
        print("Entropie météo :", weather_entropy)
        print("Entropie quantique :", quantum_entropy_value)
        print("Bruit local (hex) :", local_noise.hex())
        print("Haché SHA-256 :", hashed_entropy)
        print("Graine PRNG :", seed)
        print("-----------------------------")

    return result, weather_entropy, quantum_entropy_value, timestamp, local_noise.hex()

if __name__ == "__main__":
    for i in range(5):
        rnd, weather, quantum, timestamp, noise = generate_random_number_with_entropy(verbose=True)
        print(f"Nombre aléatoire généré (avec hachage) : {rnd}\n")
        time.sleep(1)
