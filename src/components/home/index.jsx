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
  const [allProducts, setAllProducts] = useState([]);
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
      setAllProducts(productsData);
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

  const [isDropdownOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isDropdownOpen);
  };

  const searchByParam = (filterParam) => {
    let filtered = [];
    if (filterParam === 'type') {
      filtered = allProducts.filter(product => product.type.toLowerCase().includes(searchTerm.toLowerCase()));
    } else if (filterParam === 'manufacturer') {
      filtered = allProducts.filter(product => product.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()));
    } else if (filterParam === 'reset') {
      filtered = allProducts;
      setSearchTerm('');
    }
    setFilteredProducts(filtered);
    setIsOpen(false);
  }

  return (
    <div className="product-container relative pb-12">
    <div className="fixed inset-0 flex justify-center items-center opacity-10 pointer-events-none z-0">
      <img src="/logo.jpg" alt="logo" className="img-fluid h-full w-full scale-110" style={{ width: '50%', height: '50%', objectFit: 'contain' }} />
    </div>
    <h2 className="mt-16 title text-center text-xl z-10">Home Page</h2>

    <div className="flex justify-between z-10">
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
      <div className="flex items-center mt-20">
        <div className="relative">
          <input
            type="text"
            className="overflow-hidden whitespace-nowrap text-ellipsis pl-10 pr-4 py-2 border border-gray-300 rounded-l-lg shadow-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            placeholder="Search" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)}
          />
          <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.9 14.32a8 8 0 111.414-1.414l5.387 5.387a1 1 0 01-1.414 1.414l-5.387-5.387zM14 8a6 6 0 11-12 0 6 6 0 0112 0z" clipRule="evenodd" />
          </svg>
        </div>

        <div className="relative inline-block text-left shrink-0 z-20">
          <button onClick={toggleDropdown} className="border border-blue-500 bg-blue-500 text-white font-semibold py-2 px-4 rounded-r-md focus:outline-none focus:ring focus:ring-blue-200 flex items-center gap-2">
            Filter
            <svg className={`fill-current h-4 w-4 transform ${isDropdownOpen ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M10 12l-5-5 1.41-1.41L10 9.17l3.59-3.58L15 7z"/>
            </svg>
          </button>

          {isDropdownOpen && (
              <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                  <div onClick={() => searchByParam('type')} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 cursor-pointer" role="menuitem">
                    By Type
                  </div>
                  <div onClick={() => searchByParam('manufacturer')} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 cursor-pointer" role="menuitem">
                    By Manufacturer
                  </div>
                  {searchTerm &&
                      <div onClick={() => searchByParam('reset')}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-red-400 hover:text-white cursor-pointer"
                        role="menuitem">
                        Reset
                      </div>
                  }
                </div>
              </div>
          )}
        </div>
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

      {
        filteredProducts.length ?
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mx-md:16 mt-12">
              {filteredProducts.map(product => (
                  <div key={product.id} className="bg-white relative max-w-xs rounded-xl overflow-hidden text-gray-600 border border-gray-300 shadow-2xl z-10">
                    <Link to={`/product/${product.id}`}>
                      <div className="absolute top-4 left-4 mb-4 w-20 rounded-md bg-blue-100 px-4 py-1 text-sm font-medium text-blue-700 z-10">Product</div>
                      {product.image && (
                          <div className="w-full h-[250px] overflow-hidden">
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover hover:scale-150 transition duration-300" />
                          </div>
                      )}
                      <div className="px-8 py-5 mb-5">
                        <div className="text-ellipsis font-bold mb-2 text-2xl z-10">{product.name}</div>
                        <div className="mb-6 text-gray-400 z-10">
                          <p> <span className='text-gray-900 overflow-hidden whitespace-nowrap text-ellipsis'>Price:</span> ${product.price}</p>
                          <p>  <span className='text-gray-900 overflow-hidden whitespace-nowrap text-ellipsis'>Manufacturer:</span> {product.manufacturer}</p>
                          <p>  <span className='text-gray-900 overflow-hidden whitespace-nowrap text-ellipsis'>Stock Quantity:</span> {product.stock_quantity}</p>
                          <p>  <span className='text-gray-900 overflow-hidden whitespace-nowrap text-ellipsis'>Type:</span> {product.type}</p>
                        </div>
                      </div>
                    </Link>
                    <div className="">
                      {product.stock_quantity === 0 ? (
                          <p className="text-red-500 font-bold z-10">Out of Stock</p>
                      ) : (
                          <button
                              onClick={() => handleAddToCart(product)}
                              className="flex items-center justify-center w-full absolute bottom-0 rounded-b-md bg-slate-900 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-4 focus:ring-blue-300 z-10"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
                            </svg>
                            Add to cart
                          </button>
                      )}
                    </div>
                  </div>
              ))}
             </div> :
            <div className="flex justify-center items-center w-full h-[45vh]">
              <p className="text-lg font-semibold">No products found</p>
            </div>
      }


    <div className={`fixed inset-y-0 right-0 w-80 bg-gray-100 overflow-y-scroll transform ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300 ease-in-out shadow-lg z-10`}>
      <div className="p-4 border-b border-gray-300 h-[150px] pt-14 relative text-end">
        <button onClick={handleCloseSidebar} className="text-gray-600 hover:text-gray-800 pb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold">Cart</h3>
          <button onClick={handleClearCart}
                  className="self-end ms-32 px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded hover:bg-blue-700">
            Clear
          </button>
        </div>

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
                  <div className="mb-2">
                    <img src={item.image} alt={item.name} style={{ width: '90px' }} />
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
