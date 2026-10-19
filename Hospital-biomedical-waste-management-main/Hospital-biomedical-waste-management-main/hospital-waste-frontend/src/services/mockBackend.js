// KMCH Hospital Biomedical Waste Management - In-Browser Mock Backend & Offline Engine
// Allows the full web app to run seamlessly in static hosting (e.g. GitHub Pages)
// and handles all API calls locally if the remote backend server is unreachable.

import { CATEGORY_BIN_MAP, CATEGORIES, BINS, isCompliant, hasMismatch, ACTIVE_STATUSES, DONE_STATUSES } from '../utils/waste';

const STORAGE_KEY = 'kmch_biowaste_demo_db_v1';

// Seed Initial 150 Users (Admin, 75 Staff, 75 Workers) matching backend
function createInitialUsers() {
  const users = [
    {
      id: 'usr_admin',
      _id: 'usr_admin',
      name: 'System Admin',
      email: 'admin@hospital.com',
      username: 'adminname',
      password: 'Password123',
      phone: '9876543210',
      role: 'admin',
      department: 'Administration',
      isActive: true,
      createdAt: '2026-09-01T08:00:00.000Z'
    }
  ];

  const departments = ['Emergency', 'ICU', 'Pediatrics', 'Surgery', 'General Ward', 'Oncology', 'Cardiology', 'Radiology'];
  for (let i = 1; i <= 75; i++) {
    const num = String(i).padStart(3, '0');
    users.push({
      id: `usr_staff_${num}`,
      _id: `usr_staff_${num}`,
      name: `Staff Member ${i}`,
      email: `staff${num}@hospital.com`,
      username: `staff${num}`,
      password: 'Password123',
      phone: `9800000${num}`,
      role: 'staff',
      department: departments[i % departments.length],
      isActive: i % 10 !== 0,
      createdAt: '2026-09-01T08:30:00.000Z'
    });
  }

  const workerDepts = ['Logistics', 'Sanitation', 'Waste Mgt', 'Environmental Care'];
  for (let i = 1; i <= 75; i++) {
    const num = String(i).padStart(3, '0');
    users.push({
      id: `usr_worker_${num}`,
      _id: `usr_worker_${num}`,
      name: `Sanitation Worker ${i}`,
      email: `worker${num}@hospital.com`,
      username: `worker${num}`,
      password: 'Password123',
      phone: `9700000${num}`,
      role: 'worker',
      department: workerDepts[i % workerDepts.length],
      isActive: i % 12 !== 0,
      createdAt: '2026-09-01T09:00:00.000Z'
    });
  }

  return users;
}

// Seed sample weekly waste records matching backend server.js
function createInitialRecords() {
  const now = new Date();
  const createDateOffset = (daysAgo, hour = 10) => {
    const d = new Date(now.getTime() - daysAgo * 86400000);
    d.setHours(hour, 15, 0, 0);
    return d.toISOString();
  };

  return [
    {
      _id: 'rec_101',
      id: 'rec_101',
      recordId: 'WR-101',
      description: 'Expired pharmaceuticals & chemical solutions',
      room: 'Pharmacy Store',
      category: 'Chemical Waste',
      weight: 12.5,
      assignedBin: 'Yellow',
      status: 'Completed',
      createdBy: 'Staff Member 1',
      collectedBy: 'Sanitation Worker 1',
      collectedByUserId: 'usr_worker_001',
      assignedTo: 'Sanitation Worker 1',
      assignedToUserId: 'usr_worker_001',
      binVerified: true,
      binMismatchNote: '',
      collectedAt: createDateOffset(6, 14),
      createdAt: createDateOffset(6, 9)
    },
    {
      _id: 'rec_102',
      id: 'rec_102',
      recordId: 'WR-102',
      description: 'Used blood bags & IV tubing',
      room: 'ICU Bed 4',
      category: 'Infectious Waste',
      weight: 18.2,
      assignedBin: 'Yellow',
      status: 'Completed',
      createdBy: 'Staff Member 2',
      collectedBy: 'Sanitation Worker 3',
      collectedByUserId: 'usr_worker_003',
      assignedTo: 'Sanitation Worker 3',
      assignedToUserId: 'usr_worker_003',
      binVerified: true,
      binMismatchNote: '',
      collectedAt: createDateOffset(5, 12),
      createdAt: createDateOffset(5, 8)
    },
    {
      _id: 'rec_103',
      id: 'rec_103',
      recordId: 'WR-103',
      description: 'Surgical scalpels & glass vials',
      room: 'Operation Theater 2',
      category: 'Sharps',
      weight: 8.4,
      assignedBin: 'White',
      status: 'Completed',
      createdBy: 'Staff Member 3',
      collectedBy: 'Sanitation Worker 2',
      collectedByUserId: 'usr_worker_002',
      assignedTo: 'Sanitation Worker 2',
      assignedToUserId: 'usr_worker_002',
      binVerified: true,
      binMismatchNote: '',
      collectedAt: createDateOffset(4, 15),
      createdAt: createDateOffset(4, 10)
    },
    {
      _id: 'rec_104',
      id: 'rec_104',
      recordId: 'WR-104',
      description: 'Disposed masks & general packaging',
      room: 'General Ward 101',
      category: 'General Waste',
      weight: 25.0,
      assignedBin: 'Green',
      status: 'Completed',
      createdBy: 'Staff Member 4',
      collectedBy: 'Sanitation Worker 1',
      collectedByUserId: 'usr_worker_001',
      assignedTo: 'Sanitation Worker 1',
      assignedToUserId: 'usr_worker_001',
      binVerified: true,
      binMismatchNote: '',
      collectedAt: createDateOffset(3, 11),
      createdAt: createDateOffset(3, 8)
    },
    {
      _id: 'rec_105',
      id: 'rec_105',
      recordId: 'WR-105',
      description: 'Plastic IV bottles & syringes',
      room: 'Pediatrics Ward',
      category: 'Contaminated Recyclable',
      weight: 14.8,
      assignedBin: 'Red',
      status: 'Collected',
      createdBy: 'Staff Member 5',
      collectedBy: 'Sanitation Worker 4',
      collectedByUserId: 'usr_worker_004',
      assignedTo: 'Sanitation Worker 4',
      assignedToUserId: 'usr_worker_004',
      binVerified: true,
      binMismatchNote: '',
      collectedAt: createDateOffset(2, 16),
      createdAt: createDateOffset(2, 11)
    },
    {
      _id: 'rec_106',
      id: 'rec_106',
      recordId: 'WR-106',
      description: 'Soiled cotton swabs & bandages',
      room: 'Emergency Room',
      category: 'Infectious Waste',
      weight: 22.3,
      assignedBin: 'Yellow',
      status: 'Assigned',
      createdBy: 'Staff Member 6',
      assignedTo: 'Sanitation Worker 1',
      assignedToUserId: 'usr_worker_001',
      assignedTime: createDateOffset(1, 10),
      createdAt: createDateOffset(1, 9)
    },
    {
      _id: 'rec_107',
      id: 'rec_107',
      recordId: 'WR-107',
      description: 'Broken glass ampoules & slides',
      room: 'Pathology Lab',
      category: 'Sharps',
      weight: 6.7,
      assignedBin: 'White',
      status: 'Pending',
      createdBy: 'Staff Member 7',
      createdAt: createDateOffset(0, 8)
    },
    {
      _id: 'rec_108',
      id: 'rec_108',
      recordId: 'WR-108',
      description: 'General office waste & paper wrappers',
      room: 'Admin Block',
      category: 'General Waste',
      weight: 19.5,
      assignedBin: 'Green',
      status: 'Assigned',
      assignedTo: 'Sanitation Worker 1',
      assignedToUserId: 'usr_worker_001',
      assignedTime: createDateOffset(0, 9),
      createdBy: 'Staff Member 1',
      createdAt: createDateOffset(0, 8)
    }
  ];
}

function createInitialNotifications() {
  return [
    {
      _id: 'notif_1',
      id: 'notif_1',
      recipientUserId: 'usr_worker_001',
      recipientRole: 'worker',
      senderName: 'Staff Member 6',
      recordId: 'WR-106',
      wasteRecordId: 'rec_106',
      type: 'assignment',
      title: 'Task Assigned: WR-106',
      message: 'You have been assigned to collect Infectious Waste (22.3 kg) from Emergency Room.',
      room: 'Emergency Room',
      category: 'Infectious Waste',
      weight: 22.3,
      assignedBin: 'Yellow',
      isRead: false,
      createdAt: new Date().toISOString()
    },
    {
      _id: 'notif_2',
      id: 'notif_2',
      recipientUserId: 'usr_worker_001',
      recipientRole: 'worker',
      senderName: 'Staff Member 1',
      recordId: 'WR-108',
      wasteRecordId: 'rec_108',
      type: 'assignment',
      title: 'Task Assigned: WR-108',
      message: 'You have been assigned to collect General Waste (19.5 kg) from Admin Block.',
      room: 'Admin Block',
      category: 'General Waste',
      weight: 19.5,
      assignedBin: 'Green',
      isRead: false,
      createdAt: new Date().toISOString()
    }
  ];
}

class MockBackendStore {
  constructor() {
    this.data = this.load();
  }

  load() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Failed to parse mock database, resetting to default', e);
    }
    const fresh = {
      users: createInitialUsers(),
      records: createInitialRecords(),
      notifications: createInitialNotifications()
    };
    this.save(fresh);
    return fresh;
  }

  save(data = this.data) {
    this.data = data;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('LocalStorage write failed:', e);
    }
  }

  reset() {
    localStorage.removeItem(STORAGE_KEY);
    this.data = this.load();
  }
}

const store = new MockBackendStore();

function getISTDayBounds(dateStr) {
  let year, month, day;
  if (dateStr && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    [year, month, day] = dateStr.split('-').map(Number);
  } else {
    const now = new Date();
    const istNow = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
    year = istNow.getUTCFullYear();
    month = istNow.getUTCMonth() + 1;
    day = istNow.getUTCDate();
  }
  const istOffsetMs = 5.5 * 60 * 60 * 1000;
  const startIST = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
  const startUTC = new Date(startIST.getTime() - istOffsetMs);
  const endUTC = new Date(startUTC.getTime() + 24 * 60 * 60 * 1000);
  return { startUTC, endUTC };
}

const sumWeight = (arr) => arr.reduce((sum, r) => sum + (Number(r.weight) || 0), 0);

export const mockBackend = {
  isMockActive: true,

  handle: async (pathWithQs, { method = 'GET', body, formData } = {}) => {
    // Artificial small delay for realistic UX
    await new Promise(r => setTimeout(r, 60));

    const [path, qs] = pathWithQs.split('?');
    const params = new URLSearchParams(qs || '');

    // ---------------- AUTH ----------------
    if (path === '/auth/login' && method === 'POST') {
      const { username, password, role } = body || {};
      const clean = (username || '').trim().toLowerCase();
      const user = store.data.users.find(u =>
        u.username.toLowerCase() === clean || u.email.toLowerCase() === clean
      );

      if (!user) {
        throw Object.assign(new Error('Invalid username or password'), { status: 401 });
      }
      if (password !== 'Password123' && password !== user.password) {
        throw Object.assign(new Error('Invalid username or password'), { status: 401 });
      }
      if (role && user.role !== role) {
        throw Object.assign(new Error(`Access denied. Account role is '${user.role}', not '${role}'`), { status: 401 });
      }
      if (user.isActive === false) {
        throw Object.assign(new Error('This account has been deactivated. Please contact the administrator.'), { status: 403 });
      }

      const publicUser = {
        id: user.id || user._id,
        _id: user.id || user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
        department: user.department,
        phone: user.phone,
        isActive: user.isActive,
        createdAt: user.createdAt
      };

      return {
        message: 'Login successful (Offline Demo Mode)',
        token: `mock_jwt_token_${publicUser.id}_${Date.now()}`,
        user: publicUser
      };
    }

    if (path === '/auth/me') {
      const token = localStorage.getItem('authToken') || '';
      const userId = token.replace(/^mock_jwt_token_/, '').split('_')[0];
      const user = store.data.users.find(u => u.id === userId || u._id === userId) || store.data.users[0];
      return {
        user: {
          id: user.id || user._id,
          _id: user.id || user._id,
          name: user.name,
          email: user.email,
          username: user.username,
          role: user.role,
          department: user.department,
          phone: user.phone,
          isActive: user.isActive,
          createdAt: user.createdAt
        }
      };
    }

    if (path === '/auth/change-password' && method === 'POST') {
      return { message: 'Password updated successfully' };
    }

    // ---------------- USERS ----------------
    if (path === '/users' && method === 'GET') {
      let result = [...store.data.users];
      const role = params.get('role');
      const status = params.get('status');
      const department = params.get('department');
      const search = params.get('search');

      if (role) result = result.filter(u => u.role === role);
      if (status === 'active') result = result.filter(u => u.isActive !== false);
      if (status === 'inactive') result = result.filter(u => u.isActive === false);
      if (department) result = result.filter(u => u.department === department);
      if (search) {
        const q = search.toLowerCase();
        result = result.filter(u => u.name.toLowerCase().includes(q) || u.username.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
      }
      return result;
    }

    if (path === '/users' && method === 'POST') {
      const newUser = {
        ...body,
        id: `usr_${Date.now()}`,
        _id: `usr_${Date.now()}`,
        isActive: body.isActive !== undefined ? body.isActive : true,
        createdAt: new Date().toISOString()
      };
      store.data.users.unshift(newUser);
      store.save();
      return { message: 'User created successfully', user: newUser };
    }

    const userToggleMatch = path.match(/^\/users\/([^/]+)\/toggle-active$/);
    if (userToggleMatch && method === 'PATCH') {
      const id = userToggleMatch[1];
      const user = store.data.users.find(u => u.id === id || u._id === id);
      if (user) {
        user.isActive = !user.isActive;
        store.save();
        return { message: 'Status updated', user };
      }
      throw Object.assign(new Error('User not found'), { status: 404 });
    }

    const userMatch = path.match(/^\/users\/([^/]+)$/);
    if (userMatch) {
      const id = userMatch[1];
      if (method === 'PUT') {
        const idx = store.data.users.findIndex(u => u.id === id || u._id === id);
        if (idx !== -1) {
          store.data.users[idx] = { ...store.data.users[idx], ...body };
          store.save();
          return { message: 'User updated', user: store.data.users[idx] };
        }
        throw Object.assign(new Error('User not found'), { status: 404 });
      }
      if (method === 'DELETE') {
        store.data.users = store.data.users.filter(u => u.id !== id && u._id !== id);
        store.save();
        return { message: 'User deleted' };
      }
    }

    // ---------------- WASTE RECORDS ----------------
    if (path === '/waste' && method === 'GET') {
      let records = [...store.data.records];
      const date = params.get('date');
      const status = params.get('status');
      const workerName = params.get('workerName');
      const workerId = params.get('workerId');

      if (date === 'today') {
        const { startUTC, endUTC } = getISTDayBounds();
        records = records.filter(r => {
          const t = new Date(r.createdAt).getTime();
          return t >= startUTC.getTime() && t < endUTC.getTime();
        });
      } else if (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
        const { startUTC, endUTC } = getISTDayBounds(date);
        records = records.filter(r => {
          const t = new Date(r.createdAt).getTime();
          return t >= startUTC.getTime() && t < endUTC.getTime();
        });
      }

      if (status) records = records.filter(r => r.status === status);
      if (workerName || workerId) {
        records = records.filter(r =>
          (workerName && (r.assignedTo === workerName || r.collectedBy === workerName)) ||
          (workerId && (r.assignedToUserId === workerId || r.collectedByUserId === workerId))
        );
      }

      return records.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    if (path === '/waste/today') {
      const { startUTC } = getISTDayBounds();
      return store.data.records
        .filter(r => new Date(r.createdAt).getTime() >= startUTC.getTime())
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    if (path === '/waste/pending-previous') {
      const { startUTC } = getISTDayBounds();
      return store.data.records
        .filter(r => ACTIVE_STATUSES.includes(r.status) && new Date(r.createdAt).getTime() < startUTC.getTime())
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    if (path === '/waste/stats') {
      const date = params.get('date');
      const { startUTC: dayStart, endUTC: dayEnd } = getISTDayBounds(date);
      const allRecords = store.data.records;

      const selectedDayRecords = allRecords.filter(r => {
        const t = new Date(r.createdAt).getTime();
        return t >= dayStart.getTime() && t < dayEnd.getTime();
      });

      const liveDayRecords = selectedDayRecords.filter(r => r.status !== 'Cancelled');
      const totalWeight = sumWeight(liveDayRecords);
      const pendingCount = liveDayRecords.filter(r => ACTIVE_STATUSES.includes(r.status)).length;
      const collectedCount = liveDayRecords.filter(r => r.status === 'Collected' || DONE_STATUSES.includes(r.status)).length;
      const cancelledCount = selectedDayRecords.length - liveDayRecords.length;

      const totalRecords = liveDayRecords.length;
      const compliantRecords = liveDayRecords.filter(r => isCompliant(r.category, r.assignedBin) && !hasMismatch(r));
      const complianceRate = totalRecords > 0 ? Math.round((compliantRecords.length / totalRecords) * 100) : 100;

      const prevDayStart = new Date(dayStart.getTime() - 86400000);
      const prevDayRecords = allRecords.filter(r => {
        const t = new Date(r.createdAt).getTime();
        return t >= prevDayStart.getTime() && t < dayStart.getTime() && r.status !== 'Cancelled';
      });
      const prevWeight = sumWeight(prevDayRecords);
      const weightChangePct = prevWeight > 0 ? Math.round(((totalWeight - prevWeight) / prevWeight) * 1000) / 10 : null;
      const prevCompliant = prevDayRecords.filter(r => isCompliant(r.category, r.assignedBin) && !hasMismatch(r)).length;
      const prevComplianceRate = prevDayRecords.length > 0 ? Math.round((prevCompliant / prevDayRecords.length) * 100) : null;
      const complianceChangePct = prevComplianceRate === null ? null : complianceRate - prevComplianceRate;

      const turnaroundSamples = liveDayRecords
        .filter(r => r.collectedAt)
        .map(r => (new Date(r.collectedAt).getTime() - new Date(r.createdAt).getTime()) / 60000)
        .filter(m => m >= 0);
      const avgTurnaroundMinutes = turnaroundSamples.length > 0
        ? Math.round(turnaroundSamples.reduce((a, b) => a + b, 0) / turnaroundSamples.length)
        : null;

      const previousDaysPending = allRecords.filter(r =>
        ACTIVE_STATUSES.includes(r.status) && new Date(r.createdAt).getTime() < dayStart.getTime()
      ).length;

      const mismatchCount = liveDayRecords.filter(hasMismatch).length;

      const binBreakdown = {};
      BINS.forEach(bin => { binBreakdown[bin] = Number(sumWeight(liveDayRecords.filter(r => r.assignedBin === bin)).toFixed(2)); });
      const categoryWeights = {};
      CATEGORIES.forEach(cat => { categoryWeights[cat] = Number(sumWeight(liveDayRecords.filter(r => r.category === cat)).toFixed(2)); });

      const infectious = binBreakdown.Yellow || 0;
      const sharps = binBreakdown.White || 0;
      const general = (binBreakdown.Green || 0) + (binBreakdown.Red || 0) + (binBreakdown.Blue || 0);

      const selectedISTDate = new Date(dayStart.getTime() + 5.5 * 60 * 60 * 1000);
      const dayOfWeek = selectedISTDate.getUTCDay();
      const weekSundayStartUTC = new Date(dayStart.getTime() - dayOfWeek * 86400000);

      const daysOrder = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const weeklyChartData = daysOrder.map((dayName, idx) => {
        const currentDayStart = new Date(weekSundayStartUTC.getTime() + idx * 86400000);
        const currentDayEnd = new Date(currentDayStart.getTime() + 86400000);
        const dayRecords = allRecords.filter(r => {
          const t = new Date(r.createdAt).getTime();
          return t >= currentDayStart.getTime() && t < currentDayEnd.getTime() && r.status !== 'Cancelled';
        });
        return {
          name: dayName,
          infectious: Number(sumWeight(dayRecords.filter(r => r.assignedBin === 'Yellow')).toFixed(1)) || 0,
          sharps: Number(sumWeight(dayRecords.filter(r => r.assignedBin === 'White')).toFixed(1)) || 0,
          general: Number(sumWeight(dayRecords.filter(r => ['Green', 'Red', 'Blue'].includes(r.assignedBin))).toFixed(1)) || 0,
          records: dayRecords.length
        };
      });

      const recentActivity = selectedDayRecords.map(r => ({
        id: r.id || r._id,
        recordId: r.recordId,
        room: r.room,
        category: r.category,
        weight: r.weight,
        assignedBin: r.assignedBin,
        status: r.status,
        createdAt: r.createdAt,
        action: (r.status === 'Collected' || r.status === 'Completed')
          ? `Collected by ${r.collectedBy || 'Worker'}`
          : `Logged by ${r.createdBy || 'Medical Staff'}`,
        updatedAt: r.updatedAt || r.createdAt
      }));

      const sunDateIST = new Date(weekSundayStartUTC.getTime() + 5.5 * 60 * 60 * 1000);
      const satDateIST = new Date(weekSundayStartUTC.getTime() + 6 * 86400000 + 5.5 * 60 * 60 * 1000);
      const opts = { month: 'short', day: '2-digit' };
      const weekRangeLabel = `${sunDateIST.toLocaleDateString('en-US', opts)} – ${satDateIST.toLocaleDateString('en-US', opts)}, ${satDateIST.getFullYear()}`;

      return {
        totalWeight: Number(totalWeight.toFixed(2)),
        pendingCount,
        collectedCount,
        complianceRate,
        todayTotalRecords: totalRecords,
        todayPending: pendingCount,
        todayCompleted: collectedCount,
        previousDaysPending,
        cancelledCount,
        mismatchCount,
        weightChangePct,
        complianceChangePct,
        avgTurnaroundMinutes,
        categoryBreakdown: { infectious, sharps, general },
        binBreakdown,
        categoryWeights,
        weeklyChartData,
        weekRangeLabel,
        recentActivity,
        recordsCount: totalRecords,
        selectedDate: date || null,
        noRecords: totalRecords === 0
      };
    }

    if (path === '/waste/worker-stats') {
      const workerName = params.get('workerName');
      const workerId = params.get('workerId');
      const { startUTC: todayStart, endUTC: todayEnd } = getISTDayBounds();

      let workerRecords = store.data.records;
      if (workerName || workerId) {
        workerRecords = workerRecords.filter(r =>
          (workerName && (r.assignedTo === workerName || r.collectedBy === workerName)) ||
          (workerId && (r.assignedToUserId === workerId || r.collectedByUserId === workerId))
        );
      }

      const todayAssignedPickups = workerRecords.filter(r => {
        const d = r.assignedTime ? new Date(r.assignedTime) : new Date(r.createdAt);
        return d >= todayStart && d < todayEnd;
      }).length;

      const pendingCollections = workerRecords.filter(r => r.status === 'Pending' || r.status === 'Assigned').length;
      const collectedCollections = workerRecords.filter(r => r.status === 'Collected').length;
      const completedDisposals = workerRecords.filter(r => r.status === 'Completed' || r.status === 'Disposed').length;

      const overdueCount = workerRecords.filter(r => {
        if (r.status !== 'Pending' && r.status !== 'Assigned') return false;
        const refTime = r.assignedTime ? new Date(r.assignedTime).getTime() : new Date(r.createdAt).getTime();
        return refTime < todayStart.getTime() || (Date.now() - refTime) > 2 * 60 * 60 * 1000;
      }).length;

      const todayCollections = workerRecords.filter(r =>
        (r.status === 'Collected' || r.status === 'Completed' || r.status === 'Disposed') &&
        r.collectedAt && new Date(r.collectedAt) >= todayStart
      ).length;

      const userTotalCollections = workerRecords.filter(r =>
        r.status === 'Collected' || r.status === 'Completed' || r.status === 'Disposed'
      ).length;

      const todayWeightCollected = workerRecords
        .filter(r =>
          (r.status === 'Collected' || r.status === 'Completed' || r.status === 'Disposed') &&
          r.collectedAt && new Date(r.collectedAt) >= todayStart
        )
        .reduce((sum, r) => sum + (Number(r.weight) || 0), 0);

      const roomMap = {};
      workerRecords.filter(r => r.status === 'Pending' || r.status === 'Assigned').forEach(r => {
        roomMap[r.room] = (roomMap[r.room] || 0) + 1;
      });
      const roomWisePending = Object.keys(roomMap).map(room => ({ room, count: roomMap[room] }));

      const recentNotifications = workerRecords
        .filter(r => r.status === 'Pending' || r.status === 'Assigned')
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

      return {
        todayAssignedPickups,
        pendingCollections,
        collectedCollections,
        inTransitCollections: 0,
        completedDisposals,
        overdueCount,
        todayCollections,
        userTotalCollections,
        todayWeightCollected: Number(todayWeightCollected.toFixed(2)),
        roomWisePending,
        recentNotifications
      };
    }

    if (path === '/waste/history') {
      const { search, category, room, workerName, workerId } = Object.fromEntries(params.entries());
      let list = store.data.records.filter(r => r.status === 'Completed' || r.status === 'Disposed');
      if (category) list = list.filter(r => r.category === category);
      if (room) list = list.filter(r => r.room === room);
      if (workerName || workerId) {
        list = list.filter(r =>
          (workerName && (r.collectedBy === workerName || r.assignedTo === workerName)) ||
          (workerId && (r.collectedByUserId === workerId || r.assignedToUserId === workerId))
        );
      }
      if (search) {
        const q = search.toLowerCase();
        list = list.filter(r => r.recordId.toLowerCase().includes(q) || (r.description && r.description.toLowerCase().includes(q)) || r.room.toLowerCase().includes(q));
      }
      return list.sort((a, b) => new Date(b.collectedAt || b.createdAt) - new Date(a.collectedAt || a.createdAt));
    }

    if (path === '/waste' && method === 'POST') {
      const count = store.data.records.length;
      const recordId = `WR-${String(count + 109).padStart(3, '0')}`;
      const isAssigned = Boolean(body.assignedTo || body.assignedToUserId);

      const newRecord = {
        id: `rec_${Date.now()}`,
        _id: `rec_${Date.now()}`,
        recordId,
        description: body.description || '',
        room: (body.room || '').trim(),
        category: body.category,
        weight: Number(body.weight) || 0,
        assignedBin: body.assignedBin || CATEGORY_BIN_MAP[body.category] || 'Yellow',
        status: isAssigned ? 'Assigned' : 'Pending',
        createdBy: body.createdBy || 'Medical Staff',
        assignedTo: body.assignedTo || '',
        assignedToUserId: body.assignedToUserId || '',
        assignedTime: isAssigned ? new Date().toISOString() : null,
        binVerified: false,
        binMismatchNote: '',
        createdAt: new Date().toISOString()
      };

      store.data.records.unshift(newRecord);

      if (isAssigned && (body.assignedToUserId || body.assignedTo)) {
        store.data.notifications.unshift({
          id: `notif_${Date.now()}`,
          _id: `notif_${Date.now()}`,
          recipientUserId: body.assignedToUserId || '',
          recipientRole: 'worker',
          senderName: body.createdBy || 'Medical Staff',
          recordId: newRecord.recordId,
          wasteRecordId: newRecord.id,
          type: 'assignment',
          title: `New Task Assigned: ${newRecord.recordId}`,
          message: `You have been assigned to collect ${newRecord.category} (${newRecord.weight} kg) from ${newRecord.room}.`,
          room: newRecord.room,
          category: newRecord.category,
          weight: newRecord.weight,
          assignedBin: newRecord.assignedBin,
          isRead: false,
          createdAt: new Date().toISOString()
        });
      }

      store.save();
      return { message: 'Waste record logged successfully', record: newRecord };
    }

    // Assign
    const assignMatch = path.match(/^\/waste\/([^/]+)\/assign$/);
    if (assignMatch && method === 'PUT') {
      const id = assignMatch[1];
      const record = store.data.records.find(r => r.id === id || r._id === id || r.recordId === id);
      if (!record) throw Object.assign(new Error('Record not found'), { status: 404 });

      record.assignedTo = body.assignedTo || '';
      record.assignedToUserId = body.assignedToUserId || '';
      record.assignedTime = new Date().toISOString();
      if (record.status === 'Pending') record.status = 'Assigned';

      if (body.assignedToUserId || body.assignedTo) {
        store.data.notifications.unshift({
          id: `notif_${Date.now()}`,
          _id: `notif_${Date.now()}`,
          recipientUserId: body.assignedToUserId || '',
          recipientRole: 'worker',
          senderName: 'Medical Staff',
          recordId: record.recordId,
          wasteRecordId: record.id || record._id,
          type: 'assignment',
          title: `Task Assigned: ${record.recordId}`,
          message: `You were assigned to collect ${record.category} (${record.weight} kg) from ${record.room}.`,
          room: record.room,
          category: record.category,
          weight: record.weight,
          assignedBin: record.assignedBin,
          isRead: false,
          createdAt: new Date().toISOString()
        });
      }

      store.save();
      return { message: 'Worker assigned successfully', record };
    }

    // Collect
    const collectMatch = path.match(/^\/waste\/([^/]+)\/collect$/);
    if (collectMatch && method === 'PUT') {
      const id = collectMatch[1];
      const record = store.data.records.find(r => r.id === id || r._id === id || r.recordId === id);
      if (!record) throw Object.assign(new Error('Record not found'), { status: 404 });

      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      record.status = 'Collected';
      record.collectedBy = currentUser.name || 'Sanitation Worker';
      record.collectedByUserId = currentUser.id || '';
      record.collectedAt = new Date().toISOString();

      store.save();
      return { message: 'Waste collected successfully', record };
    }

    // Complete / Dispose
    const completeMatch = path.match(/^\/waste\/([^/]+)\/complete$/);
    if (completeMatch && method === 'PUT') {
      const id = completeMatch[1];
      const record = store.data.records.find(r => r.id === id || r._id === id || r.recordId === id);
      if (!record) throw Object.assign(new Error('Record not found'), { status: 404 });

      record.status = 'Completed';
      record.binVerified = body.binVerified !== undefined ? body.binVerified : true;
      record.binMismatchNote = body.binMismatchNote || '';
      if (!record.collectedAt) record.collectedAt = new Date().toISOString();

      store.save();
      return { message: 'Waste disposal completed successfully', record };
    }

    // Cancel
    const cancelMatch = path.match(/^\/waste\/([^/]+)\/cancel$/);
    if (cancelMatch && method === 'PUT') {
      const id = cancelMatch[1];
      const record = store.data.records.find(r => r.id === id || r._id === id || r.recordId === id);
      if (!record) throw Object.assign(new Error('Record not found'), { status: 404 });

      record.status = 'Cancelled';
      record.cancellationReason = body.reason || '';

      store.save();
      return { message: 'Waste record cancelled', record };
    }

    // Delete
    const wasteDeleteMatch = path.match(/^\/waste\/([^/]+)$/);
    if (wasteDeleteMatch && method === 'DELETE') {
      const id = wasteDeleteMatch[1];
      store.data.records = store.data.records.filter(r => r.id !== id && r._id !== id && r.recordId !== id);
      store.save();
      return { message: 'Record deleted' };
    }

    // ---------------- NOTIFICATIONS ----------------
    if (path === '/notifications' && method === 'GET') {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      return store.data.notifications.filter(n =>
        !n.recipientUserId || n.recipientUserId === currentUser.id || n.recipientRole === currentUser.role
      );
    }

    const notifReadMatch = path.match(/^\/notifications\/([^/]+)\/read$/);
    if (notifReadMatch && method === 'PATCH') {
      const id = notifReadMatch[1];
      const notif = store.data.notifications.find(n => n.id === id || n._id === id);
      if (notif) notif.isRead = true;
      store.save();
      return { message: 'Marked as read' };
    }

    if (path === '/notifications/read-all' && method === 'PATCH') {
      store.data.notifications.forEach(n => { n.isRead = true; });
      store.save();
      return { message: 'All notifications marked as read' };
    }

    if (path === '/notifications/reminder' && method === 'POST') {
      const { recordId, wasteRecordId } = body || {};
      store.data.notifications.unshift({
        id: `notif_${Date.now()}`,
        _id: `notif_${Date.now()}`,
        recipientRole: 'worker',
        senderName: 'Medical Staff',
        recordId: recordId || 'WR-Reminder',
        wasteRecordId,
        type: 'reminder',
        title: `URGENT Collection Reminder: ${recordId}`,
        message: `Pickup for ${recordId} is pending. Please attend promptly.`,
        isRead: false,
        createdAt: new Date().toISOString()
      });
      store.save();
      return { message: 'Reminder dispatched to worker' };
    }

    // ---------------- AI ASSISTANT ----------------
    if (path === '/ai/status') {
      return { available: true, model: 'browser-nlp-ai', offlineMock: true };
    }

    if (path === '/ai/classify-image') {
      return {
        category: 'Infectious Waste',
        bin: 'Yellow',
        confidence: 0.94,
        description: 'Cotton gauze, used bandages, and soiled dressings detected (Bio-Medical Waste 2016 statutory Yellow bin).'
      };
    }

    console.warn(`[MockBackend] Unhandled route: ${method} ${path}`);
    return { message: 'OK', path };
  }
};
