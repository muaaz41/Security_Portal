import React, { useEffect, useRef, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { PlusCircle, Loader2, Filter, RefreshCw } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import VisitCard from "@/components/VisitCard";
import { toast } from "sonner";
import { AppDispatch, RootState } from "@/redux/store";
import { fetchAllGuests, fetchArrivedGuests } from "@/redux/slice/guestSlice";
import io from "socket.io-client";
import { fetchPendingGuests } from "@/redux/slice/guestSlice";
import { useInterval } from "@/hooks/useInterval";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { fetchAllGuards } from "@/redux/slice/guardSlice";

const LoaderOverlay = () => (
  <div className="h-full w-full fixed top-0 left-0 flex items-center justify-center bg-background/80 z-50">
    <div className="flex flex-col items-center gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-lg font-medium"></p>
    </div>
  </div>
);
 
const Visits = () => {
  const useAppDispatch = () => useDispatch<AppDispatch>();
  const useAppSelector = <T,>(selector: (state: RootState) => T) => useSelector<RootState, T>(selector);
  const dispatch = useAppDispatch();
  const {
    allGuests = [],
    todayVisits = [],
    activeVisitors = [],
    arrivedGuests = [],
    pendingVisitors = [],
    isLoading,
    error
  } = useAppSelector((state) => state.guests);
  const { allGuards } = useSelector((state: RootState) => state.guards);

  const [initialLoading, setInitialLoading] = useState(true);
  const [checkInData, setCheckInData] = useState({});
  const [dateFilter, setDateFilter] = useState("day"); 
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [checkedInGuests, setCheckedInGuests] = useState({});
  const checkedInGuestsRef = useRef({});

  useEffect(() => {
    const loadingTimer = setTimeout(() => {
      setInitialLoading(false);
    }, 500);
    const fetchData = async () => {
      try {
        await dispatch(fetchArrivedGuests()).unwrap();
        await dispatch(fetchAllGuards()).unwrap();
        await dispatch(fetchAllGuests()).unwrap();
        await dispatch(fetchPendingGuests()).unwrap();
        setLastRefresh(new Date());
      } catch (error) {
        console.error("Error fetching initial data:", error);
      }
    };

    fetchData();

    return () => {
      clearTimeout(loadingTimer);
    };
  }, [dispatch]);

  // Function to refresh data
  const refreshData = async () => {
    setIsRefreshing(true);
    try {
      await dispatch(fetchArrivedGuests()).unwrap();
      await dispatch(fetchAllGuards()).unwrap();
      await dispatch(fetchAllGuests()).unwrap();
      await dispatch(fetchPendingGuests()).unwrap();
      setLastRefresh(new Date());
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Auto-refresh every 5 minutes (300000 milliseconds)
  useInterval(() => {
    refreshData();
  }, 300000);

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
  
  const formatScheduledTime = (time: any): string => {
    if (typeof time !== 'string') {
      time = String(time);
    }
    if (time === 'null') { time = '00:00' }

    const paddedTime = time.padStart(4, '0');
    const hours = paddedTime.slice(0, -2);
    const minutes = paddedTime.slice(-2);

    return `${hours}:${minutes}`;
  };
  
  
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
  
  const handleNewVisit = () => {
    toast.info("New Visit", {
      description: "This feature will open a form to create a new visit.",
    });
  };
  useEffect(() => {
    // Try to load saved check-in data from localStorage on mount
    try {
      const savedCheckedInGuests = localStorage.getItem('checkedInGuests');
      if (savedCheckedInGuests) {
        const parsedData = JSON.parse(savedCheckedInGuests);
        setCheckedInGuests(parsedData);
        checkedInGuestsRef.current = parsedData;
      }
    } catch (error) {
      console.error('Error loading check-in data from localStorage:', error);
    }
  }, []);
  const handleCheckIn = async (guestCode: string) => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      toast.error('Guard information not found. Please login again.');
      return;
    }
   
    try {
      // Parse the user data from localStorage
      const userData = JSON.parse(userStr);
      const guardCode = userData?.code;
      const guardName = userData?.name;
      
      // Show loading toast
      const loadingToast = toast.loading('Processing check-in...');
  
      const response = await fetch('https://frbr.vdc.services:40112/api/arrived', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: guestCode,
          guard: guardCode
        }),
      });
  
      toast.dismiss(loadingToast);
  
      if (!response.ok) {
        throw new Error('Check-in failed');
      }
      const responseData = await response.json();
      
      // Update the local state with check-in data
      const checkInInfo = {
        guardCode: guardCode,
        guardName: guardName,
        arrivedAt: responseData.arrivedAt || new Date().toLocaleTimeString()
      };
      
      // Update both the state and the ref
      setCheckedInGuests(prev => {
        const updated = {
          ...prev,
          [guestCode]: checkInInfo
        };
        try {
          localStorage.setItem('checkedInGuests', JSON.stringify(updated));
        } catch (error) {
          console.error('Error saving to localStorage:', error);
        }
        
        return updated;
      });
      checkedInGuestsRef.current = {
        ...checkedInGuestsRef.current,
        [guestCode]: checkInInfo
      };
      
      toast.success('Guest arrived successfully!');
      setInitialLoading(true);
      
      setTimeout(async () => {
        try {
          await dispatch(fetchArrivedGuests()).unwrap();
          await dispatch(fetchPendingGuests()).unwrap();
          await dispatch(fetchAllGuests()).unwrap();
          setInitialLoading(false);
        } catch (fetchError) {
          console.error('Error refreshing data:', fetchError);
        }
      }, 500);
      
    } catch (error) {
      toast.error('Check-in failed. Please try again.');
      console.error(error);
    }
  };
  
  const isWithinFilterPeriod = (date) => {
    const today = new Date();
    const visitDate = new Date(date);

    if (dateFilter === "all") return true;

    if (dateFilter === "day") {
      const oneDayAgo = new Date(today);
      oneDayAgo.setDate(today.getDate() - 1);
      return visitDate >= oneDayAgo;
    }

    if (dateFilter === "week") {
      const oneWeekAgo = new Date(today);
      oneWeekAgo.setDate(today.getDate() - 7);
      return visitDate >= oneWeekAgo;
    }

    if (dateFilter === "month") {
      const oneMonthAgo = new Date(today);
      oneMonthAgo.setDate(today.getDate() - 30);
      return visitDate >= oneMonthAgo;
    }

    return true;
  };

  const handleManualRefresh = () => {
    refreshData();
    toast.success("Data refreshed", {
      description: `Last updated: ${new Date().toLocaleTimeString()}`,
    });
  };

  if (initialLoading) {
    return <LoaderOverlay />;
  }

  const today = new Date();
  const formatTime = (arrivalTime: string): string => {
    if (!arrivalTime) return '0000';
    const hours = arrivalTime.slice(0, -2);
    const minutes = arrivalTime.slice(-2);

    return `${hours.padStart(2, '0')}${minutes.padStart(2, '0')}`;
  };
  const combineDateTime = (dateStr: string, timeStr: string) => {
    const trimmedDate = dateStr?.split(' ')[0]; 
    const hours = timeStr?.slice(0, 2); 
    const minutes = timeStr?.slice(2, 4); 
   
    return new Date(`${trimmedDate}T${hours}:${minutes}:00`);
  };
  
  const visits = {
    scheduled: allGuests
      .filter(v => {
        const visitDate = combineDateTime(v.U_Date, String(v.U_arrival_time));
        const today = new Date();

        today.setHours(0, 0, 0, 0);

        return v.U_isArrived === 'N' && visitDate >= today;
      })
      .sort((a, b) => {
        const dateTimeA = new Date(a.U_Date);
        const timeA = formatTime(String(a.U_arrival_time));
        dateTimeA.setHours(
          parseInt(timeA.slice(0, 2), 10),
          parseInt(timeA.slice(2), 10),
          0, 0
        );

        const dateTimeB = new Date(b.U_Date);
        const timeB = formatTime(String(b.U_arrival_time));
        dateTimeB.setHours(
          parseInt(timeB.slice(0, 2), 10),
          parseInt(timeB.slice(2), 10),
          0, 0
        );

        return dateTimeB.getTime() - dateTimeA.getTime();
      })
      .map(visit => ({
        ...visit,
        id: visit.U_Code,
        status: 'Upcoming',
        visitorName: visit.U_Name || 'Unknown',
        scheduledAt: new Date(visit.U_Date),
        scheduledTime:  formatScheduledTime(visit.U_arrival_time),
        contactInfo: visit.U_TNum || 'N/A',
        hostName: visit.U_Host_Name || 'N/A',
        hostAddress: visit.U_Host_Address || 'N/A',
        purpose: visit.U_ID || 'Visit',
        // Include the image data
        image: visit.base64Image || null
      })),
      active: arrivedGuests
      .filter(visitor => {
        return isWithinFilterPeriod(visitor.U_Date);
      })
      .sort((a, b) => {
        const dateTimeA = new Date(a.U_Date || new Date());
        const timeA = a.U_arrivedAt || "00:00"; 
        
        // Split time safely
        let hoursA = "00";
        let minutesA = "00";
        if (timeA && timeA.includes(':')) {
          const timeParts = timeA.split(':');
          hoursA = timeParts[0]?.padStart(2, '0') || "00";
          minutesA = timeParts[1]?.padStart(2, '0') || "00";
        }
        
        dateTimeA.setHours(
          parseInt(hoursA, 10),
          parseInt(minutesA, 10),
          0,
          0
        );
        
        const dateTimeB = new Date(b.U_Date || new Date());
        const timeB = b.U_arrivedAt || "00:00"; 
        
        let hoursB = "00";
        let minutesB = "00";
        if (timeB && timeB.includes(':')) {
          const timeParts = timeB.split(':');
          hoursB = timeParts[0]?.padStart(2, '0') || "00";
          minutesB = timeParts[1]?.padStart(2, '0') || "00";
        }
        
        dateTimeB.setHours(
          parseInt(hoursB, 10),
          parseInt(minutesB, 10),
          0,
          0
        );
        
        return dateTimeB.getTime() - dateTimeA.getTime();
      })
      .map(visitor => {
        const persistentCheckInData = checkedInGuests[visitor.U_Code];
        
        return {
          id: visitor.U_Code,
          visitorName: visitor.U_Name || 'Unknown',
          status: "Arrived",
          scheduledAt: new Date(visitor.U_Date),
          scheduledTime:  formatScheduledTime(visitor.U_arrival_time),
          hostName: visitor.U_Host_Name || 'N/A',
          hostAddress: visitor.U_Host_Address || 'N/A',
          guardName: 
            persistentCheckInData?.guardName || 
            (visitor.U_receivedBy ? allGuards.find(guard => guard.code === visitor?.U_receivedBy)?.name || 'N/A' : 'N/A'),
          arrivedAt: 
            persistentCheckInData?.arrivedAt || 
            visitor.U_arrivedAt || 
            'N/A',
          purpose: visitor.U_ID || 'Visit',
          contactInfo: visitor.U_TNum || 'N/A',
          image: visitor.base64Image || null
        };
      })
  };

  // Get filter label for display
  const getFilterLabel = () => {
    switch (dateFilter) {
      case "day": return "Last 24 Hours";
      case "week": return "Last 7 Days";
      case "month": return "Last 30 Days";
      default: return "All Time";
    }
  };

  // Format last refresh time
  const formatLastRefresh = () => {
    return lastRefresh.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    console.log(arrivedGuests,'lppp==='),
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Visitor Management</h1>
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground hidden md:block">
            Last updated: {formatLastRefresh()}
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleManualRefresh} 
            disabled={isRefreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs defaultValue="Upcoming" className="w-full">
        <TabsList className="w-full md:w-auto mb-4">
          <TabsTrigger value="Upcoming" className="flex-1 md:flex-none">
            Upcoming ({visits.scheduled.length})
          </TabsTrigger>
          <TabsTrigger value="Arrived" className="flex-1 md:flex-none">
            Arrived ({visits.active.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="Upcoming" className="animate-fade-in">
          {visits.scheduled.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {visits.scheduled.reverse().map((visit) => (
                <VisitCard
                  key={visit.U_Code}
                  {...visit}
                  onCheckIn={() => handleCheckIn(visit.U_Code)}
                  onCancel={() => { }}
                  hostName={visit.hostName}
                  hostAddress={visit.hostAddress}
                  image={visit.image}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No scheduled visits</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="Arrived" className="animate-fade-in">
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm text-muted-foreground">
              Showing {getFilterLabel()}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Filter by time
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setDateFilter("all")}>
                  All Time
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setDateFilter("day")}>
                  Last 24 Hours
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setDateFilter("week")}>
                  Last 7 Days
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setDateFilter("month")}>
                  Last 30 Days
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {visits.active.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {visits.active.map((visit) => (
                <VisitCard
                  key={visit.id}
                  {...visit}
                  hostName={visit.hostName}
                  hostAddress={visit.hostAddress}
                  // image={visit.image}
                />
              ))}
            </div>
 
) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No active visits {dateFilter !== "all" ? `in ${getFilterLabel().toLowerCase()}` : ""}
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Visits;