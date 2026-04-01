import { Food } from "@/types";

// ─── Open Food Facts API ──────────────────────────────────────────────────────
// Free, no key needed, 3M+ foods

const OFF_BASE = "https://world.openfoodfacts.org";

interface OFFProduct {
  product_name: string;
  brands?: string;
  serving_size?: string;
  nutriments: {
    "energy-kcal_serving"?: number;
    "energy-kcal_100g"?: number;
    proteins_serving?: number;
    proteins_100g?: number;
    carbohydrates_serving?: number;
    carbohydrates_100g?: number;
    fat_serving?: number;
    fat_100g?: number;
  };
}

function offProductToFood(barcode: string, p: OFFProduct): Food {
  const n = p.nutriments;
  const calories = n["energy-kcal_serving"] ?? n["energy-kcal_100g"] ?? 0;
  const protein = n.proteins_serving ?? n.proteins_100g ?? 0;
  const carbs = n.carbohydrates_serving ?? n.carbohydrates_100g ?? 0;
  const fat = n.fat_serving ?? n.fat_100g ?? 0;

  return {
    id: barcode,
    name: p.product_name || "Unknown food",
    emoji: "🍽️",
    brand: p.brands,
    servingSize: 1,
    servingUnit: p.serving_size ?? "serving",
    barcode,
    macros: {
      calories: Math.round(calories),
      protein: Math.round(protein * 10) / 10,
      carbs: Math.round(carbs * 10) / 10,
      fat: Math.round(fat * 10) / 10,
    },
  };
}

// ─── Search by text query ─────────────────────────────────────────────────────

export async function searchFoods(query: string): Promise<Food[]> {
  if (!query.trim()) return [];

  try {
    const url = `${OFF_BASE}/cgi/search.pl?search_terms=${encodeURIComponent(
      query
    )}&search_simple=1&action=process&json=1&page_size=20&fields=product_name,brands,serving_size,nutriments,code`;

    const res = await fetch(url);
    if (!res.ok) {
      console.error("Food search HTTP error:", res.status);
      return [];
    }

    const raw = await res.text();
    let json: any;
    try {
      json = JSON.parse(raw);
    } catch {
      console.error("Food search parse error: non-JSON response");
      return [];
    }

    return (json.products ?? [])
      .filter((p: any) => p.product_name && p.nutriments)
      .slice(0, 15)
      .map((p: any) => offProductToFood(p.code, p));
  } catch (err) {
    console.error("Food search error:", err);
    return [];
  }
}

// ─── Lookup by barcode ────────────────────────────────────────────────────────

export async function lookupBarcode(barcode: string): Promise<Food | null> {
  try {
    const url = `${OFF_BASE}/api/v0/product/${barcode}.json`;
    const res = await fetch(url);
    if (!res.ok) return null;

    const raw = await res.text();
    let json: any;
    try {
      json = JSON.parse(raw);
    } catch {
      return null;
    }

    if (json.status !== 1 || !json.product) return null;
    return offProductToFood(barcode, json.product);
  } catch (err) {
    console.error("Barcode lookup error:", err);
    return null;
  }
}

// ─── Parse voice transcript into a food name + quantity ──────────────────────
// Uses a simple OpenAI call to parse "2 cups of oatmeal with berries"
// into { name: "oatmeal with berries", quantity: 2, unit: "cups" }

export async function parseVoiceTranscript(
  transcript: string,
  openAiKey: string
): Promise<{ name: string; quantity: number; unit: string } | null> {
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openAiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              'You are a food parsing assistant. Parse the user\'s spoken food description into JSON with fields: name (string), quantity (number, default 1), unit (string, e.g. "cup", "serving", "piece"). Return ONLY valid JSON, no explanation.',
          },
          {
            role: "user",
            content: transcript,
          },
        ],
        max_tokens: 100,
        temperature: 0,
      }),
    });

    const json = await res.json();
    const content = json.choices?.[0]?.message?.content;
    if (!content) return null;

    const cleaned = String(content)
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    return JSON.parse(cleaned);
  } catch (err) {
    console.error("Voice parse error:", err);
    return null;
  }
}

// ─── Whisper transcription (audio -> text) ───────────────────────────────────

export async function transcribeVoiceAudio(
  audioUri: string,
  openAiKey: string
): Promise<string | null> {
  try {
    const form = new FormData();
    form.append("model", "whisper-1");
    form.append("response_format", "json");
    form.append("file", {
      // React Native FormData file shape
      uri: audioUri,
      name: "voice.m4a",
      type: "audio/m4a",
    } as any);

    const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openAiKey}`,
      },
      body: form,
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Whisper transcription error:", errorText);
      return null;
    }

    const json = await res.json();
    return json?.text?.trim() || null;
  } catch (err) {
    console.error("Whisper request failed:", err);
    return null;
  }
}
