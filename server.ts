import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import multer from 'multer';

const upload = multer({
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // In-memory user store for mock testing
  const users = [
    { id: 'u1', fullName: 'Nguyễn Văn A', phone: '0912345678', password: 'password', role: 'CITIZEN' }
  ];

  // Mock API routes
  app.post('/api/auth/login', (req, res) => {
    const { phone, password } = req.body;
    
    if (!phone || !password) {
      return res.status(400).json({ success: false, error: 'BAD_REQUEST' });
    }

    const user = users.find(u => u.phone === phone && u.password === password);

    if (user) {
      return res.status(200).json({
        success: true,
        data: {
          accessToken: 'mock_access_token_' + Math.random().toString(36).substring(7),
          refreshToken: 'mock_refresh_token_' + Math.random().toString(36).substring(7),
          user: { id: user.id, fullName: user.fullName, phone: user.phone, role: user.role }
        }
      });
    }

    if (phone === '0999999999') {
      return res.status(403).json({ success: false, error: 'ACCOUNT_BANNED' });
    }

    return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });
  });

  app.post('/api/auth/register', (req, res) => {
    const { fullName, phone, email, password, role } = req.body;

    // Mock duplicate check
    if (users.some(u => u.phone === phone)) {
      return res.status(409).json({ success: false, error: 'DUPLICATE_PHONE' });
    }
    
    // Mock validation error
    if (!fullName || !phone || !password || !role) {
      return res.status(400).json({ success: false, error: 'VALIDATION_ERROR' });
    }

    const newUser = {
      id: 'u' + (users.length + 1),
      fullName,
      phone,
      password, // In real app, hash this!
      role,
      status: 'ACTIVE'
    };

    users.push(newUser);

    // Mock success
    return res.status(201).json({
      success: true,
      data: newUser
    });
  });

  app.post('/api/auth/refresh', (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ success: false, error: 'MISSING_REFRESH_TOKEN' });
    }
    
    // Mock refresh logic
    return res.status(200).json({
      success: true,
      data: {
        accessToken: 'new_mock_access_token_' + Math.random().toString(36).substring(7),
        refreshToken: 'new_mock_refresh_token_' + Math.random().toString(36).substring(7),
      }
    });
  });

  app.post('/api/requests', upload.array('images', 5), (req, res) => {
    const { lat, lng, addressText, urgencyLevel, description, numPeople } = req.body;
    const files = req.files as Express.Multer.File[];

    console.log('--- NEW RESCUE REQUEST ---');
    console.log('Location:', lat, lng, addressText);
    console.log('Urgency:', urgencyLevel);
    console.log('Description:', description);
    console.log('People:', numPeople);
    console.log('Images:', files?.length || 0);

    // Mock success response
    const requestId = 'REQ-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    
    return res.status(200).json({
      success: true,
      requestId,
      message: 'Yêu cầu cứu hộ đã được tiếp nhận'
    });
  });

  app.get('/api/requests/my', (req, res) => {
    const { page = 0, size = 10, status } = req.query;
    
    // Mock data
    const allRequests = [
      {
        id: 'REQ-A1B2C3',
        status: 'PENDING',
        createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
        lat: 10.762622,
        lng: 106.660172,
        addressText: '227 Nguyễn Văn Cừ, Quận 5, TP.HCM',
        urgencyLevel: 'CRITICAL',
        description: 'Nước dâng cao đến tầng 2, có 3 người đang ở trên mái tôn.',
        numPeople: 3,
        hasInjured: false,
        hasChildren: true,
        hasElderly: false,
        hasPets: true,
        statusHistory: [
          { status: 'PENDING', time: new Date(Date.now() - 1000 * 60 * 30).toISOString(), note: 'Yêu cầu đã được gửi' }
        ]
      },
      {
        id: 'REQ-D4E5F6',
        status: 'ASSIGNED',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        lat: 10.773622,
        lng: 106.671172,
        addressText: '123 Cách Mạng Tháng 8, Quận 10, TP.HCM',
        urgencyLevel: 'HIGH',
        description: 'Cần hỗ trợ di dời đồ đạc và người già.',
        numPeople: 2,
        hasInjured: false,
        hasChildren: false,
        hasElderly: true,
        hasPets: false,
        teamInfo: {
          teamName: 'Đội Cứu Hộ Quận 10',
          memberCount: 5,
          phone: '0901234567'
        },
        statusHistory: [
          { status: 'PENDING', time: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), note: 'Yêu cầu đã được gửi' },
          { status: 'VERIFIED', time: new Date(Date.now() - 1000 * 60 * 60 * 1.5).toISOString(), note: 'Thông tin đã được xác minh' },
          { status: 'ASSIGNED', time: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(), note: 'Đã điều động đội cứu hộ' }
        ]
      },
      {
        id: 'REQ-G7H8I9',
        status: 'COMPLETED',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
        lat: 10.751622,
        lng: 106.650172,
        addressText: '456 Trần Hưng Đạo, Quận 5, TP.HCM',
        urgencyLevel: 'MEDIUM',
        description: 'Hết lương thực dự trữ.',
        numPeople: 4,
        hasInjured: false,
        hasChildren: true,
        hasElderly: false,
        hasPets: false,
        statusHistory: [
          { status: 'PENDING', time: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
          { status: 'COMPLETED', time: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString(), note: 'Đã cung cấp nhu yếu phẩm' }
        ]
      }
    ];

    let filtered = allRequests;
    if (status && status !== 'null') {
      filtered = allRequests.filter(r => r.status === status);
    }

    const totalElements = filtered.length;
    const totalPages = Math.ceil(totalElements / Number(size));
    const content = filtered.slice(Number(page) * Number(size), (Number(page) + 1) * Number(size));

    return res.status(200).json({
      content,
      page: Number(page),
      size: Number(size),
      totalElements,
      totalPages
    });
  });

  app.get('/api/dispatch/map-data', (req, res) => {
    return res.status(200).json({
      requests: [
        { id: 'REQ-A1B2C3', lat: 10.762622, lng: 106.660172, status: 'PENDING', urgencyLevel: 'CRITICAL' },
        { id: 'REQ-D4E5F6', lat: 10.773622, lng: 106.671172, status: 'ASSIGNED', urgencyLevel: 'HIGH' },
        { id: 'REQ-G7H8I9', lat: 10.751622, lng: 106.650172, status: 'COMPLETED', urgencyLevel: 'MEDIUM' }
      ],
      teams: [
        { id: 'T1', lat: 10.765622, lng: 106.665172, teamName: 'Đội Phản Ứng Nhanh 1', status: 'ACTIVE', memberCount: 4 },
        { id: 'T2', lat: 10.780622, lng: 106.680172, teamName: 'Đội Cứu Hộ Quận 3', status: 'ON_MISSION', memberCount: 6 }
      ]
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
