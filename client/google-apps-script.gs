/**
 * DNG Transport Booking System - Google Apps Script
 * Clean, minimal, and professional Google Sheets integration
 */

// Configuration
const SHEET_ID = '1bYFCkDn6OMfBfDXS0VP8ulOa91cknvnChs95_qwhCk0';
const SHEET_NAME = 'Bookings';

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
 * Creates a minimal, clean, and professional booking sheet
 */
function createBookingSheet() {
  try {
    const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
    let sheet = spreadsheet.getSheetByName(SHEET_NAME);

    // Create or reset the sheet safely
    if (sheet) {
      // Safely clear everything
      try {
        // First, break apart any merged cells
        const dataRange = sheet.getDataRange();
        if (dataRange.getNumRows() > 0 && dataRange.getNumColumns() > 0) {
          dataRange.breakApart();
        }
        
        // Clear all content and formatting
        sheet.clear();
        sheet.clearFormats();
        sheet.clearConditionalFormatRules();
        sheet.clearDataValidations();
      } catch (e) {
        Logger.log('Sheet clearing completed with minor warnings: ' + e.message);
      }
    } else {
      sheet = spreadsheet.insertSheet(SHEET_NAME);
    }

    // Clean, minimal headers
    const headers = [
      "Date & Time",
      "Booking ID", 
      "Customer Name",
      "Phone",
      "Destination",
      "Travel Date",
      "Bus Type",
      "Price",
      "Special Requests",
      "Emergency Contact",
      "Emergency Phone",
      "Status",
      "Payment Status"
    ];

    // Simple title - no merge to avoid issues
    sheet.getRange(1, 1)
      .setValue("DNG TRANSPORT - BOOKING DASHBOARD")
      .setFontSize(12)
      .setFontWeight("bold")
      .setBackground(BRAND_COLORS.primary)
      .setFontColor(BRAND_COLORS.white)
      .setHorizontalAlignment("center");

    // Extend title background across all columns
    sheet.getRange(1, 1, 1, headers.length)
      .setBackground(BRAND_COLORS.primary)
      .setFontColor(BRAND_COLORS.white);

    // Set clean headers
    sheet.getRange(2, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(2, 1, 1, headers.length)
      .setFontWeight("bold")
      .setFontSize(10)
      .setBackground(BRAND_COLORS.light)
      .setFontColor(BRAND_COLORS.text)
      .setHorizontalAlignment("center")
      .setVerticalAlignment("middle")
      .setBorder(true, true, true, true, false, false, BRAND_COLORS.border, SpreadsheetApp.BorderStyle.SOLID);

    // Freeze header rows
    sheet.setFrozenRows(2);

    // Set optimal column widths
    const columnWidths = [140, 120, 150, 120, 130, 110, 90, 90, 200, 150, 120, 130, 130];
    columnWidths.forEach((width, index) => {
      sheet.setColumnWidth(index + 1, width);
    });

    // Apply professional formatting and validation
    setupColumnFormatting(sheet, headers.length);
    addDropdownValidation(sheet);

    Logger.log('✅ Professional booking sheet created successfully');
    return sheet;
    
  } catch (error) {
    Logger.log('❌ Error creating booking sheet: ' + error.message);
    throw error;
  }
}


/**
 * Setup professional column formatting
 */
function setupColumnFormatting(sheet, headerCount) {
  // Date columns formatting
  sheet.getRange('A3:A1000').setNumberFormat('dd/mm/yyyy hh:mm'); // Timestamp
  sheet.getRange('F3:F1000').setNumberFormat('dd/mm/yyyy'); // Travel Date
  
  // Price column formatting
  sheet.getRange('H3:H1000').setNumberFormat('₵#,##0.00');
  
  // Text alignment for better readability
  sheet.getRange('A3:A1000').setHorizontalAlignment('center'); // Timestamp
  sheet.getRange('B3:B1000').setHorizontalAlignment('center'); // Booking ID
  sheet.getRange('D3:E1000').setHorizontalAlignment('left'); // Phone, Destination
  sheet.getRange('F3:H1000').setHorizontalAlignment('center'); // Date, Bus Type, Price
  sheet.getRange('L3:M1000').setHorizontalAlignment('center'); // Status columns
  
  // Add subtle alternating row colors for better readability
  const dataRange = sheet.getRange(3, 1, 997, headerCount);
  dataRange.applyRowBanding(SpreadsheetApp.BandingTheme.LIGHT_GREY);
}

/**
 * Add dropdown validation for status columns
 */
function addDropdownValidation(sheet) {
  // Bus Type dropdown
  const busTypeRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['Sprinter', 'VIP'], true)
    .setAllowInvalid(false)
    .setHelpText('Select bus type')
    .build();
  sheet.getRange('G3:G1000').setDataValidation(busTypeRule);

  // Booking Status dropdown
  const statusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList([
      'Confirmed',
      'Pending', 
      'Completed',
      'Cancelled'
    ], true)
    .setAllowInvalid(false)
    .setHelpText('Select booking status')
    .build();
  sheet.getRange('L3:L1000').setDataValidation(statusRule);

  // Payment Status dropdown
  const paymentRule = SpreadsheetApp.newDataValidation()
    .requireValueInList([
      'Paid',
      'Pending',
      'Partial',
      'Refunded'
    ], true)
    .setAllowInvalid(false)
    .setHelpText('Select payment status')
    .build();
  sheet.getRange('M3:M1000').setDataValidation(paymentRule);
}

/**
 * Save booking data to the sheet with clean formatting
 */
function saveBookingToSheet(booking) {
  try {
    let sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    
    // Create sheet if it doesn't exist
    if (!sheet) {
      sheet = createBookingSheet();
    }

    // Prepare clean row data
    const rowData = [
      new Date(booking.timestamp || new Date()),
      booking.bookingReference || generateBookingReference(),
      booking.fullName || '',
      booking.phoneNumber || '',
      booking.destination || '',
      booking.travelDate || '',
      booking.busType === 'vip' ? 'VIP' : 'Sprinter',
      parseFloat(booking.price) || 0,
      booking.specialRequests || '',
      booking.emergencyName || '',
      booking.emergencyPhone || '',
      'Pending',
      'Pending'
    ];

    // Add the booking to the sheet
    sheet.appendRow(rowData);
    
    // Get the row that was just added
    const lastRow = sheet.getLastRow();
    const newRowRange = sheet.getRange(lastRow, 1, 1, rowData.length);
    
    // Apply clean formatting
    newRowRange.setFontFamily('Arial')
               .setFontSize(9)
               .setVerticalAlignment('middle');

    // Highlight VIP bookings subtly
    if (booking.busType === 'vip') {
      sheet.getRange(lastRow, 7).setBackground('#fef3c7').setFontWeight('bold');
    }

    Logger.log('✅ Booking saved successfully: ' + booking.bookingReference);
    return { success: true, message: 'Booking saved successfully' };

  } catch (error) {
    Logger.log('❌ Error saving booking: ' + error.message);
    return { success: false, message: error.message };
  }
}

    // Auto-resize if needed
    sheet.autoResizeColumns(1, rowData.length);

    Logger.log(`✅ Booking saved with beautiful formatting for: ${booking.fullName}`);
    
    return {
      success: true,
      row: lastRow,
      data: booking,
      sheetUrl: `https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit#gid=${sheet.getSheetId()}`
    };
    
  } catch (error) {
    Logger.log(`❌ Error saving booking: ${error.message}`);
    throw new Error(`Failed to save booking: ${error.message}`);
  }
}

/**
 * Handle POST requests from the booking form
 */
function doPost(e) {
  try {
    // Parse the incoming booking data
    const data = JSON.parse(e.postData.contents);
    
    // Generate booking reference if not provided
    if (!data.bookingReference) {
      data.bookingReference = generateBookingReference();
    }
    
    // Save to Google Sheets
    const result = saveBookingToSheet(data);
    
    if (result.success) {
      return ContentService
        .createTextOutput(JSON.stringify({
          success: true,
          message: 'Booking saved successfully!',
          bookingReference: data.bookingReference,
          timestamp: new Date().toISOString()
        }))
        .setMimeType(ContentService.MimeType.JSON);
    } else {
      throw new Error(result.message);
    }
      
  } catch (error) {
    Logger.log('❌ Error processing booking: ' + error.message);
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString(),
        message: 'Please try again or contact support.',
        timestamp: new Date().toISOString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handle GET requests for testing
 */
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ 
      message: "DNG Transport Booking System - API Active",
      timestamp: new Date().toISOString()
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Generate unique booking reference
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
 * Test function to create the booking sheet
 */
function testCreateSheet() {
  try {
    const sheet = createBookingSheet();
    Logger.log('✅ Test sheet created successfully');
    
    // Add a sample booking for testing
    const sampleBooking = {
      timestamp: new Date(),
      fullName: 'Test Customer',
      phoneNumber: '0551234567',
      destination: 'Kumasi',
      travelDate: '2024-01-15',
      busType: 'vip',
      price: 150,
      specialRequests: 'Window seat',
      emergencyName: 'Emergency Contact',
      emergencyPhone: '0557654321'
    };
    
    const result = saveBookingToSheet(sampleBooking);
    Logger.log('Sample booking result: ' + JSON.stringify(result));
    
  } catch (error) {
    Logger.log('❌ Test failed: ' + error.message);
  }
}