# Contactless Dine-In Experience

## Overview
The Contactless Dine-In Experience is a web application designed to enhance the dining experience by allowing customers to view menus, place orders, and track their orders using QR codes. This application consists of a React frontend, a Node.js and Express backend, and a MongoDB database.

## Features
- **QR Code Scanning**: Customers can scan QR codes at their tables to access the menu and place orders.
- **Menu Management**: The application allows for easy management of menu items, including adding, updating, and removing items.
- **Cart Functionality**: Users can add items to their cart, modify quantities, and proceed to checkout.
- **Order Tracking**: Customers can track the status of their orders in real-time.
- **Responsive Design**: The application is designed to work seamlessly on both desktop and mobile devices.

## Project Structure
```
contactless-dine-in
├── client                  # Frontend application
│   ├── src
│   ├── public
│   ├── package.json
│   └── tsconfig.json
├── server                  # Backend application
│   ├── src
│   ├── package.json
│   └── tsconfig.json
├── .env.example            # Example environment variables
├── .gitignore              # Git ignore file
└── README.md               # Project documentation
```

## Getting Started

### Prerequisites
- Node.js (version 14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Installation

1. **Clone the repository**:
   ```
   git clone <repository-url>
   cd contactless-dine-in
   ```

2. **Set up the server**:
   - Navigate to the `server` directory:
     ```
     cd server
     ```
   - Install dependencies:
     ```
     npm install
     ```
   - Create a `.env` file based on the `.env.example` file and configure your MongoDB connection string.
   - Start the server:
     ```
     npm run dev
     ```

3. **Set up the client**:
   - Navigate to the `client` directory:
     ```
     cd ../client
     ```
   - Install dependencies:
     ```
     npm install
     ```
   - Start the client:
     ```
     npm start
     ```

### Usage
- Scan the QR code at your table to access the menu.
- Browse the menu, add items to your cart, and proceed to checkout.
- Track your order status in real-time.

## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License
This project is licensed under the MIT License. See the LICENSE file for details.