import numpy as np
import secrets
import string
import time
from core.utils.utils import get_entropy_data
import logging

logger = logging.getLogger(__name__)

class CryptoTokenRiverGenerator:
    """Générateur de flux continu de tokens cryptographiques robustes."""
    
    def __init__(self):
        # Caractères robustes pour tokens sécurisés
        self.charset = (
            string.ascii_letters + 
            string.digits + 
            "!@#$%^&*()_+-=[]{}|;:,.<>?`~"
        )
        self.entropy_pool = []
        self.last_generation = time.time()
    
    def generate_crypto_river_stream(self, chunk_size: int = 100) -> dict:
        """Génère un chunk de tokens cryptographiques pour la rivière."""
        try:
            # Mélanger l'entropie système avec secrets
            entropy = get_entropy_data()
            system_random = secrets.SystemRandom()
            
            # Générer le chunk de tokens
            tokens = []
            for i in range(chunk_size):
                # Combiner plusieurs sources d'entropie
                char_index = (
                    system_random.randint(0, len(self.charset) - 1) ^
                    int((entropy * 1000 + i) % len(self.charset))
                ) % len(self.charset)
                
                tokens.append({
                    "char": self.charset[char_index],
                    "position": i,
                    "entropy": entropy,
                    "timestamp": time.time(),
                    "velocity": system_random.uniform(0.5, 2.0),
                    "color": [
                        system_random.uniform(0.3, 1.0),
                        system_random.uniform(0.3, 1.0), 
                        system_random.uniform(0.3, 1.0)
                    ]
                })
            
            # Métriques du flux
            generation_time = time.time() - self.last_generation
            self.last_generation = time.time()
            
            return {
                "type": "crypto_token_river",
                "tokens": tokens,
                "chunk_size": chunk_size,
                "generation_time": generation_time,
                "entropy_quality": entropy,
                "river_flow_rate": chunk_size / generation_time if generation_time > 0 else 0,
                "charset_size": len(self.charset),
                "security_level": "robust_continuous"
            }
            
        except Exception as e:
            logger.error(f"Erreur génération CryptoTokenRiver: {e}")
            return {"error": str(e)}

def generate_crypto_token_river_data(chunk_size: int = 100) -> dict:
    """Interface principale pour génération de la rivière de tokens."""
    generator = CryptoTokenRiverGenerator()
    return generator.generate_crypto_river_stream(chunk_size)
