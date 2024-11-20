'use client';

import { useDispatch, useSelector } from 'react-redux';
import { RootState } from './redux/store';
import { setData } from './redux/slices/dataSlice';
import { generateContent } from './pages/backend';

export default function Home() {
  const dispatch = useDispatch();
  const customers = useSelector((state: RootState) => state.data.customers);

  const handleGenerate = async () => {
    try {
      const extractedData = await generateContent();
      dispatch(setData(extractedData));
    } catch (error) {
      console.error('Failed to generate content', error);
    }
  };

  return (
    <main className="p-8">
      <div className="mb-8">
        <button
          onClick={handleGenerate}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Generate Data
        </button>
      </div>

      {customers && customers.length > 0 ? (
        <div className="overflow-x-auto">
          <h2 className="text-2xl font-bold mb-4">Customers</h2>
          <table className="min-w-full bg-white border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-6 py-3 border-b text-left">ID</th>
                <th className="px-6 py-3 border-b text-left">Name</th>
                <th className="px-6 py-3 border-b text-left">Phone Number</th>
                <th className="px-6 py-3 border-b text-right">Total Purchase Amount</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 border-b">{customer.id || 'N/A'}</td>
                  <td className="px-6 py-4 border-b">{customer.name || 'N/A'}</td>
                  <td className="px-6 py-4 border-b">{customer.phoneNumber || 'N/A'}</td>
                  <td className="px-6 py-4 border-b text-right">
                    ${typeof customer.totalPurchaseAmount === 'number'
                      ? customer.totalPurchaseAmount.toFixed(2)
                      : '0.00'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-500">No customer data available. Click Generate Data to fetch.</p>
      )}
    </main>
  );
}
