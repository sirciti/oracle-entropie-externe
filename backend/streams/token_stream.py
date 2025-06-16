import string
import logging
import secrets
import hashlib
import os
import random
from typing import Optional, Dict, List, Any
from blake3 import blake3
import sentry_sdk
from entropy.quantum.entropy_oracle import get_final_entropy

logger = logging.getLogger("token_stream")

SENTRY_DSN = os.environ.get("SENTRY_DSN")
if SENTRY_DSN:
    sentry_sdk.init(
        dsn=SENTRY_DSN,
        traces_sample_rate=1.0,
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
                raise ValueError("Aucun type de caractère sélectionné.")

            self.seed = seed
            if self.seed is None:
                 self.seed = get_final_entropy(
                     hash_algo=hash_algo,
                     use_cubes=True,
                     use_weather=True,
                     use_icosahedron=True,
                     use_quantum=True,
                     use_timestamps=True,
                     use_local_noise=True,
                     use_spiral_simple=True,
                     use_spiral_torus=True
                 )
            
            if not self.seed or len(self.seed) < 32:
                if self.seed and len(self.seed) < 32:
                    logger.warning(f"Graine d'entropie trop courte ({len(self.seed)} octets). Padding avec des zéros.")
                    self.seed = self.seed.ljust(32, b'\0')
                else:
                    raise ValueError("Graine d'entropie invalide ou absente (doit être >= 32 octets après padding).")
            
            self.counter = 0
            self.buffer = bytearray()
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
            alphabet += string.punctuation
        return alphabet

    def _generate_bytes(self, num_bytes: int) -> bytes:
        """
        Génère au moins num_bytes octets pseudo-aléatoires en concaténant plusieurs blocs si nécessaire.
        """
        output = bytearray()
        while len(output) < num_bytes:
            data_to_hash = self.seed + self.counter.to_bytes(8, "big")
            if self.hash_algo == "blake3":
                hash_output = blake3(data_to_hash).digest()
            elif self.hash_algo == "sha3_512":
                hash_output = hashlib.sha3_512(data_to_hash).digest()
            else:
                raise ValueError("Algorithme de hachage Hash_DRBG non supporté.")
            self.counter += 1
            output.extend(hash_output)
        return bytes(output[:num_bytes])

    def generate_token(self, length: int) -> Optional[str]:
        """
        Génère un token de longueur donnée, en garantissant la composition des caractères
        si les types sont sélectionnés.
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
            
            if remaining_length > 0:
                num_bytes_needed = remaining_length
                raw_bytes = self._generate_bytes(num_bytes_needed)

                for byte_val in raw_bytes:
                    index = byte_val % len(full_alphabet_list)
                    token_chars.append(full_alphabet_list[index])

            system_random.shuffle(token_chars)
            
            token = ''.join(token_chars)
            
            logger.info(f"Token généré: {token[:10]}... (longueur: {length})")
            return token
        except Exception as e:
            sentry_sdk.capture_exception(e)
            logger.error(f"Erreur dans generate_token (CSPRNG): {e}", exc_info=True)
            return None

    def generate_token_stream(self, num_tokens: int, length: int) -> List[Optional[str]]:
        """
        Génère un flux de tokens.
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

    def simple_generate_token(self, length):
        """
        Génère un token simple sans utiliser la graine d'entropie, basé uniquement sur les options de caractères.
        Utilise secrets.choice pour chaque caractère.
        """
        if not isinstance(length, int) or length < 8 or length > 128:
            raise ValueError("Longueur doit être entre 8 et 128.")
        chars = ''
        if self.char_options.get('lowercase', False):
            chars += string.ascii_lowercase
        if self.char_options.get('uppercase', False):
            chars += string.ascii_uppercase
        if self.char_options.get('numbers', False):
            chars += string.digits
        if self.char_options.get('symbols', False):
            chars += string.punctuation
        if not chars:
            raise ValueError("Aucun jeu de caractères sélectionné.")
        return ''.join(secrets.choice(chars) for _ in range(length))

if __name__ == "__main__":
    import unittest
    logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

    class TestTokenStreamGenerator(unittest.TestCase):
        def test_generate_token_blake3_default_composition(self):
            print("\n--- Test BLAKE3 Default ---")
            generator = TokenStreamGenerator(hash_algo="blake3")
            token = generator.generate_token(32)
            self.assertIsNotNone(token)
            self.assertEqual(len(token), 32)
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
            char_opts = {"lowercase": True, "uppercase": True, "numbers": True, "symbols": True}
            generator = TokenStreamGenerator(hash_algo="blake3", char_options=char_opts)
            token = generator.generate_token(8)
            self.assertIsNotNone(token)
            self.assertEqual(len(token), 8)
            self.assertTrue(any(c in string.ascii_lowercase for c in token))
            self.assertTrue(any(c in string.ascii_uppercase for c in token))
            self.assertTrue(any(c in string.digits for c in token))
            self.assertTrue(any(c in string.punctuation for c in token))
            print(f"Token court garanti (8): {token}")

        def test_simple_generate_token(self):
            print("\n--- Test Simple Generate Token (sans graine) ---")
            char_opts = {"lowercase": True, "uppercase": True, "numbers": True, "symbols": True}
            generator = TokenStreamGenerator(hash_algo="blake3", char_options=char_opts)
            token = generator.simple_generate_token(12)
            self.assertIsNotNone(token)
            self.assertEqual(len(token), 12)
            self.assertTrue(any(c in string.ascii_lowercase for c in token))
            self.assertTrue(any(c in string.ascii_uppercase for c in token))
            self.assertTrue(any(c in string.digits for c in token))
            self.assertTrue(any(c in string.punctuation for c in token))
            print(f"Token simple (12): {token}")

    unittest.main(argv=[''], exit=False)