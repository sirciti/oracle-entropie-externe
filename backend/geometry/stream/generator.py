import secrets
import string
from core.utils.utils import get_entropy_data
import logging

logger = logging.getLogger(__name__)

def generate_stream_tokens(length: int, char_options: dict, capacity_bytes: int) -> dict:
    """Génère des tokens pour le visualiseur de stream."""
    try:
        # Construire le charset selon les options
        charset = ""
        if char_options.get('lowercase', False):
            charset += string.ascii_lowercase
        if char_options.get('uppercase', False):
            charset += string.ascii_uppercase
        if char_options.get('numbers', False):
            charset += string.digits
        if char_options.get('symbols', False):
            charset += "!@#$%^&*()_+-=[]{}|;:,.<>?"
        
        if not charset:
            return {"error": "Aucun type de caractère sélectionné"}
        
        # Générer des tokens
        entropy = get_entropy_data()
        system_random = secrets.SystemRandom()
        
        tokens = []
        max_tokens = min(100, capacity_bytes // (length * 2))  # Limiter le nombre de tokens
        
        for i in range(max_tokens):
            token = ''.join(system_random.choice(charset) for _ in range(length))
            tokens.append(token)
        
        return {
            "tokens": tokens,
            "count": len(tokens),
            "charset_size": len(charset),
            "entropy": entropy
        }
        
    except Exception as e:
        logger.error(f"Erreur génération stream tokens: {e}")
        return {"error": str(e)}
