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
   * Initialize daily capacity for a specific date if it doesn't exist
   */
  export const initializeDailyCapacity = async (date) => {
    try {
      const dateKey = getDateKey(date);
      const capacityRef = doc(db, 'dailyCapacity', dateKey);
      const capacityDoc = await getDoc(capacityRef);
      
      if (!capacityDoc.exists()) {
        await setDoc(capacityRef, {
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
    } catch (error) {
      console.error('Error initializing daily capacity:', error);
      throw error;
    }
  };
  
  /**
   * Get remaining capacity for a specific date
   */
  export const getRemainingCapacity = async (date) => {
    try {
      const dateKey = getDateKey(date);
      const capacityRef = doc(db, 'dailyCapacity', dateKey);
      const capacityDoc = await getDoc(capacityRef);
      
      if (!capacityDoc.exists()) {
        // Initialize if doesn't exist
        return await initializeDailyCapacity(date);
      }
      
      return capacityDoc.data().remainingCapacity;
    } catch (error) {
      console.error('Error getting remaining capacity:', error);
      throw error;
    }
  };
  
  /**
   * Subscribe to real-time updates for daily capacity
   */
  export const subscribeToCapacity = (date, callback) => {
    const dateKey = getDateKey(date);
    const capacityRef = doc(db, 'dailyCapacity', dateKey);
    
    return onSnapshot(capacityRef, (doc) => {
      if (doc.exists()) {
        callback(doc.data().remainingCapacity);
      } else {
        // Initialize if doesn't exist
        initializeDailyCapacity(date).then(capacity => {
          callback(capacity);
        });
      }
    }, (error) => {
      console.error('Error subscribing to capacity:', error);
    });
  };
  
  /**
   * Create a new order and update capacity atomically
   */
  export const createOrder = async (orderData) => {
    try {
      const dateKey = getDateKey(orderData.deliveryDate);
      const capacityRef = doc(db, 'dailyCapacity', dateKey);
      
      // Use a transaction to ensure atomic operations
      const result = await runTransaction(db, async (transaction) => {
        const capacityDoc = await transaction.get(capacityRef);
        
        // Initialize capacity if it doesn't exist
        if (!capacityDoc.exists()) {
          transaction.set(capacityRef, {
            date: Timestamp.fromDate(orderData.deliveryDate),
            dateKey: dateKey,
            totalCapacity: DAILY_CAPACITY,
            remainingCapacity: DAILY_CAPACITY,
            reservedPieces: 0,
            lastUpdated: Timestamp.now(),
            createdAt: Timestamp.now()
          });
        }
        
        // Get current capacity
        const currentData = capacityDoc.exists() 
          ? capacityDoc.data() 
          : { remainingCapacity: DAILY_CAPACITY, reservedPieces: 0 };
        
        const newRemaining = currentData.remainingCapacity - orderData.boxSize;
        const newReserved = currentData.reservedPieces + orderData.boxSize;
        
        // Check if there's enough capacity
        if (newRemaining < 0) {
          throw new Error('Insufficient capacity for this date');
        }
        
        // Update capacity
        transaction.update(capacityRef, {
          remainingCapacity: newRemaining,
          reservedPieces: newReserved,
          lastUpdated: Timestamp.now()
        });
        
        // Add the order to orders collection
        const orderRef = doc(collection(db, 'orders'));
        transaction.set(orderRef, {
          ...orderData,
          deliveryDate: Timestamp.fromDate(orderData.deliveryDate),
          createdAt: Timestamp.now(),
          status: 'pending',
          dateKey: dateKey
        });
        
        return { orderId: orderRef.id, remainingCapacity: newRemaining };
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