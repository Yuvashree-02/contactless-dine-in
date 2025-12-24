import mongoose from 'mongoose';
import dotenv from 'dotenv';
import MenuItem from './models/MenuItem';

dotenv.config();

const indianMenuItems = [
  {
    name: 'Butter Chicken',
    description: 'Creamy tomato-based curry with tender chicken pieces',
    price: 12.99,
    category: 'Main Course',
    isVeg: false,
    imageUrl: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500',
    isAvailable: true
  },
  {
    name: 'Paneer Tikka Masala',
    description: 'Grilled cottage cheese in rich creamy tomato gravy',
    price: 10.99,
    category: 'Main Course',
    isVeg: true,
    imageUrl: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=500',
    isAvailable: true
  },
  {
    name: 'Biryani',
    description: 'Aromatic basmati rice cooked with spices and tender meat',
    price: 13.99,
    category: 'Main Course',
    isVeg: false,
    imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500',
    isAvailable: true
  },
  {
    name: 'Samosa',
    description: 'Crispy pastry filled with spiced potatoes and peas',
    price: 4.99,
    category: 'Appetizer',
    isVeg: true,
    imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500',
    isAvailable: true
  },
  {
    name: 'Tandoori Chicken',
    description: 'Chicken marinated in yogurt and spices, cooked in tandoor',
    price: 11.99,
    category: 'Main Course',
    isVeg: false,
    imageUrl: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=500',
    isAvailable: true
  },
  {
    name: 'Palak Paneer',
    description: 'Cottage cheese cubes in creamy spinach gravy',
    price: 9.99,
    category: 'Main Course',
    isVeg: true,
    imageUrl: 'https://images.unsplash.com/photo-1645177628172-a94c30a5e43f?w=500',
    isAvailable: true
  },
  {
    name: 'Naan',
    description: 'Traditional Indian flatbread baked in tandoor',
    price: 2.99,
    category: 'Bread',
    isVeg: true,
    imageUrl: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500',
    isAvailable: true
  },
  {
    name: 'Dal Makhani',
    description: 'Black lentils slow-cooked with butter and cream',
    price: 8.99,
    category: 'Main Course',
    isVeg: true,
    imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500',
    isAvailable: true
  },
  {
    name: 'Chicken Tikka',
    description: 'Boneless chicken pieces marinated and grilled to perfection',
    price: 10.99,
    category: 'Appetizer',
    isVeg: false,
    imageUrl: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=500',
    isAvailable: true
  },
  {
    name: 'Masala Dosa',
    description: 'Crispy rice crepe filled with spiced potato filling',
    price: 7.99,
    category: 'Main Course',
    isVeg: true,
    imageUrl: 'https://images.unsplash.com/photo-1630383249896-424e482df921?w=500',
    isAvailable: true
  },
  {
    name: 'Chole Bhature',
    description: 'Spicy chickpea curry served with fluffy fried bread',
    price: 9.99,
    category: 'Main Course',
    isVeg: true,
    imageUrl: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?w=500',
    isAvailable: true
  },
  {
    name: 'Gulab Jamun',
    description: 'Sweet milk dumplings soaked in rose-flavored syrup',
    price: 4.99,
    category: 'Dessert',
    isVeg: true,
    imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500',
    isAvailable: true
  },
  {
    name: 'Mango Lassi',
    description: 'Refreshing yogurt-based mango drink',
    price: 3.99,
    category: 'Beverage',
    isVeg: true,
    imageUrl: 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=500',
    isAvailable: true
  },
  {
    name: 'Aloo Gobi',
    description: 'Potato and cauliflower curry with aromatic spices',
    price: 8.99,
    category: 'Main Course',
    isVeg: true,
    imageUrl: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=500',
    isAvailable: true
  },
  {
    name: 'Raita',
    description: 'Cooling yogurt condiment with cucumber and spices',
    price: 2.99,
    category: 'Side Dish',
    isVeg: true,
    imageUrl: 'https://images.unsplash.com/photo-1626419623454-e87f8073bde4?w=500',
    isAvailable: true
  }
];

async function seedMenu() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/contactless-dine-in', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    } as any);
    
    console.log('Connected to MongoDB');

    // Clear existing menu items
    await MenuItem.deleteMany({});
    console.log('Cleared existing menu items');

    // Insert new menu items
    const result = await MenuItem.insertMany(indianMenuItems);
    console.log(`Successfully added ${result.length} Indian menu items!`);

    // Display added items
    result.forEach((item, index) => {
      console.log(`${index + 1}. ${item.name} - $${item.price} (${item.category})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error seeding menu:', error);
    process.exit(1);
  }
}

seedMenu();
