/**
 * wordList.js
 * -----------
 * Profanity word lists sourced from censor-text/profanity-list.
 * Stored in Sets for O(1) lookup. Loaded once at module initialisation.
 *
 * Severity tiers:
 *   EXTREME (score 5) — slurs, hate speech
 *   STRONG  (score 3) — clearly offensive words
 *   MILD    (score 1) — borderline / mildly offensive
 */

const EXTREME_WORDS = new Set([
  // Racial/ethnic slurs
  "nigger", "niggers", "kike", "kikes", "spic", "spics", "chink", "chinks",
  "gook", "gooks", "wetback", "wetbacks", "towelhead", "raghead", "ragheads",
  "sandnigger", "paki", "pakis", "beaner", "beaners", "cracker", "hymie",
  "hymies", "jigaboo", "jiggaboo", "spook", "coon", "coons", "darkie",
  "darkies", "darky", "sambo", "sambos", "zipperhead", "zipperheads",
  "tarbaby", "junglebunny", "porchmonkey", "wigger", "wiggers",
  // Homophobic/transphobic slurs
  "faggot", "fag", "fags", "dyke", "dykes", "tranny", "trannie",
  // Sexual violence
  "rape", "raped", "raping", "rapist",
  // Hate groups
  "nazi", "nazis", "kkk", "klan",
]);

const STRONG_WORDS = new Set([
  "fuck", "fucked", "fucker", "fuckers", "fucking", "fucks", "fuckhead",
  "fuckface", "fuckoff", "fuckwit", "fuckwad", "fucktard", "fucktards",
  "motherfucker", "motherfuckers", "motherfucking", "motherfuck",
  // Common obfuscation variants (output of normalizer)
  "fack", "fuk", "fok", "phuck", "phuk", "fcuk", "fucc",
  "cunt", "cunts", "cunted", "cuntface", "cuntfuck",
  "cock", "cocks", "cockface", "cockhead", "cocksucker", "cocksucking",
  "cockblock", "cockfucker",
  "shit", "shits", "shithead", "shitface", "shithole", "shitbag",
  "shitfuck", "shitfucker", "bullshit", "horseshit",
  "shyt", "sheit", "shiit",
  "asshole", "assholes", "asshat", "assfuck", "assfucker",
  "douchebag", "douchebags", "douche",
  "bitch", "bitches", "bitchass", "bitching",
  "whore", "whores", "whorefucker", "slut", "sluts", "slutbag",
  "bastard", "bastards", "dumbfuck", "stupidass",
  "cum", "cumshot", "cumshots", "cumslut", "cumstain", "cumsucker",
  "gangbang", "gangbanged", "gangbangs",
  "blowjob", "blowjobs", "handjob", "rimjob", "footjob",
  "dildo", "dildos", "vibrator",
  "pussy", "pussies", "pussi", "pussyfucker", "pussylicker",
  "dick", "dicks", "dickhead", "dickface", "dickfuck", "dicksucker",
  "penis", "penisfucker", "penislicker",
  "vagina", "vulva",
  "tits", "titties", "titfuck", "tittyfuck",
  "jizz", "jizzed", "jizm",
  "pimp", "pimped", "pimper",
  "pedophile", "pedophilia", "paedophile",
  "necro", "clusterfuck",
]);

const MILD_WORDS = new Set([
  "ass", "asses", "assclown", "assmonkey",
  "damn", "dammit", "damned", "damnation",
  "crap", "crapper", "crappy",
  "piss", "pissed", "pisser", "pissing", "pissoff",
  "hell", "hells",
  "idiot", "idiots",
  "moron", "morons",
  "retard", "retards", "retarded",
  "dumbass", "dumbasses",
  "jackass",
  "loser", "losers",
  "trash",
  "suck", "sucks", "sucked", "sucking",
  "jerk", "jerkoff", "jerked",
  "butt", "butthead", "butthole",
  "boob", "boobs",
  "tit", "titi",
  "poop", "pooping",
  "fart", "farted", "farting",
  "pee", "peepee",
  "weenie", "weiner",
  "bum",
  "wang", "wank", "wanker", "wanking",
  "nob", "knob", "knobs",
  "arse", "arsehole",
  "bollocks",
  "dork",
  "nuts", "nutjob",
  "screw", "screwed",
  "friggin", "frigger",
  "hoe", "hoes",
  "sleezeball", "slimeball",
]);

// Words that could false-positive in an academic context.
// All normalised to lowercase — Set membership is case-sensitive after normalisation.
const WHITELIST = new Set([
  "assignment", "assignments",
  "class", "classes",
  "analysis", "analyst",
  "associate", "association",
  "assume", "assumption",
  "assessment",
  "assist", "assistance",
  "classic",
  "bass", "mass", "pass", "grass", "brass", "glass", "lass", "sass",
  "accession",
  "asset", "assets",
  "passage", "passion", "massive",
  "harass", "embarrass",
  "compass", "trespass", "surpass", "bypass", "dispatch",
  "cockatoo", "cocktail", "cockerel",
  "scunthorpe",
  "essex", "middlesex", "sussex",
  "weinstein", "dickens", "dickson", "hancock", "sexsmith", "shuttlecock",
  "titrate", "titration",
]);

/**
 * Returns the severity score for a single normalised word token.
 * @param {string} word
 * @returns {0 | 1 | 3 | 5}
 */
function getSeverityScore(word) {
  if (WHITELIST.has(word)) return 0;
  if (EXTREME_WORDS.has(word)) return 5;
  if (STRONG_WORDS.has(word)) return 3;
  if (MILD_WORDS.has(word)) return 1;
  return 0;
}

module.exports = { EXTREME_WORDS, STRONG_WORDS, MILD_WORDS, WHITELIST, getSeverityScore };
