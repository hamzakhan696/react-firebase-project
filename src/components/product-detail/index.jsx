import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { Oval } from 'react-loader-spinner';

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
    <div className="relative mx-5 mx-md-32 mt-5 mb-5">
      {/* Logo image behind the cards */}
      <div className="absolute inset-0 flex justify-center items-center opacity-10 pointer-events-none z-0">
        <img src="/logo.jpg" alt="logo" className="img-fluid h-full w-full" style={{ width: '50%', height: '50%', objectFit: 'contain' }} />
      </div>

      {/* Cards container */}
      <div className="relative z-10 max-w-xs rounded-xl px-8 py-5 text-gray-600 shadow-2xl mt-12 bg-white">
        {product ? (
          <React.Fragment key={product.id}>
            <div className="mb-4 w-32 rounded-md bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">Product Details</div>
            {product.image && (
              <div className="my-4">
                <img src={product.image} alt={product.name} className="w-100 h-100 object-cover" />
              </div>
            )}
            <div className="mb-2 text-2xl">{product.name}</div>
            <div className="mb-6 text-gray-400">
              <p><span className='text-gray-900 overflow-hidden whitespace-nowrap text-ellipsis'>Price:</span> ${product.price}</p>
              <p><span className='text-gray-900 overflow-hidden whitespace-nowrap text-ellipsis'>Description:</span> {product.description}</p>
              <p><span className='text-gray-900 overflow-hidden whitespace-nowrap text-ellipsis'>Manufacturer:</span> {product.manufacturer}</p>
              <p><span className='text-gray-900 overflow-hidden whitespace-nowrap text-ellipsis'>Stock quantity:</span> {product.stock_quantity}</p>
              <p><span className='text-gray-900 overflow-hidden whitespace-nowrap text-ellipsis'>Type:</span> {product.type}</p>
            </div>
          </React.Fragment>
        ) : (
          <div className="flex justify-center items-center h-40">
            <Oval color="#00BFFF" height={40} width={40} />
            <p className="ml-3 text-gray-700">Loading...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailComponent;
