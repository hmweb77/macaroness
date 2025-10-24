// src/app/services/telegramService.js

const BOT_TOKEN = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID;

/**
 * Send formatted order notification to Telegram
 */
export const sendOrderToTelegram = async (orderData) => {
  try {
    // Validate configuration
    if (!BOT_TOKEN || !CHAT_ID) {
      console.error('❌ Telegram configuration missing');
      return { success: false, error: 'Configuration missing' };
    }

    const message = formatOrderMessage(orderData);
    
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message,
        parse_mode: 'Markdown',
      }),
    });

    const result = await response.json();
    
    if (result.ok) {
      console.log('✅ Order sent to Telegram successfully');
      return { success: true, messageId: result.result.message_id };
    } else {
      console.error('❌ Telegram API error:', result);
      return { success: false, error: result.description };
    }
  } catch (error) {
    console.error('❌ Error sending to Telegram:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Format order data into readable Telegram message
 */
const formatOrderMessage = (data) => {
  const {
    orderNumber,
    customerName,
    phone,
    address,
    notes,
    city,
    cityArabic,
    deliveryDate,
    deliveryHours,
    boxSize,
    boxPrice,
    deliveryPrice,
    totalPrice,
    flavors,
    excludedFlavors,
    surpriseMe,
  } = data;

  // Format date nicely
  let formattedDate;
  if (deliveryDate && deliveryDate.seconds) {
    // Firebase Timestamp
    formattedDate = new Date(deliveryDate.seconds * 1000).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } else if (deliveryDate instanceof Date) {
    // Regular Date object
    formattedDate = deliveryDate.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } else {
    formattedDate = 'Date non disponible';
  }

  // Create clickable phone number
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  const phoneForLink = cleanPhone.startsWith('+') ? cleanPhone : `+${cleanPhone}`;

  // Format flavors
  let flavorText;
  if (surpriseMe) {
    flavorText = '✨ Surprise! (Sélection du chef)';
  } else if (excludedFlavors && excludedFlavors.length > 0) {
    const includedList = flavors.join(', ');
    const excludedList = excludedFlavors.join(', ');
    flavorText = `• Incluses: ${includedList}\n• Exclues: ${excludedList}`;
  } else {
    flavorText = `• Toutes les saveurs (${flavors.length} saveurs)`;
  }

  const message = `
🎉 *NOUVELLE COMMANDE MACARONESS*

📦 *Détails de la commande:*
- Numéro: \`#${orderNumber}\`
- Boîte: ${boxSize} pièces
- Prix boîte: ${boxPrice} MAD
- Livraison: ${deliveryPrice} MAD
- *TOTAL: ${totalPrice} MAD*

👤 *Informations Client:*
- Nom: *${customerName}*
- Téléphone: ${phoneForLink}
${address ? `• Adresse: ${address}` : ''}
${notes ? `• Notes: _${notes}_` : ''}

📍 *Détails Livraison:*
- Ville: ${city}${cityArabic ? ` (${cityArabic})` : ''}
- Date: ${formattedDate}
- Délai: ${deliveryHours === 24 ? '24h' : '48h'}

🍰 *Saveurs:*
${flavorText}

━━━━━━━━━━━━━━━━━
⏰ Commande passée: ${new Date().toLocaleString('fr-FR')}
`.trim();

  return message;
};

/**
 * Send simple text message (for testing)
 */
export const sendTelegramMessage = async (text) => {
  try {
    if (!BOT_TOKEN || !CHAT_ID) {
      console.error('❌ Telegram configuration missing');
      return false;
    }

    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: text,
      }),
    });

    const result = await response.json();
    return result.ok;
  } catch (error) {
    console.error('❌ Error sending Telegram message:', error);
    return false;
  }
};