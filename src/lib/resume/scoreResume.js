export function scoreResume(text) {
  let score = 0;
  const issues = [];

  if (/\b(email|@)\b/i.test(text)) score += 10;
  else issues.push("Email not found");

  if (/\b\d{10}\b/.test(text)) score += 10;
  else issues.push("Phone number missing");

  if (/skills/i.test(text)) score += 15;
  else issues.push("Skills section missing");

  if (/experience|projects/i.test(text)) score += 25;
  else issues.push("No experience or projects mentioned");

  if (text.length > 1500) score += 10;
  else issues.push("Resume content too short");

  const actionVerbs = ["built", "developed", "designed", "implemented"];
  if (actionVerbs.some(v => text.toLowerCase().includes(v))) {
    score += 10;
  } else {
    issues.push("Use stronger action verbs");
  }

  return {
    score: Math.min(score, 100),
    issues
  };
}
