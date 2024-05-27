import React, { useEffect, useState } from 'react';
import { getDocs, collection, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import '../../App.css'; // Importing the app.css file
import toastr from "toastr";
import "toastr/build/toastr.min.css"; // Import toastr CSS
import { Oval } from 'react-loader-spinner'

const ProductComponent = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    description: '',
    manufacturer: '',
    stock_quantity: '',
    type: ''
  });
  const [showModal, setShowModal] = useState(false); // State to control modal visibility
  const [editingProduct, setEditingProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // State to track data loading

  const [dropdownVisible, setDropdownVisible] = useState({});

  const fetchProducts = async () => {
    setIsLoading(true); // Set loading to true when fetching starts
    const colRef = collection(db, 'Products');
    const snapshot = await getDocs(colRef);
    const productsData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
    setProducts(productsData);
    setFilteredProducts(productsData);
    setIsLoading(false); // Set loading to false when fetching completes
  };
  useEffect(() => {
    fetchProducts();
  }, []);

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

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setNewProduct({ ...newProduct, [name]: value });
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setNewProduct({ ...product }); // Set newProduct state with the product being edited
    setShowModal(true);
  };



  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      if (editingProduct) {
        const productRef = doc(db, 'Products', editingProduct.id);
        await updateDoc(productRef, newProduct);
        toastr.success('The product has been updated sucessfully.', 'Product Updated');
      } else {
        toastr.success('The product has been added .', 'Product Added');

      }
      setNewProduct({
        name: '',
        price: '',
        description: '',
        manufacturer: '',
        stock_quantity: '',
        type: ''
      });
      setShowModal(false);
      fetchProducts();
    } catch (error) {
      console.error('Error adding/editing product: ', error);
    }
  };

  const toggleModal = () => {
    setShowModal(!showModal);
    setEditingProduct(null);
  };

  const toggleDropdown = (id) => {
    setDropdownVisible(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const deleteProduct = async (productId) => {
    try {
      await deleteDoc(doc(db, 'Products', productId));
      fetchProducts(); // Fetch products again to update the list
      toastr.success('The product was deleted successfully.', 'Deletion Successful');
    } catch (error) {
      console.error('Error deleting product: ', error);
      toastr.error('There was an error deleting the product. Please try again.', 'Deletion Failed');

    }
  };
  return (
    <div className="product-container pb-12">
    <h2 className='mt-16 title text-center'>Products Page</h2>
      <div className="flex">
      <div className='mt-20'>
          <button onClick={toggleModal} type="button" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">
            ADD New Product
          </button>
        </div>
                <form class="max-w-md mx-auto mt-16" onSubmit={handleSubmit}>
          <label for="default-search" class="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">Search</label>
          <div class="relative">
              <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                  <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                      <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                  </svg>
              </div>
              <input type="search" id="default-search" class="block w-full p-4 px-32 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Search by type or manufacturer..." value={searchTerm} onChange={handleSearchChange} />
              <button type="submit" class="text-white absolute end-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Search</button>
          </div>
        </form>
      </div>

      {/* Spinner */}
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
            <div className="cards-container mx-5">
                {filteredProducts.map(product => (
                  <div key={product.id} className="relative max-w-xs rounded-xl px-8 py-5 text-gray-600 shadow-2xl dark:shadow-lg dark:shadow-gray-300 mt-12">
                    <div className="flex justify-between items-center">
                      <div className="mb-4 w-20 rounded-md bg-blue-100 px-2 py-1 text-sm font-medium text-blue-700">Product</div>
                      <div className="relative">
                        <button onClick={() => toggleDropdown(product.id)} className="focus:outline-none">
                          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v.01M12 12v.01M12 18v.01"></path>
                          </svg>
                        </button>
                        {dropdownVisible[product.id] && (
                          <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                            <ul>
                            <li className="block px-4 py-2 text-gray-800 hover:bg-gray-100 cursor-pointer" onClick={() => handleEditProduct(product)}>Edit</li>
                              <li className="block px-4 py-2 text-danger-800 hover:bg-gray-100 cursor-pointer" onClick={() => deleteProduct(product.id)}>Delete</li>
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="mb-2 text-2xl">{product.name}</div>
                    <div className="mb-6 text-gray-400">
                      <p>Price: ${product.price}</p>
                      {/* <p>Description: {product.description}</p> */}
                      <p className='text-nowrap'>Manufacturer: {product.manufacturer}</p>
                      <p>Stock Quantity: {product.stock_quantity}</p>
                      <p>Type: {product.type}</p>
                    </div>
                    <button className="flex items-center space-x-2 rounded-md border-2 border-blue-500 px-4 py-2 font-medium text-blue-600 transition hover:bg-blue-500 hover:text-white">
                      <span>Learn more</span>
                      <span>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
                          <path fillRule="evenodd" d="M16.72 7.72a.75.75 0 011.06 0l3.75 3.75a.75.75 0 010 1.06l-3.75 3.75a.75.75 0 11-1.06-1.06l2.47-2.47H3a.75.75 0 010-1.5h16.19l-2.47-2.47a.75.75 0 010-1.06z" clipRule="evenodd" />
                        </svg>
                      </span>
                    </button>
                  </div>
                ))}
              </div>
               {/* Add product modal */}
   {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-75">
          <div className="bg-white p-8 rounded-lg">
          <h2 className="text-xl font-bold mb-4">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
            <form className="grid gap-6 mb-6 md:grid-cols-2" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Name</label>
              <input type="text" id="name" name="name" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Name" value={newProduct.name} onChange={handleInputChange} required />
            </div>
            <div>
              <label htmlFor="price" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Price</label>
              <input type="text" id="price" name="price" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Price" value={newProduct.price} onChange={handleInputChange} required />
            </div>
            <div>
              <label htmlFor="description" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Description</label>
              <input type="text" id="description" name="description" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Description" value={newProduct.description} onChange={handleInputChange} required />
            </div>
            <div>
              <label htmlFor="manufacturer" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Manufacturer</label>
              <input type="text" id="manufacturer" name="manufacturer" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Manufacturer" value={newProduct.manufacturer} onChange={handleInputChange} required />
            </div>
            <div>
              <label htmlFor="stock_quantity" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Stock Quantity</label>
              <input type="text" id="stock_quantity" name="stock_quantity" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Stock Quantity" value={newProduct.stock_quantity} onChange={handleInputChange} required />
            </div>
            <div>
              <label htmlFor="type" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Type</label>
              <input type="text" id="type" name="type" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Type" value={newProduct.type} onChange={handleInputChange} required />
            </div>
            <button type="submit" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Add Product</button>
                      </form>
                    </div>
                  </div>
                )}
    </div>
  );
};

export default ProductComponent;
