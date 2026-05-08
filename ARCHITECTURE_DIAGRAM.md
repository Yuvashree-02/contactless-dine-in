# Contactless Dine-In Architecture Flow Diagram

## System Architecture

```mermaid
graph TB
    subgraph "Client Layer - React Frontend"
        QR[QR Scanner/HomePage]
        Menu[MenuPage<br/>Browse & Filter Menu]
        Cart[Cart Sidebar<br/>View/Edit Cart]
        Checkout[CheckoutPage<br/>Order Summary]
        Tracking[OrderTrackingPage<br/>Real-time Status]
        AdminLogin[AdminLoginPage]
        AdminDash[AdminDashboard]
        AdminMenu[AdminMenuPage]
        AdminTable[AdminTableManagement]
        
        CartCtx[CartContext<br/>Global Cart State]
        AuthCtx[AuthContext<br/>Admin Auth State]
    end
    
    subgraph "API Layer - Express Routes"
        QRRoute[/api/qr<br/>Generate QR Codes]
        MenuRoute[/api/menu<br/>CRUD Menu Items]
        OrderRoute[/api/orders<br/>Create & Track Orders]
        TableRoute[/api/tables<br/>Manage Tables]
        AuthRoute[/api/auth<br/>Admin Login]
        PaymentRoute[/api/payment<br/>Payment Processing]
    end
    
    subgraph "Server Layer - Node.js"
        MenuCtrl[Menu Controller]
        OrderCtrl[Order Controller]
        TableCtrl[Table Controller]
        QRCtrl[QR Controller]
        
        AuthMiddleware[Auth Middleware<br/>JWT Verification]
        Validator[Validator Middleware]
        ErrorHandler[Error Handler]
    end
    
    subgraph "Database Layer - MongoDB"
        UsersDB[(users<br/>Admin Credentials)]
        MenuDB[(menuItems<br/>Food Items)]
        TablesDB[(tables<br/>Table Info & QR)]
        OrdersDB[(orders<br/>Order Details)]
    end
    
    %% Customer Flow
    QR -->|Scan QR Code<br/>table/:id| Menu
    Menu --> CartCtx
    CartCtx --> Cart
    Cart -->|Proceed to<br/>Checkout| Checkout
    Checkout --> PaymentRoute
    PaymentRoute -->|Payment Success| Tracking
    
    %% Admin Flow
    AdminLogin --> AuthRoute
    AuthRoute --> AuthCtx
    AuthCtx --> AdminDash
    AdminDash --> AdminMenu
    AdminDash --> AdminTable
    
    %% API Connections - Customer
    Menu --> MenuRoute
    Checkout --> OrderRoute
    Tracking --> OrderRoute
    QR --> QRRoute
    
    %% API Connections - Admin
    AdminMenu --> MenuRoute
    AdminTable --> TableRoute
    AdminDash --> OrderRoute
    
    %% Server Layer
    MenuRoute --> AuthMiddleware
    OrderRoute --> Validator
    TableRoute --> AuthMiddleware
    QRRoute --> QRCtrl
    AuthRoute --> ErrorHandler
    
    AuthMiddleware --> MenuCtrl
    AuthMiddleware --> TableCtrl
    Validator --> OrderCtrl
    
    %% Database Connections
    MenuCtrl --> MenuDB
    OrderCtrl --> OrdersDB
    TableCtrl --> TablesDB
    QRCtrl --> TablesDB
    AuthRoute --> UsersDB
    
    style QR fill:#e1f5ff
    style Menu fill:#e1f5ff
    style Cart fill:#e1f5ff
    style Checkout fill:#e1f5ff
    style Tracking fill:#e1f5ff
    style AdminLogin fill:#ffe1e1
    style AdminDash fill:#ffe1e1
    style AdminMenu fill:#ffe1e1
    style AdminTable fill:#ffe1e1
    style CartCtx fill:#fff3e1
    style AuthCtx fill:#fff3e1
    style UsersDB fill:#e8f5e9
    style MenuDB fill:#e8f5e9
    style TablesDB fill:#e8f5e9
    style OrdersDB fill:#e8f5e9
```

## Customer User Flow

```mermaid
sequenceDiagram
    participant Customer
    participant QRCode
    participant MenuPage
    participant Cart
    participant Checkout
    participant Server
    participant Database
    participant Payment
    participant Tracking
    
    Customer->>QRCode: 1. Scans QR at Table
    QRCode->>MenuPage: 2. Redirect to /table/:id
    MenuPage->>Server: 3. GET /api/menu
    Server->>Database: 4. Fetch Menu Items
    Database-->>Server: 5. Return Items
    Server-->>MenuPage: 6. Menu Data
    MenuPage->>Customer: 7. Display Menu
    
    Customer->>MenuPage: 8. Add Items to Cart
    MenuPage->>Cart: 9. Update Cart State
    Cart->>Cart: 10. Save to localStorage
    
    Customer->>Cart: 11. View Cart
    Cart->>Customer: 12. Show Cart Items
    
    Customer->>Checkout: 13. Proceed to Checkout
    Checkout->>Customer: 14. Show Order Summary
    
    Customer->>Checkout: 15. Place Order
    Checkout->>Server: 16. POST /api/orders
    Server->>Database: 17. Create Order
    Database-->>Server: 18. Order Created
    Server-->>Checkout: 19. Order ID
    
    Checkout->>Payment: 20. Process Payment
    Payment-->>Checkout: 21. Payment Success
    
    Checkout->>Tracking: 22. Redirect to Tracking
    Tracking->>Server: 23. GET /api/orders/:id
    Server->>Database: 24. Fetch Order Status
    Database-->>Server: 25. Order Details
    Server-->>Tracking: 26. Status Updates
    Tracking->>Customer: 27. Show Status (Pending→Preparing→Ready→Served)
```

## Admin User Flow

```mermaid
sequenceDiagram
    participant Admin
    participant Login
    participant Dashboard
    participant Server
    participant Database
    
    Admin->>Login: 1. Navigate to /admin/login
    Login->>Admin: 2. Show Login Form
    Admin->>Login: 3. Enter Credentials
    Login->>Server: 4. POST /api/auth/login
    Server->>Database: 5. Verify Credentials
    Database-->>Server: 6. User Found
    Server-->>Login: 7. JWT Token
    Login->>Dashboard: 8. Redirect to Dashboard
    
    Dashboard->>Server: 9. GET /api/orders (with JWT)
    Server->>Server: 10. Verify JWT Token
    Server->>Database: 11. Fetch All Orders
    Database-->>Server: 12. Orders Data
    Server-->>Dashboard: 13. Return Orders
    Dashboard->>Admin: 14. Display Statistics
    
    Admin->>Dashboard: 15. Manage Menu/Tables
    Dashboard->>Server: 16. CRUD Operations
    Server->>Database: 17. Update Data
    Database-->>Server: 18. Success
    Server-->>Dashboard: 19. Confirmation
    Dashboard->>Admin: 20. Show Updated Data
```

## Data Models

```mermaid
erDiagram
    USER ||--o{ ORDER : manages
    TABLE ||--o{ ORDER : has
    ORDER ||--|{ ORDER_ITEM : contains
    MENU_ITEM ||--o{ ORDER_ITEM : references
    
    USER {
        string _id PK
        string email
        string password
        string role
        date createdAt
    }
    
    TABLE {
        string _id PK
        number tableNumber
        number capacity
        string status
        string qrCode
        date createdAt
    }
    
    MENU_ITEM {
        string _id PK
        string name
        string description
        number price
        string category
        boolean isVeg
        string imageUrl
        boolean available
    }
    
    ORDER {
        string _id PK
        string tableId FK
        array items
        number totalAmount
        string status
        date createdAt
        date updatedAt
    }
    
    ORDER_ITEM {
        string menuItemId FK
        string name
        number quantity
        number price
    }
```

## Technology Stack

```mermaid
mindmap
  root((Contactless<br/>Dine-In))
    Frontend
      React 18
      TypeScript
      React Router v6
      Tailwind CSS v3
      Axios
      Context API
    Backend
      Node.js
      Express.js
      TypeScript
      JWT Auth
      Nodemon
    Database
      MongoDB
      Mongoose ODM
    Tools
      QR Code Generator
      Payment Gateway
      VS Code
      npm/yarn
```

## Component Hierarchy

```mermaid
graph TD
    App[App.tsx<br/>Root Component]
    App --> AuthProvider[AuthProvider]
    AuthProvider --> CartProvider[CartProvider]
    CartProvider --> Router[React Router]
    
    Router --> CustomerRoutes[Customer Routes]
    Router --> AdminRoutes[Admin Routes]
    
    CustomerRoutes --> Home[HomePage]
    CustomerRoutes --> MenuP[MenuPage]
    CustomerRoutes --> CheckoutP[CheckoutPage]
    CustomerRoutes --> TrackingP[OrderTrackingPage]
    
    MenuP --> MenuList[Menu Items Grid]
    MenuP --> CartSidebar[Cart Sidebar]
    CartSidebar --> CartComp[Cart Component]
    CartComp --> CartItem[CartItem Components]
    
    CheckoutP --> OrderSummary[Order Summary]
    CheckoutP --> PaymentGateway[Payment Gateway]
    
    AdminRoutes --> AdminLoginP[AdminLoginPage]
    AdminRoutes --> AdminDashP[AdminDashboard]
    AdminRoutes --> AdminMenuP[AdminMenuPage]
    AdminRoutes --> AdminTableP[AdminTableManagement]
    
    style App fill:#4285f4,color:#fff
    style AuthProvider fill:#ea4335,color:#fff
    style CartProvider fill:#fbbc04,color:#000
    style Router fill:#34a853,color:#fff
```

---

## How to View This Diagram

### Option 1: VS Code Preview
1. Install "Markdown Preview Mermaid Support" extension
2. Open this file in VS Code
3. Press `Ctrl+Shift+V` (or `Cmd+Shift+V` on Mac)

### Option 2: Online Viewer
1. Copy the Mermaid code
2. Go to https://mermaid.live/
3. Paste and view the interactive diagram

### Option 3: GitHub
- Push this file to GitHub and it will render automatically

---

## Quick Reference

**Customer Journey:** QR Scan → Menu → Cart → Checkout → Payment → Order Tracking

**Admin Journey:** Login → Dashboard → Manage Menu/Tables/Orders

**Tech Stack:** MERN + TypeScript + Tailwind CSS

**Key Features:** QR-based ordering, Real-time tracking, Admin dashboard, Secure authentication
