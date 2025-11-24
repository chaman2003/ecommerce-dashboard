import React, { useEffect, useState } from 'react';
import {
  Grid,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  CircularProgress,
  Button,
} from '@mui/material';
import { motion } from 'framer-motion';
import StarIcon from '@mui/icons-material/Star';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import { productAPI } from '../services/api';

const categories = ['All', 'Laptops', 'Smartphones', 'Cameras', 'Drones', 'Accessories', 'Tablets', 'Gaming', 'Audio'];

const Recommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [minRating, setMinRating] = useState(7);
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [selectedOrigin, setSelectedOrigin] = useState('All');
  const [filterOptions, setFilterOptions] = useState({ brands: [], origins: [] });
  const [filtersLoading, setFiltersLoading] = useState(false);
  const [filtersError, setFiltersError] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleRatingChange = (_, value) => {
    const nextValue = Array.isArray(value) ? value[0] : value;
    setMinRating(nextValue);
  };

  const handleResetFilters = () => {
    setSelectedCategory('All');
    setSelectedBrand('All');
    setSelectedOrigin('All');
    setMinRating(7);
  };

  useEffect(() => {
    const loadFilterOptions = async () => {
      setFiltersLoading(true);
      setFiltersError(null);
      try {
        const response = await productAPI.getFilterOptions();
        const data = response.data.data || {};
        setFilterOptions({
          brands: data.brands || [],
          origins: data.origins || [],
        });
      } catch (error) {
        console.error('Error loading filter options:', error);
        setFiltersError('Some filters may be unavailable right now.');
      } finally {
        setFiltersLoading(false);
      }
    };

    loadFilterOptions();
  }, []);

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      try {
        const params = { minRating };
        if (selectedCategory !== 'All') params.category = selectedCategory;
        if (selectedBrand !== 'All') params.brand = selectedBrand;
        if (selectedOrigin !== 'All') params.origin = selectedOrigin;

        const response = await productAPI.getRecommendations(params);
        const raw = response.data.data || [];
        setRecommendations(raw);
      } catch (error) {
        console.error('Error fetching recommendations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [selectedCategory, minRating, selectedBrand, selectedOrigin]);

  return (
    <Box>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          <ThumbUpIcon sx={{ fontSize: 40, color: '#a78bfa' }} />
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              background: 'linear-gradient(135deg, #ffffff 0%, #a78bfa 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Product Recommendations
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Discover highly-rated products tailored to your preferences
        </Typography>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card
          sx={{
            mb: 4,
            background: 'rgba(26, 32, 44, 0.6)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '20px',
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap', mb: 2 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Fine-tune Recommendations
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Combine category, brand, and rating filters to narrow suggestions.
                </Typography>
              </Box>
              <Button
                variant="outlined"
                onClick={handleResetFilters}
                disabled={
                  selectedCategory === 'All' &&
                  selectedBrand === 'All' &&
                  selectedOrigin === 'All' &&
                  minRating === 7
                }
                sx={{ borderColor: '#a78bfa', color: '#a78bfa' }}
              >
                Reset
              </Button>
            </Box>

            {filtersError && (
              <Typography variant="body2" color="#ff6384" sx={{ mb: 2 }}>
                {filtersError}
              </Typography>
            )}

            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={selectedCategory}
                    label="Category"
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    {categories.map((cat) => (
                      <MenuItem key={cat} value={cat}>
                        {cat}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Brand</InputLabel>
                  <Select
                    value={selectedBrand}
                    label="Brand"
                    onChange={(e) => setSelectedBrand(e.target.value)}
                    disabled={filtersLoading}
                  >
                    <MenuItem value="All">All brands</MenuItem>
                    {filterOptions.brands.map((brand) => (
                      <MenuItem key={brand} value={brand}>
                        {brand}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Origin</InputLabel>
                  <Select
                    value={selectedOrigin}
                    label="Origin"
                    onChange={(e) => setSelectedOrigin(e.target.value)}
                    disabled={filtersLoading}
                  >
                    <MenuItem value="All">All origins</MenuItem>
                    {filterOptions.origins.map((origin) => (
                      <MenuItem key={origin} value={origin}>
                        {origin}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Minimum Rating: {minRating.toFixed(1)}
                </Typography>
                <Slider
                  value={minRating}
                  onChange={handleRatingChange}
                  min={1}
                  max={10}
                  step={0.5}
                  marks
                  valueLabelDisplay="auto"
                  sx={{
                    color: '#a78bfa',
                    '& .MuiSlider-thumb': {
                      background: 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)',
                      boxShadow: '0 4px 12px rgba(167, 139, 250, 0.4)',
                    },
                    '& .MuiSlider-track': {
                      background: 'linear-gradient(90deg, #a78bfa 0%, #7c3aed 100%)',
                    },
                  }}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </motion.div>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40vh' }}>
          <CircularProgress sx={{ color: '#a78bfa' }} size={60} />
        </Box>
      ) : (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              {recommendations.length} Recommended Products
            </Typography>
          </motion.div>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {recommendations.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <Card
                  sx={{
                    background: 'linear-gradient(135deg, rgba(167, 139, 250, 0.2) 0%, rgba(124, 58, 237, 0.2) 100%)',
                    border: '1px solid rgba(167, 139, 250, 0.4)',
                    borderRadius: '20px',
                    overflow: 'hidden',
                  }}
                >
                  <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                    <Typography variant="overline" sx={{ letterSpacing: 2, color: '#a78bfa' }}>
                      Featured Pick
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                      {recommendations[0].name}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                      <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.8, px: 1.5, py: 0.5, borderRadius: '999px', background: 'rgba(255,255,255,0.15)' }}>
                        <StarIcon sx={{ fontSize: 18, color: '#ffaa00' }} />
                        <Typography variant="h6" sx={{ color: '#ffaa00', fontWeight: 700 }}>
                          {(recommendations[0].rating ?? 0).toFixed(1)}
                        </Typography>
                      </Box>
                      <Typography variant="body1" color="text.secondary">
                        ${recommendations[0].price}
                      </Typography>
                      {recommendations[0].brand && (
                        <Chip label={recommendations[0].brand} size="small" sx={{ background: 'rgba(0, 0, 0, 0.2)', color: '#fff' }} />
                      )}
                      {recommendations[0].origin && (
                        <Chip label={recommendations[0].origin} size="small" sx={{ background: 'rgba(0, 0, 0, 0.2)', color: '#fff' }} />
                      )}
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                      <Chip label={recommendations[0].category} size="small" variant="outlined" sx={{ borderColor: 'rgba(255,255,255,0.3)', color: '#fff' }} />
                    </Box>
                    {recommendations[0].description && (
                      <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.85)', lineHeight: 1.7 }}>
                        {recommendations[0].description.substring(0, 280)}...
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {recommendations.slice(1).length > 0 && (
              <Card
                sx={{
                  background: 'rgba(26, 32, 44, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '18px'
                }}
              >
                <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                  <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                    Runner-ups
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {recommendations.slice(1).map((product, index) => (
                      <motion.div
                        key={product._id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.03 }}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            gap: 2,
                            alignItems: 'flex-start',
                            padding: 2,
                            borderRadius: '12px',
                            background: 'rgba(0,0,0,0.2)',
                            border: '1px solid rgba(255,255,255,0.05)'
                          }}
                        >
                          <Box sx={{
                            width: 36,
                            height: 36,
                            borderRadius: '50%',
                            background: 'rgba(167, 139, 250, 0.15)',
                            border: '1px solid rgba(167, 139, 250, 0.4)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            color: '#a78bfa'
                          }}>
                            {index + 2}
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                {product.name}
                              </Typography>
                              <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 1, py: 0.2, borderRadius: '6px', background: 'rgba(255, 170, 0, 0.15)' }}>
                                <StarIcon sx={{ fontSize: 14, color: '#ffaa00' }} />
                                <Typography variant="body2" sx={{ color: '#ffaa00', fontWeight: 600 }}>
                                  {(product.rating ?? 0).toFixed(1)}
                                </Typography>
                              </Box>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', mt: 1 }}>
                              <Typography variant="body2" color="text.secondary">
                                ${product.price}
                              </Typography>
                              {product.brand && <Chip label={product.brand} size="small" />}
                              {product.origin && <Chip label={product.origin} size="small" />}
                            </Box>
                            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 1 }}>
                              <Chip label={product.category} size="small" variant="outlined" />
                            </Box>
                            {product.description && (
                              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                {product.description.substring(0, 160)}...
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </motion.div>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            )}
          </Box>

          {recommendations.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h5" color="text.secondary">
                No recommendations found with the current filters
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Try adjusting your filters to see more results
              </Typography>
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default Recommendations;
