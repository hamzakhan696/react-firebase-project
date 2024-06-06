import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/firebase'; // Import your firebase configuration
import { Oval } from 'react-loader-spinner';
import { Link } from 'react-router-dom';

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
    <div className="cards-container mx-5 mx-md-32 mt-5 mb-5">
      <div className="login-image absolute inset-0 flex justify-center items-center opacity-10 pointer-events-none z-0">
        <img src="/logo.jpg" alt="logo" className="img-fluid h-full w-full" style={{ width: '50%', height: '50%', objectFit:'contain' }} />
      </div>
      {product ? (
        <div key={product.id} className="max-w-xs rounded-xl px-8 py-5 text-gray-600 shadow-2xl mt-12">
          <div className="mb-4 w-32 rounded-md bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">Product Details</div>
          {product.image && (
            <div className="mb-4">
              <img src={product.image} alt={product.name} className="w-32 h-32 object-cover" />
            </div>
          )}
          <div className="mb-2 text-2xl">{product.name}</div>
          <div className="mb-6 text-gray-400">
            <p> <span className='text-gray-900 overflow-hidden whitespace-nowrap text-ellipsis '>Price:</span> ${product.price}</p>
            <p> <span className='text-gray-900 overflow-hidden whitespace-nowrap text-ellipsis'>Description:</span>  {product.description}</p>
            <p> <span className='text-gray-900 overflow-hidden whitespace-nowrap text-ellipsis'>Manufacturer:</span> {product.manufacturer}</p>
            <p><span className='text-gray-900 overflow-hidden whitespace-nowrap text-ellipsis'>Stock quantity:</span> {product.stock_quantity}</p>
            <p><span className='text-gray-900 overflow-hidden whitespace-nowrap text-ellipsis'>Type:</span>  {product.type}</p>
          </div>
         
        </div>
      ) : (
        <div className="flex justify-center items-center h-40">
          <Oval color="#00BFFF" height={40} width={40} />
          <p className="ml-3 text-gray-700">Loading...</p>
        </div>
      )}
    </div>
  );
};

export default ProductDetailComponent;
