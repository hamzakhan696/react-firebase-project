import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/firebase'; // Import your firebase configuration

const ProductDetailComponent = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const docRef = doc(db, 'Products', productId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProduct({ ...docSnap.data(), id: docSnap.id });
        } else {
          console.log('No such document!');
        }
      } catch (error) {
        console.error('Error fetching product: ', error);
      }
    };

    fetchProduct();
  }, [productId]);

  return (

    <div className="cards-container mx-32 mt-5 mb-5">
    {product ? (
      <div key={product.id} className="max-w-xs rounded-xl px-8 py-5 text-gray-600 shadow-2xl dark:shadow-lg dark:shadow-gray-300 mt-12">
        <div className="mb-4 w-20 rounded-md bg-blue-100 px-2 py-1 text-sm font-medium text-blue-700">Product</div>
        <div className="mb-2 text-2xl">{product.name}</div>
        <div className="mb-6 text-gray-400">
          <p> <span className='text-gray-900 dark:text-gray-200 '>Price:</span> ${product.price}</p>
          <p> <span className='text-gray-900 dark:text-gray-200'>Description:</span>  {product.description}</p>
          <p> <span className='text-gray-900 dark:text-gray-200'>Manufacturer:</span> {product.manufacturer}</p>
          <p><span className='text-gray-900 dark:text-gray-200'>Stock quantity:</span> {product.stock_quantity}</p>
          <p><span className='text-gray-900 dark:text-gray-200'>Type:</span>  {product.type}</p>
        </div>
        {/* <a href="#" className="flex items-center justify-center rounded-md bg-slate-900 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-4 focus:ring-blue-300">
          <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
          </svg>
          Add to cart
        </a> */}
      </div>
    ) : (
      <p>Loading...</p>
    )}
  </div>

  );
};

export default ProductDetailComponent;
