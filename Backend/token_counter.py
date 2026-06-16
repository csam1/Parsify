import tiktoken

_enc = tiktoken.get_encoding("cl100k_base")


def count_tokens(text: str) -> int:
    return len(_enc.encode(text))


def savings_percent(before: int, after: int) -> float:
    if before == 0:
        return 0.0
    return round((1 - after / before) * 100, 2)
