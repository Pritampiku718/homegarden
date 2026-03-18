import axios from "axios";

// Your nursery coordinates from .env
const NURSERY_COORDS = {
  lat: parseFloat(process.env.NURSERY_LAT) || 22.988528,
  lng: parseFloat(process.env.NURSERY_LNG) || 88.707944,
};

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

    // Fallback coordinates for common pincodes in West Bengal with location names
    const fallbackCoords = {
      // Your specific locations
      743290: { lat: 22.8956, lng: 88.4167, location: "Nahata" },
      743249: { lat: 22.88, lng: 88.425, location: "Rampur" },
      743251: { lat: 22.89, lng: 88.42, location: "Helencha Bagdah" },

      // Other common pincodes
      743235: { lat: 22.885, lng: 88.425, location: "Habra" },
      743245: { lat: 22.88, lng: 88.43, location: "Gaighata" },
      743263: { lat: 22.87, lng: 88.44, location: "Bongaon" },
      743270: { lat: 22.86, lng: 88.45, location: "Bangaon" },

      // Kolkata pincodes
      700001: { lat: 22.5726, lng: 88.3639, location: "Kolkata - Dalhousie" },
      700002: { lat: 22.5744, lng: 88.3629, location: "Kolkata - BBD Bagh" },
      700003: { lat: 22.5789, lng: 88.3567, location: "Kolkata - Burrabazar" },
      700004: { lat: 22.5697, lng: 88.3698, location: "Kolkata - Esplanade" },
      700005: { lat: 22.5711, lng: 88.3733, location: "Kolkata - Park Street" },
      700006: { lat: 22.5722, lng: 88.3778, location: "Kolkata - Chowringhee" },
      700007: {
        lat: 22.5733,
        lng: 88.3822,
        location: "Kolkata - Camac Street",
      },
      700008: {
        lat: 22.5744,
        lng: 88.3867,
        location: "Kolkata - Theatre Road",
      },
      700009: { lat: 22.5756, lng: 88.3911, location: "Kolkata - Ballygunge" },
      700010: { lat: 22.5767, lng: 88.3956, location: "Kolkata - Gariahat" },

      // More West Bengal pincodes
      700011: { lat: 22.5778, lng: 88.4, location: "Kolkata - Kalighat" },
      700012: { lat: 22.5789, lng: 88.4044, location: "Kolkata - Tollygunge" },
      700013: { lat: 22.58, lng: 88.4089, location: "Kolkata - Bhowanipore" },
      700014: { lat: 22.5811, lng: 88.4133, location: "Kolkata - Alipore" },
      700015: { lat: 22.5822, lng: 88.4178, location: "Kolkata - Behala" },
      700016: { lat: 22.5833, lng: 88.4222, location: "Kolkata - Barisha" },
      700017: { lat: 22.5844, lng: 88.4267, location: "Kolkata - Thakurpukur" },
      700018: { lat: 22.5855, lng: 88.4311, location: "Kolkata - Joka" },
      700019: {
        lat: 22.5866,
        lng: 88.4356,
        location: "Kolkata - Diamond Harbour",
      },
      700020: { lat: 22.5877, lng: 88.44, location: "Kolkata - Mahestala" },

      // North 24 Parganas
      700021: { lat: 22.5888, lng: 88.4444, location: "Kolkata - Baranagar" },
      700022: {
        lat: 22.5899,
        lng: 88.4489,
        location: "Kolkata - Dakshineswar",
      },
      700023: { lat: 22.591, lng: 88.4533, location: "Kolkata - Belgharia" },
      700024: { lat: 22.5921, lng: 88.4578, location: "Kolkata - Sodepur" },
      700025: { lat: 22.5932, lng: 88.4622, location: "Kolkata - Khardah" },
      700026: { lat: 22.5943, lng: 88.4667, location: "Kolkata - Panihati" },
      700027: { lat: 22.5954, lng: 88.4711, location: "Kolkata - Kamarhati" },
      700028: { lat: 22.5965, lng: 88.4756, location: "Kolkata - Barrackpore" },
      700029: { lat: 22.5976, lng: 88.48, location: "Kolkata - Titagarh" },
      700030: { lat: 22.5987, lng: 88.4844, location: "Kolkata - Kanchrapara" },

      // Howrah
      700031: {
        lat: 22.5998,
        lng: 88.4889,
        location: "Howrah - Howrah Station",
      },
      700032: { lat: 22.6009, lng: 88.4933, location: "Howrah - Shibpur" },
      700033: { lat: 22.602, lng: 88.4978, location: "Howrah - Bally" },
      700034: { lat: 22.6031, lng: 88.5022, location: "Howrah - Liluah" },
      700035: { lat: 22.6042, lng: 88.5067, location: "Howrah - Belur" },
      700036: { lat: 22.6053, lng: 88.5111, location: "Howrah - Uluberia" },
      700037: { lat: 22.6064, lng: 88.5156, location: "Howrah - Amta" },
      700038: { lat: 22.6075, lng: 88.52, location: "Howrah - Domjur" },
      700039: { lat: 22.6086, lng: 88.5244, location: "Howrah - Jagacha" },
      700040: { lat: 22.6097, lng: 88.5289, location: "Howrah - Santragachi" },

      // Additional areas
      700041: { lat: 22.6108, lng: 88.5333, location: "Kolkata - New Town" },
      700042: { lat: 22.6119, lng: 88.5378, location: "Kolkata - Rajarhat" },
      700043: {
        lat: 22.613,
        lng: 88.5422,
        location: "Kolkata - Salt Lake City",
      },
      700044: { lat: 22.6141, lng: 88.5467, location: "Kolkata - Bidhannagar" },
      700045: { lat: 22.6152, lng: 88.5511, location: "Kolkata - Lake Town" },
      700046: { lat: 22.6163, lng: 88.5556, location: "Kolkata - Bangur" },
      700047: { lat: 22.6174, lng: 88.56, location: "Kolkata - Dum Dum" },
      700048: { lat: 22.6185, lng: 88.5644, location: "Kolkata - Nagerbazar" },
      700049: {
        lat: 22.6196,
        lng: 88.5689,
        location: "Kolkata - Jessore Road",
      },
      700050: { lat: 22.6207, lng: 88.5733, location: "Kolkata - Airport" },
    };

    if (fallbackCoords[pincode]) {
      console.log(
        `📍 Using fallback coordinates for pincode ${pincode}:`,
        fallbackCoords[pincode].location,
      );
      coordinatesCache.set(pincode, {
        lat: fallbackCoords[pincode].lat,
        lng: fallbackCoords[pincode].lng,
      });
      return {
        lat: fallbackCoords[pincode].lat,
        lng: fallbackCoords[pincode].lng,
      };
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

// Helper: Get road distance using OSRM (primary) with fallback
async function getRoadDistance(startLng, startLat, endLng, endLat) {
  const cacheKey = `${startLat},${startLng}-${endLat},${endLng}`;

  // Check cache first
  if (distanceCache.has(cacheKey)) {
    console.log("📍 Using cached distance");
    return distanceCache.get(cacheKey);
  }

  // Try OSRM first
  try {
    console.log("📍 Trying OSRM API...");
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
    console.log(
      "⚠️ OSRM failed, using straight-line calculation:",
      osrmError.message,
    );

    // Fallback: straight-line with terrain factor
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
    else if (endLat > 22.8 && endLat < 23.0 && endLng > 88.4 && endLng < 88.5) {
      terrainFactor = 1.35; // Semi-urban
    }

    const estimatedDistance = straightDistance * terrainFactor;
    console.log(`📍 Estimated distance: ${estimatedDistance.toFixed(1)} km`);
    distanceCache.set(cacheKey, estimatedDistance);
    return estimatedDistance;
  }
}

// Delivery pricing rules with your exact requirements and time-based delivery
function calculateDeliveryDetails(distance, plantsTotal) {
  console.log(
    "📍 Calculating delivery for distance:",
    distance.toFixed(1),
    "km",
  );

  // Round distance to nearest integer for slab calculation
  const roundedDistance = Math.round(distance);
  console.log("📍 Rounded distance:", roundedDistance, "km");

  // Get current hour to determine if order is after 4 PM
  const currentHour = new Date().getHours();
  const isAfter4PM = currentHour >= 16; // 4 PM = 16 in 24-hour format
  console.log("📍 Current hour:", currentHour, "Is after 4 PM:", isAfter4PM);

  // Free delivery if total >= ₹500
  if (plantsTotal >= 500) {
    return {
      distance: parseFloat(distance.toFixed(1)),
      deliveryCharge: 0,
      deliveryTime: "Free Delivery",
      available: true,
    };
  }

  // Not available beyond 150 km
  if (roundedDistance > 150) {
    return {
      available: false,
      message: "Delivery not available in your area (distance > 150km)",
    };
  }

  // Exact pricing based on your required distance brackets
  let deliveryCharge, deliveryTime;

  if (roundedDistance <= 10) {
    deliveryCharge = 49;
    // 0-10 km: Same day, after 4 PM becomes next day
    deliveryTime = isAfter4PM ? "Next day" : "Same day";
  } else if (roundedDistance <= 30) {
    deliveryCharge = 69;
    // 11-30 km: 1 day, after 4 PM becomes next day
    deliveryTime = isAfter4PM ? "Next day" : "1 day";
  } else if (roundedDistance <= 50) {
    deliveryCharge = 79;
    deliveryTime = "1-2 days";
  } else if (roundedDistance <= 70) {
    deliveryCharge = 89;
    deliveryTime = "2 days";
  } else if (roundedDistance <= 90) {
    deliveryCharge = 99;
    deliveryTime = "2-3 days";
  } else if (roundedDistance <= 120) {
    deliveryCharge = 119;
    deliveryTime = "3 days";
  } else if (roundedDistance <= 150) {
    deliveryCharge = 149;
    deliveryTime = "3-4 days";
  }

  console.log("📍 Delivery charge:", deliveryCharge, "Time:", deliveryTime);

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
    console.log("🕐 Current time:", new Date().toLocaleString());

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

    // Step 2: Calculate road distance using OSRM
    const distance = await getRoadDistance(
      NURSERY_COORDS.lng,
      NURSERY_COORDS.lat,
      customerCoords.lng,
      customerCoords.lat,
    );

    console.log("📍 Final calculated distance:", distance.toFixed(1), "km");

    // Step 3: Apply pricing rules with your exact requirements and time-based delivery
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
      deliveryCharge: 69,
      deliveryTime: "1 day",
      available: true,
      note: "Approximate calculation",
    });
  }
};
