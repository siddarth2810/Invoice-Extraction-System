import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Input } from '@/components/ui/input';
import { TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Pencil, X, Check } from 'lucide-react';
import { Invoice, updateInvoice } from '@/app/redux/slices/dataSlice';


interface InvoicesTableProps {
	invoices: Invoice[];
}

const InvoicesTable: React.FC<InvoicesTableProps> = ({ invoices }) => {
	const dispatch = useDispatch();
	const [editingId, setEditingId] = useState<string | null>(null);
	const [editData, setEditData] = useState<Partial<Invoice>>({});

	const startEdit = (item) => {
		setEditingId(item.id);
		setEditData({
			customerName: item.customerName,
			productName: item.productName,
			quantity: item.quantity,
			date: item.date
		});
	};

	const handleChange = (field: keyof Invoice, value: string | number) => {
		setEditData(prev => ({
			...prev,
			[field]: field === 'quantity' ? Number(value) : value
		}));
	};


	const saveChanges = () => {
		if (editingId) {
			dispatch(updateInvoice({
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
		<TabsContent value="invoices">
			{invoices.length > 0 ? (
				<div className="bg-white shadow-md rounded-lg overflow-hidden">
					<table className="w-full">
						<thead className="bg-gray-100 border-b">
							<tr>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice ID</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer Name</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Name</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
								<th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Price With Tax</th>
								<th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
								<th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-200">
							{invoices.map((item) => (
								<tr key={item.id} className="hover:bg-gray-50 transition-colors">
									<td className="px-6 py-4 whitespace-nowrap">{item.serialNumber}</td>
									<td className="px-6 py-4 whitespace-nowrap">
										{editingId === item.id ? (
											<Input
												value={editData.customerName}
												onChange={(e) => handleChange('customerName', e.target.value)}
												className="w-full"
											/>
										) : (
											item.customerName
										)}
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										{editingId === item.id ? (
											<Input
												value={editData.productName}
												onChange={(e) => handleChange('productName', e.target.value)}
												className="w-full"
											/>
										) : (
											item.productName
										)}
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										{editingId === item.id ? (
											<Input
												type="number"
												value={editData.quantity}
												onChange={(e) => handleChange('quantity', e.target.value)}
												className="w-full"
											/>
										) : (
											item.quantity
										)}
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-right">
										{item.priceWithTax}
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-right">
										{item.date}
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-center">
										{editingId === item.id ? (
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
												onClick={() => startEdit(item)}
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
				<p className="text-gray-500 text-center py-4">No final data available</p>
			)}
		</TabsContent>
	);
};

export default InvoicesTable;
