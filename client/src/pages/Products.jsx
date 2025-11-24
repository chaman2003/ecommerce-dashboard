import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  TextField,
  InputAdornment,
  CircularProgress,
  Skeleton,
  IconButton,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Button,
  Grid,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import SearchIcon from '@mui/icons-material/Search';
import StarIcon from '@mui/icons-material/Star';
import CloseIcon from '@mui/icons-material/Close';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import InventoryIcon from '@mui/icons-material/Inventory';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import { productAPI } from '../services/api';
import useDebounce from '../hooks/useDebounce';

const categories = ['All', 'Electronics', 'Clothing', 'Home', 'Sports', 'Books', 'Toys', 'Beauty', 'Food', 'Gaming'];

const Products = () => {
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [selectedOrigin, setSelectedOrigin] = useState('All');
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [minRating, setMinRating] = useState(0);
  const [filterOptions, setFilterOptions] = useState({ brands: [], origins: [], categories: [] });
  const [filtersLoading, setFiltersLoading] = useState(false);
  const [filtersError, setFiltersError] = useState(null);
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [loading, setLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const loadMoreRef = useRef(null);
  const abortControllerRef = useRef(null);
  const pageRef = useRef(1);
  const isFetchingRef = useRef(false);
  const hasMoreRef = useRef(true);

  useEffect(() => {
    const loadFilterOptions = async () => {
      setFiltersLoading(true);
      setFiltersError(null);
      try {
        const response = await productAPI.getFilterOptions();
        setFilterOptions(response.data.data || { brands: [], origins: [], categories: [] });
      } catch (optionsError) {
        console.error('Error fetching filter options:', optionsError);
        setFiltersError('Failed to load filter options.');
      } finally {
        setFiltersLoading(false);
      }
    };

    loadFilterOptions();
  }, []);

  const fetchProducts = useCallback(async ({ reset = false } = {}) => {
    if (isFetchingRef.current) return;
    if (!hasMoreRef.current && !reset) return;

    if (reset) {
      setLoading(true);
      pageRef.current = 1;
      setError(null);
    }

    isFetchingRef.current = true;
    setIsFetching(true);
    setError(null);

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    const currentPage = pageRef.current;
    const params = {
      page: currentPage,
      limit: 24,
      sortBy: '-sold',
    };

    if (selectedCategory !== 'All') {
      params.category = selectedCategory;
    }

    const trimmedSearch = debouncedSearch.trim();
    if (trimmedSearch) {
      params.search = trimmedSearch;
    }

    if (selectedBrand !== 'All') {
      params.brand = selectedBrand;
    }

    if (selectedOrigin !== 'All') {
      params.origin = selectedOrigin;
    }

    if (priceRange[0] > 0) {
      params.minPrice = priceRange[0];
    }

    if (priceRange[1] < 10000) {
      params.maxPrice = priceRange[1];
    }

    if (minRating > 0) {
      params.minRating = minRating;
    }

    try {
      const response = await productAPI.getAllProducts(params, { signal: controller.signal });
      const { data: fetchedProducts, meta } = response.data;

      setProducts((prev) => (reset ? fetchedProducts : [...prev, ...fetchedProducts]));

      if (meta?.total !== undefined) {
        setTotalCount(meta.total);
        setHasMore(meta.hasMore);
        hasMoreRef.current = meta.hasMore;
        pageRef.current = meta.page + 1;
      } else {
        setTotalCount((prevCount) => (reset ? fetchedProducts.length : prevCount + fetchedProducts.length));
        const nextHasMore = fetchedProducts.length > 0;
        setHasMore(nextHasMore);
        hasMoreRef.current = nextHasMore;
        pageRef.current = currentPage + 1;
      }
    } catch (fetchError) {
      if (fetchError.code === 'ERR_CANCELED') return;
      
      const status = fetchError.response?.status;
      const url = fetchError.config?.url;
      let msg = 'Failed to load products. Please try again.';
      
      if (status === 404) {
        msg = `API Endpoint not found (404). Checked: ${url}`;
      } else if (fetchError.message) {
        msg = fetchError.message;
      }
      
      setError(msg);
      console.error('Error fetching products:', fetchError);
    } finally {
      setLoading(false);
      setIsFetching(false);
      isFetchingRef.current = false;
    }
  }, [debouncedSearch, selectedCategory, selectedBrand, selectedOrigin, priceRange, minRating]);

  useEffect(() => {
    setProducts([]);
    setTotalCount(0);
    setHasMore(true);
    hasMoreRef.current = true;
    pageRef.current = 1;
    fetchProducts({ reset: true });
  }, [fetchProducts]);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    const sentinel = loadMoreRef.current;
    if (!sentinel) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && !isFetching && hasMore) {
          fetchProducts();
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [fetchProducts, hasMore, isFetching, loading]);

  const handleResetFilters = () => {
    setSelectedCategory('All');
    setSelectedBrand('All');
    setSelectedOrigin('All');
    setPriceRange([0, 10000]);
    setMinRating(0);
  };

  const handleRatingChange = (_, value) => {
    const nextValue = Array.isArray(value) ? value[0] : value;
    setMinRating(nextValue);
  };

  const handlePriceRangeChange = (_, value) => {
    setPriceRange(value);
  };

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setTimeout(() => setSelectedProduct(null), 300);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  return (
    <Box>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography
          variant="h4"
          sx={{
            mb: 1,
            fontWeight: 800,
            background: 'linear-gradient(135deg, #ffffff 0%, #a78bfa 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Product Catalog
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Explore {totalCount || products.length} premium products
        </Typography>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <TextField
          fullWidth
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          type="search"
          autoComplete="off"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#a78bfa' }} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                {isFetching && !loading && (
                  <CircularProgress size={20} sx={{ color: '#a78bfa' }} />
                )}
              </InputAdornment>
            ),
          }}
          sx={{ mb: 3 }}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
      >
        <Card
          sx={{
            mb: 4,
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.8) 100%)',
            border: '1px solid rgba(0, 245, 255, 0.2)',
            borderRadius: '16px',
            backdropFilter: 'blur(24px)'
          }}
        >
          <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Filter Products
              </Typography>
              <Button
                variant="outlined"
                onClick={handleResetFilters}
                disabled={
                  selectedCategory === 'All' &&
                  selectedBrand === 'All' &&
                  selectedOrigin === 'All' &&
                  priceRange[0] === 0 &&
                  priceRange[1] === 10000 &&
                  minRating === 0
                }
                sx={{ color: '#a78bfa', borderColor: '#a78bfa' }}
              >
                Reset All
              </Button>
            </Box>

            {filtersError && (
              <Typography variant="body2" color="#ff3366">
                {filtersError}
              </Typography>
            )}

            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Brand</InputLabel>
                  <Select
                    value={selectedBrand}
                    label="Brand"
                    onChange={(e) => setSelectedBrand(e.target.value)}
                    disabled={filtersLoading}
                  >
                    <MenuItem value="All">All Brands</MenuItem>
                    {filterOptions.brands.map((brand) => (
                      <MenuItem key={brand} value={brand}>
                        {brand}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Origin</InputLabel>
                  <Select
                    value={selectedOrigin}
                    label="Origin"
                    onChange={(e) => setSelectedOrigin(e.target.value)}
                    disabled={filtersLoading}
                  >
                    <MenuItem value="All">All Origins</MenuItem>
                    {filterOptions.origins.map((origin) => (
                      <MenuItem key={origin} value={origin}>
                        {origin}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={3}>
                <Box sx={{ px: 1 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Min Rating: {minRating.toFixed(1)} ⭐
                  </Typography>
                  <Slider
                    value={minRating}
                    onChange={handleRatingChange}
                    min={0}
                    max={5}
                    step={0.5}
                    marks
                    valueLabelDisplay="auto"
                    sx={{
                      color: '#a78bfa',
                      '& .MuiSlider-thumb': {
                        boxShadow: '0 2px 10px rgba(0, 245, 255, 0.5)',
                      }
                    }}
                  />
                </Box>
              </Grid>

              <Grid item xs={12} md={3}>
                <Box sx={{ px: 1 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Price: {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
                  </Typography>
                  <Slider
                    value={priceRange}
                    onChange={handlePriceRangeChange}
                    min={0}
                    max={10000}
                    step={100}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(value) => formatPrice(value)}
                    sx={{
                      color: '#a78bfa',
                      '& .MuiSlider-thumb': {
                        boxShadow: '0 2px 10px rgba(0, 245, 255, 0.5)',
                      }
                    }}
                  />
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Box sx={{ mb: 4, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {categories.map((category, index) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Chip
                label={category}
                onClick={() => setSelectedCategory(category)}
                sx={{
                  background:
                    selectedCategory === category
                      ? 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)'
                      : 'rgba(255, 255, 255, 0.05)',
                  border:
                    selectedCategory === category
                      ? '2px solid rgba(0, 245, 255, 0.6)'
                      : '2px solid rgba(255, 255, 255, 0.1)',
                  color: selectedCategory === category ? '#fff' : 'rgba(255, 255, 255, 0.7)',
                  fontWeight: selectedCategory === category ? 700 : 500,
                  px: 2.5,
                  py: 3,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  '&:hover': {
                    background:
                      selectedCategory === category
                        ? 'linear-gradient(135deg, #c4b5fd 0%, #a78bfa 100%)'
                        : 'rgba(0, 245, 255, 0.15)',
                  },
                }}
              />
            </motion.div>
          ))}
        </Box>
      </motion.div>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', mb: 3, gap: 2 }}>
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
          Showing {products.length} / {totalCount || products.length} products
        </Typography>
        {debouncedSearch && (
          <Chip 
            label={`Search: "${debouncedSearch}"`}
            onDelete={() => setSearchTerm('')}
            sx={{ 
              background: 'rgba(0, 245, 255, 0.15)',
              color: '#a78bfa'
            }}
          />
        )}
      </Box>

      {error && (
        <Box
          sx={{
            mb: 3,
            p: 2,
            borderRadius: '16px',
            border: '2px solid rgba(255, 51, 102, 0.4)',
            background: 'rgba(255, 51, 102, 0.1)'
          }}
        >
          <Typography variant="body2" color="#ff3366" sx={{ fontWeight: 600 }}>
            {error}
          </Typography>
        </Box>
      )}

      {loading ? (
        <Grid container spacing={3}>
          {Array.from({ length: 8 }).map((_, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
              <Skeleton variant="rounded" height={280} sx={{ borderRadius: '16px', background: 'rgba(255, 255, 255, 0.05)' }} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Grid container spacing={3}>
          {products.map((product, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={product._id}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.02 }}
              >
                <Card
                  onClick={() => handleProductClick(product)}
                  sx={{
                    background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.9) 100%)',
                    backdropFilter: 'blur(24px)',
                    border: '1px solid rgba(0, 245, 255, 0.15)',
                    borderRadius: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    '&:hover': {
                      boxShadow: '0 12px 40px 0 rgba(0, 245, 255, 0.3)',
                      border: '1px solid rgba(0, 245, 255, 0.5)',
                      transform: 'translateY(-8px)',
                    },
                  }}
                >
                  <CardContent sx={{ p: 2.5, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    {product.discount > 0 && (
                      <Chip
                        label={`-${product.discount}%`}
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 12,
                          right: 12,
                          background: 'linear-gradient(135deg, #ff3366 0%, #cc0033 100%)',
                          color: '#fff',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                        }}
                      />
                    )}
                    
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        color: '#fff',
                        mb: 1.5,
                        minHeight: '3em',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {product.name}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                          px: 1,
                          py: 0.5,
                          borderRadius: '8px',
                          background: 'rgba(255, 184, 0, 0.15)',
                          border: '1px solid rgba(255, 184, 0, 0.4)',
                        }}
                      >
                        <StarIcon sx={{ fontSize: 16, color: '#ffb800' }} />
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#ffb800' }}>
                          {product.rating.toFixed(1)}
                        </Typography>
                      </Box>
                      
                      {product.sold > 0 && (
                        <Chip
                          label={`${product.sold} sold`}
                          size="small"
                          sx={{
                            background: 'rgba(0, 255, 136, 0.15)',
                            border: '1px solid rgba(0, 255, 136, 0.3)',
                            color: '#00ff88',
                            fontWeight: 600,
                            fontSize: '0.75rem',
                          }}
                        />
                      )}
                    </Box>
                    
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1.5 }}>
                      {product.category && product.category.slice(0, 2).map((cat, i) => (
                        <Chip 
                          key={i} 
                          label={cat} 
                          size="small"
                          sx={{
                            background: 'rgba(0, 245, 255, 0.12)',
                            border: '1px solid rgba(0, 245, 255, 0.3)',
                            color: '#a78bfa',
                            fontWeight: 600,
                            fontSize: '0.7rem',
                          }}
                        />
                      ))}
                    </Box>
                    
                    <Box sx={{ mt: 'auto', pt: 1.5, borderTop: '1px solid rgba(0, 245, 255, 0.1)' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          <Typography
                            variant="h5"
                            sx={{
                              fontWeight: 800,
                              background: 'linear-gradient(135deg, #a78bfa 0%, #c4b5fd 100%)',
                              backgroundClip: 'text',
                              WebkitBackgroundClip: 'text',
                              WebkitTextFillColor: 'transparent',
                            }}
                          >
                            {formatPrice(product.price)}
                          </Typography>
                          {product.originalPrice && product.originalPrice > product.price && (
                            <Typography
                              variant="body2"
                              sx={{
                                textDecoration: 'line-through',
                                color: 'text.secondary',
                                fontSize: '0.85rem',
                              }}
                            >
                              {formatPrice(product.originalPrice)}
                            </Typography>
                          )}
                        </Box>
                        
                        {product.stock > 0 ? (
                          <Chip
                            label="In Stock"
                            size="small"
                            sx={{
                              background: 'rgba(0, 255, 136, 0.15)',
                              border: '1px solid rgba(0, 255, 136, 0.4)',
                              color: '#00ff88',
                              fontWeight: 700,
                            }}
                          />
                        ) : (
                          <Chip
                            label="Out of Stock"
                            size="small"
                            sx={{
                              background: 'rgba(255, 51, 102, 0.15)',
                              border: '1px solid rgba(255, 51, 102, 0.4)',
                              color: '#ff3366',
                              fontWeight: 700,
                            }}
                          />
                        )}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      )}

      {!loading && products.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <InventoryIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" color="text.secondary" sx={{ fontWeight: 600 }}>
            No products found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Try adjusting your filters or search criteria
          </Typography>
        </Box>
      )}

      {isFetching && !loading && products.length > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress size={40} sx={{ color: '#a78bfa' }} />
        </Box>
      )}

      {!hasMore && !loading && products.length > 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
            You&apos;ve reached the end of the catalog
          </Typography>
        </Box>
      )}

      <Box ref={loadMoreRef} sx={{ height: 1 }} />

      <Dialog
        open={modalOpen}
        onClose={handleCloseModal}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.98) 100%)',
            backdropFilter: 'blur(40px)',
            border: '2px solid rgba(0, 245, 255, 0.4)',
            borderRadius: '24px',
            boxShadow: '0 24px 64px rgba(0, 245, 255, 0.3)',
          },
        }}
      >
        <AnimatePresence>
          {selectedProduct && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              <DialogTitle>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
                      {selectedProduct.name}
                    </Typography>
                    {selectedProduct.brand && (
                      <Chip 
                        label={selectedProduct.brand}
                        sx={{
                          background: 'rgba(0, 245, 255, 0.15)',
                          border: '1px solid rgba(0, 245, 255, 0.4)',
                          color: '#a78bfa',
                          fontWeight: 700,
                        }}
                      />
                    )}
                  </Box>
                  <IconButton onClick={handleCloseModal} sx={{ color: '#a78bfa' }}>
                    <CloseIcon />
                  </IconButton>
                </Box>
              </DialogTitle>
              <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <StarIcon sx={{ color: '#ffb800', fontSize: 28 }} />
                      <Typography variant="h4" sx={{ fontWeight: 800, color: '#ffb800' }}>
                        {selectedProduct.rating.toFixed(1)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        / 5
                      </Typography>
                    </Box>
                    
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        px: 2,
                        py: 1,
                        borderRadius: '12px',
                        background: 'rgba(0, 245, 255, 0.1)',
                        border: '1px solid rgba(0, 245, 255, 0.3)',
                      }}
                    >
                      <AttachMoneyIcon sx={{ color: '#a78bfa' }} />
                      <Typography variant="h5" sx={{ fontWeight: 800, color: '#a78bfa' }}>
                        {formatPrice(selectedProduct.price)}
                      </Typography>
                    </Box>

                    {selectedProduct.sold > 0 && (
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          px: 2,
                          py: 1,
                          borderRadius: '12px',
                          background: 'rgba(0, 255, 136, 0.1)',
                          border: '1px solid rgba(0, 255, 136, 0.3)',
                        }}
                      >
                        <TrendingUpIcon sx={{ color: '#00ff88' }} />
                        <Typography variant="body1" sx={{ fontWeight: 700, color: '#00ff88' }}>
                          {selectedProduct.sold} sold
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, fontWeight: 700 }}>
                      Categories
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {selectedProduct.category.map((cat, i) => (
                        <Chip 
                          key={i} 
                          label={cat}
                          sx={{
                            background: 'rgba(0, 245, 255, 0.15)',
                            border: '1px solid rgba(0, 245, 255, 0.4)',
                            color: '#a78bfa',
                            fontWeight: 700,
                          }}
                        />
                      ))}
                    </Box>
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, fontWeight: 700 }}>
                      Details
                    </Typography>
                    <Grid container spacing={2}>
                      {selectedProduct.brand && (
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Brand
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {selectedProduct.brand}
                          </Typography>
                        </Grid>
                      )}
                      {selectedProduct.origin && (
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Origin
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {selectedProduct.origin}
                          </Typography>
                        </Grid>
                      )}
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Stock
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600, color: selectedProduct.stock > 0 ? '#00ff88' : '#ff3366' }}>
                          {selectedProduct.stock > 0 ? `${selectedProduct.stock} available` : 'Out of stock'}
                        </Typography>
                      </Grid>
                      {selectedProduct.revenue > 0 && (
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Total Revenue
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {formatPrice(selectedProduct.revenue)}
                          </Typography>
                        </Grid>
                      )}
                    </Grid>
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, fontWeight: 700 }}>
                      Description
                    </Typography>
                    <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
                      {selectedProduct.description}
                    </Typography>
                  </Box>

                  {selectedProduct.tags && selectedProduct.tags.length > 0 && (
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, fontWeight: 700 }}>
                        Tags
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {selectedProduct.tags.map((tag, i) => (
                          <Chip
                            key={i}
                            icon={<LocalOfferIcon />}
                            label={tag}
                            size="small"
                            variant="outlined"
                            sx={{
                              borderColor: 'rgba(0, 245, 255, 0.3)',
                              color: '#a78bfa',
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                  )}
                </Box>
              </DialogContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Dialog>
    </Box>
  );
};

export default Products;
