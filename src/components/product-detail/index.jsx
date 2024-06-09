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

      {/* Cards container */}
      <div className="bg-white relative max-w-xs rounded-xl overflow-hidden text-gray-600 border border-gray-300 shadow-2xl z-10 mt-14">
        {product ? (
          <React.Fragment key={product.id}>
            <div className="absolute top-4 left-4 mb-4 w-20 rounded-md bg-blue-100 px-4 py-1 text-sm font-medium text-blue-700 z-10">Product</div>
            {product.image && (
                <div className="w-full h-[250px] overflow-hidden">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover hover:scale-150 transition duration-300" />
                </div>
            )}
            <div className="px-8 py-5">
              <div className="text-ellipsis font-bold mb-2 text-2xl z-10">{product.name}</div>
              <div className="mb-6 text-gray-400">
                <p><span className='text-gray-900 overflow-hidden whitespace-nowrap text-ellipsis'>Price:</span> ${product.price}</p>
                <p><span className='text-gray-900 overflow-hidden whitespace-nowrap text-ellipsis'>Description:</span> {product.description}</p>
                <p><span className='text-gray-900 overflow-hidden whitespace-nowrap text-ellipsis'>Manufacturer:</span> {product.manufacturer}</p>
                <p><span className='text-gray-900 overflow-hidden whitespace-nowrap text-ellipsis'>Stock quantity:</span> {product.stock_quantity}</p>
                <p><span className='text-gray-900 overflow-hidden whitespace-nowrap text-ellipsis'>Type:</span> {product.type}</p>
              </div>
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
