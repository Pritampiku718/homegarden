import express from 'express';
import validatePIN from 'indian-pincode-details';

const router = express.Router();

// GET /api/pincode/:pincode
router.get('/:pincode', async (req, res) => {
  try {
    const { pincode } = req.params;
    
    // Validate pincode format (6 digits)
    if (!pincode || pincode.length !== 6 || !/^\d+$/.test(pincode)) {
      return res.status(400).json({ 
        error: 'Invalid pincode format' 
      });
    }
    
    // Fetch pincode details
    const result = await validatePIN(pincode);
    
    if (!result) {
      return res.status(404).json({ 
        error: 'Pincode not found' 
      });
    }
    
    // Return the city/district and state
    res.json({
      pincode: result.Pincode,
      city: result.District,      // District serves as city
      state: result.State,
      postOffice: result.PostOffice,
      country: result.Country
    });
    
  } catch (error) {
    console.error('Pincode lookup error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch pincode details' 
    });
  }
});

export default router;