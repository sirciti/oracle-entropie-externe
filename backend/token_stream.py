import string
import logging
import secrets
import hashlib
from typing import Optional, Dict, List
from blake3 import blake3 # pip install blake3
import sentry_sdk

# Dépendances internes (à importer depuis le package backend)
# Nous allons les passer en paramètre ou les importer si elles sont nécessaires
# ici pour éviter les imports circulaires. Pour l'instant, on suppose app.py les passera
# ou on les importe pour le test direct.
try:
    from .entropy_oracle import get_final_entropy
except ImportError:
    # Fallback pour exécution directe du script à des fins de test
    # En production ou lors d'imports dans Flask, l'import relatif fonctionnera
    print("WARNING: Using mock get_final_entropy for direct script execution. Replace with actual import.")
    def get_final_entropy(hash_algo='blake3', **kwargs):
        # Mocking a valid seed for direct script execution
        if hash_algo == 'blake3':
            return blake3("mock_seed_data_blake3".encode()).digest()
        else:
            return hashlib.sha3_512("mock_seed_data_sha3".encode()).digest()

# Configurer le logger pour ce module
logger = logging.getLogger("token_stream")
# Assurez-vous que le logger a au moins un handler dans app.py pour voir les logs.

# Configurer Sentry (DSN à remplacer par le tien)
sentry_sdk.init(
    dsn="https://29f8b7efc9e08f8ab4f63a42a7947b7e@o4509440127008768.ingest.de.sentry.io/4509440193396816",# Remplace par ton DSN réel en production
    traces_sample_rate=1.0,
    environment="development" # Ou "production"
)

class TokenStreamGenerator:
    """
    Générateur de flux de tokens sécurisés à partir d'une graine d'entropie.
    Utilise Hash_DRBG avec BLAKE3/SHA-3 pour CSPRNG.
    """
    def __init__(
        self,
        hash_algo: str = "blake3",
        seed: Optional[bytes] = None,
        char_options: Optional[Dict[str, bool]] = None
    ):
        """
        Initialise le générateur avec une graine et des options de caractères.
        Args:
            hash_algo: 'blake3' ou 'sha3_512'
            seed: Graine d'entropie (32 octets minimum), sinon générée via get_final_entropy
            char_options: {'lowercase': bool, 'uppercase': bool, 'numbers': bool, 'symbols': bool}
        """
        try:
            if hash_algo not in ['blake3', 'sha3_512']:
                raise ValueError("Algorithme de hachage non supporté pour la graine interne.")
            self.hash_algo = hash_algo
            
            self.char_options = char_options or {
                "lowercase": True,
                "uppercase": True,
                "numbers": True,
                "symbols": True
            }
            self.alphabet = self._build_alphabet()
            if not self.alphabet:
                raise ValueError("Aucun type de caractère sélectionné")

            # Obtenir la graine si non fournie. Utilise la graine finale du système.
            self.seed = seed or get_final_entropy(hash_algo=hash_algo, use_cubes=True) # Utilise la graine du système
            if not self.seed or len(self.seed) < 32:
                raise ValueError("Graine d'entropie invalide ou trop courte (doit être >= 32 octets).")
            
            self.counter = 0 # Compteur pour Hash_DRBG
            self.buffer = bytearray() # Buffer pour stocker les octets générés
            logger.info("TokenStreamGenerator initialisé avec succès")
        except Exception as e:
            sentry_sdk.capture_exception(e)
            logger.error(f"Erreur lors de l'initialisation de TokenStreamGenerator: {e}", exc_info=True)
            raise

    def _build_alphabet(self) -> str:
        """Construit l'alphabet complet basé sur les options de caractères sélectionnées."""
        alphabet = ""
        if self.char_options.get("lowercase"):
            alphabet += string.ascii_lowercase
        if self.char_options.get("uppercase"):
            alphabet += string.ascii_uppercase
        if self.char_options.get("numbers"):
            alphabet += string.digits
        if self.char_options.get("symbols"):
            alphabet += string.punctuation # Utilise string.punctuation pour une liste standard de symboles
        return alphabet

    def _generate_bytes(self, num_bytes: int) -> bytes:
        """
        Implémente le cœur de Hash_DRBG pour générer des octets pseudo-aléatoires.
        Prend la graine interne et le compteur, les hache, et retourne une partie du haché.
        """
        try:
            data_to_hash = self.seed + self.counter.to_bytes(8, "big") # Combine graine et compteur
            
            if self.hash_algo == "blake3":
                hash_output = blake3(data_to_hash).digest()
            elif self.hash_algo == "sha3_512":
                hash_output = hashlib.sha3_512(data_to_hash).digest()
            else:
                raise ValueError("Algorithme de hachage Hash_DRBG non supporté.")
            
            self.counter += 1 # Incrémente le compteur pour la prochaine génération
            return hash_output[:num_bytes] # Retourne les octets demandés
        except Exception as e:
            sentry_sdk.capture_exception(e)
            logger.error(f"Erreur dans _generate_bytes (Hash_DRBG): {e}", exc_info=True)
            raise

    def generate_token(self, length: int) -> Optional[str]:
        """
        Génère un token de longueur donnée, en garantissant la composition des caractères
        si les types sont sélectionnés.
        Args:
            length: Longueur du token (8-128)
        Returns:
            str: Token généré ou None en cas d'erreur
        """
        try:
            if not 8 <= length <= 128:
                raise ValueError("Longueur doit être entre 8 et 128.")
            token_chars = []
            charsets_to_guarantee = []
            if self.char_options.get("lowercase"):
                charsets_to_guarantee.append(string.ascii_lowercase)
            if self.char_options.get("uppercase"):
                charsets_to_guarantee.append(string.ascii_uppercase)
            if self.char_options.get("numbers"):
                charsets_to_guarantee.append(string.digits)
            if self.char_options.get("symbols"):
                charsets_to_guarantee.append(string.punctuation)
            required_chars_count = len(charsets_to_guarantee)
            if length < required_chars_count:
                raise ValueError(f"Longueur {length} trop courte pour inclure {required_chars_count} types de caractères.")
            system_random = secrets.SystemRandom()
            for charset_pool in charsets_to_guarantee:
                token_chars.append(system_random.choice(charset_pool))
            full_alphabet_list = list(self.alphabet)
            remaining_length = length - len(token_chars)
            while remaining_length > 0:
                num_bytes_needed = min(remaining_length, 32)
                raw_bytes = self._generate_bytes(num_bytes_needed)
                for byte_val in raw_bytes:
                    if remaining_length <= 0:
                        break
                    index = byte_val % len(full_alphabet_list)
                    token_chars.append(full_alphabet_list[index])
                    remaining_length -= 1
            system_random.shuffle(token_chars)
            token = ''.join(token_chars)
            logger.info(f"Token généré: {token} (longueur: {len(token)})")
            return token
        except Exception as e:
            sentry_sdk.capture_exception(e)
            logger.error(f"Erreur dans generate_token: {e}", exc_info=True)
            return None

    def generate_token_stream(self, num_tokens: int, length: int) -> List[Optional[str]]:
        """
        Génère un flux de tokens.
        Args:
            num_tokens: Nombre de tokens à générer
            length: Longueur de chaque token
        Returns:
            List[Optional[str]]: Liste des tokens générés
        """
        try:
            tokens = []
            for _ in range(num_tokens):
                token = self.generate_token(length)
                if token:
                    tokens.append(token)
                else:
                    logger.warning("Échec de génération d'un token dans le flux.")
            return tokens
        except Exception as e:
            sentry_sdk.capture_exception(e)
            logger.error(f"Erreur dans generate_token_stream: {e}", exc_info=True)
            return []

# Tests unitaires simples pour le module
if __name__ == "__main__":
    import unittest
    # Configurer le logger pour qu'il affiche dans la console pendant le test direct
    logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

    class TestTokenStreamGenerator(unittest.TestCase):
        def test_generate_token_blake3_default_composition(self):
            print("\n--- Test BLAKE3 Default ---")
            generator = TokenStreamGenerator(hash_algo="blake3")
            token = generator.generate_token(32)
            self.assertIsNotNone(token)
            self.assertEqual(len(token), 32)
            # Vérifier que tous les types sont présents (si la longueur le permet)
            self.assertTrue(any(c in string.ascii_lowercase for c in token))
            self.assertTrue(any(c in string.ascii_uppercase for c in token))
            self.assertTrue(any(c in string.digits for c in token))
            self.assertTrue(any(c in string.punctuation for c in token))
            print(f"Token BLAKE3 (32): {token}")

        def test_generate_token_sha3_512_custom_composition(self):
            print("\n--- Test SHA-3 Custom (lower, digits) ---")
            char_opts = {"lowercase": True, "uppercase": False, "numbers": True, "symbols": False}
            generator = TokenStreamGenerator(hash_algo="sha3_512", char_options=char_opts)
            token = generator.generate_token(16)
            self.assertIsNotNone(token)
            self.assertEqual(len(token), 16)
            self.assertTrue(any(c in string.ascii_lowercase for c in token))
            self.assertTrue(any(c in string.digits for c in token))
            self.assertFalse(any(c in string.ascii_uppercase for c in token))
            self.assertFalse(any(c in string.punctuation for c in token))
            print(f"Token SHA-3 (16, lower+digits): {token}")
            
        def test_generate_token_stream_blake3(self):
            print("\n--- Test Stream BLAKE3 ---")
            generator = TokenStreamGenerator(hash_algo="blake3")
            tokens = generator.generate_token_stream(5, 16)
            self.assertEqual(len(tokens), 5)
            for token in tokens:
                self.assertIsNotNone(token)
                self.assertEqual(len(token), 16)
                self.assertTrue(any(c in string.ascii_lowercase for c in token))
                self.assertTrue(any(c in string.ascii_uppercase for c in token))
                self.assertTrue(any(c in string.digits for c in token))
                self.assertTrue(any(c in string.punctuation for c in token))
            print(f"Flux généré: {tokens[0]}...")

        def test_short_token_composition_guarantee(self):
            print("\n--- Test Short Token Composition Guarantee ---")
            # Demande 4 types de caractères pour un token de longueur 8 (le minimum pour garantir)
            char_opts = {"lowercase": True, "uppercase": True, "numbers": True, "symbols": True}
            generator = TokenStreamGenerator(hash_algo="blake3", char_options=char_opts)
            token = generator.generate_token(8)
            self.assertIsNotNone(token)
            self.assertEqual(len(token), 8)
            self.assertTrue(any(c in string.ascii_lowercase for c in token))
            self.assertTrue(any(c in string.ascii_uppercase for c in token))
            self.assertTrue(any(c in string.digits for c in token))
            self.assertTrue(any(c in string.punctuation for c in token))
            print(f"Token court (8, tous types garantis): {token}")

        def test_invalid_length_raises_error(self):
            print("\n--- Test Invalid Length ---")
            generator = TokenStreamGenerator(hash_algo="blake3")
            with self.assertRaises(ValueError):
                generator.generate_token(5) # Trop court
            with self.assertRaises(ValueError):
                generator.generate_token(150) # Trop long
            print("Tests de longueur invalide réussis.")

        def test_no_charset_selected_raises_error(self):
            print("\n--- Test No Charset Selected ---")
            char_opts = {"lowercase": False, "uppercase": False, "numbers": False, "symbols": False}
            with self.assertRaises(ValueError):
                TokenStreamGenerator(hash_algo="blake3", char_options=char_opts)
            print("Test 'aucun jeu de caractères' réussi.")

    unittest.main(argv=[''], exit=False)


