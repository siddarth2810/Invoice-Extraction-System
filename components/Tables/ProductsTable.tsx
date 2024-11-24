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
				<div className="table-container">
					<table className="w-full">
						<thead className="table-header">
							<tr>
								<th>Name</th>
								<th>Quantity</th>
								<th>Unit Price</th>
								<th>Tax(%)</th>
								<th>Price With Tax</th>
								<th>Actions</th>
							</tr>
						</thead>
						<tbody className="table-body">
							{products.map((product) => (
								<tr key={product.id} className="table-row">
									<td className="table-cell">
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
									<td className="table-cell">
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
									<td className="table-cell">
										{editingId === product.id ? (
											<Input
												type="number"
												value={editData.unitPrice || ''}
												onChange={(e) => handleChange('unitPrice', e.target.value)}
												className="w-full"
											/>
										) : (
											product.unitPrice
										)}
									</td>
									<td className="table-cell">
										{editingId === product.id ? (
											<Input
												type="number"
												value={editData.tax || ''}
												onChange={(e) => handleChange('tax', e.target.value)}
												className="w-full"
											/>
										) : (
											product.tax
										)}
									</td>
									<td className="table-cell">
										{product.priceWithTax}
									</td>
									<td className="table-cell">
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