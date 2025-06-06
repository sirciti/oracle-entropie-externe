# backend/test_backend/test_token_stream.py

import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))
import pytest
from backend.token_stream import TokenStreamGenerator

def test_generate_token_length():
    gen = TokenStreamGenerator(
        char_options={"lowercase": True, "uppercase": True, "numbers": True, "symbols": True}
    )
    # Test différentes longueurs
    for length in [8, 32, 64, 128]:
        token = gen.generate_token(length)
        assert token is not None
        assert len(token) == length

def test_generate_token_charset():
    gen = TokenStreamGenerator(
        char_options={"lowercase": True, "uppercase": False, "numbers": False, "symbols": False}
    )
    token = gen.generate_token(32)
    assert all(c.islower() for c in token)

def test_generate_token_invalid_length():
    gen = TokenStreamGenerator(
        char_options={"lowercase": True}
    )
    # Longueur trop courte
    token = gen.generate_token(4)
    assert token is None
    # Longueur trop longue
    token = gen.generate_token(256)
    assert token is None

def test_generate_token_stream():
    gen = TokenStreamGenerator(
        char_options={"lowercase": True, "uppercase": True, "numbers": True, "symbols": True}
    )
    tokens = gen.generate_token_stream(num_tokens=5, length=16)
    assert len(tokens) == 5
    for t in tokens:
        assert t is not None
        assert len(t) == 16
