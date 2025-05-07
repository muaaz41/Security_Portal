import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export interface Guard {
  name: string;
  code: string;
  email: string;
  address: string;
  idCard: string;
  isActive: string;
}

interface GuardApiResponse {
  message: string;
  data: Guard[];
}

interface GuardState {
  allGuards: Guard[];
  isLoading: boolean;
  error: string | null;
}

const initialState: GuardState = {
  allGuards: [],
  isLoading: false,
  error: null,
};

export const fetchAllGuards = createAsyncThunk(
  'guards/fetchAllGuards',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('https://frbr.vdc.services:40112/auth/all-guards');
      
      if (!response.ok) {
        throw new Error('Failed to fetch guards');
      }
      
      const data: GuardApiResponse = await response.json();
      console.log(data,'kkoo00000')
      return data.data; 
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

const guardSlice = createSlice({
  name: 'guards',
  initialState,
  reducers: {
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllGuards.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllGuards.fulfilled, (state, action: PayloadAction<Guard[]>) => {
        state.isLoading = false;
        state.allGuards = action.payload;
      })
      .addCase(fetchAllGuards.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export default guardSlice.reducer;