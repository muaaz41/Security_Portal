import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AppDispatch, RootState } from '../store'; 
import Cookies from 'js-cookie';

interface Guest {
  U_Image: null;
  U_Code: string | null;
  U_Name: string | null;
  U_ID: string | null;
  U_Date: string | null;
  U_TNum: string | null;
  U_isArrived: string | null;
  U_arrival_time: number | null;
  U_Host: string | null;
  U_Host_Address: string | null;
  U_Host_Name: string | null;
  U_arrivedAt: string | null;
  U_receivedBy: string | null;
  U_ID_Picture?: number | null; 
  base64Image?: string | null;       
}

interface Visit {
  id: string;
  visitorName: string;
  hostName: string;
  scheduledAt: string;
  status: string;
  purpose: string;
  contactInfo: string;
  scheduledTime: string;
  Address: string | null;
  arrivedAt: string | null;
  receivedBy: string | null;
  imageId?: number | null;            
  image?: string | null;              
}

interface ChartData {
  labels: string[];
  counts: number[];
}

interface GuestState {
  allGuests: Guest[];
  pendingGuests: Guest[];
  arrivedGuests: Guest[];
  todayVisits: Visit[];
  activeVisitors: Guest[];
  pendingVisitors: Guest[];
  visitorChartData: ChartData;
  isLoading: boolean;
  error: string | null;
}

const API_BASE_URL = 'https://frbr.vdc.services:40112/';

export const fetchAllGuests = createAsyncThunk<
  Guest[], 
  void, 
  {
    dispatch: AppDispatch;
    state: RootState;
    rejectValue: string;
  }
>(
  'guests/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const token = Cookies.get('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const response = await fetch(`${API_BASE_URL}/api/all-guests`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Server error');
      }
      
      const data = await response.json();
      console.log("Fetched all guests:", data.guests);
      return data.guests;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const fetchPendingGuests = createAsyncThunk<
  Guest[],
  void,
  {
    dispatch: AppDispatch;
    state: RootState;
    rejectValue: string;
  }
>(
  'guests/fetchPending',
  async (_, { rejectWithValue }) => {
    try {
      const token = Cookies.get('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const response = await fetch(`${API_BASE_URL}/api/pending-guests`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Server error');
      }
      
      const data = await response.json();
      return data.guests;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const fetchArrivedGuests = createAsyncThunk<
  Guest[],
  void,
  {
    dispatch: AppDispatch;
    state: RootState;
    rejectValue: string;
  }
>(
  'guests/fetchArrived',
  async (_, { rejectWithValue }) => {
    try {
      const token = Cookies.get('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const response = await fetch(`${API_BASE_URL}/api/arrived-guests`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Server error');
      }
      
      const data = await response.json();
      return data.guests;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

const formatTime = (arrivalTime: string | number | null): string => {
  if (!arrivalTime) return '00:00';
  
  const timeStr = arrivalTime.toString();
  
  // Handle cases where time might be formatted as HHMM
  if (timeStr.length <= 4 && /^\d+$/.test(timeStr)) {
    const hours = timeStr.length <= 2 ? timeStr : timeStr.slice(0, -2);
    const minutes = timeStr.length <= 2 ? '00' : timeStr.slice(-2);
    return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
  }
  
  if (/^\d{1,2}:\d{2}$/.test(timeStr)) {
    const [hours, minutes] = timeStr.split(':');
    return `${hours.padStart(2, '0')}:${minutes}`;
  }
  
  // Try to handle timestamp format
  try {
    const date = new Date(parseInt(timeStr));
    if (!isNaN(date.getTime())) {
      return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    }
  } catch (e) {
    // Silently handle parsing errors
  }
  
  return '00:00';
};

const transformGuestToVisit = (guest: Guest): Visit => {
  let formattedTime = '00:00';
  if (guest.U_arrival_time !== null) {
    formattedTime = formatTime(guest.U_arrival_time);
  }
  
  const visit: Visit = {
    id: guest.U_Code || '',
    visitorName: guest.U_Name || 'Unknown',
    hostName: guest.U_Host_Name || 'N/A',
    scheduledAt: guest.U_Date || '',
    status: guest.U_isArrived === 'Y' ? 'Arrived' : 'Upcoming',
    purpose: 'Visit',
    contactInfo: guest.U_TNum || 'N/A',
    scheduledTime: formattedTime,
    Address: guest.U_Host_Address || 'N/A',
    arrivedAt: guest.U_arrivedAt || null,
    receivedBy: guest.U_receivedBy || null,
    imageId: guest.U_ID_Picture || null,
    image: guest.base64Image || null
  };
  
  return visit;
};

const filterUpcoming24HoursVisits = (visits: Visit[]): Visit[] => {
  const now = new Date();
  const twentyFourHoursLater = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  
  return visits
    .filter(visit => {
      if (!visit.scheduledAt) return false;
      const visitDate = new Date(visit.scheduledAt);
      if (isNaN(visitDate.getTime())) return false;
      const [hours, minutes] = (visit.scheduledTime || '00:00').split(':').map(num => parseInt(num, 10));
      visitDate.setHours(hours || 0, minutes || 0, 0, 0);
      
      // Filter for next 24 hours
      return visitDate >= now && visitDate <= twentyFourHoursLater;
    })
    .sort((a, b) => {
      const dateTimeA = new Date(a.scheduledAt || '');
      const [hoursA, minutesA] = (a.scheduledTime || '00:00').split(':').map(num => parseInt(num, 10));
      dateTimeA.setHours(hoursA || 0, minutesA || 0, 0, 0);
      
      const dateTimeB = new Date(b.scheduledAt || '');
      const [hoursB, minutesB] = (b.scheduledTime || '00:00').split(':').map(num => parseInt(num, 10));
      dateTimeB.setHours(hoursB || 0, minutesB || 0, 0, 0);
      
      return dateTimeA.getTime() - dateTimeB.getTime();
    });
};

const getActiveVisitors = (guests: Guest[]): Guest[] => {
  return guests.filter(guest => guest.U_isArrived === 'Y' && guest.U_arrivedAt);
};

const getPendingVisitors = (guests: Guest[]): Guest[] => {
  return guests.filter(guest => guest.U_isArrived !== 'Y' || !guest.U_arrivedAt);
};

// Fixed: Ensure chart data is properly generated
const getActiveVisitorCountsByDay = (guests: Guest[]): number[] => {
  const counts = Array(7).fill(0);
  const today = new Date();

  // Ensure guests is an array before processing
  if (!Array.isArray(guests)) {
    console.error("getActiveVisitorCountsByDay received non-array:", guests);
    return counts;
  }

  guests.forEach(guest => {
    if (!guest.U_Date || guest.U_isArrived !== 'Y') return;

    try {
      const visitDate = new Date(guest.U_Date);
      if (isNaN(visitDate.getTime())) return; 

      const timeDiff = today.getTime() - visitDate.getTime();
      const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

      if (daysDiff >= 0 && daysDiff < 7) {
        counts[6 - daysDiff]++; 
      }
    } catch (error) {
      console.error("Error processing visit date:", error);
    }
  });

  return counts;
};

const getLastSevenDaysLabels = (): string[] => {
  const labels: string[] = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const label = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });

    labels.push(label);
  }

  return labels;
};

const initialState: GuestState = {
  allGuests: [],
  pendingGuests: [],
  arrivedGuests: [],
  todayVisits: [],
  pendingVisitors: [],
  activeVisitors: [],
  visitorChartData: {
    labels: getLastSevenDaysLabels(), 
    counts: [0, 0, 0, 0, 0, 0, 0]   
  },
  isLoading: false,
  error: null
};

const guestSlice = createSlice({
  name: 'guests',
  initialState,
  reducers: {
    refreshChartData: (state) => {
      // Generate fresh chart data
      const labels = getLastSevenDaysLabels();
      const counts = getActiveVisitorCountsByDay(state.allGuests);
      
      // Log the generated data for debugging
      console.log("Refreshing chart data:", { labels, counts });
      
      state.visitorChartData = { labels, counts };
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllGuests.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllGuests.fulfilled, (state, action: PayloadAction<Guest[]>) => {
        state.isLoading = false;
        state.allGuests = action.payload;
        
        // Transform and filter guests
        const transformedGuests = action.payload.map(transformGuestToVisit);
        state.todayVisits = filterUpcoming24HoursVisits(transformedGuests);
        
        // Update active and pending visitors
        state.activeVisitors = getActiveVisitors(action.payload);
        state.pendingVisitors = getPendingVisitors(action.payload);
        
        // Update chart data with proper logging
        const labels = getLastSevenDaysLabels();
        const counts = getActiveVisitorCountsByDay(action.payload);
        
        console.log("Updating chart data in reducer:", { labels, counts });
        
        state.visitorChartData = {
          labels: labels,
          counts: counts
        };
      })
      .addCase(fetchAllGuests.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Unknown error';
      })
      
      .addCase(fetchPendingGuests.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPendingGuests.fulfilled, (state, action: PayloadAction<Guest[]>) => {
        state.isLoading = false;
        state.pendingGuests = action.payload;
        state.pendingVisitors = getPendingVisitors(action.payload);
      })
      .addCase(fetchPendingGuests.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Unknown error';
      })
    
      .addCase(fetchArrivedGuests.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchArrivedGuests.fulfilled, (state, action: PayloadAction<Guest[]>) => {
        state.isLoading = false;
        state.arrivedGuests = action.payload;
        state.activeVisitors = getActiveVisitors(action.payload);
      
        // Update chart data if no all guests data is available
        if (state.allGuests.length === 0) {
          const labels = getLastSevenDaysLabels();
          const counts = getActiveVisitorCountsByDay(action.payload);
          
          console.log("Updating chart data from arrived guests:", { labels, counts });
          
          state.visitorChartData = {
            labels: labels,
            counts: counts
          };
        }
      })
      .addCase(fetchArrivedGuests.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Unknown error';
      });
  }
});

export const { refreshChartData } = guestSlice.actions;
export default guestSlice.reducer;