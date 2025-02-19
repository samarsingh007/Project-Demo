    sample_text = """
    1) **Reasoning**: The parent tries a time delay
    2) **Fidelity**: 2
    Something else here 
    Reasoning: Another reasoning line
    Fidelity: 3
    """
    fidelity_val, reasoning_val = parse_llm_output(sample_text)
    logging.info(f"DEBUG TEST -> Fidelity: {fidelity_val}, Reasoning: {reasoning_val}")