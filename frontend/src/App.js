import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchExpenses, addExpense, deleteExpense, fetchStats } from "./redux/expenseSlice";
import "./App.css";

function App() {
  const dispatch = useDispatch();
  const expenses = useSelector((state) => state.expenses.list);
  const stats = useSelector((state) => state.expenses.stats);
  const [form, setForm] = useState({ 
    title: "", 
    amount: "", 
    category: "", 
    description: "", 
    type: "expense", 
    date: new Date().toISOString().split('T')[0] 
  });

  useEffect(() => { 
    dispatch(fetchExpenses()); 
    dispatch(fetchStats());
  }, [dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(addExpense({
      ...form,
      amount: parseFloat(form.amount)
    }));
    setForm({ 
      title: "", 
      amount: "", 
      category: "", 
      description: "", 
      type: "expense", 
      date: new Date().toISOString().split('T')[0] 
    });
    // Refresh stats after adding
    setTimeout(() => dispatch(fetchStats()), 100);
  };

  const handleDelete = (id) => {
    dispatch(deleteExpense(id));
    // Refresh stats after deleting
    setTimeout(() => dispatch(fetchStats()), 100);
  };

  const formatAmount = (amount, type) => {
    const symbol = type === 'income' ? '+' : '-';
    return `${symbol}$${amount.toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="container">
      <h2>Expense Tracker</h2>
      
      {/* Stats Cards */}
      <div className="stats-container">
        <div className="stat-card income">
          <h3>Total Income</h3>
          <div className="amount">${stats.totalIncome.toFixed(2)}</div>
        </div>
        <div className="stat-card expense">
          <h3>Total Expenses</h3>
          <div className="amount">${stats.totalExpenses.toFixed(2)}</div>
        </div>
        <div className="stat-card balance">
          <h3>Balance</h3>
          <div className="amount">${stats.balance.toFixed(2)}</div>
        </div>
      </div>
      
      {/* Add Expense Form */}
      <form onSubmit={handleSubmit}>
        <input 
          type="text"
          placeholder="Title" 
          value={form.title} 
          onChange={(e) => setForm({ ...form, title: e.target.value })} 
          required 
        />
        <input 
          type="number"
          step="0.01"
          placeholder="Amount" 
          value={form.amount} 
          onChange={(e) => setForm({ ...form, amount: e.target.value })} 
          required 
        />
        <select 
          value={form.category} 
          onChange={(e) => setForm({ ...form, category: e.target.value })} 
          required
        >
          <option value="">Select Category</option>
          <option value="Food">Food</option>
          <option value="Transportation">Transportation</option>
          <option value="Entertainment">Entertainment</option>
          <option value="Healthcare">Healthcare</option>
          <option value="Shopping">Shopping</option>
          <option value="Bills">Bills</option>
          <option value="Education">Education</option>
          <option value="Salary">Salary</option>
          <option value="Investment">Investment</option>
          <option value="Other">Other</option>
        </select>
        <select 
          value={form.type} 
          onChange={(e) => setForm({ ...form, type: e.target.value })} 
          required
        >
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
        <input 
          type="date"
          value={form.date} 
          onChange={(e) => setForm({ ...form, date: e.target.value })} 
          required 
        />
        <textarea 
          placeholder="Description (optional)" 
          value={form.description} 
          onChange={(e) => setForm({ ...form, description: e.target.value })} 
          rows="2"
        />
        <button type="submit">Add Transaction</button>
      </form>

      {/* Expenses Table */}
      <div className="table-container">
        {expenses.length === 0 ? (
          <div className="empty-state">
            <p>No transactions found. Add your first transaction above!</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Title</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Type</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <tr key={expense._id}>
                  <td>{formatDate(expense.date)}</td>
                  <td>{expense.title}</td>
                  <td>{expense.category}</td>
                  <td className={`amount-cell ${expense.type}`}>
                    {formatAmount(expense.amount, expense.type)}
                  </td>
                  <td>
                    <span className={expense.type}>
                      {expense.type.charAt(0).toUpperCase() + expense.type.slice(1)}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="delete-btn"
                      onClick={() => handleDelete(expense._id)}
                      title="Delete Transaction"
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default App;