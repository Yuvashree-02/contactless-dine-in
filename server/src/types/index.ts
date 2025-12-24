export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
}

export interface Order {
  id: string;
  items: MenuItem[];
  totalAmount: number;
  status: 'pending' | 'completed' | 'canceled';
}

export interface Table {
  id: string;
  number: number;
  capacity: number;
}