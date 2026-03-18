import axios from "axios";

// Your nursery coordinates from .env
const NURSERY_COORDS = {
  lat: parseFloat(process.env.NURSERY_LAT) || 22.988528,
  lng: parseFloat(process.env.NURSERY_LNG) || 88.707944,
};

// GraphHopper API key from environment
const GRAPHHOPPER_API_KEY = process.env.GRAPHHOPPER_API_KEY;

// Cache for coordinates and distances
const coordinatesCache = new Map();
const distanceCache = new Map();

// Helper: Calculate straight-line distance (Haversine formula) as fallback
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Helper: Get coordinates from pincode using Nominatim
async function getCoordinatesFromPincode(pincode) {
  // Check cache first
  if (coordinatesCache.has(pincode)) {
    console.log("📍 Using cached coordinates for:", pincode);
    return coordinatesCache.get(pincode);
  }

  try {
    const url = `https://nominatim.openstreetmap.org/search?postalcode=${pincode}&country=India&format=json`;
    console.log("📍 Fetching coordinates from Nominatim for:", pincode);

    const response = await axios.get(url, {
      headers: {
        "User-Agent": "homegarden-app",
        "Accept-Language": "en",
      },
      timeout: 5000,
    });

    if (response.data && response.data.length > 0) {
      const { lat, lon } = response.data[0];
      const coords = {
        lat: parseFloat(lat),
        lng: parseFloat(lon),
      };
      console.log("✅ Found coordinates:", coords);
      coordinatesCache.set(pincode, coords);
      return coords;
    }

    // Fallback coordinates for common pincodes in West Bengal
    const fallbackCoords = {
      743249: { lat: 22.8956, lng: 88.4167 }, // Nahata
      743251: { lat: 22.89, lng: 88.42 }, // Nahata area
      743290: { lat: 22.8956, lng: 88.4167 }, // Gopalnagar
      743235: { lat: 22.885, lng: 88.425 }, // Habra
      743245: { lat: 22.88, lng: 88.43 }, // Gaighata
      743263: { lat: 22.87, lng: 88.44 }, // Bongaon
      743270: { lat: 22.86, lng: 88.45 }, // Bangaon
      700001: { lat: 22.5726, lng: 88.3639 }, // Kolkata
      700002: { lat: 22.5744, lng: 88.3629 },
      700003: { lat: 22.5789, lng: 88.3567 },
      700004: { lat: 22.5697, lng: 88.3698 },
      700005: { lat: 22.5711, lng: 88.3733 },
      700006: { lat: 22.5722, lng: 88.3778 },
      700007: { lat: 22.5733, lng: 88.3822 },
      700008: { lat: 22.5744, lng: 88.3867 },
      700009: { lat: 22.5756, lng: 88.3911 },
      700010: { lat: 22.5767, lng: 88.3956 },
    };

    if (fallbackCoords[pincode]) {
      console.log("📍 Using fallback coordinates for pincode:", pincode);
      coordinatesCache.set(pincode, fallbackCoords[pincode]);
      return fallbackCoords[pincode];
    }

    throw new Error("No coordinates found for pincode");
  } catch (error) {
    console.error("❌ Error getting coordinates:", error.message);

    // Return approximate coordinates based on pincode
    // This is a rough estimation for West Bengal
    const firstTwoDigits = parseInt(pincode.substring(0, 2));
    if (firstTwoDigits >= 70 && firstTwoDigits <= 74) {
      // West Bengal range
      const approxCoords = {
        lat: 22.5 + Math.random() * 0.5,
        lng: 88.3 + Math.random() * 0.3,
      };
      console.log("📍 Using approximate coordinates:", approxCoords);
      return approxCoords;
    }

    // Ultimate fallback: return nursery coordinates
    console.log("📍 Using nursery coordinates as fallback");
    return NURSERY_COORDS;
  }
}

// Helper: Get road distance using GraphHopper (primary) with fallback
async function getRoadDistance(startLng, startLat, endLng, endLat) {
  const cacheKey = `${startLat},${startLng}-${endLat},${endLng}`;

  // Check cache first
  if (distanceCache.has(cacheKey)) {
    console.log("📍 Using cached distance");
    return distanceCache.get(cacheKey);
  }

  // Try GraphHopper first (most reliable)
  try {
    console.log("📍 Trying GraphHopper API...");
    const url = `https://graphhopper.com/api/1/route?point=${startLat},${startLng}&point=${endLat},${endLng}&vehicle=car&locale=en&instructions=false&calc_points=false&key=${GRAPHHOPPER_API_KEY}`;

    const response = await axios.get(url, { timeout: 8000 });

    if (response.data.paths && response.data.paths.length > 0) {
      const distanceInMeters = response.data.paths[0].distance;
      const distanceInKm = distanceInMeters / 1000;
      console.log(`✅ GraphHopper success: ${distanceInKm.toFixed(1)} km`);
      distanceCache.set(cacheKey, distanceInKm);
      return distanceInKm;
    }

    throw new Error("GraphHopper returned no routes");
  } catch (graphHopperError) {
    console.log("⚠️ GraphHopper failed:", graphHopperError.message);

    // Fallback to OSRM
    try {
      console.log("📍 Trying OSRM as fallback...");
      const url = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=false`;

      const response = await axios.get(url, { timeout: 5000 });

      if (response.data.code === "Ok" && response.data.routes?.length > 0) {
        const distanceInMeters = response.data.routes[0].distance;
        const distanceInKm = distanceInMeters / 1000;
        console.log(`✅ OSRM success: ${distanceInKm.toFixed(1)} km`);
        distanceCache.set(cacheKey, distanceInKm);
        return distanceInKm;
      }

      throw new Error("OSRM failed");
    } catch (osrmError) {
      console.log("⚠️ OSRM failed, using straight-line calculation");

      // Ultimate fallback: straight-line with terrain factor
      const straightDistance = calculateHaversineDistance(
        startLat,
        startLng,
        endLat,
        endLng,
      );

      // Apply terrain factor based on region
      let terrainFactor = 1.3; // Default factor

      // Check if destination is in Kolkata (more direct roads)
      if (endLat > 22.5 && endLat < 22.6 && endLng > 88.3 && endLng < 88.4) {
        terrainFactor = 1.2; // Urban area with better roads
      }
      // Check if destination is in North 24 Parganas (mixed)
      else if (
        endLat > 22.8 &&
        endLat < 23.0 &&
        endLng > 88.4 &&
        endLng < 88.5
      ) {
        terrainFactor = 1.35; // Semi-urban
      }

      const estimatedDistance = straightDistance * terrainFactor;
      console.log(`📍 Estimated distance: ${estimatedDistance.toFixed(1)} km`);
      distanceCache.set(cacheKey, estimatedDistance);
      return estimatedDistance;
    }
  }
}

// Delivery pricing rules (exact calculation)
function calculateDeliveryDetails(distance, plantsTotal) {
  console.log(
    "📍 Calculating delivery for distance:",
    distance.toFixed(1),
    "km",
  );

  // Free delivery if total >= ₹500
  if (plantsTotal >= 500) {
    return {
      distance: parseFloat(distance.toFixed(1)),
      deliveryCharge: 0,
      deliveryTime: "Free Delivery",
      available: true,
    };
  }

  // Not available beyond 120 km
  if (distance > 120) {
    return {
      available: false,
      message: "Delivery not available in your area (distance > 120km)",
    };
  }

  // Exact pricing based on distance brackets
  let deliveryCharge, deliveryTime;

  if (distance <= 5) {
    deliveryCharge = 40;
    deliveryTime = "Same day";
  } else if (distance <= 10) {
    deliveryCharge = 60;
    deliveryTime = "Same day";
  } else if (distance <= 15) {
    deliveryCharge = 75;
    deliveryTime = "Same day";
  } else if (distance <= 20) {
    deliveryCharge = 90;
    deliveryTime = "Same day";
  } else if (distance <= 25) {
    deliveryCharge = 100;
    deliveryTime = "1 day";
  } else if (distance <= 30) {
    deliveryCharge = 110;
    deliveryTime = "1 day";
  } else if (distance <= 40) {
    deliveryCharge = 120;
    deliveryTime = "1–2 days";
  } else if (distance <= 50) {
    deliveryCharge = 135;
    deliveryTime = "1–2 days";
  } else if (distance <= 60) {
    deliveryCharge = 150;
    deliveryTime = "2 days";
  } else if (distance <= 70) {
    deliveryCharge = 160;
    deliveryTime = "2 days";
  } else if (distance <= 80) {
    deliveryCharge = 175;
    deliveryTime = "2–3 days";
  } else if (distance <= 90) {
    deliveryCharge = 185;
    deliveryTime = "2–3 days";
  } else if (distance <= 100) {
    deliveryCharge = 190;
    deliveryTime = "3 days";
  } else if (distance <= 120) {
    deliveryCharge = 200;
    deliveryTime = "3 days";
  }

  return {
    distance: parseFloat(distance.toFixed(1)),
    deliveryCharge,
    deliveryTime,
    available: true,
  };
}

// GET /api/delivery/:pincode?total=xxx
export const getDeliveryInfo = async (req, res) => {
  try {
    const { pincode } = req.params;
    const { total } = req.query;

    console.log("=".repeat(60));
    console.log("🚚 DELIVERY CALCULATION REQUEST");
    console.log("=".repeat(60));
    console.log("📍 Pincode:", pincode);
    console.log("💰 Total:", total);
    console.log("📍 Nursery coordinates:", NURSERY_COORDS);
    console.log(
      "🔑 GraphHopper API Key:",
      GRAPHHOPPER_API_KEY ? "✅ Configured" : "❌ Missing",
    );

    // Validation
    if (!pincode || pincode.length !== 6) {
      return res.status(400).json({
        error: "Valid 6-digit pincode is required",
      });
    }

    if (!total || isNaN(total)) {
      return res.status(400).json({
        error: "Valid total amount is required",
      });
    }

    const plantsTotal = parseFloat(total);

    // Step 1: Get customer coordinates from pincode
    const customerCoords = await getCoordinatesFromPincode(pincode);
    console.log("📍 Customer coordinates:", customerCoords);

    // Step 2: Calculate road distance using GraphHopper
    const distance = await getRoadDistance(
      NURSERY_COORDS.lng,
      NURSERY_COORDS.lat,
      customerCoords.lng,
      customerCoords.lat,
    );

    console.log("📍 Final calculated distance:", distance.toFixed(1), "km");

    // Step 3: Apply pricing rules
    const result = calculateDeliveryDetails(distance, plantsTotal);
    console.log("📦 Delivery result:", result);

    // If delivery not available
    if (result.available === false) {
      return res.json({
        available: false,
        message: result.message,
      });
    }

    // Return delivery info
    res.json({
      distance: result.distance,
      deliveryCharge: result.deliveryCharge,
      deliveryTime: result.deliveryTime,
      available: true,
    });
  } catch (error) {
    console.error("❌ Delivery calculation error:", error);

    // Return a reasonable fallback
    res.json({
      distance: 25.0,
      deliveryCharge: 90,
      deliveryTime: "2-3 business days",
      available: true,
      note: "Approximate calculation",
    });
  }
};
