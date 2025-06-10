'use client';

import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  TextField,
  Chip,
  Alert,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemText,
  Paper,
  CardActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  Send as SendIcon,
  Wifi as WifiIcon,
  WifiOff as WifiOffIcon,
  Restaurant as RestaurantIcon,
  Person as PersonIcon,
  CheckCircle,
  Error,
  Refresh,
  NetworkCheck,
  DeliveryDining,
  CampaignOutlined
} from '@mui/icons-material';
import { useSocket } from '@/hooks/useSocket';

export default function TestWebSocketPage() {
  const { isConnected, error, connect, disconnect, emit, on, off } = useSocket();
  const [logs, setLogs] = useState<string[]>([]);
  const [testMessage, setTestMessage] = useState('');
  const [connectionStatus, setConnectionStatus] = useState<string>('ไม่ได้เชื่อมต่อ');

  // สำหรับการส่งข้อความเฉพาะกลุ่ม
  const [targetType, setTargetType] = useState<'restaurant' | 'customer' | 'rider' | 'broadcast'>('restaurant');
  const [targetId, setTargetId] = useState('test-restaurant');
  const [groupMessage, setGroupMessage] = useState('');

  // ฟังก์ชันเพิ่ม log
  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString('th-TH');
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 29)]);
  };

  useEffect(() => {
    if (isConnected) {
      setConnectionStatus('เชื่อมต่อแล้ว ✅');
      addLog('เชื่อมต่อ Socket.IO สำเร็จ');
    } else if (error) {
      setConnectionStatus(`เชื่อมต่อไม่ได้: ${error}`);
      addLog(`เชื่อมต่อไม่ได้: ${error}`);
    } else {
      setConnectionStatus('กำลังเชื่อมต่อ...');
    }
  }, [isConnected, error]);

  useEffect(() => {
    // ฟัง test message echo
    const handleTestMessage = (data: any) => {
      addLog(`รับข้อความทดสอบ: ${JSON.stringify(data)}`);
    };

    const handleJoinedRoom = (data: any) => {
      addLog(`เข้าร่วมห้องสำเร็จ: ${data.room} (${data.type})`);
    };

    // ฟังข้อความจากกลุ่มต่างๆ
    const handleNewOrder = (data: any) => {
      addLog(`🍽️ [NEW ORDER]: ${JSON.stringify(data)}`);
    };

    const handleOrderUpdate = (data: any) => {
      addLog(`📝 [ORDER UPDATE]: ${JSON.stringify(data)}`);
    };

    const handleDeliveryUpdate = (data: any) => {
      addLog(`🚚 [DELIVERY UPDATE]: ${JSON.stringify(data)}`);
    };

    const handleGroupMessage = (data: any) => {
      addLog(`📢 [GROUP MESSAGE]: ${JSON.stringify(data)}`);
    };

    on('test-message', handleTestMessage);
    on('joined-room', handleJoinedRoom);
    on('new-order', handleNewOrder);
    on('order-update', handleOrderUpdate);
    on('delivery-update', handleDeliveryUpdate);
    on('group-message', handleGroupMessage);

    return () => {
      off('test-message', handleTestMessage);
      off('joined-room', handleJoinedRoom);
      off('new-order', handleNewOrder);
      off('order-update', handleOrderUpdate);
      off('delivery-update', handleDeliveryUpdate);
      off('group-message', handleGroupMessage);
    };
  }, [on, off]);

  const handleSendTestMessage = () => {
    if (testMessage.trim()) {
      addLog(`ส่งข้อความทดสอบ: ${testMessage}`);
      emit('test-message', { message: testMessage, timestamp: new Date().toISOString() });
      setTestMessage('');
    }
  };

  const handleJoinRestaurantRoom = () => {
    addLog('พยายามเข้าร่วมห้องร้านอาหาร (ID: test-restaurant)');
    emit('join-restaurant', 'test-restaurant');
  };

  const handleJoinCustomerRoom = () => {
    addLog('พยายามเข้าร่วมห้องลูกค้า (ID: test-customer)');
    emit('join-customer', 'test-customer');
  };

  const handleJoinRiderRoom = () => {
    addLog('พยายามเข้าร่วมห้องไรเดอร์ (ID: test-rider)');
    emit('join-rider', 'test-rider');
  };

  const handleSendGroupMessage = async () => {
    if (!groupMessage.trim()) return;

    const messageData = {
      message: groupMessage,
      timestamp: new Date().toISOString(),
      from: 'test-websocket'
    };

    if (targetType === 'broadcast') {
      // ส่งข้อความไปทุกกลุ่ม
      addLog(`📢 ส่งข้อความไปทุกกลุ่ม: ${groupMessage}`);
      
      try {
        const response = await fetch('/api/notifications/broadcast', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: groupMessage,
            type: 'test-message'
          })
        });
        
        if (response.ok) {
          addLog('✅ ส่งข้อความ broadcast สำเร็จ');
        } else {
          addLog('❌ ส่งข้อความ broadcast ไม่สำเร็จ');
        }
      } catch (error) {
        addLog(`❌ เกิดข้อผิดพลาด: ${error}`);
      }
    } else {
      // ส่งข้อความไปกลุ่มเฉพาะ
      const roomName = `${targetType}-${targetId}`;
      addLog(`📤 ส่งข้อความไป ${roomName}: ${groupMessage}`);
      
      try {
        const response = await fetch('/api/notifications/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            targetType,
            targetId,
            message: groupMessage,
            type: 'group-message'
          })
        });
        
        if (response.ok) {
          addLog(`✅ ส่งข้อความไป ${roomName} สำเร็จ`);
        } else {
          addLog(`❌ ส่งข้อความไป ${roomName} ไม่สำเร็จ`);
        }
      } catch (error) {
        addLog(`❌ เกิดข้อผิดพลาด: ${error}`);
      }
    }

    setGroupMessage('');
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const getTargetIcon = () => {
    switch (targetType) {
      case 'restaurant': return <RestaurantIcon />;
      case 'customer': return <PersonIcon />;
      case 'rider': return <DeliveryDining />;
      case 'broadcast': return <CampaignOutlined />;
      default: return <SendIcon />;
    }
  };

  const getTargetLabel = () => {
    switch (targetType) {
      case 'restaurant': return 'ร้านอาหาร';
      case 'customer': return 'ลูกค้า';
      case 'rider': return 'ไรเดอร์';
      case 'broadcast': return 'ทุกกลุ่ม';
      default: return 'ไม่ระบุ';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        🧪 ทดสอบระบบ WebSocket
      </Typography>

      {/* สถานะการเชื่อมต่อและการทดสอบพื้นฐาน */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, mb: 3 }}>
        {/* สถานะการเชื่อมต่อ */}
        <Box sx={{ flex: 1 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📡 สถานะการเชื่อมต่อ
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Chip 
                  icon={isConnected ? <CheckCircle /> : <Error />}
                  label={connectionStatus}
                  color={isConnected ? 'success' : 'error'}
                  variant="outlined"
                />
              </Box>

              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  <strong>เออร์:</strong> {error}
                </Alert>
              )}

              <Typography variant="body2" color="text.secondary">
                URL: {typeof window !== 'undefined' ? window.location.origin : 'N/A'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Path: /api/socket
              </Typography>
            </CardContent>
            
            <CardActions>
              <Button 
                variant="outlined" 
                onClick={connect}
                disabled={isConnected}
                startIcon={<NetworkCheck />}
              >
                เชื่อมต่อ
              </Button>
              <Button 
                variant="outlined" 
                onClick={disconnect}
                disabled={!isConnected}
                color="error"
              >
                ตัดการเชื่อมต่อ
              </Button>
            </CardActions>
          </Card>
        </Box>

        {/* การทดสอบพื้นฐาน */}
        <Box sx={{ flex: 1 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🧪 การทดสอบพื้นฐาน
              </Typography>

              <Box sx={{ mb: 2 }}>
                <TextField
                  fullWidth
                  label="ข้อความทดสอบ"
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendTestMessage()}
                  disabled={!isConnected}
                />
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button 
                  variant="contained" 
                  onClick={handleSendTestMessage}
                  disabled={!isConnected || !testMessage.trim()}
                  startIcon={<SendIcon />}
                  fullWidth
                >
                  ส่งข้อความทดสอบ
                </Button>
                
                <Button 
                  variant="outlined" 
                  onClick={handleJoinRestaurantRoom}
                  disabled={!isConnected}
                  startIcon={<RestaurantIcon />}
                  fullWidth
                >
                  เข้าร่วมห้องร้านอาหาร
                </Button>
                
                <Button 
                  variant="outlined" 
                  onClick={handleJoinCustomerRoom}
                  disabled={!isConnected}
                  startIcon={<PersonIcon />}
                  fullWidth
                >
                  เข้าร่วมห้องลูกค้า
                </Button>

                <Button 
                  variant="outlined" 
                  onClick={handleJoinRiderRoom}
                  disabled={!isConnected}
                  startIcon={<DeliveryDining />}
                  fullWidth
                >
                  เข้าร่วมห้องไรเดอร์
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* การส่งข้อความเฉพาะกลุ่ม */}
      <Box sx={{ mb: 3 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              📢 ส่งข้อความเฉพาะกลุ่ม
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, mb: 2 }}>
              <FormControl sx={{ minWidth: 150 }}>
                <InputLabel>เป้าหมาย</InputLabel>
                <Select
                  value={targetType}
                  label="เป้าหมาย"
                  onChange={(e) => {
                    const newType = e.target.value as typeof targetType;
                    setTargetType(newType);
                    // ตั้งค่า default ID ตามประเภท
                    if (newType === 'restaurant') setTargetId('test-restaurant');
                    else if (newType === 'customer') setTargetId('test-customer');
                    else if (newType === 'rider') setTargetId('test-rider');
                    else setTargetId('');
                  }}
                  startAdornment={getTargetIcon()}
                >
                  <MenuItem value="restaurant">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <RestaurantIcon /> ร้านอาหาร
                    </Box>
                  </MenuItem>
                  <MenuItem value="customer">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PersonIcon /> ลูกค้า
                    </Box>
                  </MenuItem>
                  <MenuItem value="rider">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <DeliveryDining /> ไรเดอร์
                    </Box>
                  </MenuItem>
                                     <MenuItem value="broadcast">
                     <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                       <CampaignOutlined /> ทุกกลุ่ม
                     </Box>
                   </MenuItem>
                </Select>
              </FormControl>

              {targetType !== 'broadcast' && (
                <TextField
                  label="ID เป้าหมาย"
                  value={targetId}
                  onChange={(e) => setTargetId(e.target.value)}
                  sx={{ minWidth: 200 }}
                  placeholder={`เช่น ${targetType}-1`}
                />
              )}
            </Box>

            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                label={`ข้อความไปยัง${getTargetLabel()}`}
                value={groupMessage}
                onChange={(e) => setGroupMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendGroupMessage()}
                disabled={!isConnected}
                multiline
                rows={2}
                placeholder={targetType === 'broadcast' ? 'ข้อความนี้จะส่งไปทุกกลุ่ม' : `ข้อความนี้จะส่งไป ${targetType}-${targetId}`}
              />
            </Box>

            <Button 
              variant="contained" 
              onClick={handleSendGroupMessage}
              disabled={!isConnected || !groupMessage.trim() || (targetType !== 'broadcast' && !targetId.trim())}
              startIcon={getTargetIcon()}
              color={targetType === 'broadcast' ? 'warning' : 'primary'}
              fullWidth
            >
              ส่งข้อความไป{getTargetLabel()} {targetType !== 'broadcast' && `(${targetId})`}
            </Button>
          </CardContent>
        </Card>
      </Box>

      {/* Logs */}
      <Box sx={{ mb: 3 }}>
        <Paper sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              📋 บันทึกการทำงาน
            </Typography>
            <Button 
              variant="outlined" 
              size="small"
              onClick={clearLogs}
              startIcon={<Refresh />}
            >
              ล้างบันทึก
            </Button>
          </Box>

          <Box 
            sx={{ 
              height: 400, 
              overflow: 'auto', 
              bgcolor: 'grey.50', 
              p: 2, 
              borderRadius: 1,
              fontFamily: 'monospace'
            }}
          >
            {logs.length === 0 ? (
              <Typography color="text.secondary">
                ยังไม่มีบันทึก...
              </Typography>
            ) : (
              <List dense>
                {logs.map((log, index) => (
                  <ListItem key={index} sx={{ py: 0.5 }}>
                    <ListItemText 
                      primary={log}
                      sx={{ 
                        '& .MuiListItemText-primary': { 
                          fontSize: '0.875rem',
                          fontFamily: 'monospace'
                        }
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        </Paper>
      </Box>

      {/* คำแนะนำการแก้ไขปัญหา */}
      <Box>
        <Alert severity="info">
          <Typography variant="h6" gutterBottom>
            💡 คำแนะนำการใช้งาน
          </Typography>
          <Typography variant="body2" paragraph>
            <strong>การส่งข้อความเฉพาะกลุ่ม:</strong>
          </Typography>
          <ul>
            <li><strong>ร้านอาหาร:</strong> ส่งข้อความไปห้อง restaurant-{targetId}</li>
            <li><strong>ลูกค้า:</strong> ส่งข้อความไปห้อง customer-{targetId}</li>
            <li><strong>ไรเดอร์:</strong> ส่งข้อความไปห้อง rider-{targetId}</li>
            <li><strong>ทุกกลุ่ม:</strong> ส่งข้อความไปทุกห้องพร้อมกัน</li>
          </ul>
          <Typography variant="body2" sx={{ mt: 2 }}>
            <strong>หมายเหตุ:</strong> ต้องเข้าร่วมห้องก่อนจึงจะรับข้อความได้ ใช้ปุ่ม "เข้าร่วมห้อง" ด้านบน
          </Typography>
        </Alert>
      </Box>
    </Container>
  );
} 