import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  UsersRound, 
  Clock, 
  UserCheck, 
  AlertTriangle, 
  Loader2
} from "lucide-react";
import VisitCard from "@/components/VisitCard";
import { toast } from "sonner";
import { fetchAllGuests } from "@/redux/slice/guestSlice";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { AppDispatch, RootState } from "@/redux/store"; 
import io from "socket.io-client";
import { isToday } from 'date-fns';

const useAppDispatch = () => useDispatch<AppDispatch>();
const useAppSelector = <T,>(selector: (state: RootState) => T) => useSelector<RootState, T>(selector);
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

const Dashboard = () => {
  const dispatch = useAppDispatch();
  const { 
    allGuests = [],
    todayVisits = [], 
    activeVisitors = [], 
    visitorChartData = { labels: [], counts: [] },
    isLoading, 
    error 
  } = useAppSelector((state) => state.guests);

  const chartData = visitorChartData.labels.map((day, index) => ({
    name: day,
    visits: visitorChartData.counts[index] || 0
  }));

  console.log("Chart Data:", chartData);

  const todayGuests = allGuests.filter(guest => isToday(new Date(guest.U_Date)));
  console.log("All Guests:", allGuests);
  console.log("Today Guests:", todayGuests);

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

  useEffect(() => {
    dispatch(fetchAllGuests())
      .catch((error) => {
        console.error("Error loading guest data:", error);
        toast.error("Could not load guest data", {
          description: "Please try again later",
        });
      });
      
      const socket = io('https://frbr.vdc.services:40112/', {
        // Add secure options for HTTPS
        secure: true,
        rejectUnauthorized: false, // Only set this to false if you're using a self-signed certificate
        transports: ['websocket', 'polling'] // Specify transport methods
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

  const handleCheckIn = async (visitId: string) => {
    try {
      toast.success("Visitor checked in", {
        description: "The visitor has been successfully checked in",
      });
      dispatch(fetchAllGuests());
    } catch (error) {
      console.error("Error checking in visitor:", error);
      toast.error("Check-in failed", {
        description: "Please try again",
      });
    }
  };

  const handleCheckOut = async (visitId: string) => {
    try {
      toast.success("Visitor checked out", {
        description: "The visitor has been successfully checked out",
      });
      dispatch(fetchAllGuests());
    } catch (error) {
      console.error("Error checking out visitor:", error);
      toast.error("Check-out failed", {
        description: "Please try again",
      });
    }
  };

  const handleCancel = async (visitId: string) => {
    try {
      toast.success("Visit cancelled", {
        description: "The visit has been successfully cancelled",
      });
      dispatch(fetchAllGuests());
    } catch (error) {
      console.error("Error cancelling visit:", error);
      toast.error("Cancel failed", {
        description: "Please try again",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="h-[400px] w-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // if (error) {
  //   return (
  //     <div className="h-[400px] w-full flex items-center justify-center flex-col">
  //       <AlertTriangle className="h-8 w-8 text-destructive mb-2" />
  //       {/* <p className="text-destructive">Failed to load data</p> */}
  //     </div>
  //   );
  // }

  return (
    <div className="space-y-6 px-4 sm:px-6 max-w-7xl mx-auto">
      {/* Stats Cards - Responsive Grid */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2">
        <Card className="hover-lift w-full">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full p-3 bg-blue-100">
                <Clock className="h-5 w-5 text-blue-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Today's Visits</p>
                <h3 className="text-2xl font-bold">{todayGuests.length}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* <Card className="hover-lift w-full">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full p-3 bg-green-100">
                <UserCheck className="h-5 w-5 text-green-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Visitors</p>
                <h3 className="text-2xl font-bold">{activeVisitors.length}</h3>
              </div>
            </div>
          </CardContent>
        </Card> */}
      </div>

      {/* Main Content Area - Responsive Columns */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Chart Card - Responsive Container */}
        <Card className="hover-lift w-full">
  <CardHeader>
    <CardTitle>Visitor Activity</CardTitle>
    <CardDescription>Daily visitor activity over the past week</CardDescription>
  </CardHeader>
  <CardContent className="flex flex-col items-center justify-center h-[300px] sm:h-[200px] pl-0 pr-4">
    {chartData.length > 0 ? (
      <div className="w-full h-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3.5 3.5" />
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="visits" fill="#4f46e5" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    ) : (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">No visitor data available</p>
      </div>
    )}
  </CardContent>
</Card>

        {/* Visits Card - Responsive Container */}
        <Card className="hover-lift w-full">
          <CardHeader>
            <CardTitle>Today's Visits</CardTitle>
            <CardDescription>Upcoming visits in the next 24 hours</CardDescription>
          </CardHeader>
          <CardContent className="overflow-y-auto max-h-[500px]">
            {todayVisits.length > 0 ? (
              <div className="space-y-4">
                {[...todayVisits]
                  .filter(visit => visit.status === "Upcoming")
                  .map((visit) => (
                    <VisitCard
                      key={visit.id}
                      {...visit}
                      hostName={visit.hostName || 'N/A'}
                      hostAddress={visit.Address || 'N/A'}
                      // onCheckIn={() => handleCheckIn(visit.id)}
                      onCheckOut={() => handleCheckOut(visit.id)}
                      onCancel={() => handleCancel(visit.id)}
                    />
                  ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground">No visits scheduled in the next 24 hours</p>
              </div>
            )}
            {todayVisits.length > 0 && todayVisits.filter(visit => visit.status === "Upcoming").length === 0 && (
              <div className="text-center py-4">
                <p className="text-muted-foreground">No pending arrivals at this time</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;