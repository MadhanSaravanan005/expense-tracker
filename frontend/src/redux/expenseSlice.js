import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Use environment-based API URL
const API_URL = process.env.NODE_ENV === 'production' 
  ? "/api/expenses" 
  : "http://localhost:5000/api/expenses";

export const fetchExpenses = createAsyncThunk("expenses/fetch", async () => {
  const res = await axios.get(API_URL);
  return res.data;
});

export const addExpense = createAsyncThunk("expenses/add", async (expense) => {
  const res = await axios.post(API_URL, expense);
  return res.data;
});

export const deleteExpense = createAsyncThunk("expenses/delete", async (id) => {
  await axios.delete(`${API_URL}/${id}`);
  return id;
});

export const fetchStats = createAsyncThunk("expenses/fetchStats", async () => {
  const res = await axios.get(`${API_URL}/stats`);
  return res.data;
});

const expenseSlice = createSlice({
  name: "expenses",
  initialState: { 
    list: [], 
    stats: { totalIncome: 0, totalExpenses: 0, balance: 0, categoryStats: [] }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchExpenses.fulfilled, (state, action) => { 
        state.list = action.payload; 
      })
      .addCase(addExpense.fulfilled, (state, action) => { 
        state.list.unshift(action.payload); 
      })
      .addCase(deleteExpense.fulfilled, (state, action) => {
        state.list = state.list.filter((e) => e._id !== action.payload);
      })
      .addCase(fetchStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      });
  }
});

export default expenseSlice.reducer;