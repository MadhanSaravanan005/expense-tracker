const express = require("express");
const Expense = require("../models/Expense");
const router = express.Router();

// Get all expenses
router.get("/", async (req, res) => {
  try {
    const expenses = await Expense.find().sort({ date: -1 });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new expense
router.post("/", async (req, res) => {
  try {
    const { title, amount, category, description, type, date } = req.body;
    const expense = new Expense({ title, amount, category, description, type, date });
    const savedExpense = await expense.save();
    res.status(201).json(savedExpense);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update an expense
router.put("/:id", async (req, res) => {
  try {
    const { title, amount, category, description, type, date } = req.body;
    const expense = await Expense.findByIdAndUpdate(
      req.params.id,
      { title, amount, category, description, type, date },
      { new: true }
    );
    if (!expense) return res.status(404).json({ error: "Expense not found" });
    res.json(expense);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete an expense
router.delete("/:id", async (req, res) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);
    if (!expense) return res.status(404).json({ error: "Expense not found" });
    res.json({ message: "Expense deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get expense statistics
router.get("/stats", async (req, res) => {
  try {
    const totalIncome = await Expense.aggregate([
      { $match: { type: 'income' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    const totalExpenses = await Expense.aggregate([
      { $match: { type: 'expense' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const categoryStats = await Expense.aggregate([
      { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } }
    ]);

    res.json({
      totalIncome: totalIncome[0]?.total || 0,
      totalExpenses: totalExpenses[0]?.total || 0,
      balance: (totalIncome[0]?.total || 0) - (totalExpenses[0]?.total || 0),
      categoryStats
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;