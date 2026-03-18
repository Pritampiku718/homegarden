import axios from 'axios';

// Your nursery coordinates from .env
const NURSERY_COORDS = {
  lat: process.env.NURSERY_LAT,
  lng: process.env.NURSERY_LNG
};

// Helper: Get coordinates from pincode using Nominatim
async function getCoordinatesFromPincode(pincode) {
  try {
    const url = `https://nominatim.openstreetmap.org/search?postalcode=${pincode}&country=India&format=json`;
    const response = await axios.get(url, {
      headers: { 'User-Agent': 'homegarden-app' }
    });

    if (!response.data || response.data.length === 0) {
      throw new Error('Invalid pincode');
    }

    const { lat, lon } = response.data[0];
    return {
      lat: parseFloat(lat),
      lng: parseFloat(lon)
    };
  } catch (error) {
    console.error('Nominatim error:', error.message);
    throw new Error('Failed to get location from pincode');
  }
}

// Helper: Get road distance using OSRM
async function getRoadDistance(startLng, startLat, endLng, endLat) {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=false`;
    const response = await axios.get(url);

    if (response.data.code !== 'Ok' || !response.data.routes?.length) {
      throw new Error('Could not calculate route');
    }

    // Distance is in meters, convert to kilometers
    const distanceInMeters = response.data.routes[0].distance;
    return distanceInMeters / 1000;
  } catch (error) {
    console.error('OSRM error:', error.message);
    throw new Error('Failed to calculate distance');
  }
}

// Delivery pricing rules
function calculateDeliveryDetails(distance, plantsTotal) {
  // Free delivery if total >= ₹500
  if (plantsTotal >= 500) {
    return {
      distance: parseFloat(distance.toFixed(1)),
      deliveryCharge: 0,
      deliveryTime: 'Free Delivery'
    };
  }

  // Not available beyond 120 km
  if (distance > 120) {
    return {
      available: false,
      message: 'Delivery not available in your area'
    };
  }

  let deliveryCharge, deliveryTime;

  if (distance <= 5) {
    deliveryCharge = 40;
    deliveryTime = 'Same day';
  } else if (distance <= 10) {
    deliveryCharge = 60;
    deliveryTime = 'Same day';
  } else if (distance <= 20) {
    deliveryCharge = 90;
    deliveryTime = 'Same day';
  } else if (distance <= 40) {
    deliveryCharge = 120;
    deliveryTime = '1–2 days';
  } else if (distance <= 60) {
    deliveryCharge = 150;
    deliveryTime = '2 days';
  } else if (distance <= 80) {
    deliveryCharge = 175;
    deliveryTime = '2–3 days';
  } else if (distance <= 120) {
    deliveryCharge = 200;
    deliveryTime = '3 days';
  }

  return {
    distance: parseFloat(distance.toFixed(1)),
    deliveryCharge,
    deliveryTime
  };
}

// GET /api/delivery/:pincode?total=xxx
export const getDeliveryInfo = async (req, res) => {
  try {
    const { pincode } = req.params;
    const { total } = req.query;

    // Validation
    if (!pincode || pincode.length !== 6) {
      return res.status(400).json({
        error: 'Valid 6-digit pincode is required'
      });
    }

    if (!total || isNaN(total)) {
      return res.status(400).json({
        error: 'Valid total amount is required'
      });
    }

    const plantsTotal = parseFloat(total);

    // Step 1: Get customer coordinates from pincode
    const customerCoords = await getCoordinatesFromPincode(pincode);

    // Step 2: Calculate road distance
    const distance = await getRoadDistance(
      NURSERY_COORDS.lng, NURSERY_COORDS.lat,
      customerCoords.lng, customerCoords.lat
    );

    // Step 3: Apply pricing rules
    const result = calculateDeliveryDetails(distance, plantsTotal);

    // If delivery not available
    if (result.available === false) {
      return res.json({
        available: false,
        message: result.message
      });
    }

    // Return delivery info
    res.json({
      distance: result.distance,
      deliveryCharge: result.deliveryCharge,
      deliveryTime: result.deliveryTime
    });

  } catch (error) {
    console.error('Delivery calculation error:', error);
    res.status(500).json({
      error: error.message || 'Failed to calculate delivery'
    });
  }
};