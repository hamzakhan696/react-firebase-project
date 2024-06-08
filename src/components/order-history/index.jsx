import React, { useEffect, useState } from 'react';
import { getDocs, collection, where, query } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { Oval } from 'react-loader-spinner';
import { getAuth } from 'firebase/auth';
import { Link } from 'react-router-dom'; // Import Link

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
    <div className="container relative">
         <div className="login-image fixed inset-0 flex justify-center items-center opacity-10 pointer-events-none z-0">
       <img src="/logo.jpg" alt="logo" className="img-fluid h-full w-full scale-110" style={{ width: '50%', height: '50%', objectFit:'contain' }} />
    </div>
      <div className="cards-container mx-5 mt-12 pb-5">
        {isLoading ? (
          <div className="flex justify-center items-center w-screen h-screen">
            <Oval
              height="60"
              width="60"
              radius="9"
              color="black"
              ariaLabel="three-dots-loading"
              secondaryColor="grey"
            />
          </div>
        ) : orders.length === 0 ? (
          <div><h1 className='text-center mt-5'>No order history found.</h1></div>
        ) : (
          orders.map(order => (
            <Link to={`/product/${order.items[0].id}`} key={order.id}> {/* Wrap with Link and pass the product id */}
              <div className="relative max-w-xs rounded-xl px-8 py-5 text-gray-600 shadow-2xl mt-12 bg-white">
                <div className="flex justify-between items-center">
                  <div className="mb-4 w-30 rounded-md bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">Order History</div>
                  <div className="relative">
                    {/* Dropdown button placeholder (optional) */}
                  </div>
                </div>
                {/* <div className="mb-2">User ID: {order.userId}</div> */}
                <div className="mb-6 text-gray-400">
                  <p>Order Price: ${order.order_price}</p>
                  <p className='text-ellipsis'>Order Date: {new Date(order.order_date).toLocaleDateString()}</p>
                  <p className='text-ellipsis'>Order Quantity: {order.quantity}</p>
                  <p className="text-lg font-semibold text-gray-800 mt-4">Items:</p>
                  {order.items && order.items.length > 0 && (
                    <div>
                      {order.items.map((item, index) => (
                          <div>
                            <div key={index} className="py-2">
                              <p>Name: {item.name}</p>
                              <p className='text-ellipsis'>Manufacturer: {item.manufacturer}</p>
                              <p>Price: {item.price}</p>
                              <p className='overflow-hidden whitespace-nowrap text-ellipsis'>Type: {item.type}</p>
                              <p>Stock Quantity: {item.stock_quantity}</p>
                              <p className='overflow-hidden whitespace-nowrap text-ellipsis'>Description: {item.description}</p>
                              <p className='overflow-hidden whitespace-nowrap text-ellipsis'>Quantity: {item.quantity}</p>
                            </div>
                            { index < order.items.length - 1 && <hr className="h-px bg-gray-300"/>}
                          </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};

export default OrderHistoryComponent;
