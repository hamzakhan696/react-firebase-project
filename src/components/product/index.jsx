import React, { useEffect, useState } from 'react';
import { getDocs, collection, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebase'; 
import '../../App.css'; // Importing the app.css file
import toastr from "toastr";
import "toastr/build/toastr.min.css"; // Import toastr CSS
import { Oval } from 'react-loader-spinner'
import { Link } from 'react-router-dom';

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
    type: '',
    image: '' // Add this line
  });
  const [imagePreview, setImagePreview] = useState(''); // State to track image preview
  
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
    setImagePreview(product.image); // Set image preview with the existing product image
    setShowModal(true);
    closeDropdown(product.id); // Close the dropdown
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
     // Validate required fields
     if (!newProduct.name || !newProduct.price || !newProduct.description || !newProduct.manufacturer || !newProduct.stock_quantity || !newProduct.type) {
      toastr.error('Please fill out all required fields.', 'Form Validation Error');
      return;
    }
    try {
      if (editingProduct) {
        const productRef = doc(db, 'Products', editingProduct.id);
        await updateDoc(productRef, newProduct);
        toastr.success('The product has been updated successfully.', 'Product Updated');
      } else {
        await addDoc(collection(db, 'Products'), newProduct);
        toastr.success('The product has been added.', 'Product Added');
      }
      setNewProduct({
        name: '',
        price: '',
        description: '',
        manufacturer: '',
        stock_quantity: '',
        type: '',
        image: '' // Reset the image field
      });
      setImagePreview(''); // Reset image preview
      setShowModal(false);
      fetchProducts();
    } catch (error) {
      console.error('Error adding/editing product: ', error);
    }
  };

  const toggleModal = () => {
    setShowModal(!showModal);
    setEditingProduct(null);
    setImagePreview(''); // Reset image preview when closing the modal
  };

  const toggleDropdown = (id) => {
    setDropdownVisible(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const closeDropdown = (id) => {
    setDropdownVisible(prev => ({
      ...prev,
      [id]: false
    }));
  };

  const deleteProduct = async (productId) => {
    try {
      await deleteDoc(doc(db, 'Products', productId));
      fetchProducts(); // Fetch products again to update the list
      toastr.success('The product was deleted successfully.', 'Deletion Successful');
      closeDropdown(productId); // Close the dropdown
    } catch (error) {
      console.error('Error deleting product: ', error);
      toastr.error('There was an error deleting the product. Please try again.', 'Deletion Failed');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setImagePreview(''); // Reset image preview when closing the modal
  };

  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setNewProduct({ ...newProduct, image: reader.result });
      setImagePreview(reader.result); // Update image preview with the new image
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="product-container pb-12 relative">
      <div className="login-image absolute inset-0 flex justify-center items-center opacity-10 pointer-events-none z-0">
        <img src="/logo.jpg" alt="logo" className="img-fluid h-full w-full" style={{ width: '60%', height: '60%', objectFit: 'contain' }} />
      </div>
      <h2 className='mt-16 title text-center'>Products Page</h2>
      <div className="flex">
        <div className='mt-20'>
          <button onClick={toggleModal} type="button" className="text-nowrap text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2">
            Add New Product
          </button>
        </div>
    
        <div className="w-4/6	max-w-sm mx-auto mt-20">
          <form className="relative" onSubmit={handleSubmit}>
            <input 
              type="text" 
              className="w-full pl-10 lg:mx-56 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Search by type and manufacturer..." value={searchTerm} onChange={handleSearchChange}
            />
            <svg className="absolute lg:mx-56 left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.9 14.32a8 8 0 111.414-1.414l5.387 5.387a1 1 0 01-1.414 1.414l-5.387-5.387zM14 8a6 6 0 11-12 0 6 6 0 0112 0z" clipRule="evenodd" />
            </svg>
          </form>
        </div>
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
          <div key={product.id} className="relative max-w-xs rounded-xl px-8 py-5 text-gray-600 shadow-2xl mt-12">
            <div className="flex justify-between items-center">
              <div className="mb-4 w-15 rounded-md bg-blue-100 px-2 py-1 text-sm font-medium text-blue-700">Product</div>
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
            <Link to={`/product/${product.id}`}>
              <div className="mt-2">
                {product.image && (
                  <div className="mt-4">
                    <img src={product.image} alt={product.name} className="w-32 h-32 object-cover" />
                  </div>
                )}
                <h2 className="text-lg font-bold text-gray-800">{product.name}</h2>
                <p className="mt-2 text-sm text-gray-600">{product.description}</p>
                <div className="flex items-center mt-2">
                  <span className="text-sm font-medium text-gray-800">Price:</span>
                  <span className="ml-2 text-sm text-gray-600">${product.price}</span>
                </div>
                <div className="flex items-center mt-2">
                  <span className="text-sm font-medium text-gray-800">Manufacturer:</span>
                  <span className="ml-2 text-sm text-gray-600">{product.manufacturer}</span>
                </div>
                <div className="flex items-center mt-2">
                  <span className="text-sm font-medium text-gray-800">Stock:</span>
                  <span className="ml-2 text-sm text-gray-600">{product.stock_quantity}</span>
                </div>
                <div className="flex items-center mt-2">
                  <span className="text-sm font-medium text-gray-800">Type:</span>
                  <span className="ml-2 text-sm text-gray-600">{product.type}</span>
                </div>
                <button className="mt-4 flex items-center space-x-2 rounded-md border-2 border-blue-500 px-4 py-2 font-medium text-blue-600 transition hover:bg-blue-500 hover:text-white"><span>More Detail</span><span><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6"><path fillRule="evenodd" d="M16.72 7.72a.75.75 0 011.06 0l3.75 3.75a.75.75 0 010 1.06l-3.75 3.75a.75.75 0 11-1.06-1.06l-2.47-2.47H3a.75.75 0 010-1.5h16.19l-2.47-2.47a.75.75 0 010-1.06z" clipRule="evenodd"></path></svg></span></button>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-auto bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
            <h2 className="text-2xl font-semibold mb-4">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div className="mb-4">
                  <label className="block mb-1 font-semibold">Name:</label>
                  <input type="text" name="name" value={newProduct.name} onChange={handleInputChange} className="w-full border border-gray-300 rounded px-3 py-2" placeholder='Name' />
                </div>
                <div className="mb-4">
                  <label className="block mb-1 font-semibold">Price:</label>
                  <input type="text" name="price" value={newProduct.price} onChange={handleInputChange} className="w-full border border-gray-300 rounded px-3 py-2" placeholder='Price' />
                </div>
                <div className="mb-4">
                  <label className="block mb-1 font-semibold">Manufacturer:</label>
                  <input type="text" name="manufacturer" value={newProduct.manufacturer} onChange={handleInputChange} className="w-full border border-gray-300 rounded px-3 py-2" placeholder='Manufacturer' />
                </div>
                <div className="mb-4">
                  <label className="block mb-1 font-semibold">Stock Quantity:</label>
                  <input type="text" name="stock_quantity" value={newProduct.stock_quantity} onChange={handleInputChange} className="w-full border border-gray-300 rounded px-3 py-2" placeholder='Quantity' />
                </div>
                <div className="mb-4">
                  <label className="block mb-1 font-semibold">Type:</label>
                  <input type="text" name="type" value={newProduct.type} onChange={handleInputChange} className="w-full border border-gray-300 rounded px-3 py-2" placeholder='Type' />
                </div>
                <div className="mb-4 ">
                  <label className="block mb-1 font-semibold">Description:</label>
                  <input name="description" value={newProduct.description} onChange={handleInputChange} className="w-full border border-gray-300 rounded px-3 py-2" placeholder='Description'/>
                </div>
                <div className="mb-4 col-span-2">
                  <label className="block mb-1 font-semibold">Image:</label>
                  {imagePreview && (
                    <div className="mb-2">
                      <img src={imagePreview} alt="Product" className="w-32 h-32 object-cover" />
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={handleImageChange} className="w-full border border-gray-300 rounded px-3 py-2" />
                </div>
              
              </div>
              <div className="flex justify-end mt-4">
                <button type="button" onClick={handleCloseModal} className="mr-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded">Cancel</button>
                <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded">{editingProduct ? 'Update' : 'Add'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductComponent;
