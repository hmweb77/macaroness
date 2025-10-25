// src/app/services/firebaseService.js
import { 
  collection, 
  addDoc, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  onSnapshot,
  query,
  where,
  Timestamp,
  runTransaction
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { DAILY_CAPACITY } from '../Shared';

/**
 * Get the document ID for a specific date's capacity
 * Format: YYYY-MM-DD
 */
const getDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Get remaining capacity for a specific date (READ ONLY - more efficient)
 */
export const getRemainingCapacity = async (date) => {
  try {
    const dateKey = getDateKey(date);
    const capacityRef = doc(db, 'dailyCapacity', dateKey);
    const capacityDoc = await getDoc(capacityRef);
    
    if (!capacityDoc.exists()) {
      return DAILY_CAPACITY;
    }
    
    return capacityDoc.data().remainingCapacity;
  } catch (error) {
    console.error('Error getting remaining capacity:', error);
    return DAILY_CAPACITY;
  }
};

/**
 * Initialize daily capacity only when needed (during order creation)
 */
export const initializeDailyCapacityIfNeeded = async (date, transaction) => {
  const dateKey = getDateKey(date);
  const capacityRef = doc(db, 'dailyCapacity', dateKey);
  const capacityDoc = await transaction.get(capacityRef);
  
  if (!capacityDoc.exists()) {
    transaction.set(capacityRef, {
      date: Timestamp.fromDate(date),
      dateKey: dateKey,
      totalCapacity: DAILY_CAPACITY,
      remainingCapacity: DAILY_CAPACITY,
      reservedPieces: 0,
      lastUpdated: Timestamp.now(),
      createdAt: Timestamp.now()
    });
    return DAILY_CAPACITY;
  }
  
  return capacityDoc.data().remainingCapacity;
};

/**
 * Optimized subscription with error handling
 */
export const subscribeToCapacity = (date, callback, onError) => {
  const dateKey = getDateKey(date);
  const capacityRef = doc(db, 'dailyCapacity', dateKey);
  
  return onSnapshot(
    capacityRef,
    (doc) => {
      if (doc.exists()) {
        callback(doc.data().remainingCapacity);
      } else {
        callback(DAILY_CAPACITY);
      }
    },
    (error) => {
      console.error('Error subscribing to capacity:', error);
      if (onError) onError(error);
      callback(DAILY_CAPACITY);
    }
  );
};

/**
 * Create or update user/customer record
 * Returns the user document ID
 */
export const createOrUpdateUser = async (userData) => {
  try {
    const usersRef = collection(db, 'users');
    
    // Check if user exists by phone number
    const q = query(usersRef, where('phone', '==', userData.phone));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      // User exists - update with new order info
      const userDoc = querySnapshot.docs[0];
      const existingData = userDoc.data();
      
      await updateDoc(userDoc.ref, {
        customerName: userData.customerName,
        address: userData.address || existingData.address || '',
        city: userData.city || existingData.city || '',
        cityArabic: userData.cityArabic || existingData.cityArabic || '',
        lastOrderDate: Timestamp.now(),
        totalOrders: (existingData.totalOrders || 0) + 1,
        lastUpdated: Timestamp.now(),
        // Add notes to history if provided
        notesHistory: userData.notes 
          ? [...(existingData.notesHistory || []), {
              note: userData.notes,
              date: Timestamp.now()
            }]
          : existingData.notesHistory || []
      });
      
      return userDoc.id;
    } else {
      // New user - create record
      const newUserRef = await addDoc(usersRef, {
        customerName: userData.customerName,
        phone: userData.phone,
        address: userData.address || '',
        city: userData.city || '',
        cityArabic: userData.cityArabic || '',
        firstOrderDate: Timestamp.now(),
        lastOrderDate: Timestamp.now(),
        totalOrders: 1,
        createdAt: Timestamp.now(),
        lastUpdated: Timestamp.now(),
        notesHistory: userData.notes ? [{
          note: userData.notes,
          date: Timestamp.now()
        }] : [],
        language: userData.language || 'fr',
        // Marketing preferences
        marketingConsent: false,
        emailConsent: false
      });
      
      return newUserRef.id;
    }
  } catch (error) {
    console.error('Error creating/updating user:', error);
    throw error;
  }
};

/**
 * Create a new order and update capacity atomically
 * Also creates/updates user record
 */
export const createOrder = async (orderData) => {
  try {
    const dateKey = getDateKey(orderData.deliveryDate);
    const capacityRef = doc(db, 'dailyCapacity', dateKey);
    
    // First, create or update user record (outside transaction)
    const userId = await createOrUpdateUser({
      customerName: orderData.customerName,
      phone: orderData.phone,
      address: orderData.address,
      notes: orderData.notes,
      city: orderData.city,
      cityArabic: orderData.cityArabic,
      language: orderData.language
    });
    
    // Then create order with transaction
    const result = await runTransaction(db, async (transaction) => {
      const capacityDoc = await transaction.get(capacityRef);
      
      let currentRemaining = DAILY_CAPACITY;
      let currentReserved = 0;
      
      // Initialize or get current capacity
      if (!capacityDoc.exists()) {
        await initializeDailyCapacityIfNeeded(orderData.deliveryDate, transaction);
      } else {
        const currentData = capacityDoc.data();
        currentRemaining = currentData.remainingCapacity;
        currentReserved = currentData.reservedPieces;
      }
      
      const newRemaining = currentRemaining - orderData.boxSize;
      const newReserved = currentReserved + orderData.boxSize;
      
      if (newRemaining < 0) {
        throw new Error('Insufficient capacity for this date');
      }
      
      // Update capacity
      transaction.update(capacityRef, {
        remainingCapacity: newRemaining,
        reservedPieces: newReserved,
        lastUpdated: Timestamp.now()
      });
      
      // Add order with user reference
      const orderRef = doc(collection(db, 'orders'));
      transaction.set(orderRef, {
        ...orderData,
        userId: userId, // Link to user document
        deliveryDate: Timestamp.fromDate(orderData.deliveryDate),
        createdAt: Timestamp.now(),
        status: 'pending',
        dateKey: dateKey
      });
      
      return { orderId: orderRef.id, userId: userId, remainingCapacity: newRemaining };
    });
    
    return result;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

/**
 * Get all orders for a specific date
 */
export const getOrdersForDate = async (date) => {
  try {
    const dateKey = getDateKey(date);
    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, where('dateKey', '==', dateKey));
    
    const querySnapshot = await getDocs(q);
    const orders = [];
    querySnapshot.forEach((doc) => {
      orders.push({ id: doc.id, ...doc.data() });
    });
    
    return orders;
  } catch (error) {
    console.error('Error getting orders for date:', error);
    throw error;
  }
};

/**
 * Update order status
 */
export const updateOrderStatus = async (orderId, status) => {
  try {
    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, {
      status: status,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

/**
 * Cancel an order and restore capacity
 */
export const cancelOrder = async (orderId) => {
  try {
    const orderRef = doc(db, 'orders', orderId);
    const orderDoc = await getDoc(orderRef);
    
    if (!orderDoc.exists()) {
      throw new Error('Order not found');
    }
    
    const orderData = orderDoc.data();
    const dateKey = orderData.dateKey;
    const capacityRef = doc(db, 'dailyCapacity', dateKey);
    
    await runTransaction(db, async (transaction) => {
      const capacityDoc = await transaction.get(capacityRef);
      
      if (capacityDoc.exists()) {
        const currentData = capacityDoc.data();
        const newRemaining = currentData.remainingCapacity + orderData.boxSize;
        const newReserved = currentData.reservedPieces - orderData.boxSize;
        
        transaction.update(capacityRef, {
          remainingCapacity: newRemaining,
          reservedPieces: newReserved,
          lastUpdated: Timestamp.now()
        });
      }
      
      transaction.update(orderRef, {
        status: 'cancelled',
        cancelledAt: Timestamp.now()
      });
    });
  } catch (error) {
    console.error('Error cancelling order:', error);
    throw error;
  }
};

/**
 * Reset daily capacity (for admin use)
 */
export const resetDailyCapacity = async (date) => {
  try {
    const dateKey = getDateKey(date);
    const capacityRef = doc(db, 'dailyCapacity', dateKey);
    
    await setDoc(capacityRef, {
      date: Timestamp.fromDate(date),
      dateKey: dateKey,
      totalCapacity: DAILY_CAPACITY,
      remainingCapacity: DAILY_CAPACITY,
      reservedPieces: 0,
      lastUpdated: Timestamp.now(),
      resetAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error resetting daily capacity:', error);
    throw error;
  }
};

/**
 * Get user by phone number
 */
export const getUserByPhone = async (phone) => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('phone', '==', phone));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      return { id: userDoc.id, ...userDoc.data() };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting user by phone:', error);
    throw error;
  }
};

/**
 * Get all users (for export)
 */
export const getAllUsers = async () => {
  try {
    const usersRef = collection(db, 'users');
    const querySnapshot = await getDocs(usersRef);
    
    const users = [];
    querySnapshot.forEach((doc) => {
      users.push({ id: doc.id, ...doc.data() });
    });
    
    return users;
  } catch (error) {
    console.error('Error getting all users:', error);
    throw error;
  }
};

/**
 * Get user's order history
 */
export const getUserOrderHistory = async (userId) => {
  try {
    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    const orders = [];
    querySnapshot.forEach((doc) => {
      orders.push({ id: doc.id, ...doc.data() });
    });
    
    return orders;
  } catch (error) {
    console.error('Error getting user order history:', error);
    throw error;
  }
};