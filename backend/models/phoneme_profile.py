def build_phoneme_profile(assessment_blocks):
    """
    Creates a phoneme difficulty profile:
    { "b": 4 errors, "d": 2 errors, "sh": 1 error }
    """
    profile = {}

    for q in assessment_blocks:
        for w in q["words"]:
            if w["error_type"] != "correct":
                phs = w["expected_phonemes"]
                # Simplify: take first phoneme (espeak gives strings like "b æ t")
                main = phs.split(" ")[0].lower()

                profile[main] = profile.get(main, 0) + 1

    return profile
