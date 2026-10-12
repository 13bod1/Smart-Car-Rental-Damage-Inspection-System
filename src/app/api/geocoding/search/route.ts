import { NextResponse } from "next/server";

interface GeoResult {
  name: string;
  displayName: string;
  lat: number;
  lng: number;
  type?: string;
}

// Top curated places in Egypt & major global hubs as instant fallback guarantee
const EGYPT_POPULAR_PLACES: GeoResult[] = [
  { name: "Luxor (الأقصر)", displayName: "Luxor, Luxor Governorate, Egypt", lat: 25.6872, lng: 32.6396, type: "city" },
  { name: "Abu Simbel (أبو سمبل)", displayName: "Abu Simbel, Aswan Governorate, Egypt", lat: 22.3372, lng: 31.6258, type: "landmark" },
  { name: "Aswan City (أسوان)", displayName: "Aswan City, Aswan Governorate, Egypt", lat: 24.0889, lng: 32.8998, type: "city" },
  { name: "Philae Temple (معبد فيلة)", displayName: "Philae Island, Aswan Governorate, Egypt", lat: 24.0258, lng: 32.8844, type: "landmark" },
  { name: "Kom Ombo Temple", displayName: "Kom Ombo, Aswan Governorate, Egypt", lat: 24.4522, lng: 32.9284, type: "landmark" },
  { name: "Edfu Temple (معبد إدفو)", displayName: "Edfu, Aswan Governorate, Egypt", lat: 24.9780, lng: 32.8734, type: "landmark" },
  { name: "Marsa Alam (مرسى علم)", displayName: "Marsa Alam, Red Sea Governorate, Egypt", lat: 25.0676, lng: 34.8790, type: "city" },
  { name: "Hurghada (الغردقة)", displayName: "Hurghada, Red Sea Governorate, Egypt", lat: 27.2579, lng: 33.8116, type: "city" },
  { name: "Sharm El Sheikh (شرم الشيخ)", displayName: "Sharm El Sheikh, South Sinai, Egypt", lat: 27.9158, lng: 34.3299, type: "city" },
  { name: "Cairo (القاهرة)", displayName: "Cairo, Cairo Governorate, Egypt", lat: 30.0444, lng: 31.2357, type: "city" },
  { name: "Giza Pyramids (أهرامات الجيزة)", displayName: "Al Giza Desert, Giza Governorate, Egypt", lat: 29.9792, lng: 31.1342, type: "landmark" },
  { name: "Alexandria (الإسكندرية)", displayName: "Alexandria, Alexandria Governorate, Egypt", lat: 31.2001, lng: 29.9187, type: "city" },
  { name: "Siwa Oasis (سيوة)", displayName: "Siwa Oasis, Matrouh Governorate, Egypt", lat: 29.2032, lng: 25.5195, type: "landmark" },
  { name: "Dahab (دهب)", displayName: "Dahab, South Sinai Governorate, Egypt", lat: 28.5097, lng: 34.5136, type: "city" },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() || "";

  if (q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    // 1. Try OpenStreetMap Nominatim with proper User-Agent
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=8&addressdetails=1`;
    const res = await fetch(nominatimUrl, {
      headers: {
        "User-Agent": "AutoRentAI/1.0 (contact@autorent.app; rental service)",
        "Accept-Language": "en,ar",
      },
      next: { revalidate: 3600 },
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const results: GeoResult[] = data.map((item: any) => ({
          name: item.name || (item.display_name ? item.display_name.split(",")[0] : q),
          displayName: item.display_name,
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
          type: item.type || item.class || "place",
        }));
        return NextResponse.json({ results });
      }
    }
  } catch (err) {
    console.warn("Nominatim fetch failed, using fallback:", err);
  }

  try {
    // 2. Fallback to Photon OpenStreetMap API
    const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=8`;
    const photonRes = await fetch(photonUrl, { next: { revalidate: 3600 } });

    if (photonRes.ok) {
      const photonData = await photonRes.json();
      if (photonData?.features?.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const results: GeoResult[] = photonData.features.map((f: any) => {
          const props = f.properties || {};
          const coords = f.geometry?.coordinates || [0, 0];
          const name = props.name || props.city || props.street || q;
          const parts = [props.name, props.city, props.state, props.country].filter(Boolean);
          return {
            name: name,
            displayName: parts.join(", "),
            lat: coords[1],
            lng: coords[0],
            type: props.osm_value || "place",
          };
        });
        return NextResponse.json({ results });
      }
    }
  } catch (err) {
    console.warn("Photon fetch failed, using curated list:", err);
  }

  // 3. Fallback to matching Egypt curated list
  const lowerQ = q.toLowerCase();
  const matchedCurated = EGYPT_POPULAR_PLACES.filter(
    (p) => p.name.toLowerCase().includes(lowerQ) || p.displayName.toLowerCase().includes(lowerQ)
  );

  return NextResponse.json({ results: matchedCurated });
}
