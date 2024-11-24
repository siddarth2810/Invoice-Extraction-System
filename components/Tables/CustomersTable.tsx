import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Pencil, Check, X } from 'lucide-react';
import { updateCustomer, Customer } from '@/app/redux/slices/dataSlice';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"

interface CustomersTableProps {
	customers: Customer[];
}

const CustomersTable: React.FC<CustomersTableProps> = ({ customers }) => {
	const dispatch = useDispatch();
	const [editingId, setEditingId] = useState<string | null>(null);
	const [selectedText, setSelectedText] = useState<string | null>(null);
	const [editData, setEditData] = useState<Partial<Customer>>({});

	const startEdit = (customer: Customer) => {
		setEditingId(customer.id);
		setEditData({
			customerName: customer.customerName,
			phoneNumber: customer.phoneNumber,
			address: customer.address
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
				<div className="table-container">
					<table className="w-full">
						<thead className="table-header">
							<tr>
								<th>Name</th>
								<th>Phone Number</th>
								<th>Address</th>
								<th>Total Purchase Amount</th>
								<th>Actions</th>
							</tr>
						</thead>
						<tbody className="table-body">
							{customers.map((customer) => (
								<tr key={customer.phoneNumber} className="table-row">
									<td className="table-cell">
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
									<td className="table-cell">
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
									<td className="table-cell">
										{editingId === customer.id ? (
											<Input
												value={editData.address || ''}
												onChange={(e) => handleChange('address', e.target.value)}
												className="w-full"
											/>
										) : (
											<div className="relative">
												<Button
													onClick={() => setSelectedText(customer.address)}
													className="text-left hover:text-gray-600 focus:outline-none"
												>
													<span className="truncate block w-40" title={customer.address}>
														{customer.address ? `${customer.address.slice(0, 20)}...` : '-'}
													</span>
												</Button>

												<Dialog open={!!selectedText} onOpenChange={() => setSelectedText(null)}>
													<DialogContent className="max-w-2xl bg-white rounded-lg shadow-lg border border-gray-200">
														<DialogHeader className="border-b pb-2">
															<DialogTitle className="text-lg font-semibold">Address Details</DialogTitle>
														</DialogHeader>

														<div className="p-4">
															<p className="text-sm whitespace-pre-wrap break-words">
																{selectedText || 'No details available'}
															</p>
														</div>
													</DialogContent>
												</Dialog>
											</div>
										)}
									</td>

									<td className="table-cell">
										{customer.totalPurchaseAmount}
									</td>
									<td className="table-cell-center">
										{editingId === customer.id ? (
											<div className="button-group">
												<Button
													onClick={saveChanges}
													variant="ghost"
													size="icon"
													className="save-button"
												>
													<Check className="h-4 w-4" />
												</Button>
												<Button
													onClick={cancelEdit}
													variant="ghost"
													size="icon"
													className="cancel-button"
												>
													<X className="h-4 w-4" />
												</Button>
											</div>
										) : (
											<Button
												onClick={() => startEdit(customer)}
												variant="ghost"
												size="icon"
												className="edit-button"
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
				<p className="empty-message">No customer data available</p>
			)}
		</TabsContent>
	);
};

export default CustomersTable;
