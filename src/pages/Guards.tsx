import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, UserRoundSearch, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import GuardCard, { GuardProps } from "@/components/GuardCard";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllGuards } from "@/redux/slice/guardSlice";
import { AppDispatch, RootState } from "../redux/store"; 
import io from "socket.io-client";
import { fetchAllGuests } from "@/redux/slice/guestSlice";

const Guards = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { allGuards, isLoading, error } = useSelector((state: RootState) => state.guards);
  const [filteredGuards, setFilteredGuards] = React.useState<GuardProps[]>([]);
  const [activeFilter, setActiveFilter] = React.useState<"all" | "on-duty" | "off-duty" | "on-leave">("all");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [currentGuardCode, setCurrentGuardCode] = React.useState<string | null>(null);

  const saveNotification = (notification) => {
    try {
      const existingNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
      const updatedNotifications = [notification, ...existingNotifications].slice(0, 50);
      localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
      window.dispatchEvent(new CustomEvent('new-notification', { detail: notification }));
    } catch (error) {
      console.error('Error saving notification:', error);
    }
  };

  // Get current guard code from localStorage
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        setCurrentGuardCode(userData?.code);
      } catch (error) {
        console.error('Error parsing user data:', error);
        toast.error('Failed to load user information');
      }
    }
  }, []);

  const formatScheduledTime = (time: any): string => {
    if (typeof time !== 'string') {
      time = String(time);
    }
    if(time === 'null') {time = '00:00'}

    const paddedTime = time.padStart(4, '0'); 
    const hours = paddedTime.slice(0, -2); 
    const minutes = paddedTime.slice(-2);
    
    return `${hours}:${minutes}`;
  };

  // Load guards data using Redux
 
  useEffect(() => {
    dispatch(fetchAllGuests())
      .catch((error) => {
        console.error("Error loading guest data:", error);
        toast.error("Could not load guest data", {
          description: "Please try again later",
        });
      });
      
      const socket = io('https://frbr.vdc.services:40112/', {
        secure: true,
        rejectUnauthorized: false, 
        transports: ['websocket', 'polling'] 
      });
      
      socket.on("connect", () => {
        console.log("📨 Socket connected securely");
      });
    
      socket.on("connect_error", (error) => {
        console.error("📨 Socket connection error:", error);
        toast.error("Socket connection failed", {
          description: "Real-time updates may not work properly",
        });
      });
    
      socket.on("disconnect", (reason) => {
        console.log("📨 Socket disconnected:", reason);
      });
    
      socket.on("error", (error) => {
        console.error("📨 Socket error:", error);
      });
      
      socket.on('new-guest', (data) => {
        const scheduledDate = new Date(data.date);
        const formattedDate = scheduledDate.toLocaleDateString('en-US', { 
          weekday: 'short', 
          month: 'short', 
          day: 'numeric' 
        });
        
        const arrivalTime = formatScheduledTime(data.arrivalTime);
        const notification = {
          id: Date.now(),
          type: 'new-guest',
          title: 'New Guest Scheduled',
          message: `${data.name || 'A visitor'} is scheduled to arrive on ${formattedDate} at ${arrivalTime}`,
          details: [
            { label: 'Resident ID', value: data.residentId || 'N/A' },
            { label: 'Transport', value: data.transportNumber || 'N/A' },
            { label: 'Access Code', value: data.code || 'N/A' }
          ],
          data: data,
          timestamp: new Date().toISOString(),
          read: false
        };
        toast.success(notification.title, {
          description: notification.message,
          duration: 8000,
          action: {
            label: "View Details",
            onClick: () => {
              window.dispatchEvent(new CustomEvent('show-notification-panel'));
            }
          }
        });
        saveNotification(notification);
        dispatch(fetchAllGuests());
      });
      
      socket.emit("register", { type: "guard", id: "guard-123" });
    
      return () => {
        socket.disconnect(); 
      };
    }, [dispatch]);


  type Guard = {
    code: string;
    name: string;
    email: string;
    isActive: string;
    address?: string;
    idCard?: string;
  };

  const mapGuardsToProps = (guards: Guard[]): GuardProps[] => {
    return guards.map(guard => ({
      id: guard.code, 
      name: guard.name || "",
      email: guard.email || "",
      phone: guard.idCard || "",
      avatar: `/avatars/${guard.code}.jpg`,
      position: "Security Guard",
      // Set status to "on-duty" if this guard's code matches the current user's guard code
      status: guard.code === currentGuardCode ? "on-duty" : "off-duty",
      location: guard.address || "Unknown location" 
    }));
  };

  useEffect(() => {
    if (!allGuards || !Array.isArray(allGuards)) {
      setFilteredGuards([]);
      return;
    }
    
    try {
      const guardProps = mapGuardsToProps(allGuards);
      
      let result = guardProps;
      if (activeFilter !== "all") {
        result = result.filter(guard => guard.status === activeFilter);
      }
      
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        result = result.filter(guard => 
          (guard.name && guard.name.toLowerCase().includes(query)) || 
          (guard.email && guard.email.toLowerCase().includes(query)) ||
          (guard.position && guard.position.toLowerCase().includes(query))
        );
      }
      
      setFilteredGuards(result);
    } catch (err) {
      console.error("Error filtering guards:", err);
      setFilteredGuards([]);
    }
  }, [allGuards, activeFilter, searchQuery, currentGuardCode]);

  const handleEditGuard = async (guardId: string) => {
    toast.info("Edit guard", {
      description: `Edit functionality would open for guard ID: ${guardId}`,
    });
  };

  const handleAssignGuard = async (guardId: string) => {
    toast.info("Assign guard", {
      description: `Assignment functionality would open for guard ID: ${guardId}`,
    });
  };

  const handleAddGuard = () => {
    toast.info("Add guard", {
      description: "This feature will open a form to add a new guard.",
    });
  };

  const handleFilterClick = (filter: "all" | "on-duty" | "off-duty" | "on-leave") => {
    setActiveFilter(filter);
  };

  if (isLoading) {
    return (
      <div className="h-[400px] w-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-[400px] w-full flex flex-col items-center justify-center gap-4">
        <p className="text-destructive">Failed to load guards</p>
        <Button onClick={() => dispatch(fetchAllGuards())}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Guards Management</h1>
        {/* <Button className="gap-1" onClick={handleAddGuard}>
          <PlusCircle className="w-4 h-4" />
          Add Guard
        </Button> */}
      </div>
      
      {/* Search and filters */}
      <div className="flex flex-col md:flex-row gap-4 md:items-center">
        <div className="relative flex-1">
          <UserRoundSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            type="search" 
            placeholder="Search guards..." 
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      {/* Guards list */}
      {filteredGuards.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredGuards.map((guard) => (
            <GuardCard 
              key={guard.id}
              {...guard}
              onEdit={() => handleEditGuard(guard.id)}
              onAssign={() => handleAssignGuard(guard.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No guards found</p>
        </div>
      )}
    </div>
  );
};

export default Guards;