import Product from '../models/Product.js';
import connectDB from '../config/database.js';

// Ensure DB connection before each operation
const ensureDBConnection = async () => {
  try {
    await connectDB();
  } catch (error) {
    throw new Error(`Database connection failed: ${error.message}`);
  }
};

// @desc    Get all products with optional filters
// @route   GET /api/products
export const getProducts = async (req, res) => {
  try {
    await ensureDBConnection();
    
    const {
      category,
      search,
      sortBy = '-sold',
      limit = 36,
      page = 1,
      brand,
      origin,
      minPrice,
      maxPrice,
      minRating,
      featured
    } = req.query;

    const numericLimit = Math.max(1, Math.min(parseInt(limit, 10) || 36, 100));
    const numericPage = Math.max(1, parseInt(page, 10) || 1);
    const skip = (numericPage - 1) * numericLimit;

    const query = {};

    if (category && category !== 'All') {
      query.category = category;
    }

    if (search) {
      query.$text = { $search: search };
    }

    if (brand && brand !== 'All') {
      query.brand = brand;
    }

    if (origin && origin !== 'All') {
      query.origin = origin;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined) {
        query.price.$gte = parseFloat(minPrice);
      }
      if (maxPrice !== undefined) {
        query.price.$lte = parseFloat(maxPrice);
      }
    }

    if (minRating !== undefined) {
      const ratingFloor = parseFloat(minRating);
      if (!Number.isNaN(ratingFloor)) {
        query.rating = { $gte: ratingFloor };
      }
    }

    if (featured === 'true') {
      query.featured = true;
    }

    const [products, total] = await Promise.all([
      Product.find(query)
        .sort(sortBy)
        .skip(skip)
        .limit(numericLimit)
        .lean(),
      Product.countDocuments(query)
    ]);

    const totalPages = Math.max(1, Math.ceil(total / numericLimit));
    const hasMore = numericPage < totalPages;

    res.json({
      success: true,
      count: products.length,
      data: products,
      meta: {
        total,
        totalPages,
        page: numericPage,
        limit: numericLimit,
        hasMore
      }
    });
  } catch (error) {
    console.error('❌ Error in getProducts:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
export const getProduct = async (req, res) => {
  try {
    await ensureDBConnection();
    
    const product = await Product.findById(req.params.id).lean();
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }
    
    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('❌ Error in getProduct:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// @desc    Get product analytics
// @route   GET /api/products/analytics/stats
export const getAnalytics = async (req, res) => {
  try {
    await ensureDBConnection();
    console.log(`📊 getAnalytics called with query: ${JSON.stringify(req.query)}`);
    
    const { category, brand, origin, minPrice, maxPrice, minRating, featured } = req.query;
    
    // Build filter query
    let filterQuery = {};
    if (category && category !== 'All') filterQuery.category = category;
    if (brand && brand !== 'All') filterQuery.brand = brand;
    if (origin && origin !== 'All') filterQuery.origin = origin;
    if (minRating) filterQuery.rating = { $gte: parseFloat(minRating) };
    if (featured === 'true') filterQuery.featured = true;
    if (minPrice !== undefined || maxPrice !== undefined) {
      filterQuery.price = {};
      if (minPrice !== undefined) filterQuery.price.$gte = parseFloat(minPrice);
      if (maxPrice !== undefined) filterQuery.price.$lte = parseFloat(maxPrice);
    }
    
    // Total products
    const totalProducts = await Product.countDocuments(filterQuery);
    
    // Average rating
    const avgRatingResult = await Product.aggregate([
      { $match: filterQuery },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' }
        }
      }
    ]);
    const avgRating = avgRatingResult[0]?.avgRating || 0;
    
    // Total revenue
    const revenueResult = await Product.aggregate([
      { $match: filterQuery },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$revenue' },
          totalSold: { $sum: '$sold' }
        }
      }
    ]);
    const totalRevenue = revenueResult[0]?.totalRevenue || 0;
    const totalSold = revenueResult[0]?.totalSold || 0;
    
    // Top category
    const categoryStats = await Product.aggregate([
      { $match: filterQuery },
      { $unwind: '$category' },
      { $group: { _id: '$category', count: { $sum: 1 }, revenue: { $sum: '$revenue' } } },
      { $sort: { revenue: -1 } },
      { $limit: 1 }
    ]);
    const topCategory = categoryStats[0] || { _id: 'N/A', count: 0, revenue: 0 };
    
    // Products per category
    const productsPerCategory = await Product.aggregate([
      { $match: filterQuery },
      { $unwind: '$category' },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          revenue: { $sum: '$revenue' },
          sold: { $sum: '$sold' }
        }
      },
      { $sort: { revenue: -1 } }
    ]);
    
    // Products per brand
    const productsPerBrand = await Product.aggregate([
      { $match: filterQuery },
      {
        $group: {
          _id: '$brand',
          count: { $sum: 1 },
          revenue: { $sum: '$revenue' },
          sold: { $sum: '$sold' }
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: 10 }
    ]);
    
    // Products per origin
    const productsPerOrigin = await Product.aggregate([
      { $match: filterQuery },
      {
        $group: {
          _id: '$origin',
          count: { $sum: 1 },
          revenue: { $sum: '$revenue' }
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: 10 }
    ]);
    
    // Price distribution
    const priceDistribution = await Product.aggregate([
      { $match: filterQuery },
      {
        $bucket: {
          groupBy: '$price',
          boundaries: [0, 50, 100, 200, 500, 1000, 5000, 10000],
          default: 'Other',
          output: {
            count: { $sum: 1 },
            revenue: { $sum: '$revenue' }
          }
        }
      }
    ]);
    
    // Rating distribution
    const ratingDistribution = await Product.aggregate([
      { $match: filterQuery },
      {
        $bucket: {
          groupBy: '$rating',
          boundaries: [0, 1, 2, 3, 4, 4.5, 5],
          default: 'Other',
          output: {
            count: { $sum: 1 }
          }
        }
      }
    ]);
    
    // Top selling products
    const topSellingProducts = await Product.find(filterQuery)
      .sort('-sold')
      .limit(10)
      .select('name rating price sold revenue category imageUrl brand origin discount')
      .lean();
    
    // Top revenue products
    const topRevenueProducts = await Product.find(filterQuery)
      .sort('-revenue')
      .limit(10)
      .select('name rating price sold revenue category imageUrl brand origin discount')
      .lean();
    
    // Monthly revenue trend (simulated based on createdAt)
    const revenueByMonth = await Product.aggregate([
      { $match: filterQuery },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$revenue' },
          sold: { $sum: '$sold' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
    
    res.json({
      success: true,
      data: {
        totalProducts,
        avgRating: parseFloat(avgRating.toFixed(2)),
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        totalSold,
        topCategory: {
          name: topCategory._id,
          count: topCategory.count,
          revenue: parseFloat((topCategory.revenue || 0).toFixed(2))
        },
        productsPerCategory,
        productsPerBrand,
        productsPerOrigin,
        priceDistribution,
        ratingDistribution,
        topSellingProducts,
        topRevenueProducts,
        revenueByMonth
      }
    });
  } catch (error) {
    console.error('❌ Error in getAnalytics:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// @desc    Get recommendations
// @route   GET /api/products/recommendations
export const getRecommendations = async (req, res) => {
  try {
    await ensureDBConnection();
    
    const { category, minRating = 4 } = req.query;
    
    let query = { rating: { $gte: parseFloat(minRating) } };
    
    if (category && category !== 'All') {
      query.category = category;
    }
    
    const recommendations = await Product.find(query)
      .sort('-rating -sold')
      .limit(20)
      .lean();
    
    res.json({
      success: true,
      count: recommendations.length,
      data: recommendations
    });
  } catch (error) {
    console.error('❌ Error in getRecommendations:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// @desc    Create new product
// @route   POST /api/products
export const createProduct = async (req, res) => {
  try {
    await ensureDBConnection();
    const product = await Product.create(req.body);
    
    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
export const updateProduct = async (req, res) => {
  try {
    await ensureDBConnection();
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }
    
    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
export const deleteProduct = async (req, res) => {
  try {
    await ensureDBConnection();
    const product = await Product.findByIdAndDelete(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }
    
    res.json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get filter options (brands, origins)
// @route   GET /api/products/filters/options
export const getFilterOptions = async (req, res) => {
  try {
    await ensureDBConnection();
    
    const [brands, origins, categories] = await Promise.all([
      Product.distinct('brand'),
      Product.distinct('origin'),
      Product.distinct('category')
    ]);
    
    res.json({
      success: true,
      data: {
        brands: brands.filter(Boolean).sort(),
        origins: origins.filter(Boolean).sort(),
        categories: categories.filter(Boolean).sort()
      }
    });
  } catch (error) {
    console.error('❌ Error in getFilterOptions:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};
