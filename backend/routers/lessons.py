@router.get("/lessons/next")
async def get_next_phoneme(user_id: str):
    db = connect()
    profile = await db["phoneme_profiles"].find_one({"user_id": user_id})
    if not profile or not profile.get("phoneme_stats"):
        # fallback if no assessment yet
        return {"phoneme": "b", "difficulty": 1, "reason": "default"}

    stats = profile["phoneme_stats"]

    # compute error rate per phoneme
    scored = []
    for ph, s in stats.items():
      attempts = max(1, s.get("attempts", 1))
      errors = s.get("errors", 0)
      error_rate = errors / attempts
      scored.append((ph, error_rate, attempts))

    # sort by highest error rate, then by attempts
    scored.sort(key=lambda x: (-x[1], -x[2]))

    top_ph, err_rate, attempts = scored[0]

    # simple difficulty heuristic
    if err_rate > 0.6:
        diff = 1
    elif err_rate > 0.3:
        diff = 2
    else:
        diff = 3

    return {
        "phoneme": top_ph,
        "difficulty": diff,
        "error_rate": round(err_rate, 2),
        "attempts": attempts
    }
