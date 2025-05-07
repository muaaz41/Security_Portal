
import { simulateRequest } from '../utils/api';
import { GuardProps } from '../components/GuardCard';

// Mock database
let guards: GuardProps[] = [
  {
    id: "g1",
    name: "James Wilson",
    email: "james.w@securityportal.com",
    phone: "+1 (555) 123-4567",
    position: "Senior Security Officer",
    status: "on-duty",
    shift: {
      start: "8:00 AM",
      end: "4:00 PM"
    }
  },
  {
    id: "g2",
    name: "Sarah Johnson",
    email: "sarah.j@securityportal.com",
    phone: "+1 (555) 987-6543",
    position: "Security Team Lead",
    status: "on-duty",
    shift: {
      start: "9:00 AM",
      end: "5:00 PM"
    }
  },
  {
    id: "g3",
    name: "Michael Rodriguez",
    email: "michael.r@securityportal.com",
    phone: "+1 (555) 456-7890",
    position: "Security Officer",
    status: "off-duty"
  },
  {
    id: "g4",
    name: "Emily Chen",
    email: "emily.c@securityportal.com",
    phone: "+1 (555) 234-5678",
    position: "Access Control Specialist",
    status: "on-leave"
  },
  {
    id: "g5",
    name: "David Thompson",
    email: "david.t@securityportal.com",
    phone: "+1 (555) 321-7654",
    position: "Security Officer",
    status: "on-duty",
    shift: {
      start: "4:00 PM",
      end: "12:00 AM"
    }
  }
];

export type GuardCreationData = Omit<GuardProps, 'id'>;

export const guardsService = {
  /**
   * Get all guards
   */
  async getAllGuards(): Promise<GuardProps[]> {
    return simulateRequest([...guards]);
  },
  
  /**
   * Get guards by status
   */
  async getGuardsByStatus(status: "on-duty" | "off-duty" | "on-leave"): Promise<GuardProps[]> {
    const filteredGuards = guards.filter(guard => guard.status === status);
    return simulateRequest([...filteredGuards]);
  },
  
  /**
   * Create a new guard
   */
  async createGuard(guardData: GuardCreationData): Promise<GuardProps> {
    const newGuard: GuardProps = {
      ...guardData,
      id: `g${Date.now()}`
    };
    
    guards.push(newGuard);
    return simulateRequest(newGuard);
  },
  
  /**
   * Update a guard
   */
  async updateGuard(guardId: string, guardData: Partial<GuardProps>): Promise<GuardProps> {
    const guardIndex = guards.findIndex(g => g.id === guardId);
    
    if (guardIndex === -1) {
      throw new Error("Guard not found");
    }
    
    const updatedGuard = {
      ...guards[guardIndex],
      ...guardData
    };
    
    guards[guardIndex] = updatedGuard;
    return simulateRequest(updatedGuard);
  },
  
  /**
   * Delete a guard
   */
  async deleteGuard(guardId: string): Promise<void> {
    guards = guards.filter(g => g.id !== guardId);
    return simulateRequest(undefined);
  }
};
