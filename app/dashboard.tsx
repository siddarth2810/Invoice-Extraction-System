'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { Check, Upload } from 'lucide-react'

type Product = {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  tax: number;
  priceWithTax: number;
}

type Customer = {
  id: string;
  name: string;
  phoneNumber: string;
  totalPurchaseAmount: number;
}

type Invoice = {
  serialNumber: string;
  customerName: string;
  productName: string;
  quantity: number;
  tax: number;
  totalAmount: number;
  date: string;
}

export default function Dashboard() {
  const [file, setFile] = useState<File | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      // Here you would typically process the file and update the state
      // For this example, we'll just simulate data loading
      setTimeout(() => {
        setProducts([{ id: '1', name: 'Sample Product', quantity: 10, unitPrice: 100, tax: 10, priceWithTax: 110 }])
        setCustomers([{ id: '1', name: 'John Doe', phoneNumber: '123-456-7890', totalPurchaseAmount: 1000 }])
        setInvoices([{ serialNumber: 'INV001', customerName: 'John Doe', productName: 'Sample Product', quantity: 1, tax: 10, totalAmount: 110, date: '2023-05-20' }])
      }, 1000)
    }
  }

  return (
    <div className="min-h-screen bg-[#faf4ed] text-[#575279] p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-[#907aa9]">Dashboard</h1>

        <Card className="mb-8 bg-[#fffaf3] border-none shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Input
                  type="file"
                  accept=".pdf,.csv,.xlsx"
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
          </CardContent>
        </Card>

        <Tabs defaultValue="products" className="w-full">
          <TabsList className="w-full bg-[#fffaf3] p-0 mb-4">
            <TabsTrigger value="products" className="flex-1 py-2.5 data-[state=active]:bg-[#faf4ed] data-[state=active]:text-[#907aa9] rounded-none border-b-2 border-transparent data-[state=active]:border-[#907aa9]">Products</TabsTrigger>
            <TabsTrigger value="customers" className="flex-1 py-2.5 data-[state=active]:bg-[#faf4ed] data-[state=active]:text-[#907aa9] rounded-none border-b-2 border-transparent data-[state=active]:border-[#907aa9]">Customers</TabsTrigger>
            <TabsTrigger value="invoices" className="flex-1 py-2.5 data-[state=active]:bg-[#faf4ed] data-[state=active]:text-[#907aa9] rounded-none border-b-2 border-transparent data-[state=active]:border-[#907aa9]">Invoices</TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <DataTable
              data={products}
              columns={[
                { header: 'Name', accessor: 'name' },
                { header: 'Quantity', accessor: 'quantity' },
                { header: 'Unit Price', accessor: 'unitPrice', format: (value) => `$${value.toFixed(2)}` },
                { header: 'Tax', accessor: 'tax', format: (value) => `$${value.toFixed(2)}` },
                { header: 'Price with Tax', accessor: 'priceWithTax', format: (value) => `$${value.toFixed(2)}` },
              ]}
              emptyMessage="No product data available"
            />
          </TabsContent>

          <TabsContent value="customers">
            <DataTable
              data={customers}
              columns={[
                { header: 'Name', accessor: 'name' },
                { header: 'Phone Number', accessor: 'phoneNumber' },
                { header: 'Total Purchase Amount', accessor: 'totalPurchaseAmount', format: (value) => `$${value.toFixed(2)}` },
              ]}
              emptyMessage="No customer data available"
            />
          </TabsContent>

          <TabsContent value="invoices">
            <DataTable
              data={invoices}
              columns={[
                { header: 'Serial Number', accessor: 'serialNumber' },
                { header: 'Customer Name', accessor: 'customerName' },
                { header: 'Product Name', accessor: 'productName' },
                { header: 'Quantity', accessor: 'quantity' },
                { header: 'Tax', accessor: 'tax', format: (value) => `$${value.toFixed(2)}` },
                { header: 'Total Amount', accessor: 'totalAmount', format: (value) => `$${value.toFixed(2)}` },
                { header: 'Date', accessor: 'date' },
              ]}
              emptyMessage="No invoice data available"
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

type Column<T> = {
  header: string
  accessor: keyof T
  format?: (value: any) => string
}

function DataTable<T>({ data, columns, emptyMessage }: { data: T[], columns: Column<T>[], emptyMessage: string }) {
  return (
    <div className="rounded-md border border-[#dfdad9] bg-[#fffaf3]">
      <ScrollArea className="h-[400px] w-full">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-[#dfdad9] bg-[#faf4ed]">
              {columns.map((column) => (
                <TableHead key={column.header} className="text-[#797593] font-medium">
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length > 0 ? (
              data.map((item, index) => (
                <TableRow key={index} className="border-b border-[#dfdad9] last:border-0">
                  {columns.map((column) => (
                    <TableCell key={column.header} className="text-[#575279]">
                      {column.format ? column.format(item[column.accessor]) : item[column.accessor] as string}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-4 text-[#797593]">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  )
}
