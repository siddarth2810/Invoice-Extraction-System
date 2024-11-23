import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Input } from '@/components/ui/input';
import { TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Pencil, X, Check } from 'lucide-react';
import { Product, updateProduct } from '@/app/redux/slices/dataSlice';

interface ProductsTableProps {
	products: Product[];
}

const ProductsTable: React.FC<ProductsTableProps> = ({ products }) => {
	const dispatch = useDispatch();
	const [editingId, setEditingId] = useState<string | null>(null);
	const [editData, setEditData] = useState<Partial<Product>>({});
	const startEdit = (product: Product) => {
		setEditingId(product.id);
		setEditData({
			productName: product.productName,
			quantity: product.quantity,
			unitPrice: product.unitPrice,
			tax: product.tax,
		});
	};

	const handleChange = (field: keyof Product, value: string) => {
		setEditData(prev => ({
			...prev,
			[field]: field === 'productName' ? value : Number(value)
		}));
	};

	const saveChanges = () => {
		if (editingId) {
			dispatch(updateProduct({
				id: editingId,
				...editData
			}));
			setEditingId(null);
		}
	};
	const cancelEdit = () => {
		setEditingId(null);
		setEditData({});
	};

	return (
		<TabsContent value="products">
			{products.length > 0 ? (
				<div className="bg-white shadow-md rounded-lg overflow-hidden">
					<table className="w-full">
						<thead className="bg-gray-100 border-b">
							<tr>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
								<th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
								<th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Tax(%)</th>
								<th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Price With Tax</th>
								<th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-200">
							{products.map((product) => (
								<tr key={product.id} className="hover:bg-gray-50 transition-colors">
									<td className="px-6 py-4 whitespace-nowrap">
										{editingId === product.id ? (
											<Input
												value={editData.productName || ''}
												onChange={(e) => handleChange('productName', e.target.value)}
												className="w-full"
											/>
										) : (
											product.productName
										)}
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										{editingId === product.id ? (
											<Input
												type="number"
												value={editData.quantity || ''}
												onChange={(e) => handleChange('quantity', e.target.value)}
												className="w-full"
											/>
										) : (
											product.quantity
										)}
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-right">
										{editingId === product.id ? (
											<Input
												type="number"
												value={editData.unitPrice || ''}
												onChange={(e) => handleChange('unitPrice', e.target.value)}
												className="w-full"
											/>
										) : (
											product.unitPrice.toFixed(2)
										)}
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-right">
										{editingId === product.id ? (
											<Input
												type="number"
												value={editData.tax || ''}
												onChange={(e) => handleChange('tax', e.target.value)}
												className="w-full"
											/>
										) : (
											product.tax.toFixed(2)
										)}
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-right">
										{product.priceWithTax.toFixed(2)}
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-center">
										{editingId === product.id ? (
											<div className="flex justify-center space-x-2">
												<Button
													onClick={saveChanges}
													variant="ghost"
													size="icon"
													className="h-8 w-8"
												>
													<Check className="h-4 w-4" />
												</Button>
												<Button
													onClick={cancelEdit}
													variant="ghost"
													size="icon"
													className="h-8 w-8"
												>
													<X className="h-4 w-4" />
												</Button>
											</div>
										) : (
											<Button
												onClick={() => startEdit(product)}
												variant="ghost"
												size="icon"
												className="h-8 w-8"
											>
												<Pencil className="h-4 w-4" />
											</Button>
										)}
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
	);
};

export default ProductsTable;
