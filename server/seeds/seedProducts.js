import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.js';
import connectDB from '../config/database.js';

dotenv.config();

const products = [
  {
    name: 'MacBook Pro 16"',
    category: 'Electronics',
    brand: 'Apple',
    price: 2499,
    rating: 4.8,
    stock: 50,
    sold: 1200,
    revenue: 2998800,
    origin: 'USA',
    description: 'Supercharged by M2 Pro or M2 Max, MacBook Pro takes its power and efficiency further than ever.',
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
    featured: true,
    createdAt: new Date('2023-01-15')
  },
  {
    name: 'Dell XPS 15',
    category: 'Electronics',
    brand: 'Dell',
    price: 1899,
    rating: 4.5,
    stock: 30,
    sold: 850,
    revenue: 1614150,
    origin: 'USA',
    description: 'Immersive display, powerful performance, and premium design.',
    imageUrl: 'https://images.unsplash.com/photo-1593642632823-8f78536788c6?auto=format&fit=crop&w=800&q=80',
    featured: true,
    createdAt: new Date('2023-02-10')
  },
  {
    name: 'Sony WH-1000XM5',
    category: 'Audio',
    brand: 'Sony',
    price: 349,
    rating: 4.7,
    stock: 100,
    sold: 2500,
    revenue: 872500,
    origin: 'Japan',
    description: 'Industry-leading noise canceling headphones with premium sound.',
    imageUrl: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=800&q=80',
    featured: true,
    createdAt: new Date('2023-03-05')
  },
  {
    name: 'Samsung Galaxy S23 Ultra',
    category: 'Electronics',
    brand: 'Samsung',
    price: 1199,
    rating: 4.6,
    stock: 80,
    sold: 1500,
    revenue: 1798500,
    origin: 'South Korea',
    description: 'Epic camera, powerful processor, and built-in S Pen.',
    imageUrl: 'https://images.unsplash.com/photo-1610945265078-3858a0b5d8f4?auto=format&fit=crop&w=800&q=80',
    featured: true,
    createdAt: new Date('2023-04-20')
  },
  {
    name: 'Logitech MX Master 3S',
    category: 'Accessories',
    brand: 'Logitech',
    price: 99,
    rating: 4.9,
    stock: 200,
    sold: 5000,
    revenue: 495000,
    origin: 'Switzerland',
    description: 'An icon remastered. Performance mouse with 8K DPI tracking.',
    imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&q=80',
    featured: false,
    createdAt: new Date('2023-05-12')
  },
  {
    name: 'PlayStation 5',
    category: 'Gaming',
    brand: 'Sony',
    price: 499,
    rating: 4.9,
    stock: 15,
    sold: 3000,
    revenue: 1497000,
    origin: 'Japan',
    description: 'Experience lightning-fast loading with an ultra-high-speed SSD.',
    imageUrl: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=800&q=80',
    featured: true,
    createdAt: new Date('2023-06-01')
  },
  {
    name: 'Nintendo Switch OLED',
    category: 'Gaming',
    brand: 'Nintendo',
    price: 349,
    rating: 4.8,
    stock: 60,
    sold: 2200,
    revenue: 767800,
    origin: 'Japan',
    description: '7-inch OLED screen, wide adjustable stand, and enhanced audio.',
    imageUrl: 'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?auto=format&fit=crop&w=800&q=80',
    featured: false,
    createdAt: new Date('2023-06-15')
  },
  {
    name: 'iPad Air 5',
    category: 'Electronics',
    brand: 'Apple',
    price: 599,
    rating: 4.7,
    stock: 90,
    sold: 1800,
    revenue: 1078200,
    origin: 'USA',
    description: 'Light. Bright. Full of might. Supercharged by the Apple M1 chip.',
    imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80',
    featured: true,
    createdAt: new Date('2023-07-01')
  },
  {
    name: 'Asus ROG Zephyrus G14',
    category: 'Gaming',
    brand: 'Asus',
    price: 1499,
    rating: 4.6,
    stock: 40,
    sold: 600,
    revenue: 899400,
    origin: 'Taiwan',
    description: 'Powerful, portable gaming laptop with AniMe Matrix display.',
    imageUrl: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?auto=format&fit=crop&w=800&q=80',
    featured: false,
    createdAt: new Date('2023-07-20')
  },
  {
    name: 'Keychron Q1 Pro',
    category: 'Accessories',
    brand: 'Keychron',
    price: 199,
    rating: 4.8,
    stock: 75,
    sold: 900,
    revenue: 179100,
    origin: 'China',
    description: 'Wireless custom mechanical keyboard with QMK/VIA support.',
    imageUrl: 'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=800&q=80',
    featured: false,
    createdAt: new Date('2023-08-05')
  },
  {
    name: 'GoPro Hero 11 Black',
    category: 'Cameras',
    brand: 'GoPro',
    price: 399,
    rating: 4.5,
    stock: 55,
    sold: 1100,
    revenue: 438900,
    origin: 'USA',
    description: 'Ultra-versatile camera with HyperSmooth 5.0 video stabilization.',
    imageUrl: 'https://images.unsplash.com/photo-1564466021188-1e178106ed68?auto=format&fit=crop&w=800&q=80',
    featured: false,
    createdAt: new Date('2023-08-15')
  },
  {
    name: 'DJI Mini 3 Pro',
    category: 'Drones',
    brand: 'DJI',
    price: 759,
    rating: 4.8,
    stock: 25,
    sold: 450,
    revenue: 341550,
    origin: 'China',
    description: 'Lightweight, foldable camera drone with 4K/60fps video.',
    imageUrl: 'https://images.unsplash.com/photo-1579829366248-204fe8413f31?auto=format&fit=crop&w=800&q=80',
    featured: true,
    createdAt: new Date('2023-09-01')
  },
  {
    name: 'Apple Watch Ultra',
    category: 'Wearables',
    brand: 'Apple',
    price: 799,
    rating: 4.7,
    stock: 45,
    sold: 1300,
    revenue: 1038700,
    origin: 'USA',
    description: 'Rugged and capable, built to meet the demands of endurance athletes.',
    imageUrl: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?auto=format&fit=crop&w=800&q=80',
    featured: true,
    createdAt: new Date('2023-09-10')
  },
  {
    name: 'Bose QuietComfort 45',
    category: 'Audio',
    brand: 'Bose',
    price: 329,
    rating: 4.6,
    stock: 85,
    sold: 1600,
    revenue: 526400,
    origin: 'USA',
    description: 'Iconic quiet, comfort, and sound.',
    imageUrl: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80',
    featured: false,
    createdAt: new Date('2023-09-25')
  },
  {
    name: 'Kindle Paperwhite',
    category: 'Electronics',
    brand: 'Amazon',
    price: 139,
    rating: 4.8,
    stock: 150,
    sold: 3500,
    revenue: 486500,
    origin: 'USA',
    description: 'Now with a 6.8” display and adjustable warm light.',
    imageUrl: 'https://images.unsplash.com/photo-1592496431122-2349e0fbc666?auto=format&fit=crop&w=800&q=80',
    featured: false,
    createdAt: new Date('2023-10-05')
  }
];

const seedProducts = async () => {
  try {
    await connectDB();
    
    await Product.deleteMany();
    console.log('🗑️  Cleared existing products');
    
    await Product.insertMany(products);
    console.log('🌱 Seeded tech products successfully');
    
    process.exit();
  } catch (error) {
    console.error('❌ Error seeding products:', error);
    process.exit(1);
  }
};

seedProducts();
