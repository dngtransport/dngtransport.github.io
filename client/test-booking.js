// DNG Transport Booking System - Test Script
// This file can be used to test the Google Apps Script connection

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbw8v2c1OFzepBk6Ue2hxqAuHULvLZLW6ok_7FE-gXnmCdA51mscFaNqRF1sAeYlSEhS/exec';

/**
 * Test function to verify the Google Apps Script connection
 */
async function testBookingSubmission() {
  const testBooking = {
    fullName: 'John Doe',
    phoneNumber: '0551234567',
    destination: 'Kumasi',
    travelDate: '2025-08-15',
    busType: 'sprinter',
    price: 117,
    currency: 'GHS',
    specialRequests: 'Test booking from website',
    emergencyName: 'Jane Doe',
    emergencyPhone: '0557654321',
    timestamp: new Date().toISOString()
  };

  try {
    console.log('🚀 Testing booking submission...');
    console.log('Data to send:', testBooking);

    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testBooking)
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ Success! Response:', result);

    if (result.success) {
      console.log(`🎫 Booking Reference: ${result.bookingReference}`);
      console.log(`📊 Sheet URL: ${result.sheetUrl || 'Not provided'}`);
      return result;
    } else {
      console.error('❌ Booking failed:', result.error);
      return null;
    }

  } catch (error) {
    console.error('❌ Error testing booking submission:', error);
    console.error('Error details:', error.message);
    return null;
  }
}

/**
 * Test the GET endpoint
 */
async function testGetEndpoint() {
  try {
    console.log('🔍 Testing GET endpoint...');
    
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'GET',
      mode: 'cors'
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ GET endpoint working:', result);
    return result;

  } catch (error) {
    console.error('❌ Error testing GET endpoint:', error);
    return null;
  }
}

// Export functions for use in browser console or Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    testBookingSubmission,
    testGetEndpoint,
    GOOGLE_SCRIPT_URL
  };
}

// Auto-run tests if in browser environment
if (typeof window !== 'undefined') {
  console.log('🚌 DNG Transport Booking Test Script Loaded');
  console.log('Run testBookingSubmission() to test booking submission');
  console.log('Run testGetEndpoint() to test API status');
}
