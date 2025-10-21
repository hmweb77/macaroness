// src/app/services/googleSheets.js

const GOOGLE_SCRIPT_URL = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbyCaJ8sXxOrIPs6PT-5HTYMG3Q8OHhc4H5s3YmzpJnzkYJSS2g9Cq8PGzXMqXhXzMM/exec';

export const saveOrderToSheets = async (orderData) => {
  try {
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors', // Google Apps Script doesn't support CORS
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData)
    });
    
    // Since we're using no-cors, we won't get the actual response
    // but the request will still be processed by Google Apps Script
    return { success: true };
  } catch (error) {
    console.error('Error saving to Google Sheets:', error);
    // Don't block the order if sheets fails
    return { success: false, error: error.message };
  }
};

// Alternative approach using a redirect method (more reliable)
export const saveOrderToSheetsViaRedirect = (orderData) => {
  const params = new URLSearchParams({
    orderNumber: orderData.orderNumber,
    customerName: orderData.customerName,
    phone: orderData.phone,
    address: orderData.address || '',
    notes: orderData.notes || '',
    city: orderData.city,
    deliveryDate: orderData.deliveryDate,
    boxSize: orderData.boxSize,
    totalPrice: orderData.totalPrice,
    flavors: orderData.flavors,
    surpriseMe: orderData.surpriseMe
  });
  
  // Create a form and submit it
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = GOOGLE_SCRIPT_URL;
  form.target = 'google-sheets-frame';
  
  for (const [key, value] of params.entries()) {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = key;
    input.value = value;
    form.appendChild(input);
  }
  
  // Create hidden iframe to submit form without redirecting
  let iframe = document.getElementById('google-sheets-frame');
  if (!iframe) {
    iframe = document.createElement('iframe');
    iframe.id = 'google-sheets-frame';
    iframe.name = 'google-sheets-frame';
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
  }
  
  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
  
  return { success: true };
};