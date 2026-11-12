const PROTOCOL_DOCS = [
  {
    id: "earthquake",
    title: "Earthquake Survival Protocol (NDMA/FEMA)",
    keywords: ["earthquake", "quake", "tremor", "shaking", "seismic", "richter", "aftershock", "drop cover hold", "building collapse"],
    helplines: "National Emergency: 112 | NDRF / Disaster Helpline: 1078 | Ambulance: 108",
    steps: [
      "DROP onto hands and knees immediately before shaking knocks you down.",
      "COVER head and neck under a sturdy desk/table away from glass, windows, and heavy shelves.",
      "HOLD ON until shaking stops completely for at least 60 seconds.",
      "NEVER use elevators; evacuate via stairs after shaking stops and move to an open ground.",
      "Check for gas leaks (do NOT light matches/switches) and expect aftershocks."
    ]
  },
  {
    id: "flood",
    title: "Flood & Flash Flood Protocol (NDMA)",
    keywords: ["flood", "flooding", "flash flood", "waterlogging", "river overflow", "rising water", "drowning", "submerged"],
    helplines: "National Emergency: 112 | Disaster Control: 1070 / 1077 | Ambulance: 108",
    steps: [
      "Move immediately to higher floors or elevated ground; do not wait for water to enter indoors.",
      "Turn off main electricity breaker and gas supply only if safe and dry.",
      "NEVER walk or drive through moving floodwater (15 cm knocks an adult down; 30 cm floats vehicles).",
      "Avoid downed power lines, bridges over fast water, and contaminated stagnant water.",
      "Carry waterproof documents, potable water, torch, and charged phone/powerbank."
    ]
  },
  {
    id: "fire",
    title: "Fire & Smoke Evacuation Protocol",
    keywords: ["fire", "smoke", "wildfire", "forest fire", "burn", "burns", "flame", "extinguisher", "short circuit", "trapped in fire"],
    helplines: "Fire Brigade: 101 | National Emergency: 112 | Ambulance: 108",
    steps: [
      "Trigger nearest fire alarm and alert others; call 101 / 112 immediately.",
      "Crawl low under smoke where cleaner air stays near the floor.",
      "Touch closed doors with the back of your hand before opening; if hot, use an alternate exit.",
      "NEVER use elevators; if clothes catch fire: STOP, DROP, and ROLL.",
      "If trapped, seal door gaps with wet cloth and signal from a window."
    ]
  },
  {
    id: "cyclone",
    title: "Cyclone & Severe Storm Protocol (IMD/NDMA)",
    keywords: ["cyclone", "hurricane", "typhoon", "storm", "gale", "tornado", "high wind", "storm surge", "coastal"],
    helplines: "National Emergency: 112 | Cyclone Warning / NDRF: 1078 | Coast Guard: 1554",
    steps: [
      "Board/tape glass windows, secure loose outdoor objects, and charge phones/powerbanks before landfall.",
      "Stay in an interior windowless room or designated cyclone shelter until official all-clear.",
      "Do NOT go outside during the calm 'eye' of the cyclone—violent winds resume from the opposite direction.",
      "Unplug appliances and shut off gas valves during peak storm surge."
    ]
  },
  {
    id: "tsunami",
    title: "Tsunami Coastal Evacuation Protocol",
    keywords: ["tsunami", "tidal wave", "sea recede", "ocean wave", "coastal evacuation"],
    helplines: "National Emergency: 112 | INCOIS / Disaster: 1078",
    steps: [
      "If you feel a strong coastal earthquake or see the ocean suddenly recede, evacuate IMMEDIATELY on foot.",
      "Move at least 2 km inland or climb 30+ meters (100 ft) above sea level or upper floors of reinforced buildings.",
      "Wait for official government all-clear—tsunamis arrive as multiple destructive waves over hours."
    ]
  },
  {
    id: "landslide",
    title: "Landslide & Mudslide Safety Protocol",
    keywords: ["landslide", "mudslide", "debris flow", "hillside", "slope", "rockfall", "crack in ground"],
    helplines: "National Emergency: 112 | State Disaster Helpline: 1070",
    steps: [
      "Watch for warning signs after heavy rain: tilting trees, widening wall cracks, muddy springs, or rumbling.",
      "Evacuate perpendicular to the landslide path toward stable high ground—never cross a debris valley.",
      "If escape is impossible, curl into a tight ball and protect your head."
    ]
  },
  {
    id: "heatwave",
    title: "Heat Wave & Heatstroke Protocol (NDMA)",
    keywords: ["heatwave", "heat wave", "heatstroke", "sunstroke", "dehydration", "extreme heat", "high temperature"],
    helplines: "Ambulance: 108 | National Emergency: 112",
    steps: [
      "Avoid outdoor activity between 12:00 PM and 4:00 PM; stay in shade or ventilated rooms.",
      "Hydrate proactively with water, ORS, buttermilk, or lemon water—avoid alcohol and heavy caffeine.",
      "For suspected heatstroke (hot dry skin, confusion, high fever): move to cool shade, apply wet cloths/ice packs to neck/armpits/groin, and call 108."
    ]
  },
  {
    id: "drought",
    title: "Drought & Water Scarcity Preparedness",
    keywords: ["drought", "water scarcity", "famine", "crop failure", "dry spell", "conservation"],
    helplines: "National Emergency: 112 | District Control: 1077",
    steps: [
      "Prioritize drinking water storage and boil/chlorinate questionable water sources.",
      "Fix leaks, reuse greywater safely for sanitation, and reduce non-essential water usage.",
      "Avoid heat stress and follow district relief/ration distribution advisories."
    ]
  },
  {
    id: "first_aid_kit",
    title: "Emergency Go-Bag & First-Aid / CPR Basics",
    keywords: ["first aid", "cpr", "bleeding", "kit", "survival kit", "emergency bag", "go bag", "go-bag", "wound", "fracture", "emergency", "help", "sos", "stuck", "trapped", "preparedness", "shelter", "evacuation"],
    helplines: "National Emergency: 112 | Ambulance: 108 | Police: 100",
    steps: [
      "72-hour Go-Bag: 3L water/person/day, non-perishable food, first-aid kit, prescription meds, N95 masks, whistle, torch, spare batteries, copies of IDs, and cash.",
      "Severe Bleeding: Apply firm direct pressure with clean cloth/gauze; do not remove soaked cloth—add layers.",
      "Hands-Only CPR (unresponsive, not breathing): Call 108/112, push hard and fast center of chest (100-120 compressions/min).",
      "Trapped under debris: Cover mouth with cloth, tap pipes/whistle to conserve oxygen—avoid shouting continuously."
    ]
  }
];

function retrieveProtocols(query, memory = []) {
  const q = String(query || "").toLowerCase();
  const recentText = memory.map((m) => m.user + " " + m.bot).join(" ").toLowerCase();

  const scored = PROTOCOL_DOCS.map((doc) => {
    let score = 0;
    for (const kw of doc.keywords) {
      if (q.includes(kw)) score += kw.includes(" ") ? 4 : 2;
      else if (recentText.includes(kw)) score += 1;
    }
    return { doc, score };
  })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 2)
    .map((item) => item.doc);

  const isUrgent = /(trapped|bleeding|help now|emergency now|right now|fire in|unconscious|not breathing|sos|urgent)/i.test(q);
  return { docs: scored, isUrgent };
}

module.exports = { PROTOCOL_DOCS, retrieveProtocols };
