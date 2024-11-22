import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Pencil, Check, X } from 'lucide-react';
import { updateCustomer, Customer } from '@/app/redux/slices/dataSlice';

interface CustomersTableProps {
	customers: Customer[];
}

const CustomersTable: React.FC<CustomersTableProps> = ({ customers }) => {
	const dispatch = useDispatch();
	const [editingId, setEditingId] = useState<string | null>(null);
	const [editData, setEditData] = useState<Partial<Customer>>({});

	const startEdit = (customer: Customer) => {
		setEditingId(customer.id);
		setEditData({
			customerName: customer.customerName,
			phoneNumber: customer.phoneNumber
		});
	};

	const handleChange = (field: keyof Customer, value: string) => {
		setEditData(prev => ({
			...prev,
			[field]: value
		}));
	};

	const saveChanges = () => {
		if (editingId) {
			dispatch(updateCustomer({
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
		<TabsContent value="customers">
			{customers.length > 0 ? (
				<div className="bg-white shadow-md rounded-lg overflow-hidden">
					<table className="w-full">
						<thead className="bg-gray-100 border-b">
							<tr>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone Number</th>
								<th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Purchase Amount</th>
								<th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-200">
							{customers.map((customer) => (
								<tr key={customer.id} className="hover:bg-gray-50 transition-colors">
									<td className="px-6 py-4 whitespace-nowrap">
										{editingId === customer.id ? (
											<Input
												value={editData.customerName || ''}
												onChange={(e) => handleChange('customerName', e.target.value)}
												className="w-full"
											/>
										) : (
											customer.customerName
										)}
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										{editingId === customer.id ? (
											<Input
												value={editData.phoneNumber || ''}
												onChange={(e) => handleChange('phoneNumber', e.target.value)}
												className="w-full"
											/>
										) : (
											customer.phoneNumber || '-'
										)}
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-right">
										{customer.totalPurchaseAmount.toFixed(2)}
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-center">
										{editingId === customer.id ? (
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
												onClick={() => startEdit(customer)}
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
				<p className="text-gray-500 text-center py-4">No customer data available</p>
			)}
		</TabsContent>
	);
};

export default CustomersTable;
