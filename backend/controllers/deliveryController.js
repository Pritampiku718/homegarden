import axios from 'axios';

// Your nursery coordinates from .env
const NURSERY_COORDS = {
  lat: process.env.NURSERY_LAT,
  lng: process.env.NURSERY_LNG
};

// Helper: Calculate straight-line distance (Haversine formula) as fallback
function calculateStraightDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in kilometers
}

// Helper: Get coordinates from pincode using Nominatim
async function getCoordinatesFromPincode(pincode) {
  try {
    const url = `https://nominatim.openstreetmap.org/search?postalcode=${pincode}&country=India&format=json`;
    console.log('📍 Nominatim URL:', url);
    
    const response = await axios.get(url, {
      headers: { 'User-Agent': 'homegarden-app' },
      timeout: 5000
    });

    if (!response.data || response.data.length === 0) {
      console.log('⚠️ No coordinates found for pincode:', pincode);
      
      // Fallback coordinates for common pincodes in West Bengal
      const pincodeMap = {
        '743249': { lat: 22.8956, lng: 88.4167 }, // Nahata area
        '743251': { lat: 22.8900, lng: 88.4200 },
        '743290': { lat: 22.8956, lng: 88.4167 },
        '743235': { lat: 22.8850, lng: 88.4250 },
        '743245': { lat: 22.8800, lng: 88.4300 },
        '700001': { lat: 22.5726, lng: 88.3639 }, // Kolkata
        '700002': { lat: 22.5744, lng: 88.3629 },
        '700003': { lat: 22.5789, lng: 88.3567 },
      };
      
      if (pincodeMap[pincode]) {
        console.log('📍 Using fallback coordinates for pincode:', pincode, pincodeMap[pincode]);
        return pincodeMap[pincode];
      }
      
      // Default to Kolkata coordinates if pincode not found
      console.log('📍 Using default Kolkata coordinates');
      return { lat: 22.5726, lng: 88.3639 };
    }

    const { lat, lon } = response.data[0];
    return {
      lat: parseFloat(lat),
      lng: parseFloat(lon)
    };
  } catch (error) {
    console.error('❌ Nominatim error:', error.message);
    
    // Return default coordinates on error
    console.log('📍 Using default coordinates due to error');
    return { lat: 22.5726, lng: 88.3639 };
  }
}

// Helper: Get road distance using OSRM with fallback
async function getRoadDistance(startLng, startLat, endLng, endLat) {
  try {
    console.log('📍 Attempting OSRM routing...');
    const url = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=false`;
    
    const response = await axios.get(url, {
      timeout: 5000,
      headers: { 'User-Agent': 'homegarden-app' }
    });

    if (response.data.code === 'Ok' && response.data.routes?.length > 0) {
      const distanceInMeters = response.data.routes[0].distance;
      const distanceInKm = distanceInMeters / 1000;
      console.log('✅ OSRM success, distance:', distanceInKm.toFixed(1), 'km');
      return distanceInKm;
    }

    throw new Error('OSRM route not found');
    
  } catch (error) {
    console.log('⚠️ OSRM failed, using straight-line distance as fallback');
    console.log('📍 Error details:', error.message);
    
    // Fallback: Calculate straight-line distance
    const straightDistance = calculateStraightDistance(
      parseFloat(startLat), parseFloat(startLng),
      parseFloat(endLat), parseFloat(endLng)
    );
    
    // Multiply by 1.3 to approximate road distance (typical detour factor)
    const estimatedRoadDistance = straightDistance * 1.3;
    console.log('📍 Estimated road distance:', estimatedRoadDistance.toFixed(1), 'km');
    
    return estimatedRoadDistance;
  }
}

// Delivery pricing rules
function calculateDeliveryDetails(distance, plantsTotal) {
  console.log('📍 Calculating delivery for distance:', distance.toFixed(1), 'km');
  
  // Free delivery if total >= ₹500
  if (plantsTotal >= 500) {
    return {
      distance: parseFloat(distance.toFixed(1)),
      deliveryCharge: 0,
      deliveryTime: 'Free Delivery',
      available: true
    };
  }

  // Not available beyond 120 km
  if (distance > 120) {
    return {
      available: false,
      message: 'Delivery not available in your area (distance > 120km)'
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
    deliveryTime,
    available: true
  };
}

// GET /api/delivery/:pincode?total=xxx
export const getDeliveryInfo = async (req, res) => {
  try {
    const { pincode } = req.params;
    const { total } = req.query;

    console.log('🚚 Delivery request for pincode:', pincode, 'total:', total);

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

    // Get nursery coordinates with fallback
    const nurseryCoords = {
      lat: parseFloat(process.env.NURSERY_LAT) || 22.988528,
      lng: parseFloat(process.env.NURSERY_LNG) || 88.707944
    };

    console.log('📍 Nursery coordinates:', nurseryCoords);

    // Step 1: Get customer coordinates from pincode
    const customerCoords = await getCoordinatesFromPincode(pincode);
    console.log('📍 Customer coordinates:', customerCoords);

    // Step 2: Calculate distance (try OSRM first, fallback to straight-line)
    const distance = await getRoadDistance(
      nurseryCoords.lng, nurseryCoords.lat,
      customerCoords.lng, customerCoords.lat
    );

    console.log('📍 Final calculated distance:', distance.toFixed(1), 'km');

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
      deliveryTime: result.deliveryTime,
      available: true
    });

  } catch (error) {
    console.error('❌ Delivery calculation error:', error);
    
    // Always return a valid response even on error
    res.json({
      distance: 25.0,
      deliveryCharge: 90,
      deliveryTime: '2-3 business days',
      available: true,
      note: 'Approximate delivery calculation'
    });
  }
};