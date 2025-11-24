import React, { useEffect, useRef, useState } from 'react';
import {
  Grid,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Paper,
} from '@mui/material';
import { motion } from 'framer-motion';
import InventoryIcon from '@mui/icons-material/Inventory';
import StarIcon from '@mui/icons-material/Star';
import FilterListIcon from '@mui/icons-material/FilterList';
import TimelineIcon from '@mui/icons-material/Timeline';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import StatCard from '../components/StatCard';
import AnimatedBarChart from '../charts/AnimatedBarChart';
import AnimatedPieChart from '../charts/AnimatedPieChart';
import AnimatedAreaChart from '../charts/AnimatedAreaChart';
import AnimatedRadarChart from '../charts/AnimatedRadarChart';
import { productAPI } from '../services/api';

const MotionTableRow = motion(TableRow);

const Dashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [filterOptions, setFilterOptions] = useState({ brands: [], origins: [], categories: [] });
  const [loading, setLoading] = useState(true);
  const [isRefetching, setIsRefetching] = useState(false);
  const abortControllerRef = useRef(null);
  
  // Filters
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [selectedOrigin, setSelectedOrigin] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [minRating, setMinRating] = useState(0);
  const ratingMarks = [0, 2, 4, 6, 7, 8, 9, 10].map((value) => ({
    value,
    label: `${value}★`,
  }));

  const handleChartSelection = (type, value) => {
    if (value === undefined || value === null) return;

    switch (type) {
      case 'brand': {
        setSelectedBrand((prev) => (prev === value ? 'All' : value));
        break;
      }
      case 'origin': {
        setSelectedOrigin((prev) => (prev === value ? 'All' : value));
        break;
      }
      case 'category': {
        setSelectedCategory((prev) => (prev === value ? 'All' : value));
        break;
      }
      case 'rating': {
        const normalizedRating = Number(value);
        setMinRating((prev) => (prev === normalizedRating ? 0 : normalizedRating));
        break;
      }
      default:
        break;
    }
  };

  const handleRatingSliderChange = (_, value) => {
    if (typeof value === 'number') {
      setMinRating(value);
    }
  };

  useEffect(() => {
    fetchFilterOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchFilteredData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBrand, selectedOrigin, selectedCategory, minRating]);

  const fetchFilterOptions = async () => {
    try {
      const response = await productAPI.getFilterOptions();
      setFilterOptions(response.data.data || { brands: [], origins: [], categories: [] });
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  };

  const fetchFilteredData = async () => {
    const isInitialLoad = !analytics;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    if (isInitialLoad) {
      setLoading(true);
    } else {
      setIsRefetching(true);
    }

    try {
      const params = {};
      if (selectedBrand !== 'All') params.brand = selectedBrand;
      if (selectedOrigin !== 'All') params.origin = selectedOrigin;
      if (selectedCategory !== 'All') params.category = selectedCategory;
      if (minRating > 0) params.minRating = minRating;

      const analyticsResponse = await productAPI.getAnalytics(params, { signal: controller.signal });
      const analyticsPayload = analyticsResponse.data.data || {};

      setAnalytics(analyticsPayload);
      setTopProducts(analyticsPayload.topSellingProducts || []);

    } catch (error) {
      if (error.code === 'ERR_CANCELED') return;
      console.error('Error fetching data:', error);
    } finally {
      if (isInitialLoad) {
        setLoading(false);
      }
      setIsRefetching(false);
    }
  };

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const resetFilters = () => {
    setSelectedBrand('All');
    setSelectedOrigin('All');
    setSelectedCategory('All');
    setMinRating(0);
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
        }}
      >
        <CircularProgress
          sx={{
            color: '#a78bfa',
          }}
          size={60}
        />
      </Box>
    );
  }

  if (!analytics) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h5" color="text.secondary">
          No analytics data available
        </Typography>
      </Box>
    );
  }

  const revenueChartData = (analytics.revenueByMonth || []).map((item) => ({
    name: `${item._id.year}-${item._id.month}`,
    revenue: item.revenue,
    sold: item.sold
  }));

  const categoryChartData = (analytics.productsPerCategory || []).map((item) => ({
    name: item._id,
    count: item.count,
    revenue: item.revenue
  }));
  
  const brandChartData = (analytics.productsPerBrand || []).map((item) => ({
    name: item._id,
    value: item.count,
  })) || [];
  
  const originChartData = (analytics.productsPerOrigin || []).map((item) => ({
    name: item._id,
    value: item.count,
  })) || [];
  
  const ratingBucketLabels = {
    0: '0-2★',
    2: '2-4★',
    4: '4-6★',
    6: '6-7★',
    7: '7-8★',
    8: '8-9★',
    9: '9-10★',
  };
  const ratingChartData = (analytics.ratingDistribution || []).map((item) => {
    const bucketStart = typeof item._id === 'number' ? item._id : null;
    const label = bucketStart !== null
      ? ratingBucketLabels[bucketStart] || `${bucketStart}+★`
      : item._id || 'Other';
    return {
      name: label,
      value: item.count,
      bucketStart,
    };
  });
  
  const activeBrand = selectedBrand !== 'All' ? selectedBrand : null;
  const activeOrigin = selectedOrigin !== 'All' ? selectedOrigin : null;
  const activeCategory = selectedCategory !== 'All' ? selectedCategory : null;
  const activeRatingLabel = minRating > 0 ? (ratingBucketLabels[minRating] || `${minRating}+★`) : null;
  const filtersApplied = [selectedBrand, selectedOrigin, selectedCategory].some((value) => value !== 'All') || minRating > 0;
  
  const heroProduct = topProducts[0] || null;

  const showInlineLoader = isRefetching && !loading;

  return (
    <Box sx={{ position: 'relative' }}>
      {showInlineLoader && (
        <LinearProgress
          sx={{
            position: 'sticky',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 5,
            backgroundColor: 'rgba(255,255,255,0.05)',
            '& .MuiLinearProgress-bar': {
              background: 'linear-gradient(90deg, #a78bfa, #7c3aed)',
            },
          }}
        />
      )}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography
          variant="h4"
          sx={{
            mb: 1,
            fontWeight: 700,
            background: 'linear-gradient(135deg, #ffffff 0%, #a78bfa 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Tech Product Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Comprehensive insights into your product catalog with real-time filters
        </Typography>
      </motion.div>

      {/* Interactive Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Paper
          sx={{
            p: 3,
            mb: 4,
            background: 'rgba(26, 32, 44, 0.6)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '20px',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
            <FilterListIcon sx={{ color: '#a78bfa' }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Interactive Filters
            </Typography>
            <Chip 
              label="Reset All" 
              onClick={resetFilters}
              sx={{ 
                ml: 'auto',
                background: 'rgba(167, 139, 250, 0.1)',
                border: '1px solid rgba(167, 139, 250, 0.3)',
                '&:hover': {
                  background: 'rgba(167, 139, 250, 0.2)',
                }
              }}
            />
          </Box>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Brand</InputLabel>
                <Select
                  value={selectedBrand}
                  label="Brand"
                  onChange={(e) => setSelectedBrand(e.target.value)}
                >
                  <MenuItem value="All">All Brands</MenuItem>
                  {filterOptions.brands.map((brand) => (
                    <MenuItem key={brand} value={brand}>{brand}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Origin</InputLabel>
                <Select
                  value={selectedOrigin}
                  label="Origin"
                  onChange={(e) => setSelectedOrigin(e.target.value)}
                >
                  <MenuItem value="All">All Origins</MenuItem>
                  {filterOptions.origins.map((origin) => (
                    <MenuItem key={origin} value={origin}>{origin}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={selectedCategory}
                  label="Category"
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <MenuItem value="All">All Categories</MenuItem>
                  {filterOptions.categories.map((cat) => (
                    <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <Box sx={{ px: 1 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Min Rating: {minRating.toFixed(1)}
                </Typography>
                <Slider
                  value={minRating}
                  onChange={handleRatingSliderChange}
                  min={0}
                  max={10}
                  step={null}
                  marks={ratingMarks}
                  sx={{
                    color: '#a78bfa',
                    '& .MuiSlider-thumb': {
                      '&:hover, &.Mui-focusVisible': {
                        boxShadow: '0 0 0 8px rgba(167, 139, 250, 0.16)',
                      },
                    },
                  }}
                />
              </Box>
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {selectedBrand !== 'All' && (
              <Chip 
                label={`Brand: ${selectedBrand}`} 
                onDelete={() => setSelectedBrand('All')}
                sx={{ background: 'rgba(167, 139, 250, 0.1)' }}
              />
            )}
            {selectedOrigin !== 'All' && (
              <Chip 
                label={`Origin: ${selectedOrigin}`} 
                onDelete={() => setSelectedOrigin('All')}
                sx={{ background: 'rgba(167, 139, 250, 0.1)' }}
              />
            )}
            {selectedCategory !== 'All' && (
              <Chip 
                label={`Category: ${selectedCategory}`} 
                onDelete={() => setSelectedCategory('All')}
                sx={{ background: 'rgba(167, 139, 250, 0.1)' }}
              />
            )}
            {minRating > 0 && (
              <Chip 
                label={`Min Rating: ${minRating.toFixed(1)}`} 
                onDelete={() => setMinRating(0)}
                sx={{ background: 'rgba(167, 139, 250, 0.1)' }}
              />
            )}
          </Box>
        </Paper>
      </motion.div>

      {/* Stat Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Products"
            value={analytics.totalProducts}
            icon={<InventoryIcon sx={{ fontSize: 32 }} />}
            subtitle={filtersApplied ? 'Matching current filters' : 'Entire catalog'}
            color="#a78bfa"
            delay={0}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Average Rating"
            value={analytics.avgRating}
            icon={<StarIcon sx={{ fontSize: 32 }} />}
            subtitle="Out of 5"
            color="#ffaa00"
            delay={0.1}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Revenue"
            value={`$${(analytics.totalRevenue / 1000).toFixed(1)}k`}
            icon={<TimelineIcon sx={{ fontSize: 32 }} />}
            subtitle={`${analytics.totalSold} units sold`}
            color="#00ff88"
            delay={0.2}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Top Product"
              value={heroProduct?.name || 'N/A'}
            icon={<EmojiEventsIcon sx={{ fontSize: 32 }} />}
            subtitle={heroProduct ? `${(heroProduct.rating ?? 0).toFixed(1)} ★ • ${heroProduct.brand}` : 'No winners yet'}
            color="#a78bfa"
            delay={0.3}
          />
        </Grid>
      </Grid>

      {/* Main Charts Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} lg={6}>
          <AnimatedAreaChart
            data={revenueChartData}
            title="Revenue Trend"
            dataKey="revenue"
            xAxisKey="name"
            onPointClick={() => {}}
            activeItem={null}
          />
        </Grid>
        <Grid item xs={12} lg={6}>
          <AnimatedBarChart
            data={categoryChartData.slice(0, 10)}
            title="Top Categories"
            dataKey="count"
            xAxisKey="name"
            onItemClick={(_, label) => handleChartSelection('category', label)}
            activeItem={activeCategory}
          />
        </Grid>
      </Grid>

      {/* Secondary Charts Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6} lg={4}>
          <AnimatedPieChart
            data={brandChartData.slice(0, 8)}
            title="Top Brands"
            dataKey="value"
            nameKey="name"
            onItemClick={(_, label) => handleChartSelection('brand', label)}
            activeItem={activeBrand}
          />
        </Grid>
        <Grid item xs={12} md={6} lg={4}>
          <AnimatedPieChart
            data={originChartData.slice(0, 8)}
            title="Origins"
            dataKey="value"
            nameKey="name"
            onItemClick={(_, label) => handleChartSelection('origin', label)}
            activeItem={activeOrigin}
          />
        </Grid>
        <Grid item xs={12} md={12} lg={4}>
          <AnimatedRadarChart
            data={categoryChartData.slice(0, 8)}
            title="Category Analysis"
            dataKey="count"
            nameKey="name"
            onItemClick={(_, label) => handleChartSelection('category', label)}
            activeItem={activeCategory}
          />
        </Grid>
      </Grid>

      {/* Rating Distribution Chart */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <AnimatedBarChart
            data={ratingChartData}
            title="Rating Distribution"
            dataKey="value"
            xAxisKey="name"
            onItemClick={(entry) => entry && handleChartSelection('rating', entry.bucketStart ?? 0)}
            activeItem={activeRatingLabel}
          />
        </Grid>
      </Grid>

      {/* Top Rated Products Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card
          sx={{
            background: 'rgba(26, 32, 44, 0.6)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '20px',
            '&:hover': {
            boxShadow: '0 12px 48px 0 rgba(167, 139, 250, 0.2)',
            border: '1px solid rgba(167, 139, 250, 0.3)',
            },
            transition: 'all 0.3s ease',
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Typography
              variant="h6"
              sx={{
                mb: 3,
                fontWeight: 600,
                background: 'linear-gradient(135deg, #ffffff 0%, rgba(255, 255, 255, 0.7) 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Top Selling Products {filtersApplied && '(Filtered)'}
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Rank</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Brand</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Origin</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Sold</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="right">
                      Rating
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {topProducts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                        No products match the selected filters
                      </TableCell>
                    </TableRow>
                  ) : topProducts.map((product, index) => (
                    <MotionTableRow
                      key={product._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      sx={{
                        '&:hover': {
                          background: 'rgba(167, 139, 250, 0.05)',
                        },
                      }}
                    >
                      <TableCell>
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: '8px',
                            background:
                              index === 0
                                ? 'linear-gradient(135deg, #ffaa00 0%, #ff8800 100%)'
                                : index === 1
                                ? 'linear-gradient(135deg, #c0c0c0 0%, #909090 100%)'
                                : index === 2
                                ? 'linear-gradient(135deg, #cd7f32 0%, #8b5a2b 100%)'
                                : 'rgba(255, 255, 255, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '0.85rem',
                          }}
                        >
                          {index + 1}
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {product.name}
                        </Box>
                      </TableCell>
                      <TableCell>
                          <Chip 
                          label={product.brand || 'N/A'} 
                          size="small"
                          sx={{ 
                            background: 'rgba(167, 139, 250, 0.2)',
                            border: '1px solid rgba(167, 139, 250, 0.3)',
                            color: '#a78bfa'
                          }}
                        />
                      </TableCell>
                      <TableCell>
                          <Chip 
                          label={product.origin || 'N/A'} 
                          size="small"
                          sx={{ 
                            background: 'rgba(0, 255, 136, 0.2)',
                            border: '1px solid rgba(0, 255, 136, 0.3)',
                            color: '#00ff88'
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip label={product.category} size="small" />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {product.sold}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Box
                          sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 0.5,
                            px: 1.5,
                            py: 0.5,
                            borderRadius: '8px',
                            background: 'rgba(255, 170, 0, 0.1)',
                            border: '1px solid rgba(255, 170, 0, 0.3)',
                          }}
                        >
                          <StarIcon sx={{ fontSize: 16, color: '#ffaa00' }} />
                            <Typography
                            variant="body2"
                            sx={{ fontWeight: 600, color: '#ffaa00' }}
                          >
                            {(product.rating ?? 0).toFixed(1)}
                          </Typography>
                        </Box>
                      </TableCell>
                    </MotionTableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
};

export default Dashboard;
