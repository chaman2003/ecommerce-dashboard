<div align="center">

# 🛒 TechMart E-Commerce Analytics Dashboard

<img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB"/>
<img src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express"/>
<img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React"/>
<img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js"/>

<img src="https://img.shields.io/badge/Material--UI-007FFF?style=for-the-badge&logo=mui&logoColor=white" alt="Material-UI"/>
<img src="https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white" alt="Framer Motion"/>
<img src="https://img.shields.io/badge/Recharts-FF6B6B?style=for-the-badge&logo=chart.js&logoColor=white" alt="Recharts"/>

### 🚀 A modern e-commerce analytics platform with real-time sales tracking, revenue analytics, and stunning techy UI design

[Features](#-features) • [Tech Stack](#-tech-stack) • [Installation](#-installation) • [API](#-api-endpoints)

---

</div>

## ✨ Features

<details open>
<summary><b>🎨 Frontend Highlights</b></summary>

#### Vision UI Pro Design System
- 🌑 **Dark Theme** - Gradient background from `#0f1419` to `#1a1a2e`
- 💎 **Glassy Morphism** - Backdrop blur effects with semi-transparent cards
- ⚡ **Neon Accents** - Electric blue (`#00d4ff`) highlights throughout
- 🎭 **Smooth Animations** - Framer Motion powered transitions
- 📱 **Fully Responsive** - Optimized for mobile, tablet, and desktop

#### Interactive Dashboard
- 📊 **Animated Stat Cards** - Count-up animations with hover effects
- 📈 **Revenue Timeline** - Temporal sales distribution with custom tooltips
- 📊 **Category Distribution** - Product category popularity visualization
- 🏆 **Top Products Table** - Ranked list with rating badges
- 🎯 **Real-time Filters** - Instant filtering by category, brand, price, and rating

#### Product Browsing
- 🔍 **Debounced Search** - Optimized search across the product catalog
- 📝 **Grid Layout** - Clean cards with product details
- 🏷️ **Brand & Origin Badges** - Visual indicators for product details
- 💰 **Price Range Filter** - Slider for budget filtering
- 📦 **Stock Status** - Real-time inventory indicators
- 🎯 **Category Chips** - Animated filter chips with instant results
- 📖 **Detail Modal** - Rich product information overlay
- ♾️ **Infinite Scroll** - Paginated loading for performance

#### Smart Recommendations
- 🎭 **Category-based Filtering** - Find products by type
- 🏢 **Brand Filters** - Discover items from specific manufacturers
- ⭐ **Rating Threshold** - Customize quality threshold (0-5)
- 🎯 **Featured Pick** - Top recommendation hero card with full details
- 🏅 **Ranked Runner-ups** - Numbered suggestions in a distinct list format

</details>

<details>
<summary><b>⚙️ Backend Power</b></summary>

#### REST API
- 🔌 **Express.js Server** - Fast, lightweight Node.js backend
- 🗄️ **MongoDB Atlas** - Cloud-distributed database with automatic scaling
- 📝 **Mongoose ODM** - Schema validation and data modeling
- 🔒 **CORS Enabled** - Secure cross-origin resource sharing

#### Advanced Features
- 🔍 **Full-text Search Indexes** - Lightning-fast product queries
- 📊 **Aggregation Pipelines** - Complex analytics computations
- 🎯 **Multi-parameter Filters** - Category, Brand, Origin, Price, Rating
- 💾 **Database Connection Caching** - Optimized for Vercel serverless
- ⚡ **Lean Queries** - Reduced memory footprint for read operations
- 📦 **Batch Operations** - Efficient bulk data processing

#### Data Management
- 🌱 **Seed Script** - Automated database population with tech products
- 📈 **Progress Tracking** - Real-time seeding status
- 💻 **Tech Products** - Curated list of laptops, drones, cameras, and more

</details>

---

## 🛠️ Tech Stack

<table>
<tr>
<td align="center" width="33%">

### Frontend
<img src="https://skillicons.dev/icons?i=react,materialui,vite" />

- **React 18.2** - Modern UI library
- **Material-UI 5.14** - Component framework
- **Framer Motion 10.16** - Animation library
- **Recharts 2.10** - Data visualization
- **React Router 6.20** - Navigation
- **Axios 1.6** - HTTP client
- **React CountUp 6.5** - Animated counters

</td>
<td align="center" width="33%">

### Backend
<img src="https://skillicons.dev/icons?i=nodejs,express,mongodb" />

- **Node.js** - Runtime environment
- **Express 4.18** - Web framework
- **MongoDB Atlas** - Cloud database
- **Mongoose 8.0** - ODM library
- **CORS** - Cross-origin support
- **dotenv** - Environment config
- **Axios 1.6** - HTTP requests

</td>
<td align="center" width="33%">

### DevOps & Tools
<img src="https://skillicons.dev/icons?i=git,github,vscode" />

- **Git** - Version control
- **GitHub** - Code hosting
- **VS Code** - IDE
- **Nodemon** - Auto-restart
- **ESLint** - Code linting
- **Prettier** - Code formatting

</td>
</tr>
</table>

---

## 🚀 Quick Start

### Prerequisites

<table>
<tr>
<td>

```bash
node --version
# v14.0.0 or higher
```

</td>
<td>

```bash
npm --version  
# v6.0.0 or higher
```

</td>
<td>

```bash
# MongoDB Atlas account
# (connection string included)
```

</td>
</tr>
</table>

### Installation

```bash
# 1️⃣ Clone the repository
git clone https://github.com/yourusername/ecommerce-dashboard.git
cd ecommerce-dashboard

# 2️⃣ Install backend dependencies
cd server
npm install

# 3️⃣ Install frontend dependencies
cd ../client
npm install

# 4️⃣ Seed the database with tech products
cd ../server
npm run seed

# 5️⃣ Start the backend server (Terminal 1)
npm run dev
# Server runs on http://localhost:5000

# 6️⃣ Start the frontend (Terminal 2)
cd ../client
npm start
# Frontend runs on http://localhost:3000
```

### 🎉 Success! Your app is now running

<div align="center">

**Backend:** http://localhost:5000  
**Frontend:** http://localhost:3000

</div>

---

## 🔌 API Endpoints

### Products

| Method | Endpoint | Description | Query Params |
|--------|----------|-------------|--------------|
| `GET` | `/api/products` | Get all products with filters | `search`, `category`, `brand`, `origin`, `minPrice`, `maxPrice`, `minRating`, `page`, `limit`, `sortBy` |
| `GET` | `/api/products/:id` | Get single product by ID | - |
| `GET` | `/api/products/analytics/stats` | Get dashboard statistics | `category`, `brand`, `origin`, `minRating` |
| `GET` | `/api/products/recommendations` | Get recommended products | `category`, `brand`, `origin`, `minRating` |
| `GET` | `/api/products/filters/options` | Get all available filter values | - |
| `POST` | `/api/products` | Create new product | Body: product object |
| `PUT` | `/api/products/:id` | Update existing product | Body: updated fields |
| `DELETE` | `/api/products/:id` | Delete product | - |

### Analytics Response

```json
{
  "success": true,
  "data": {
    "totalProducts": 150,
    "avgRating": 4.5,
    "topCategory": { "name": "Laptops", "count": 45 },
    "revenueTimeline": [
      { "_id": "2023-01", "revenue": 50000 },
      { "_id": "2023-02", "revenue": 65000 }
    ],
    "productsPerCategory": [...],
    "productsPerBrand": [...],
    "ratingDistribution": [...],
    "topRatedProducts": [...]
  }
}
```

---

## 🎨 Design System

<table>
<tr>
<td width="50%">

### 🎨 Color Palette

```css
/* Primary Colors */
--primary-blue: #00d4ff;
--dark-bg: #0f1419;
--darker-bg: #1a1a2e;

/* Accent Colors */
--neon-glow: rgba(0, 212, 255, 0.3);
--card-bg: rgba(255, 255, 255, 0.05);
--border: rgba(255, 255, 255, 0.1);

/* Text Colors */
--text-primary: #ffffff;
--text-secondary: rgba(255, 255, 255, 0.7);
```

</td>
<td width="50%">

### ✨ Visual Effects

```css
/* Glass Morphism */
backdrop-filter: blur(20px);
background: rgba(255, 255, 255, 0.05);

/* Neon Glow */
box-shadow: 0 0 20px rgba(0, 212, 255, 0.3);

/* Smooth Transitions */
transition: all 0.3s ease;

/* Hover Effects */
transform: translateY(-5px) scale(1.02);
```

</td>
</tr>
</table>

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

<div align="center">

### ⭐ Star this repo if you found it helpful!

**Made with ❤️ and ☕ by passionate developers**

</div>
