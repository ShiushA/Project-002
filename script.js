// Initialize the application when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
    // Sample data for the application
    const sampleData = {
      
      categories: {
        income: ["Salary", "Freelance", "Investments", "Other"],
        expense: ["Housing", "Food", "Transportation", "Entertainment", "Bills", "Other"],
      },
    }
  
    // Application state
    const appState = {
      currentView: "dashboard",
      transactions: loadTransactions(),
      categories: loadCategories(),
      editingTransactionId: null,
      customDateRange: {
        startDate: null,
        endDate: null,
      },
    }
  
    // DOM Elements
    const elements = {
      navButtons: {
        dashboard: document.getElementById("dashboard-btn"),
        transactions: document.getElementById("transactions-btn"),
        reports: document.getElementById("reports-btn"),
      },
      views: {
        dashboard: document.getElementById("dashboard"),
        transactions: document.getElementById("transactions"),
        reports: document.getElementById("reports"),
      },
      dashboard: {
        totalIncome: document.getElementById("total-income"),
        totalExpenses: document.getElementById("total-expenses"),
        currentBalance: document.getElementById("current-balance"),
        recentTransactionsBody: document.getElementById("recent-transactions-body"),
      },
      transactions: {
        addButton: document.getElementById("add-transaction-btn"),
        categoryFilter: document.getElementById("category-filter"),
        typeFilter: document.getElementById("type-filter"),
        dateFilter: document.getElementById("date-filter"),
        customDateContainer: document.getElementById("custom-date-container"),
        startDateInput: document.getElementById("start-date"),
        endDateInput: document.getElementById("end-date"),
        applyCustomDateBtn: document.getElementById("apply-custom-date"),
        transactionsBody: document.getElementById("transactions-body"),
      },
      reports: {
        periodSelect: document.getElementById("report-period"),
        customDateContainer: document.getElementById("report-custom-date-container"),
        startDateInput: document.getElementById("report-start-date"),
        endDateInput: document.getElementById("report-end-date"),
        generateButton: document.getElementById("generate-report-btn"),
        totalIncome: document.getElementById("report-total-income"),
        totalExpenses: document.getElementById("report-total-expenses"),
        netBalance: document.getElementById("report-net-balance"),
        exportCsv: document.getElementById("export-csv"),
        exportPdf: document.getElementById("export-pdf"),
      },
      modal: {
        container: document.getElementById("transaction-modal"),
        title: document.getElementById("modal-title"),
        form: document.getElementById("transaction-form"),
        type: document.getElementById("transaction-type"),
        amount: document.getElementById("transaction-amount"),
        date: document.getElementById("transaction-date"),
        time: document.getElementById("transaction-time"),
        description: document.getElementById("transaction-description"),
        category: document.getElementById("transaction-category"),
        id: document.getElementById("transaction-id"),
        closeButton: document.querySelector(".close-modal"),
        cancelButton: document.getElementById("cancel-transaction"),
      },
    }
  
    // Initialize the application
    function init() {
      // If no data exists, use sample data
      
  
      if (Object.keys(appState.categories).length === 0) {
        appState.categories = sampleData.categories
        saveCategories()
      }
  
      // Set up event listeners
      setupEventListeners()
  
      // Initialize the UI
      updateDashboard()
      populateFilters()
      updateTransactionsTable()
  
      // Set current date as default for the transaction form
      const today = new Date()
      elements.modal.date.value = formatDateForInput(today)
      elements.modal.time.value = formatTimeForInput(today)
  
      // Initialize custom date inputs with current month
      if (elements.transactions.startDateInput && elements.transactions.endDateInput) {
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
        const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)
  
        elements.transactions.startDateInput.value = formatDateForInput(firstDayOfMonth)
        elements.transactions.endDateInput.value = formatDateForInput(lastDayOfMonth)
      }
  
      if (elements.reports.startDateInput && elements.reports.endDateInput) {
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
        const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)
  
        elements.reports.startDateInput.value = formatDateForInput(firstDayOfMonth)
        elements.reports.endDateInput.value = formatDateForInput(lastDayOfMonth)
      }
  
      // Show/hide custom date containers based on initial selection
      toggleCustomDateContainer()
      toggleReportCustomDateContainer()
    }
  
    // Set up event listeners
    function setupEventListeners() {
      // Navigation
      elements.navButtons.dashboard.addEventListener("click", () => switchView("dashboard"))
      elements.navButtons.transactions.addEventListener("click", () => switchView("transactions"))
      elements.navButtons.reports.addEventListener("click", () => switchView("reports"))
  
      // Transactions
      elements.transactions.addButton.addEventListener("click", openAddTransactionModal)
      elements.transactions.categoryFilter.addEventListener("change", updateTransactionsTable)
      elements.transactions.typeFilter.addEventListener("change", updateTransactionsTable)
      elements.transactions.dateFilter.addEventListener("change", () => {
        toggleCustomDateContainer()
        updateTransactionsTable()
      })
  
      // Custom date range for transactions
      if (elements.transactions.applyCustomDateBtn) {
        elements.transactions.applyCustomDateBtn.addEventListener("click", () => {
          updateTransactionsTable()
        })
      }
  
      // Reports
      elements.reports.generateButton.addEventListener("click", generateReport)
      elements.reports.periodSelect.addEventListener("change", toggleReportCustomDateContainer)
      elements.reports.exportCsv.addEventListener("click", exportToCsv)
      elements.reports.exportPdf.addEventListener("click", exportToPdf)
  
      // Modal
      elements.modal.closeButton.addEventListener("click", closeModal)
      elements.modal.cancelButton.addEventListener("click", closeModal)
      elements.modal.form.addEventListener("submit", handleTransactionFormSubmit)
      elements.modal.type.addEventListener("change", updateCategoryOptions)
    }
  
    // Toggle custom date container visibility for transactions
    function toggleCustomDateContainer() {
      if (elements.transactions.customDateContainer && elements.transactions.dateFilter) {
        elements.transactions.customDateContainer.style.display =
          elements.transactions.dateFilter.value === "custom" ? "block" : "none"
      }
    }
  
    // Toggle custom date container visibility for reports
    function toggleReportCustomDateContainer() {
      if (elements.reports.customDateContainer && elements.reports.periodSelect) {
        elements.reports.customDateContainer.style.display =
          elements.reports.periodSelect.value === "custom" ? "block" : "none"
      }
    }
  
    // Switch between views
    function switchView(viewName) {
      // Update active state for navigation buttons
      Object.keys(elements.navButtons).forEach((key) => {
        elements.navButtons[key].classList.toggle("active", key === viewName)
      })
  
      // Show the selected view, hide others
      Object.keys(elements.views).forEach((key) => {
        elements.views[key].classList.toggle("active", key === viewName)
      })
  
      // Update the current view in app state
      appState.currentView = viewName
  
      // Refresh the view data
      if (viewName === "dashboard") {
        updateDashboard()
      } else if (viewName === "transactions") {
        updateTransactionsTable()
      } else if (viewName === "reports") {
        generateReport()
      }
    }
  
    // Update the dashboard with current data
    function updateDashboard() {
      const { totalIncome, totalExpenses } = calculateTotals()
      const balance = totalIncome - totalExpenses
  
      elements.dashboard.totalIncome.textContent = formatCurrency(totalIncome)
      elements.dashboard.totalExpenses.textContent = formatCurrency(totalExpenses)
      elements.dashboard.currentBalance.textContent = formatCurrency(balance)
  
      // Update recent transactions (show only the 5 most recent)
      const recentTransactions = [...appState.transactions]
        .sort((a, b) => new Date(b.date + "T" + b.time) - new Date(a.date + "T" + a.time))
        .slice(0, 5)
  
      elements.dashboard.recentTransactionsBody.innerHTML = ""
  
      recentTransactions.forEach((transaction) => {
        const row = document.createElement("tr")
        const amountClass = transaction.type === "income" ? "income" : "expense"
        const amountPrefix = transaction.type === "income" ? "+" : "-"
  
        row.innerHTML = `
                  <td>${formatDate(transaction.date)}</td>
                  <td>${transaction.description}</td>
                  <td>${transaction.category}</td>
                  <td class="${amountClass}">${amountPrefix}${formatCurrency(transaction.amount)}</td>
              `
  
        elements.dashboard.recentTransactionsBody.appendChild(row)
      })
  
      // In a real app, we would render charts here
      renderDashboardCharts()
    }
  
    // Populate filter dropdowns
    function populateFilters() {
      // Populate category filter
      const categoryFilter = elements.transactions.categoryFilter
      categoryFilter.innerHTML = '<option value="all">All Categories</option>'
  
      // Add income categories
      const incomeOptgroup = document.createElement("optgroup")
      incomeOptgroup.label = "Income"
      appState.categories.income.forEach((category) => {
        const option = document.createElement("option")
        option.value = category
        option.textContent = category
        incomeOptgroup.appendChild(option)
      })
      categoryFilter.appendChild(incomeOptgroup)
  
      // Add expense categories
      const expenseOptgroup = document.createElement("optgroup")
      expenseOptgroup.label = "Expenses"
      appState.categories.expense.forEach((category) => {
        const option = document.createElement("option")
        option.value = category
        option.textContent = category
        expenseOptgroup.appendChild(option)
      })
      categoryFilter.appendChild(expenseOptgroup)
  
      // Update date filter options to include "all time"
      if (elements.transactions.dateFilter) {
        const dateFilter = elements.transactions.dateFilter
        if (!Array.from(dateFilter.options).some((option) => option.value === "all-time")) {
          const allTimeOption = document.createElement("option")
          allTimeOption.value = "all-time"
          allTimeOption.textContent = "All Time"
          dateFilter.appendChild(allTimeOption)
        }
      }
  
      // Update report period options to include "all time"
      if (elements.reports.periodSelect) {
        const periodSelect = elements.reports.periodSelect
        if (!Array.from(periodSelect.options).some((option) => option.value === "all-time")) {
          const allTimeOption = document.createElement("option")
          allTimeOption.value = "all-time"
          allTimeOption.textContent = "All Time"
          periodSelect.appendChild(allTimeOption)
        }
      }
    }
  
    // Update the transactions table based on filters
    function updateTransactionsTable() {
      const categoryFilter = elements.transactions.categoryFilter.value
      const typeFilter = elements.transactions.typeFilter.value
      const dateFilter = elements.transactions.dateFilter.value
  
      // Apply filters
      let filteredTransactions = appState.transactions
  
      if (categoryFilter !== "all") {
        filteredTransactions = filteredTransactions.filter((t) => t.category === categoryFilter)
      }
  
      if (typeFilter !== "all") {
        filteredTransactions = filteredTransactions.filter((t) => t.type === typeFilter)
      }
  
      // Apply date filters
      const currentDate = new Date()
  
      if (dateFilter === "this-month") {
        const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
        const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
  
        filteredTransactions = filteredTransactions.filter((t) => {
          const transactionDate = new Date(t.date)
          return transactionDate >= firstDay && transactionDate <= lastDay
        })
      } else if (dateFilter === "last-month") {
        const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
        const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0)
  
        filteredTransactions = filteredTransactions.filter((t) => {
          const transactionDate = new Date(t.date)
          return transactionDate >= firstDay && transactionDate <= lastDay
        })
      } else if (dateFilter === "this-year") {
        const firstDay = new Date(currentDate.getFullYear(), 0, 1)
        const lastDay = new Date(currentDate.getFullYear(), 11, 31)
  
        filteredTransactions = filteredTransactions.filter((t) => {
          const transactionDate = new Date(t.date)
          return transactionDate >= firstDay && transactionDate <= lastDay
        })
      } else if (dateFilter === "custom" && elements.transactions.startDateInput && elements.transactions.endDateInput) {
        const startDate = new Date(elements.transactions.startDateInput.value)
        const endDate = new Date(elements.transactions.endDateInput.value)
        // Set end date to end of day
        endDate.setHours(23, 59, 59, 999)
  
        filteredTransactions = filteredTransactions.filter((t) => {
          const transactionDate = new Date(t.date)
          return transactionDate >= startDate && transactionDate <= endDate
        })
      }
      // For 'all-time', we don't filter by date
  
      // Sort by date (newest first)
      filteredTransactions.sort((a, b) => new Date(b.date + "T" + b.time) - new Date(a.date + "T" + a.time))
  
      // Render the transactions
      elements.transactions.transactionsBody.innerHTML = ""
  
      if (filteredTransactions.length === 0) {
        const row = document.createElement("tr")
        row.innerHTML = `<td colspan="7" style="text-align: center;">No transactions found</td>`
        elements.transactions.transactionsBody.appendChild(row)
        return
      }
  
      filteredTransactions.forEach((transaction) => {
        const row = document.createElement("tr")
        const amountClass = transaction.type === "income" ? "income" : "expense"
        const amountPrefix = transaction.type === "income" ? "+" : "-"
  
        row.innerHTML = `
                  <td>${formatDate(transaction.date)}</td>
                  <td>${transaction.time}</td>
                  <td>${transaction.description}</td>
                  <td>${transaction.category}</td>
                  <td>${transaction.type === "income" ? "Income" : "Expense"}</td>
                  <td class="${amountClass}">${amountPrefix}${formatCurrency(transaction.amount)}</td>
                  <td>
                      <button class="edit-btn" data-id="${transaction.id}">Edit</button>
                      <button class="delete-btn" data-id="${transaction.id}">Delete</button>
                  </td>
              `
  
        elements.transactions.transactionsBody.appendChild(row)
      })
  
      // Add event listeners to edit and delete buttons
      document.querySelectorAll(".edit-btn").forEach((button) => {
        button.addEventListener("click", () => {
          const id = Number.parseInt(button.getAttribute("data-id"))
          openEditTransactionModal(id)
        })
      })
  
      document.querySelectorAll(".delete-btn").forEach((button) => {
        button.addEventListener("click", () => {
          const id = Number.parseInt(button.getAttribute("data-id"))
          deleteTransaction(id)
        })
      })
    }
  
    // Generate report based on selected period
    function generateReport() {
      const period = elements.reports.periodSelect.value
      let startDate, endDate
      const currentDate = new Date()
  
      // Determine date range based on selected period
      switch (period) {
        case "current-month":
          startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
          endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
          break
        case "last-month":
          startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
          endDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0)
          break
        case "last-3-months":
          startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 3, 1)
          endDate = currentDate
          break
        case "this-year":
          startDate = new Date(currentDate.getFullYear(), 0, 1)
          endDate = new Date(currentDate.getFullYear(), 11, 31)
          break
        case "custom":
          if (elements.reports.startDateInput && elements.reports.endDateInput) {
            startDate = new Date(elements.reports.startDateInput.value)
            endDate = new Date(elements.reports.endDateInput.value)
            // Set end date to end of day
            endDate.setHours(23, 59, 59, 999)
          } else {
            startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
            endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
          }
          break
        case "all-time":
          // No date filtering for all-time
          startDate = new Date(0) // Beginning of time
          endDate = new Date(8640000000000000) // End of time
          break
        default:
          startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
          endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
      }
  
      // Filter transactions by date range
      const filteredTransactions = appState.transactions.filter((t) => {
        const transactionDate = new Date(t.date)
        return transactionDate >= startDate && transactionDate <= endDate
      })
  
      // Calculate totals for the filtered transactions
      let totalIncome = 0
      let totalExpenses = 0
  
      filteredTransactions.forEach((transaction) => {
        if (transaction.type === "income") {
          totalIncome += transaction.amount
        } else {
          totalExpenses += transaction.amount
        }
      })
  
      const netBalance = totalIncome - totalExpenses
  
      // Update the report summary
      elements.reports.totalIncome.textContent = formatCurrency(totalIncome)
      elements.reports.totalExpenses.textContent = formatCurrency(totalExpenses)
      elements.reports.netBalance.textContent = formatCurrency(netBalance)
  
      // In a real app, we would render charts here
      renderReportCharts(filteredTransactions)
    }
  
    // Open modal to add a new transaction
    function openAddTransactionModal() {
      elements.modal.title.textContent = "Add Transaction"
      elements.modal.form.reset()
      elements.modal.id.value = ""
      appState.editingTransactionId = null
  
      // Set default date and time
      const now = new Date()
      elements.modal.date.value = formatDateForInput(now)
      elements.modal.time.value = formatTimeForInput(now)
  
      // Update category options based on selected type
      updateCategoryOptions()
  
      // Show the modal
      elements.modal.container.style.display = "block"
    }
  
    // Open modal to edit an existing transaction
    function openEditTransactionModal(id) {
      const transaction = appState.transactions.find((t) => t.id === id)
      if (!transaction) return
  
      elements.modal.title.textContent = "Edit Transaction"
      elements.modal.type.value = transaction.type
      elements.modal.amount.value = transaction.amount
      elements.modal.date.value = transaction.date
      elements.modal.time.value = transaction.time
      elements.modal.description.value = transaction.description
  
      // Update category options based on transaction type
      updateCategoryOptions()
  
      // Set the category after options are updated
      elements.modal.category.value = transaction.category
  
      elements.modal.id.value = transaction.id
      appState.editingTransactionId = transaction.id
  
      // Show the modal
      elements.modal.container.style.display = "block"
    }
  
    // Close the transaction modal
    function closeModal() {
      elements.modal.container.style.display = "none"
      elements.modal.form.reset()
    }
  
    // Update category options based on selected transaction type
    function updateCategoryOptions() {
      const type = elements.modal.type.value
      const categorySelect = elements.modal.category
  
      // Clear existing options
      categorySelect.innerHTML = ""
  
      // Add categories based on type
      const categories = type === "income" ? appState.categories.income : appState.categories.expense
  
      categories.forEach((category) => {
        const option = document.createElement("option")
        option.value = category
        option.textContent = category
        categorySelect.appendChild(option)
      })
    }
  
    // Handle transaction form submission
    function handleTransactionFormSubmit(e) {
      e.preventDefault()
  
      const formData = {
        type: elements.modal.type.value,
        amount: Number.parseFloat(elements.modal.amount.value),
        date: elements.modal.date.value,
        time: elements.modal.time.value,
        description: elements.modal.description.value,
        category: elements.modal.category.value,
      }
  
      if (appState.editingTransactionId) {
        // Update existing transaction
        updateTransaction(appState.editingTransactionId, formData)
      } else {
        // Add new transaction
        addTransaction(formData)
      }
  
      closeModal()
  
      // Update UI based on current view
      if (appState.currentView === "dashboard") {
        updateDashboard()
      } else if (appState.currentView === "transactions") {
        updateTransactionsTable()
      } else if (appState.currentView === "reports") {
        generateReport()
      }
    }
  
    // Add a new transaction
    function addTransaction(transactionData) {
      // Generate a new ID
      const newId = appState.transactions.length > 0 ? Math.max(...appState.transactions.map((t) => t.id)) + 1 : 1
  
      // Create the new transaction object
      const newTransaction = {
        id: newId,
        ...transactionData,
      }
  
      // Add to transactions array
      appState.transactions.push(newTransaction)
  
      // Save to local storage
      saveTransactions()
    }
  
    // Update an existing transaction
    function updateTransaction(id, transactionData) {
      const index = appState.transactions.findIndex((t) => t.id === id)
      if (index === -1) return
  
      // Update the transaction
      appState.transactions[index] = {
        ...appState.transactions[index],
        ...transactionData,
      }
  
      // Save to local storage
      saveTransactions()
    }
  
    // Delete a transaction
    function deleteTransaction(id) {
      if (confirm("Are you sure you want to delete this transaction?")) {
        appState.transactions = appState.transactions.filter((t) => t.id !== id)
        saveTransactions()
  
        // Update UI based on current view
        if (appState.currentView === "dashboard") {
          updateDashboard()
        } else if (appState.currentView === "transactions") {
          updateTransactionsTable()
        } else if (appState.currentView === "reports") {
          generateReport()
        }
      }
    }
  
    // Calculate total income and expenses
    function calculateTotals() {
      let totalIncome = 0
      let totalExpenses = 0
  
      appState.transactions.forEach((transaction) => {
        if (transaction.type === "income") {
          totalIncome += transaction.amount
        } else {
          totalExpenses += transaction.amount
        }
      })
  
      return { totalIncome, totalExpenses }
    }
  
    // Render dashboard charts (placeholder)
    function renderDashboardCharts() {
      // In a real app, we would use a charting library like Chart.js
      // For now, we'll just display placeholder text
      document.getElementById("income-vs-expenses-chart").textContent = "Income vs Expenses Chart (Placeholder)"
      document.getElementById("expense-categories-chart").textContent = "Expense Categories Chart (Placeholder)"
    }
  
    // Render report charts (placeholder)
    function renderReportCharts(transactions) {
      // In a real app, we would use a charting library like Chart.js
      // For now, we'll just display placeholder text
      document.getElementById("report-income-vs-expenses").textContent = "Income vs Expenses Chart (Placeholder)"
      document.getElementById("report-expense-categories").textContent = "Expense Categories Chart (Placeholder)"
      document.getElementById("monthly-trends").textContent = "Monthly Trends Chart (Placeholder)"
    }
  
    // Export data to CSV (placeholder)
    function exportToCsv() {
      alert("Export to CSV functionality would be implemented here")
    }
  
    // Export data to PDF (placeholder)
    function exportToPdf() {
      alert("Export to PDF functionality would be implemented here")
    }
  
    // Helper function to format currency
    function formatCurrency(amount) {
      return "$" + amount.toFixed(2)
    }
  
    // Helper function to format date for display
    function formatDate(dateString) {
      const date = new Date(dateString)
      return date.toLocaleDateString("en-US", { month: "numeric", day: "numeric", year: "numeric" })
    }
  
    // Helper function to format date for input fields
    function formatDateForInput(date) {
      return date.toISOString().split("T")[0]
    }
  
    // Helper function to format time for input fields
    function formatTimeForInput(date) {
      return date.toTimeString().slice(0, 5)
    }
  
    // Load transactions from local storage
    function loadTransactions() {
      const storedTransactions = localStorage.getItem("financialTrackerTransactions")
      return storedTransactions ? JSON.parse(storedTransactions) : []
    }
  
    // Save transactions to local storage
    function saveTransactions() {
      localStorage.setItem("financialTrackerTransactions", JSON.stringify(appState.transactions))
    }
  
    // Load categories from local storage
    function loadCategories() {
      const storedCategories = localStorage.getItem("financialTrackerCategories")
      return storedCategories ? JSON.parse(storedCategories) : {}
    }
  
    // Save categories to local storage
    function saveCategories() {
      localStorage.setItem("financialTrackerCategories", JSON.stringify(appState.categories))
    }
  
    // Initialize the application
    init()
  })
  
  