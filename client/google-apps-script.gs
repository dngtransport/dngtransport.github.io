/**
 * Google Apps Script for DNG Transport Booking System
 * 
 * This script receives booking data from the web form and saves it to Google Sheets.
 * 
 * Setup Instructions:
 * 1. Go to script.google.com
 * 2. Create a new project
 * 3. Replace the default code with this script
 * 4. Deploy as a web app with these settings:
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 5. Copy the deployment URL and paste it in your HTML file where it says 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE'
 * 6. Create a Google Sheet and update the SHEET_ID below
 */

// Configuration
const SHEET_ID = 'YOUR_GOOGLE_SHEET_ID_HERE'; // Replace with your Google Sheet ID
const SHEET_NAME = 'Bookings'; // Name of the sheet tab

/**
 * Handle POST requests from the web form
 */
function doPost(e) {
  try {
    // Parse the request data
    const data = JSON.parse(e.postData.contents);
    
    // Generate a simple booking reference
    const bookingRef = generateBookingReference();
    data.bookingReference = bookingRef;
    
    // Save to Google Sheets
    const result = saveBookingToSheet(data);
    
    // Return success response
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: 'Booking saved successfully',
        bookingReference: bookingRef,
        data: {
          fullName: data.fullName,
          destination: data.destination,
          travelDate: data.travelDate,
          busType: data.busType,
          price: data.price
        },
        timestamp: new Date().toISOString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('Error processing booking:', error);
    
    // Return error response
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString(),
        timestamp: new Date().toISOString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handle GET requests (for testing)
 */
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({
      message: 'DNG Transport Booking API is running',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Generate a simple booking reference
 */
function generateBookingReference() {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  
  return `DNG${year}${month}${day}${random}`;
}

/**
 * Save booking data to Google Sheets
 */
function saveBookingToSheet(booking) {
  try {
    // Open the spreadsheet
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    
    // If sheet doesn't exist, create it with headers
    if (!sheet) {
      const newSheet = SpreadsheetApp.openById(SHEET_ID).insertSheet(SHEET_NAME);
      const headers = [
        'Timestamp',
        'Booking Reference',
        'Full Name',
        'Phone Number',
        'Destination',
        'Travel Date',
        'Bus Type',
        'Price (GHS)',
        'Special Requests',
        'Emergency Contact Name',
        'Emergency Contact Phone',
        'Status',
        'Payment Status',
        'Notes'
      ];
      newSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      newSheet.getRange(1, 1, 1, headers.length).setBackground('#4285f4').setFontColor('#ffffff').setFontWeight('bold');
      newSheet.setFrozenRows(1);
      
      // Auto-resize columns
      newSheet.autoResizeColumns(1, headers.length);
      
      return saveBookingToSheet(booking); // Retry with the newly created sheet
    }
    
    // Prepare the row data
    const rowData = [
      new Date(booking.timestamp || new Date()),
      booking.bookingReference || '',
      booking.fullName || '',
      booking.phoneNumber || '',
      booking.destination || '',
      booking.travelDate || '',
      booking.busType === 'vip' ? 'VIP' : 'Sprinter',
      booking.price || 0,
      booking.specialRequests || '',
      booking.emergencyName || '',
      booking.emergencyPhone || '',
      'Pending Confirmation',
      'Not Paid',
      ''
    ];
    
    // Add the row to the sheet
    sheet.appendRow(rowData);
    
    // Format the new row
    const lastRow = sheet.getLastRow();
    const range = sheet.getRange(lastRow, 1, 1, rowData.length);
    
    // Alternate row colors
    if (lastRow % 2 === 0) {
      range.setBackground('#f8f9fa');
    }
    
    // Format specific columns
    sheet.getRange(lastRow, 1).setNumberFormat('yyyy-mm-dd hh:mm:ss'); // Timestamp
    sheet.getRange(lastRow, 6).setNumberFormat('yyyy-mm-dd'); // Travel Date
    sheet.getRange(lastRow, 8).setNumberFormat('#,##0.00'); // Price
    
    // Auto-resize columns if needed
    sheet.autoResizeColumns(1, rowData.length);
    
    console.log(`Booking saved successfully for: ${booking.fullName}`);
    
    return {
      success: true,
      row: lastRow,
      data: booking
    };
    
  } catch (error) {
    console.error('Error saving to sheet:', error);
    throw new Error(`Failed to save booking: ${error.message}`);
  }
}

/**
 * Test function to verify the script works
 */
function testSaveBooking() {
  const testBooking = {
    fullName: 'John Doe',
    phoneNumber: '0551234567',
    destination: 'Kumasi',
    travelDate: '2025-08-15',
    busType: 'sprinter',
    price: 117,
    specialRequests: 'Please arrange pickup from Old Site Terminal',
    emergencyName: 'Jane Doe',
    emergencyPhone: '0557654321',
    timestamp: new Date().toISOString(),
    bookingReference: generateBookingReference()
  };
  
  try {
    const result = saveBookingToSheet(testBooking);
    console.log('Test successful:', result);
    return result;
  } catch (error) {
    console.error('Test failed:', error);
    return { success: false, error: error.toString() };
  }
}

/**
 * Initialize the sheet with proper formatting
 */
function initializeSheet() {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    
    if (sheet) {
      console.log('Sheet already exists');
      return;
    }
    
    // Create the sheet
    const newSheet = SpreadsheetApp.openById(SHEET_ID).insertSheet(SHEET_NAME);
    
    const headers = [
      'Timestamp',
      'Booking Reference',
      'Full Name',
      'Phone Number',
      'Destination',
      'Travel Date',
      'Bus Type',
      'Price (GHS)',
      'Special Requests',
      'Emergency Contact Name',
      'Emergency Contact Phone',
      'Status',
      'Payment Status',
      'Notes'
    ];
    
    // Set headers
    newSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    
    // Format headers
    const headerRange = newSheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground('#1e3c72');
    headerRange.setFontColor('#ffffff');
    headerRange.setFontWeight('bold');
    headerRange.setHorizontalAlignment('center');
    
    // Set column widths
    newSheet.setColumnWidth(1, 150); // Timestamp
    newSheet.setColumnWidth(2, 120); // Booking Reference
    newSheet.setColumnWidth(3, 150); // Full Name
    newSheet.setColumnWidth(4, 120); // Phone Number
    newSheet.setColumnWidth(5, 120); // Destination
    newSheet.setColumnWidth(6, 100); // Travel Date
    newSheet.setColumnWidth(7, 100); // Bus Type
    newSheet.setColumnWidth(8, 100); // Price
    newSheet.setColumnWidth(9, 250); // Special Requests
    newSheet.setColumnWidth(10, 150); // Emergency Contact Name
    newSheet.setColumnWidth(11, 120); // Emergency Contact Phone
    newSheet.setColumnWidth(12, 120); // Status
    newSheet.setColumnWidth(13, 120); // Payment Status
    newSheet.setColumnWidth(14, 200); // Notes
    
    // Freeze the header row
    newSheet.setFrozenRows(1);
    
    console.log('Sheet initialized successfully');
    
  } catch (error) {
    console.error('Error initializing sheet:', error);
    throw error;
  }
}

/**
 * Get booking statistics
 */
function getBookingStats() {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    
    if (!sheet || sheet.getLastRow() <= 1) {
      return { totalBookings: 0, totalRevenue: 0, destinations: {} };
    }
    
    const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 14).getValues();
    
    let totalRevenue = 0;
    const destinations = {};
    
    data.forEach(row => {
      const [timestamp, bookingRef, fullName, phoneNumber, destination, travelDate, busType, price] = row;
      
      if (destination) {
        if (!destinations[destination]) {
          destinations[destination] = { count: 0, revenue: 0, busTypes: {} };
        }
        destinations[destination].count++;
        destinations[destination].revenue += Number(price) || 0;
        
        if (!destinations[destination].busTypes[busType]) {
          destinations[destination].busTypes[busType] = 0;
        }
        destinations[destination].busTypes[busType]++;
      }
      
      totalRevenue += Number(price) || 0;
    });
    
    return {
      totalBookings: data.length,
      totalRevenue: totalRevenue,
      destinations: destinations
    };
    
  } catch (error) {
    console.error('Error getting booking stats:', error);
    return { error: error.toString() };
  }
}
