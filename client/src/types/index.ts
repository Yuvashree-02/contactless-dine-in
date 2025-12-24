// Type definitions for the application

export interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  isVeg: boolean;
  imageUrl?: string;
  isAvailable: boolean;
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  _id: string;
  tableId: string;
  items: OrderItem[];
  status: 'Pending Payment' | 'Received' | 'In Kitchen' | 'Ready' | 'Served';
  totalAmount: number;
  paymentStatus?: 'Pending' | 'Paid' | 'Failed';
  paymentMethod?: string;
  paymentId?: string;
  paidAt?: string;
  createdAt: string;
}

export interface User {
  id: string;
  username: string;
  role: 'admin' | 'staff';
}

export interface AuthResponse {
  token: string;
  user: User;
}