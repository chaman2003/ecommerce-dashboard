import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

const AnimatedLineChart = ({ data, title, dataKey = 'count', xAxisKey = 'name' }) => {
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <Box
          sx={{
            background: 'rgba(26, 32, 44, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(167, 139, 250, 0.3)',
            borderRadius: '12px',
            p: 2,
            boxShadow: '0 8px 32px rgba(167, 139, 250, 0.2)',
          }}
        >
          <Typography variant="body2" color="text.secondary">
            {payload[0].payload[xAxisKey]}
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: '#a78bfa',
              fontWeight: 600,
            }}
          >
            {payload[0].value} items
          </Typography>
        </Box>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
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
            {title}
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <defs>
                <linearGradient id="colorLine" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.2} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
              <XAxis
                dataKey={xAxisKey}
                stroke="rgba(255, 255, 255, 0.5)"
                style={{ fontSize: '12px' }}
              />
              <YAxis stroke="rgba(255, 255, 255, 0.5)" style={{ fontSize: '12px' }} />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(167, 139, 250, 0.3)' }} />
              <Line
                type="monotone"
                dataKey={dataKey}
                stroke="url(#colorLine)"
                strokeWidth={3}
                dot={{
                  fill: '#a78bfa',
                  strokeWidth: 2,
                  r: 4,
                  stroke: '#1a0e2e',
                }}
                activeDot={{
                  r: 6,
                  fill: '#a78bfa',
                  stroke: '#1a0e2e',
                  strokeWidth: 2,
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AnimatedLineChart;
