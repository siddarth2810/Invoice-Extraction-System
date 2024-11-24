'use client'

import { useDispatch, useSelector } from 'react-redux'
import { RootState } from './redux/store'
import { setInitialData } from './redux/slices/dataSlice'
import { generateContent } from './pages/backend'
import { setActiveTab, TabType } from './redux/slices/tabSlice'
import { useEffect, useState, useCallback } from 'react'
import ProductsTable from "@/components/Tables/ProductsTable"
import CustomersTable from "@/components/Tables/CustomersTable"
import InvoicesTable from "@/components/Tables/InvoicesTable"
import { Loader2, Users, Package, Receipt } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Check, Upload } from 'lucide-react'

export default function Home() {
  const dispatch = useDispatch()
  const customers = useSelector((state: RootState) => state.data.customers)
  const products = useSelector((state: RootState) => state.data.products)
  const invoices = useSelector((state: RootState) => state.data.invoices)
  const activeTab = useSelector((state: RootState) => state.tab.activeTab)
  const [file, setFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)


  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) {
      return;
    }

    const validFileTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'application/pdf'
    ];

    const isValidType = validFileTypes.includes(selectedFile.type) ||
      selectedFile.type.startsWith('image/');

    if (!isValidType) {
      alert('Please upload a PDF, Excel file, or image');
      return;
    }

    setFile(selectedFile);
  }, []);

  useEffect(() => {
    if (file) {
      // Perform any side effects related to file change here
      console.log('File has been set:', file);
    }
  }, [file]);

  const handleGenerate = async () => {
    if (!file) {
      alert('Please upload a file first')
      return;
    }

    try {
      setIsLoading(true)

      // Handle other file types using existing logic
      const formData = new FormData()
      formData.append('file', file)
      formData.append('fileType', file.type)
      const extractedData = await generateContent(formData)
      dispatch(setInitialData(extractedData))
    } catch (error) {
      console.error('Failed to generate content', error)
      alert('Error processing file. Please try again.')
    } finally {
      return setIsLoading(false)
    }
  }

  return (
     <div className="min-h-screen bg-gradient-to-b from-purple-100 via-purple-50 to-white text-slate-800 p-8">
      <div className="px-12 py-6">
        <div className="mb-12 space-y-4">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-800 via-purple-600 to-purple-400 bg-clip-text text-transparent">
            Invoice Data Extraction System
          </h1>
          <p className="text-purple-600/80 text-lg">
            Upload your documents and let AI handle the rest
          </p>
        </div>

        <Card className="mb-8 bg-white/70 backdrop-blur border border-purple-100 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="relative">
                <Input
                  type="file"
                  accept=".pdf,.xlsx,.xls"
                  onChange={handleFileChange}
                  className="sr-only"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer inline-flex items-center rounded-md bg-purple-50 px-4 py-2 text-sm font-medium text-purple-700 hover:bg-purple-100 border border-purple-200 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-400"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload File
                </label>
              </div>
              {file && (
                <div className="flex items-center text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                  <Check className="mr-2 h-4 w-4" />
                  <span className="text-sm font-medium">{file.name} uploaded</span>
                </div>
              )}
              <Button
                onClick={handleGenerate}
                disabled={!file || isLoading}
                className="ml-auto bg-purple-500 hover:bg-purple-600 text-white shadow-md transition-all disabled:opacity-50 disabled:hover:bg-purple-500"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Generate Data'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Tabs
          defaultValue={activeTab}
          onValueChange={(value) => {
            if (['customers', 'products', 'invoices'].includes(value)) {
              dispatch(setActiveTab(value as TabType))
            }
          }}
          className="tabs-container"
        >
         <TabsList className="tabs-list">
            <TabsTrigger value="customers" className="tabs-trigger">
              <Users className="w-4 h-4" />
              Customers
            </TabsTrigger>
            <TabsTrigger value="products" className="tabs-trigger">
              <Package className="w-4 h-4" />
              Products
            </TabsTrigger>
            <TabsTrigger value="invoices" className="tabs-trigger">
              <Receipt className="w-4 h-4" />
              Invoices
            </TabsTrigger>
          </TabsList> 

          <div className="tabs-content-container">
            <TabsContent value="invoices">
              <InvoicesTable invoices={invoices} />
            </TabsContent>
            <TabsContent value="products">
              <ProductsTable products={products} />
            </TabsContent>
            <TabsContent value="customers">
              <CustomersTable customers={customers} />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}
