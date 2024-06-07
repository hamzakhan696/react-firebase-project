import React, { useEffect, useState } from 'react';
import { getDocs, collection, addDoc, doc, writeBatch } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import '../../App.css';
import { Link } from 'react-router-dom';
import { Oval } from 'react-loader-spinner';
import toastr from "toastr";
import "toastr/build/toastr.min.css";
import { getAuth } from 'firebase/auth';

const HomeComponent = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      const colRef = collection(db, 'Products');
      const snapshot = await getDocs(colRef);
      const productsData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      setProducts(productsData);
      setFilteredProducts(productsData);
      setIsLoading(false);
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      setCart(JSON.parse(storedCart));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    filterProducts(event.target.value);
  };

  const filterProducts = (searchTerm) => {
    const filtered = products.filter(product =>
      product.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.manufacturer.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(filtered);
  };

  const handleAddToCart = (product) => {
    const existingProductIndex = cart.findIndex(item => item.id === product.id);
    if (existingProductIndex >= 0) {
      const newCart = [...cart];
      newCart[existingProductIndex].quantity += 1;
      setCart(newCart);
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
    setIsSidebarOpen(true);
    toastr.success('Product added to cart.', 'Success');
  };
  
  const openAddToCart = () => {
    setIsSidebarOpen(true);
  }

  const handleIncrement = (productId) => {
    const newCart = cart.map(item =>
      item.id === productId ? { ...item, quantity: item.quantity + 1 } : item
    );
    setCart(newCart);
  };

  const handleDecrement = (productId) => {
    const newCart = cart.map(item =>
      item.id === productId && item.quantity > 1 ? { ...item, quantity: item.quantity - 1 } : item
    ).filter(item => item.quantity > 0);
    setCart(newCart);
  };

  const calculateTotalPrice = () => {
    return cart.reduce((total, item) => total + (parseFloat(item.price) * item.quantity), 0).toFixed(2);
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };

  const handleClearCart = () => {
    setCart([]);
    localStorage.removeItem('cart');
    toastr.success('Products removed.', 'Success');
  };

  const handlePlaceOrder = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
  
    if (!user) {
      toastr.error('You must be logged in to place an order.', 'Error');
      return;
    }
  
    const orderData = {
      userId: user.uid,
      items: cart,
      order_price: calculateTotalPrice(),
      quantity: cart.reduce((total, item) => total + item.quantity, 0),
      order_date: new Date().toISOString()
    };
  
    const batch = writeBatch(db);
  
    try {
      const orderRef = collection(db, 'Orders');
      const orderDocRef = doc(orderRef);
      batch.set(orderDocRef, orderData);
  
      cart.forEach(item => {
        const productRef = doc(db, 'Products', item.id);
        batch.update(productRef, {
          stock_quantity: item.stock_quantity - item.quantity
        });
      });
  
      await batch.commit();

      // Update local products state
      const updatedProducts = products.map(product => {
        const cartItem = cart.find(item => item.id === product.id);
        if (cartItem) {
          return { ...product, stock_quantity: product.stock_quantity - cartItem.quantity };
        }
        return product;
      });
      
      setProducts(updatedProducts);
      setFilteredProducts(updatedProducts);

      setCart([]);
      localStorage.removeItem('cart');
      setIsSidebarOpen(false);
      toastr.success('Order placed successfully.', 'Success');
      
    } catch (error) {
      toastr.error('Error placing order. Please try again.', 'Error');
    }
  };

  return (
    <div className="product-container relative pb-12">
    <div className="absolute inset-0 flex justify-center items-center opacity-10 pointer-events-none z-0">
      <img src="/logo.jpg" alt="logo" className="img-fluid h-full w-full" style={{ width: '50%', height: '50%', objectFit: 'contain' }} />
    </div>
    <h2 className="mt-16 title text-center z-10">Home Page</h2>
  
    <div className="flex justify-center z-10">
      <div className="mx-2 md:mx-1 mt-20 flex">
        <button className="text-nowrap w-full md:w-auto text-white bg-blue-600 py-2 px-4 rounded-md transition duration-300 ease-in-out hover:bg-blue-700 z-10">
          <Link to="/order-history" className="w-full inline-block text-center">
            My Orders
          </Link>
        </button>
        <button onClick={openAddToCart} className="flex mx-2 text-nowrap w-full md:w-auto text-white bg-slate-900 py-2 px-4 rounded-md z-10">
          <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
          </svg>
          View Cart
        </button>
      </div>
      <div className="w-4/6 max-w-sm mx-auto mt-20 z-10">
        <form className="relative">
          <input 
            type="text" 
            className="overflow-hidden whitespace-nowrap text-ellipsis w-full pl-10 lg:mx-44 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            placeholder="Search by type and manufacturer..." value={searchTerm} onChange={handleSearchChange}
          />
          <svg className="absolute lg:mx-44 left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.9 14.32a8 8 0 111.414-1.414l5.387 5.387a1 1 0 01-1.414 1.414l-5.387-5.387zM14 8a6 6 0 11-12 0 6 6 0 0112 0z" clipRule="evenodd" />
          </svg>
        </form>
      </div>
    </div>
    {isLoading && (
      <div className='spinner-overlay z-10'>
        <Oval
          height="60"
          width="60"
          radius="9"
          color="black"
          ariaLabel="three-dots-loading"
          secondaryColor="grey"
          wrapperStyle={{ marginTop: '10%', marginBottom: '10%' }}
        />
      </div>
    )}
  
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mx-md:16 mt-12 relative z-10 ">
      {filteredProducts.map(product => (
        <div key={product.id} className="max-w-xs rounded-xl px-8 py-5 text-gray-600 shadow-2xl z-10">
          <Link to={`/product/${product.id}`}>
            <div className="mb-4 w-20 rounded-md bg-blue-100 px-4 py-1 text-sm font-medium text-blue-700 z-10">Product</div>
            {product.image && (
                <div className="my-4">
                  <img src={product.image} alt={product.name} className="w-100 h-100 object-cover" />
                </div>
              )}
            <div className="text-ellipsis mb-2 text-2xl z-10">{product.name}</div>
            <div className="mb-6 text-gray-400 z-10">
              <p> <span className='text-gray-900 overflow-hidden whitespace-nowrap text-ellipsis'>Price:</span> ${product.price}</p>
              <p>  <span className='text-gray-900 overflow-hidden whitespace-nowrap text-ellipsis'>Manufacturer:</span> {product.manufacturer}</p>
              <p>  <span className='text-gray-900 overflow-hidden whitespace-nowrap text-ellipsis'>Stock Quantity:</span> {product.stock_quantity}</p>
              <p>  <span className='text-gray-900 overflow-hidden whitespace-nowrap text-ellipsis'>Type:</span> {product.type}</p>
            </div>
          </Link>
          {product.stock_quantity === 0 ? (
            <p className="text-red-500 font-bold z-10">Out of Stock</p>
          ) : (
            <button
              onClick={() => handleAddToCart(product)}
              className="flex items-center justify-center rounded-md bg-slate-900 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-4 focus:ring-blue-300 z-10"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
              Add to cart
            </button>
          )}
        </div>
      ))}
    </div>
  
    <div className={`fixed inset-y-0 right-0 w-80 bg-gray-100 overflow-y-scroll transform ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300 ease-in-out shadow-lg z-10`}>
      <div className="flex justify-between items-center p-4 border-b border-gray-300 ">
        <h3 className="text-xl font-bold mt-16">Cart</h3>
        <button onClick={handleClearCart} className="self-end mt-20 ms-32 px-4 py-2 text-sm font-medium text-white bg-gray-600 rounded hover:bg-gray-700">Clear</button>
        <button onClick={handleCloseSidebar} className="text-gray-600 hover:text-gray-800 ">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
  
      <div className="p-4">
        {cart.length === 0 ? (
          <p>No items in cart</p>
        ) : (
          <>
            {cart.map((item, index) => (
              <div key={index} className="mb-4 p-2 border-b border-gray-300 ">
                <div className="flex justify-between items-center">
                  <div>
                  <div>
                    <img src={item.image} alt={item.name} style={{ width: '60px' }} />
                  </div>
                    <div className="text-lg font-semibold text-ellipsis">Name: {item.name}</div>
                    <div className="text-gray-500">Price: ${item.price}</div>
                    <div className="text-gray-400 text-ellipsis">Manufacturer: {item.manufacturer}</div>
                  </div>
                  <div className="flex items-center">
                    <button onClick={() => handleDecrement(item.id)} className="px-2 py-1 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700">-</button>
                    <span className="mx-2">{item.quantity}</span>
                    <button onClick={() => handleIncrement(item.id)} className="px-2 py-1 text-sm font-medium text-white bg-green-600 rounded hover:bg-green-700">+</button>
                  </div>
                </div>
              </div>
            ))}
            <div className="text-lg font-semibold mt-4">
              Total Price: ${calculateTotalPrice()}
            </div>
            <button
              className="mt-4 flex items-center justify-center rounded-md bg-slate-900 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-4 focus:ring-blue-300"
              onClick={handlePlaceOrder}
            >
              Place Order : ${calculateTotalPrice()}
            </button>
          </>
        )}
      </div>
    </div>
  </div>
  
  );
};

export default HomeComponent;
