// Utility helper functions

export const formatPrice = (price: number): string => {
  return `₹${price.toFixed(2)}`;
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'Received':
      return 'bg-blue-500';
    case 'In Kitchen':
      return 'bg-yellow-500';
    case 'Ready':
      return 'bg-green-500';
    case 'Served':
      return 'bg-gray-500';
    default:
      return 'bg-gray-400';
  }
};

export const calculateTotal = (items: any[]): number => {
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
};

export const saveToLocalStorage = (key: string, value: any): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

export const getFromLocalStorage = <T>(key: string): T | null => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return null;
  }
};

export const removeFromLocalStorage = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing from localStorage:', error);
  }
};