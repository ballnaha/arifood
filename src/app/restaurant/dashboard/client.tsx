'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Badge,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  FormControl,
  Select,
  MenuItem,
  InputLabel
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Restaurant as RestaurantIcon,
  AccessTime as AccessTimeIcon,
  Phone as PhoneIcon,
  LocationOn as LocationOnIcon
} from '@mui/icons-material';
import useSocket from '@/hooks/useSocket';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  instructions?: string;
  addOns?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  totalAmount: number;
  status: string;
  items: OrderItem[];
  specialInstructions?: string;
  createdAt: string;
  restaurantId: string;
  restaurantName: string;
}

interface RestaurantDashboardClientProps {
  restaurantId: string;
  restaurantName: string;
}

const statusMap: Record<string, { label: string; color: any }> = {
  PENDING: { label: 'รอการยืนยัน', color: 'warning' },
  CONFIRMED: { label: 'ยืนยันแล้ว', color: 'info' },
  PREPARING: { label: 'กำลังเตรียม', color: 'primary' },
  READY_FOR_PICKUP: { label: 'พร้อมรับ', color: 'success' },
  ASSIGNED_RIDER: { label: 'จัดไรเดอร์แล้ว', color: 'default' },
  PICKED_UP: { label: 'ไรเดอร์รับแล้ว', color: 'default' },
  OUT_FOR_DELIVERY: { label: 'กำลังจัดส่ง', color: 'default' },
  DELIVERED: { label: 'จัดส่งสำเร็จ', color: 'success' },
  CANCELLED: { label: 'ยกเลิก', color: 'error' }
};

export default function RestaurantDashboardClient({ 
  restaurantId, 
  restaurantName 
}: RestaurantDashboardClientProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDialog, setShowOrderDialog] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [newOrdersCount, setNewOrdersCount] = useState(0);

  // Initialize Socket.IO
  const { isConnected, joinRoom, on, off } = useSocket();

  useEffect(() => {
    // เชื่อมต่อเข้าห้องของร้านอาหารเมื่อ Socket เชื่อมต่อสำเร็จ
    if (isConnected && restaurantId) {
      joinRoom('restaurant', restaurantId);
    }
  }, [isConnected, restaurantId, joinRoom]);

  useEffect(() => {
    // ฟังการแจ้งเตือนออเดอร์ใหม่
    const handleNewOrder = (orderData: Order) => {
      console.log('🔔 ได้รับออเดอร์ใหม่:', orderData);
      
      // เพิ่มออเดอร์ใหม่ในรายการ
      setOrders(prev => [orderData, ...prev]);
      
      // แสดงการแจ้งเตือน
      setNotificationMessage(`ออเดอร์ใหม่ #${orderData.orderNumber} จาก ${orderData.customerName}`);
      setShowNotification(true);
      
      // นับจำนวนออเดอร์ใหม่
      setNewOrdersCount(prev => prev + 1);
      
      // เล่นเสียงแจ้งเตือน (ถ้าต้องการ)
      playNotificationSound();
    };

    on('new-order', handleNewOrder);

    return () => {
      off('new-order', handleNewOrder);
    };
  }, [on, off]);

  useEffect(() => {
    // โหลดออเดอร์เดิมที่มีอยู่
    fetchOrders();
  }, [restaurantId]);

  const fetchOrders = async () => {
    try {
      const response = await fetch(`/api/orders?restaurantId=${restaurantId}`);
      if (response.ok) {
        const ordersData = await response.json();
        setOrders(ordersData);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const playNotificationSound = () => {
    // เล่นเสียงแจ้งเตือน
    if (typeof window !== 'undefined' && 'AudioContext' in window) {
      try {
        const audioContext = new AudioContext();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
      } catch (error) {
        console.log('Cannot play notification sound:', error);
      }
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        // อัพเดทสถานะในรายการ
        setOrders(prev => 
          prev.map(order => 
            order.id === orderId 
              ? { ...order, status: newStatus }
              : order
          )
        );
        
        setShowOrderDialog(false);
        setNotificationMessage('อัพเดทสถานะสำเร็จ');
        setShowNotification(true);
      } else {
        throw new Error('Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      setNotificationMessage('เกิดข้อผิดพลาดในการอัพเดทสถานะ');
      setShowNotification(true);
    } finally {
      setLoading(false);
    }
  };

  const handleOrderClick = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderDialog(true);
    
    // ลดจำนวนออเดอร์ใหม่ถ้าเป็นออเดอร์ที่ยังไม่ได้ดู
    if (order.status === 'PENDING') {
      setNewOrdersCount(prev => Math.max(0, prev - 1));
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <RestaurantIcon sx={{ fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h4" fontWeight={600}>
            {restaurantName}
          </Typography>
          <Badge 
            badgeContent={newOrdersCount} 
            color="error" 
            sx={{ ml: 2 }}
          >
            <NotificationsIcon />
          </Badge>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Chip 
            label={isConnected ? 'เชื่อมต่อแล้ว' : 'ไม่ได้เชื่อมต่อ'} 
            color={isConnected ? 'success' : 'error'} 
            size="small" 
          />
          <Typography variant="body2" color="text.secondary">
            รับการแจ้งเตือนออเดอร์แบบเรียลไทม์
          </Typography>
        </Box>
      </Box>

      {/* Orders List */}
      <Grid container spacing={3}>
        {orders.length === 0 ? (
          <Grid item xs={12}>
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <RestaurantIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                ยังไม่มีออเดอร์
              </Typography>
              <Typography variant="body2" color="text.secondary">
                เมื่อมีลูกค้าสั่งอาหาร จะแสดงที่นี่
              </Typography>
            </Paper>
          </Grid>
        ) : (
          orders.map((order) => (
            <Grid item xs={12} md={6} lg={4} key={order.id}>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 3
                  },
                  border: order.status === 'PENDING' ? '2px solid' : '1px solid',
                  borderColor: order.status === 'PENDING' ? 'warning.main' : 'divider'
                }}
                onClick={() => handleOrderClick(order)}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                    <Typography variant="h6" fontWeight={600}>
                      #{order.orderNumber}
                    </Typography>
                    <Chip 
                      label={statusMap[order.status]?.label || order.status}
                      color={statusMap[order.status]?.color || 'default'}
                      size="small"
                    />
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" fontWeight={500}>
                      {order.customerName}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                      <PhoneIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {order.customerPhone}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      รายการอาหาร:
                    </Typography>
                    {order.items.map((item, index) => (
                      <Typography key={index} variant="body2">
                        {item.name} × {item.quantity}
                      </Typography>
                    ))}
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AccessTimeIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {formatTime(order.createdAt)}
                      </Typography>
                    </Box>
                    <Typography variant="h6" fontWeight={600} color="primary">
                      ฿{order.totalAmount.toLocaleString()}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      {/* Order Detail Dialog */}
      {selectedOrder && (
        <Dialog 
          open={showOrderDialog} 
          onClose={() => setShowOrderDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">
                ออเดอร์ #{selectedOrder.orderNumber}
              </Typography>
              <Chip 
                label={statusMap[selectedOrder.status]?.label || selectedOrder.status}
                color={statusMap[selectedOrder.status]?.color || 'default'}
              />
            </Box>
          </DialogTitle>
          
          <DialogContent>
            <Grid container spacing={3}>
              {/* Customer Info */}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  ข้อมูลลูกค้า
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body1">{selectedOrder.customerName}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                    <PhoneIcon fontSize="small" color="action" />
                    <Typography variant="body2">{selectedOrder.customerPhone}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'start', gap: 1, mt: 1 }}>
                    <LocationOnIcon fontSize="small" color="action" />
                    <Typography variant="body2">{selectedOrder.customerAddress}</Typography>
                  </Box>
                </Box>
              </Grid>

              {/* Order Info */}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  ข้อมูลออเดอร์
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  วันที่: {formatDate(selectedOrder.createdAt)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  เวลา: {formatTime(selectedOrder.createdAt)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ยอดรวม: ฿{selectedOrder.totalAmount.toLocaleString()}
                </Typography>
              </Grid>

              {/* Order Items */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  รายการอาหาร
                </Typography>
                <List dense>
                  {selectedOrder.items.map((item, index) => (
                    <ListItem key={index} sx={{ px: 0 }}>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography>{item.name} × {item.quantity}</Typography>
                            <Typography>฿{(item.price * item.quantity).toLocaleString()}</Typography>
                          </Box>
                        }
                        secondary={
                          <>
                            {item.addOns && (
                              <Typography variant="body2" color="text.secondary">
                                เพิ่มเติม: {item.addOns}
                              </Typography>
                            )}
                            {item.instructions && (
                              <Typography variant="body2" color="text.secondary">
                                หมายเหตุ: {item.instructions}
                              </Typography>
                            )}
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Grid>

              {/* Special Instructions */}
              {selectedOrder.specialInstructions && (
                <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    คำแนะนำพิเศษ
                  </Typography>
                  <Typography variant="body2">
                    {selectedOrder.specialInstructions}
                  </Typography>
                </Grid>
              )}

              {/* Status Update */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  อัพเดทสถานะ
                </Typography>
                <FormControl fullWidth>
                  <InputLabel>สถานะ</InputLabel>
                  <Select
                    value={selectedOrder.status}
                    label="สถานะ"
                    onChange={(e) => updateOrderStatus(selectedOrder.id, e.target.value)}
                    disabled={loading}
                  >
                    <MenuItem value="PENDING">รอการยืนยัน</MenuItem>
                    <MenuItem value="CONFIRMED">ยืนยันแล้ว</MenuItem>
                    <MenuItem value="PREPARING">กำลังเตรียม</MenuItem>
                    <MenuItem value="READY_FOR_PICKUP">พร้อมรับ</MenuItem>
                    <MenuItem value="CANCELLED">ยกเลิก</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          
          <DialogActions>
            <Button onClick={() => setShowOrderDialog(false)}>
              ปิด
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Notification Snackbar */}
      <Snackbar
        open={showNotification}
        autoHideDuration={6000}
        onClose={() => setShowNotification(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setShowNotification(false)}
          severity="info"
          sx={{ width: '100%' }}
        >
          {notificationMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
} 