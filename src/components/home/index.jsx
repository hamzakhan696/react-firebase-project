import React, { useEffect, useState } from 'react';
import { getDocs, collection, addDoc } from 'firebase/firestore';
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
      // User is not authenticated, handle this case accordingly
      return;
    }
  
    const orderData = {
      userId: user.uid, // Store the user ID
      items: cart,
      order_price: calculateTotalPrice(),
      quantity: cart.reduce((total, item) => total + item.quantity, 0),
      order_date: new Date().toISOString()
    };
  
    try {
      await addDoc(collection(db, 'Orders'), orderData);
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
      <h2 className="mt-16 title text-center">Home Page</h2>

      <div className="flex justify-center">
      <div className="mx-16 mt-20">
  <button className="text-blue-600  bg-blue-600 py-2 px-4 rounded-md transition duration-300 ease-in-out hover:bg-blue-600 text-white">
    <Link to="/order-history">
      View Order History
    </Link>
  </button>
</div>
        <form className="max-w-md mx-auto mt-16 search-form">
          <label htmlFor="default-search" className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">Search</label>
          <div className="relative">
            <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
              <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
              </svg>
            </div>
            <input
              type="search"
              id="default-search"
              className="block w-full p-4 px-32 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Search by type or manufacturer..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <button type="submit" className="text-white absolute end-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Search</button>
          </div>
        </form>
     
      </div>


      {isLoading && (
        <div className='spinner-overlay'>
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mx-16 mt-12">
        {filteredProducts.map(product => (
          <div key={product.id} className="max-w-xs rounded-xl px-8 py-5 text-gray-600 shadow-2xl dark:shadow-lg dark:shadow-gray-300">
            <Link to={`/product/${product.id}`}>
              <div className="mb-4 w-20 rounded-md bg-blue-100 px-2 py-1 text-sm font-medium text-blue-700">Product</div>
              <div className="mb-2 text-2xl">{product.name}</div>
              <div className="mb-6 text-gray-400">
                <p>Price: ${product.price}</p>
                <p className='text-nowrap'>Manufacturer: {product.manufacturer}</p>
                <p>Stock Quantity: {product.stock_quantity}</p>
                <p>Type: {product.type}</p>
              </div>
            </Link>
            <button
              onClick={() => handleAddToCart(product)}
              className="flex items-center justify-center rounded-md bg-slate-900 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-4 focus:ring-blue-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
              Add to cart
            </button>
          </div>
        ))}
      </div>

      <div className={`fixed inset-y-0 right-0 w-80 bg-gray-100 dark:bg-gray-800 overflow-y-scroll transform ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300 ease-in-out shadow-lg`}>
        <div className="flex justify-between items-center p-4 border-b border-gray-300 dark:border-gray-700">
          <h3 className="text-xl font-bold mt-16">Cart</h3>
          <button onClick={handleClearCart} className="self-end mt-20 ms-32 px-4 py-2 text-sm font-medium text-white bg-gray-600 rounded hover:bg-gray-700">Clear</button>
          <button onClick={handleCloseSidebar} className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
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
                <div key={index} className="mb-4 p-2 border-b border-gray-300 dark:border-gray-700">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-lg font-semibold">Name: {item.name}</div>
                      <div className="text-gray-500">Price: ${item.price}</div>
                      <div className="text-gray-400">Manufacturer: {item.manufacturer}</div>
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
