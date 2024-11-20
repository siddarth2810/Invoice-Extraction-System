'use client';

import { useDispatch, useSelector } from 'react-redux';
import { RootState } from './redux/store';
import { setData } from './redux/slices/dataSlice';
import { generateContent } from './pages/backend';
import { setActiveTab } from './redux/slices/tabSlice';

export default function Home() {
  const dispatch = useDispatch();
  const customers = useSelector((state: RootState) => state.data.customers);
  const products = useSelector((state: RootState) => state.data.products);
  const invoices = useSelector((state: RootState) => state.data.invoices);
  const activeTab = useSelector((state: RootState) => state.tab.activeTab);



  const handleGenerate = async () => {
    try {
      const extractedData = await generateContent();
      dispatch(setData(extractedData));
    } catch (error) {
      console.error('Failed to generate content', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <button
          onClick={handleGenerate}
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Generate Customer Data
        </button>
      </div>
      {/* Tab Navigation */}
      <div className="flex mb-4 space-x-4">
        {(['customers', 'products', 'invoices'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => dispatch(setActiveTab(tab))}
            className={`px-4 py-2 rounded-md transition-colors ${activeTab === tab
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Customers */}
      {activeTab === 'customers' && customers.length > 0 ? (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Purchases</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {customers.map((customer) => (
                <tr
                  key={customer.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">{customer.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{customer.phoneNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    ${customer.totalPurchaseAmount.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : activeTab === 'customers' && customers.length === 0 && (
        <p className="text-gray-500 text-center py-4">No customer data available</p>
      )}

      {/* Products */}
      {activeTab === 'products' && products.length > 0 ? (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Tax</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Price With Tax</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products.map((product) => (
                <tr
                  key={product.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">{product.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{product.quantity}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{product.unitPrice}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{product.tax}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{product.priceWithTax}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : activeTab === 'products' && products.length === 0 && (
        <p className="text-gray-500 text-center py-4">No product data available</p>
      )}

      {/* Invoices */}
      {activeTab === 'invoices' && invoices.length > 0 ? (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Serial Number</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer Name</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Product Name</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Tax</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {invoices.map((invoice) => (
                <tr
                  key={invoice.serialNumber}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">{invoice.serialNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{invoice.customerName}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{invoice.productName}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{invoice.quantity}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{invoice.tax}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{invoice.totalAmount}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{invoice.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : activeTab === 'invoices' && invoices.length === 0 && (
        <p className="text-gray-500 text-center py-4">No invoice data available</p>
      )}
    </div>
  );
}
