import React, { useEffect, useState } from 'react';
import { getDocs, collection, where, query } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { Oval } from 'react-loader-spinner';
import { getAuth } from 'firebase/auth';

const OrderHistoryComponent = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        // User is not authenticated, handle this case accordingly
        return;
      }
      
      const q = query(collection(db, 'Orders'), where('userId', '==', user.uid));
      const snapshot = await getDocs(q);
      const ordersData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      setOrders(ordersData);
      setIsLoading(false);
    };

    fetchOrders();
  }, []);

  return (
    <div className="container">
    <div className="cards-container mx-5 mt-12 pb-5">
      {isLoading ? (
        <div className="flex justify-center items-center h-screen">
          <Oval
            height="60"
            width="60"
            radius="9"
            color="black"
            ariaLabel="three-dots-loading"
            secondaryColor="grey"
          />
        </div>
      ) : (
        orders.map(order => (
          <div key={order.id} className="relative max-w-xs rounded-xl px-8 py-5 text-gray-600 shadow-2xl dark:shadow-lg dark:shadow-gray-300 mt-12">
            <div className="flex justify-between items-center">
              <div className="mb-4 w-30 rounded-md bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">Order History</div>
              <div className="relative">
                {/* Dropdown button placeholder (optional) */}
              </div>
            </div>
            <div className="mb-2">User ID: {order.userId}</div>
            <div className="mb-6 text-gray-400">
              <p>Order Price: ${order.order_price}</p>
              <p>Order Date: {new Date(order.order_date).toLocaleDateString()}</p>
              <p>Order Quantity: {order.quantity}</p>
              <p className="text-lg font-semibold mt-4">Items:</p>
              {order.items && order.items.length > 0 && (
                <div>
                  {order.items.map((item, index) => (
                    <div key={index} className="border-b border-gray-300 py-2">
                      <p>Name: {item.name}</p>
                      <p>Manufacturer: {item.manufacturer}</p>
                      <p>Price: {item.price}</p>
                      <p>Type: {item.type}</p>
                      <p>Stock Quantity: {item.stock_quantity}</p>
                      <p>Description: {item.description}</p>
                      <p>Quantity: {item.quantity}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))
      )}
    </div>
    </div>
  );
};

export default OrderHistoryComponent;
