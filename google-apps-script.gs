/**
 * DNG Transport Booking System - Google Apps Script
 * Updated to match website fields and requirements
 */

// Configuration
const SHEET_ID = '1bYFCkDn6OMfBfDXS0VP8ulOa91cknvnChs95_qwhCk0';
const SHEET_NAME = 'dngtransport';

// Minimal Brand Colors - Professional Design
const BRAND_COLORS = {
  primary: '#2563eb',     // Professional blue
  light: '#f1f5f9',       // Very light gray
  white: '#ffffff',       // White
  border: '#e2e8f0',      // Light border
  text: '#334155',        // Professional gray
  success: '#10b981',     // Clean green
  warning: '#f59e0b'      // Clean amber
};

/**
 * Creates a booking sheet matching website fields
 */
function createBookingSheet() {
  try {
    const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
    let sheet = spreadsheet.getSheetByName(SHEET_NAME);
    
    // Create or reset the sheet
    if (sheet) {
      try {
        const dataRange = sheet.getDataRange();
        if (dataRange.getNumRows() > 0 && dataRange.getNumColumns() > 0) {
          dataRange.breakApart();
        }
        sheet.clear();
      } catch (e) {
        Logger.log('Sheet clearing completed: ' + e.message);
      }
    } else {
      sheet = spreadsheet.insertSheet(SHEET_NAME);
    }

    // Website-matching headers
    const headers = [
      "Timestamp",
      "Booking ID",
      "Full Name",
      "Phone",
      "Destination",
      "Pickup Point",
      "Travel Date",
      "Bus Type",
      "Price (GHS)",
      "Payer Name",
      "Emergency Name",
      "Emergency Phone",
      "Status",
      "Payment Status"
    ];

    // Set up header row
    sheet.getRange(1, 1, 1, headers.length)
      .setValues([headers])
      .setFontWeight("bold")
      .setBackground(BRAND_COLORS.primary)
      .setFontColor(BRAND_COLORS.white)
      .setHorizontalAlignment("center")
      .setBorder(true, true, true, true, false, false, BRAND_COLORS.border, SpreadsheetApp.BorderStyle.SOLID);

    // Freeze header row
    sheet.setFrozenRows(1);

    // Set column widths
    const columnWidths = [150, 140, 150, 120, 120, 150, 120, 100, 90, 150, 150, 150, 120, 120];
    columnWidths.forEach((width, index) => {
      sheet.setColumnWidth(index + 1, width);
    });

    // Apply formatting
    setupColumnFormatting(sheet);
    addDropdownValidation(sheet);

    Logger.log('✅ Booking sheet created successfully');
    return sheet;
    
  } catch (error) {
    Logger.log('❌ Error creating sheet: ' + error.message);
    throw error;
  }
}

/**
 * Setup column formatting
 */
function setupColumnFormatting(sheet) {
  // Date columns formatting
  sheet.getRange('A2:A').setNumberFormat('yyyy-mm-dd hh:mm:ss');
  sheet.getRange('G2:G').setNumberFormat('yyyy-mm-dd');
  
  // Price column formatting
  sheet.getRange('I2:I').setNumberFormat('₵#,##0.00');
  
  // Text alignment
  const centerCols = [1, 2, 4, 6, 7, 8, 12, 13]; // Timestamp, ID, Phone, Travel Date, Bus Type, Price, Status
  centerCols.forEach(col => {
    sheet.getRange(2, col, sheet.getMaxRows() - 1).setHorizontalAlignment('center');
  });
}

/**
 * Add dropdown validation
 */
function addDropdownValidation(sheet) {
  // Bus Type dropdown
  const busTypeRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['Sprinter', 'VIP'], true)
    .build();
  sheet.getRange('H2:H').setDataValidation(busTypeRule);

  // Status dropdown
  const statusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['Pending', 'Confirmed', 'Cancelled'], true)
    .build();
  sheet.getRange('M2:M').setDataValidation(statusRule);

  // Payment Status dropdown
  const paymentRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['UnPaid', 'Paid', 'Refunded'], true)
    .build();
  sheet.getRange('N2:N').setDataValidation(paymentRule);
}

/**
 * Save booking data to the sheet
 */
function saveBookingToSheet(bookingData) {
  try {
    let sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    
    // Create sheet if it doesn't exist
    if (!sheet) {
      sheet = createBookingSheet();
    }

    // Map website data to sheet columns
    const rowData = [
      new Date(), // Timestamp
      generateBookingReference(), // Booking ID
      bookingData.fullName || '',
      bookingData.phone || '',
      bookingData.destination || '',
      bookingData.pickupPoint || '', // Pickup Point field
      new Date(bookingData.travelDate), // Travel Date
      bookingData.busType === 'vip' ? 'VIP' : 'Sprinter', // Bus Type
      parseFloat(bookingData.price) || 0, // Price
      bookingData.payerName || '', // Payer Name
      bookingData.emergencyName || '', // Emergency Name
      bookingData.emergencyPhone || '', // Emergency Phone
      'Pending', // Status
      'UnPaid' // Payment Status
    ];

    // Add to sheet
    sheet.appendRow(rowData);
    const lastRow = sheet.getLastRow();
    
    // Highlight new booking
    sheet.getRange(lastRow, 1, 1, rowData.length)
      .setBackground('#f0f7ff')
      .setBorder(true, true, true, true, true, true, '#d1e0ff', SpreadsheetApp.BorderStyle.SOLID);

    // Auto-resize columns
    sheet.autoResizeColumns(1, rowData.length);

    return {
      success: true,
      bookingId: rowData[1],
      timestamp: rowData[0]
    };
    
  } catch (error) {
    Logger.log('❌ Save error: ' + error.message);
    return {
      success: false,
      message: error.toString()
    };
  }
}

/**
 * Handle POST requests from website
 */
function doPost(e) {
  let response;
  
  try {
    // Parse incoming data
    const bookingData = JSON.parse(e.postData.contents);
    
    // Validate required fields
    const requiredFields = ['fullName', 'phone', 'destination', 'pickupPoint', 'travelDate', 'busType', 'price'];
    const missingFields = requiredFields.filter(field => !bookingData[field]);
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }
    
    // Save to sheet
    const saveResult = saveBookingToSheet(bookingData);
    
    if (saveResult.success) {
      response = {
        success: true,
        bookingId: saveResult.bookingId,
        timestamp: saveResult.timestamp.toISOString(),
        message: "Booking saved successfully!"
      };
    } else {
      throw new Error(saveResult.message || 'Failed to save booking');
    }
  } catch (error) {
    response = {
      success: false,
      error: error.message,
      message: "Booking failed. Please try again."
    };
  }
  
  // Return response
  return ContentService.createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Generate booking reference
 */
function generateBookingReference() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let ref = 'DNG-';
  
  for (let i = 0; i < 6; i++) {
    ref += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return ref;
}

/**
 * Test function
 */
function testSaveBooking() {
  const testData = {
    fullName: "Kwame Asante",
    phone: "0551234567",
    destination: "Kumasi",
    pickupPoint: "Old Site Shuttle Terminal",
    travelDate: "2025-08-16",
    busType: "vip",
    price: "150",
    payerName: "Kwame Asante",
    emergencyName: "Ama Asante",
    emergencyPhone: "0557654321"
  };
  
  const result = saveBookingToSheet(testData);
  Logger.log(JSON.stringify(result));
}
