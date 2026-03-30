export type UrgencyLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface RescueRequestStep1 {
  lat?: number;
  lng?: number;
  addressText?: string;
  urgencyLevel: UrgencyLevel;
}

export interface RescueRequestStep2 {
  description: string;
  numPeople: number;
  hasInjured: boolean;
  hasChildren: boolean;
  hasElderly: boolean;
  hasPets: boolean;
}

export interface RescueRequestStep3 {
  images: File[];
}

export interface FullRescueRequest extends RescueRequestStep1, RescueRequestStep2 {
  images: File[];
}

export type RequestStatus = 'PENDING' | 'VERIFIED' | 'ASSIGNED' | 'COMPLETED' | 'CANCELLED';

export interface RescueRequestHistory {
  id: string;
  lat: number;
  lng: number;
  addressText?: string;
  urgencyLevel: UrgencyLevel;
  description: string;
  numPeople: number;
  hasInjured: boolean;
  hasChildren: boolean;
  hasElderly: boolean;
  hasPets: boolean;
  status: RequestStatus;
  createdAt: string;
  images?: string[];
  teamInfo?: {
    teamName: string;
    memberCount: number;
    phone: string;
  };
  statusHistory: {
    status: RequestStatus;
    time: string;
    note?: string;
  }[];
  citizenPhone?: string;
  citizenName?: string;
}

export interface CoordinatorStats {
  pending: number;
  verified: number;
  assigned: number;
  inProgress: number;
  completedToday: number;
}

export interface AvailableTeam {
  id: string;
  teamName: string;
  distance: number;
  currentWorkload: number;
  memberCount: number;
  phone: string;
}

export interface MapData {
  requests: {
    id: string;
    lat: number;
    lng: number;
    status: RequestStatus;
    urgencyLevel: UrgencyLevel;
  }[];
  teams: {
    id: string;
    lat: number;
    lng: number;
    teamName: string;
    status: string;
    memberCount: number;
  }[];
}

export const URGENCY_LEVELS: { value: UrgencyLevel; label: string; color: string; icon: string }[] = [
  { value: 'CRITICAL', label: 'KHẨN CẤP (Nguy hiểm tính mạng)', color: 'bg-red-600', icon: '!!' },
  { value: 'HIGH', label: 'CAO (Cần hỗ trợ sớm)', color: 'bg-orange-500', icon: '!' },
  { value: 'MEDIUM', label: 'TRUNG BÌNH', color: 'bg-yellow-500', icon: '-' },
  { value: 'LOW', label: 'THẤP', color: 'bg-gray-500', icon: '.' },
];
