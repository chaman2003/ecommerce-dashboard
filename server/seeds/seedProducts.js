import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.js';
import connectDB from '../config/database.js';

dotenv.config();

// Product data generation for ~1000 products
const brands = ['Apple', 'Dell', 'Sony', 'Samsung', 'Logitech', 'Nintendo', 'Asus', 'HP', 'Lenovo', 'MSI', 'Corsair', 'Razer', 'BenQ', 'LG', 'Canon', 'Nikon', 'GoPro', 'DJI', 'Anker', 'Belkin', 'Intel', 'AMD', 'NVIDIA', 'Kingston', 'Seagate', 'Western Digital', 'JBL', 'Beats', 'Skullcandy', 'Jabra'];
const categories = ['Laptops', 'Smartphones', 'Tablets', 'Cameras', 'Drones', 'Audio', 'Gaming', 'Accessories', 'Monitors', 'Storage'];
const origins = ['USA', 'Japan', 'China', 'South Korea', 'Taiwan', 'Germany', 'Switzerland', 'UK', 'Canada', 'Singapore'];

const adjectives = ['Professional', 'Premium', 'Compact', 'Portable', 'Ultra', 'Elite', 'Pro', 'Max', 'Ultra Pro', 'Essential', 'Smart', 'Advanced', 'Wireless', 'Wireless Pro', 'Turbo', 'Pro Max', 'Quantum'];
const productTypes = {
  'Laptops': ['Laptop', 'Ultrabook', 'Gaming Laptop', 'Notebook', 'Workstation', 'Chromebook', '2-in-1'],
  'Smartphones': ['Smartphone', 'Phone', 'Mobile', 'Smart Device', '5G Phone', 'Flagship', 'Budget Phone'],
  'Tablets': ['Tablet', 'Pad', 'Tab', 'Touch Device', 'iPad', '2-in-1 Tablet'],
  'Cameras': ['Camera', 'DSLR', 'Mirrorless', 'Action Camera', 'Compact Camera', '8K Camera'],
  'Drones': ['Drone', 'Quadcopter', 'Flying Camera', 'UAV', 'Professional Drone'],
  'Audio': ['Headphones', 'Earbuds', 'Speaker', 'Soundbar', 'Earphones', 'Wireless Earbuds', 'Studio Monitor'],
  'Gaming': ['Console', 'Gaming Device', 'Game System', 'Controller', 'Gaming PC'],
  'Accessories': ['Keyboard', 'Mouse', 'Stand', 'Charger', 'Cable', 'Case', 'Screen Protector', 'Hub', 'Adapter'],
  'Monitors': ['Monitor', 'Display', '4K Monitor', 'Gaming Monitor', 'Curved Monitor', 'Ultrawide Monitor'],
  'Storage': ['SSD', 'HDD', 'External Drive', 'Memory Card', 'USB Drive', 'NVMe SSD', 'Portable SSD']
};

const generateProducts = () => {
  const products = [];
  
  for (let i = 1; i <= 1000; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const brand = brands[Math.floor(Math.random() * brands.length)];
    const origin = origins[Math.floor(Math.random() * origins.length)];
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const type = productTypes[category][Math.floor(Math.random() * productTypes[category].length)];
    
    const basePrice = {
      'Laptops': 800 + Math.random() * 2000,
      'Smartphones': 400 + Math.random() * 1200,
      'Tablets': 300 + Math.random() * 1000,
      'Cameras': 500 + Math.random() * 2500,
      'Drones': 400 + Math.random() * 1500,
      'Audio': 100 + Math.random() * 600,
      'Gaming': 300 + Math.random() * 1500,
      'Accessories': 20 + Math.random() * 300,
      'Monitors': 200 + Math.random() * 1000,
      'Storage': 50 + Math.random() * 500
    };
    
    const price = Math.round(basePrice[category]);
    const rating = parseFloat((3.5 + Math.random() * 1.5).toFixed(1));
    const stock = Math.floor(Math.random() * 200);
    const sold = Math.floor(Math.random() * 5000);
    const revenue = price * sold;
    
    products.push({
      name: `${adjective} ${brand} ${type} ${i}`,
      category: [category],
      brand,
      price,
      rating,
      stock,
      sold,
      revenue,
      origin,
      description: `High-quality ${type} from ${brand}. Product #${i}. Features premium build quality and excellent performance for professionals and enthusiasts alike.`,
      imageUrl: `https://via.placeholder.com/400x400/6d28d9/ffffff?text=${encodeURIComponent(brand + ' ' + type)}`,
      featured: Math.random() > 0.9,
      discount: Math.floor(Math.random() * 40),
      tags: [category, brand, origin],
      createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
      specifications: {
        processor: 'Latest Gen',
        ram: `${8 + Math.floor(Math.random() * 24)}GB`,
        storage: `${128 + Math.floor(Math.random() * 512)}GB`,
        warranty: `${1 + Math.floor(Math.random() * 3)} Years`
      }
    });
  }
  
  return products;
};

const seedProducts = async () => {
  try {
    await connectDB();
    
    console.log('🗑️  Clearing existing products...');
    await Product.deleteMany();
    
    console.log('🌱 Generating 1000 products...');
    const products = generateProducts();
    
    console.log('📝 Inserting products into database...');
    await Product.insertMany(products, { ordered: false });
    
    const totalProducts = await Product.countDocuments();
    console.log(`✅ Seeded ${totalProducts} tech products successfully!`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding products:', error.message);
    process.exit(1);
  }
};

seedProducts();
