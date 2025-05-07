
import { simulateRequest } from '../utils/api';
import { VisitProps } from '../components/VisitCard';

// Mock database
let visits: VisitProps[] = [
  {
    id: "v1",
    visitorName: "John Smith",
    purpose: "Meeting with Security Team",
    contactInfo: "john.smith@example.com",
    scheduledAt: new Date(new Date().setHours(11, 0, 0)),
    status: "scheduled",
    hostName: "Robert Johnson"
  },
  {
    id: "v2",
    visitorName: "Emma Davis",
    purpose: "Facility Inspection",
    contactInfo: "emma.davis@example.com",
    scheduledAt: new Date(new Date().setHours(9, 30, 0)),
    checkInTime: new Date(new Date().setHours(9, 28, 0)),
    status: "active",
    hostName: "Sarah Wilson"
  },
  {
    id: "v3",
    visitorName: "Michael Brown",
    purpose: "Equipment Delivery",
    contactInfo: "michael.b@example.com",
    scheduledAt: new Date(new Date().setDate(new Date().getDate() + 1)),
    status: "scheduled",
    hostName: "David Wilson"
  },
  {
    id: "v4",
    visitorName: "Lisa Johnson",
    purpose: "Maintenance Work",
    contactInfo: "lisa.j@example.com",
    scheduledAt: new Date(new Date().setDate(new Date().getDate() - 1)),
    checkInTime: new Date(new Date().setDate(new Date().getDate() - 1)),
    checkOutTime: new Date(new Date().setDate(new Date().getDate() - 1)),
    status: "completed",
    hostName: "James Thompson"
  },
  {
    id: "v5",
    visitorName: "Daniel Turner",
    purpose: "Security Meeting",
    contactInfo: "daniel.t@example.com",
    scheduledAt: new Date(new Date().setDate(new Date().getDate() - 2)),
    checkInTime: new Date(new Date().setDate(new Date().getDate() - 2)),
    checkOutTime: new Date(new Date().setDate(new Date().getDate() - 2)),
    status: "completed",
    hostName: "Olivia Martinez"
  }
];

export type VisitCreationData = Omit<VisitProps, 'id' | 'status' | 'checkInTime' | 'checkOutTime'>;

export const visitsService = {
  /**
   * Get all visits
   */
  async getAllVisits(): Promise<VisitProps[]> {
    return simulateRequest([...visits]);
  },
  
  /**
   * Get visits by status
   */
  async getVisitsByStatus(status: "scheduled" | "active" | "completed" | "cancelled"): Promise<VisitProps[]> {
    const filteredVisits = visits.filter(visit => visit.status === status);
    return simulateRequest([...filteredVisits]);
  },
  
  /**
   * Create a new visit
   */
  async createVisit(visitData: VisitCreationData): Promise<VisitProps> {
    const newVisit: VisitProps = {
      ...visitData,
      id: `v${Date.now()}`,
      status: "scheduled"
    };
    
    visits.push(newVisit);
    return simulateRequest(newVisit);
  },
  
  /**
   * Check in a visitor
   */
  async checkInVisitor(visitId: string): Promise<VisitProps> {
    const visitIndex = visits.findIndex(v => v.id === visitId);
    
    if (visitIndex === -1) {
      throw new Error("Visit not found");
    }
    
    const updatedVisit = {
      ...visits[visitIndex],
      status: "active" as const,
      checkInTime: new Date()
    };
    
    visits[visitIndex] = updatedVisit;
    return simulateRequest(updatedVisit);
  },
  
  /**
   * Check out a visitor
   */
  async checkOutVisitor(visitId: string): Promise<VisitProps> {
    const visitIndex = visits.findIndex(v => v.id === visitId);
    
    if (visitIndex === -1) {
      throw new Error("Visit not found");
    }
    
    const updatedVisit = {
      ...visits[visitIndex],
      status: "completed" as const,
      checkOutTime: new Date()
    };
    
    visits[visitIndex] = updatedVisit;
    return simulateRequest(updatedVisit);
  },
  
  /**
   * Cancel a visit
   */
  async cancelVisit(visitId: string): Promise<void> {
    const visitIndex = visits.findIndex(v => v.id === visitId);
    
    if (visitIndex === -1) {
      throw new Error("Visit not found");
    }
    
    visits = visits.filter(v => v.id !== visitId);
    return simulateRequest(undefined);
  }
};
