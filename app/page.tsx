'use client';

import { useDispatch, useSelector } from 'react-redux';
import { RootState } from './redux/store';
import { setData } from './redux/slices/dataSlice';
import { generateContent } from './pages/backend';
import { setActiveTab } from './redux/slices/tabSlice';
import { useState } from 'react';


//ui 
import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { Check, Upload } from 'lucide-react'


export default function Home() {

  const dispatch = useDispatch();
  const customers = useSelector((state: RootState) => state.data.customers);
  const products = useSelector((state: RootState) => state.data.products);
  const invoices = useSelector((state: RootState) => state.data.invoices);
  const activeTab = useSelector((state: RootState) => state.tab.activeTab);
  const [file, setFile] = useState<File | null>(null);


  const productColumns = [
    { header: 'Name', accessor: 'name' },
    { header: 'Quantity', accessor: 'quantity' },
    { header: 'Unit Price', accessor: 'unitPrice', format: (value) => `$${value.toFixed(2)}` },
    { header: 'Tax', accessor: 'tax', format: (value) => `$${value.toFixed(2)}` },
    { header: 'Price with Tax', accessor: 'priceWithTax', format: (value) => `$${value.toFixed(2)}` },
  ];

  const customerColumns = [
    { header: 'Name', accessor: 'name' },
    { header: 'Phone Number', accessor: 'phoneNumber' },
    { header: 'Total Purchase Amount', accessor: 'totalPurchaseAmount', format: (value) => `$${value.toFixed(2)}` },
  ];

  const invoiceColumns = [
    { header: 'Serial Number', accessor: 'serialNumber' },
    { header: 'Customer Name', accessor: 'customerName' },
    { header: 'Product Name', accessor: 'productName' },
    { header: 'Quantity', accessor: 'quantity' },
    { header: 'Tax', accessor: 'tax', format: (value) => `$${value.toFixed(2)}` },
    { header: 'Total Amount', accessor: 'totalAmount', format: (value) => `$${value.toFixed(2)}` },
    { header: 'Date', accessor: 'date' },
  ];



  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    setFile(selectedFile || null);
  };


  const handleGenerate = async () => {
    if (!file) {
      alert('Please upload a PDF first');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      const extractedData = await generateContent(formData);
      dispatch(setData(extractedData));
    } catch (error) {
      console.error('Failed to generate content', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf4ed] text-[#575279] p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-[#907aa9]">Invoice Extraction</h1>
        <Card className="mb-8 bg-[#fffaf3] border-none shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="sr-only"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer inline-flex items-center rounded-md bg-[#dfdad9] px-4 py-2 text-sm font-medium text-[#575279] hover:bg-[#f2e9e1] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#907aa9]"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload File
                </label>
              </div>
              {file && (
                <div className="flex items-center text-[#d7827e]">
                  <Check className="mr-2 h-4 w-4" />
                  <span className="text-sm">{file.name} uploaded</span>
                </div>
              )}
            </div>
            <Button
              onClick={handleGenerate}
              disabled={!file}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              Generate Data
            </Button>
          </CardContent>
        </Card>

        <Tabs defaultValue={activeTab} onValueChange={(value) => dispatch(setActiveTab(value))} className="w-full">
          {/* Tab Navigation */}
          <TabsList className="w-full bg-[#fffaf3] p-0 mb-4">
            {(['customers', 'products', 'invoices'] as const).map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab}
                className={`flex-1 py-2.5 data-[state=active]:bg-[#faf4ed] data-[state=active]:text-[#907aa9] rounded-none border-b-2 border-transparent data-[state=active]:border-[#907aa9]`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Products Table */}
          <TabsContent value="products">
            {products.length > 0 ? (
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
                      <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">{product.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{product.quantity}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          ${product.unitPrice.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          ${product.tax.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          ${product.priceWithTax.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No product data available</p>
            )}
          </TabsContent>
        </Tabs>


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

        {/* Customers */}
        {activeTab === 'customers' && customers.length > 0 ? (
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone Number</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Purchase Amount</th>
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


      </div>
      );
}
