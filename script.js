/* =========================================================
   FINORA — PERSONAL FINANCE + AI-STYLE ADVISOR
   ========================================================= */

const $ = (id) => document.getElementById(id);

const form = $("transactionForm");
const descriptionInput = $("description");
const amountInput = $("amount");
const typeInput = $("type");
const categoryInput = $("category");
const dateInput = $("date");

const transactionList = $("transactionList");
const searchInput = $("searchInput");
const filterType = $("filterType");

const balanceElement = $("balance");
const incomeElement = $("income");
const expenseElement = $("expense");
const transactionCountElement = $("transactionCount");
const savingRateCard = $("savingRateCard");
const savingRate = $("savingRate");
const expenseCenter = $("expenseCenter");
const categoryList = $("categoryList");
const balanceStatus = $("balanceStatus");
const currentDate = $("currentDate");
const toast = $("toast");

const advisorHeadline = $("advisorHeadline");
const advisorSummary = $("advisorSummary");
const insightList = $("insightList");
const financeScore = $("financeScore");
const scoreRing = $("scoreRing");

const categoryIcons = {
    Food: "🍜",
    Transport: "🚇",
    Shopping: "🛍",
    Bills: "⚡",
    Entertainment: "🎧",
    Health: "♡",
    Education: "◈",
    Salary: "💼",
    Other: "✦"
};

const chartColors = [
    "#9a88ff",
    "#70b7ff",
    "#59e19b",
    "#f3c875",
    "#ff7d8a",
    "#c3baff",
    "#6d61c8",
    "#4e79a7",
    "#777c8f"
];

let transactions = loadTransactions();

document.addEventListener("DOMContentLoaded", () => {
    setCurrentDate();
    setDefaultDate();
    updateDashboard();
    setupNavigation();
});

/* =========================================================
   STORAGE
   ========================================================= */

function loadTransactions() {
    try {
        const saved = JSON.parse(localStorage.getItem("finoraTransactions"));
        return Array.isArray(saved) ? saved : [];
    } catch {
        return [];
    }
}

function saveTransactions() {
    localStorage.setItem("finoraTransactions", JSON.stringify(transactions));
}

/* =========================================================
   DATE + CURRENCY
   ========================================================= */

function setCurrentDate() {
    currentDate.textContent = new Date().toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric"
    });
}

function setDefaultDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    dateInput.value = `${year}-${month}-${day}`;
}

function currency(amount) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(Number(amount) || 0);
}

function shortCurrency(amount) {
    amount = Number(amount) || 0;

    if (amount >= 10000000) return "₹" + (amount / 10000000).toFixed(1) + "Cr";
    if (amount >= 100000) return "₹" + (amount / 100000).toFixed(1) + "L";
    if (amount >= 1000) return "₹" + (amount / 1000).toFixed(1) + "K";

    return "₹" + Math.round(amount);
}

function formatDate(dateString) {
    if (!dateString) return "No date";

    const date = new Date(dateString + "T00:00:00");

    if (Number.isNaN(date.getTime())) return dateString;

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}

function setGreeting() {
    const hour = new Date().getHours();

    let greeting;

    if (hour >= 5 && hour < 12) {
        greeting = "Good Morning";
    } else if (hour >= 12 && hour < 17) {
        greeting = "Good Afternoon";
    } else if (hour >= 17 && hour < 21) {
        greeting = "Good Evening";
    } else {
        greeting = "Good Night";
    }

    const greetingElement = document.getElementById("greeting");

    if (greetingElement) {
        greetingElement.textContent = greeting;
    }
}

setGreeting();
/* =========================================================
   ADD TRANSACTION
   ========================================================= */

form.addEventListener("submit", (event) => {
    event.preventDefault();

    const description = descriptionInput.value.trim();
    const amount = Number.parseFloat(amountInput.value);
    const type = typeInput.value;
    const category = categoryInput.value;
    const date = dateInput.value;

    if (!description) {
        showToast("Please enter a description.");
        descriptionInput.focus();
        return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
        showToast("Please enter a valid amount.");
        amountInput.focus();
        return;
    }

    if (!date) {
        showToast("Please select a date.");
        dateInput.focus();
        return;
    }

    const transaction = {
        id: Date.now() + Math.random(),
        description,
        amount,
        type,
        category,
        date
    };

    transactions.unshift(transaction);

    saveTransactions();
    updateDashboard();

    form.reset();
    setDefaultDate();
    typeInput.value = "expense";
    categoryInput.value = "Food";

    showToast(
        type === "income"
            ? "Income added successfully."
            : "Expense added successfully."
    );

    setTimeout(() => {
        $("transactions").scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }, 120);
});

/* =========================================================
   DASHBOARD
   ========================================================= */

function calculateTotals() {
    let income = 0;
    let expense = 0;

    transactions.forEach((transaction) => {
        const amount = Number(transaction.amount) || 0;

        if (transaction.type === "income") {
            income += amount;
        } else {
            expense += amount;
        }
    });

    return {
        income,
        expense,
        balance: income - expense
    };
}

function updateDashboard() {
    const { income, expense, balance } = calculateTotals();

    const savingsRateValue =
        income > 0
            ? Math.round(((income - expense) / income) * 100)
            : 0;

    incomeElement.textContent = currency(income);
    expenseElement.textContent = currency(expense);
    balanceElement.textContent = currency(balance);
    transactionCountElement.textContent = transactions.length;

    savingRateCard.textContent = `${savingsRateValue}%`;
    savingRate.textContent = `${savingsRateValue}%`;

    expenseCenter.textContent = shortCurrency(expense);

    if (balance > 0) {
        balanceStatus.textContent = "↑ You're spending within your income";
    } else if (balance < 0) {
        balanceStatus.textContent = "↓ Your spending is above your income";
    } else if (transactions.length > 0) {
        balanceStatus.textContent = "→ Income and spending are currently equal";
    } else {
        balanceStatus.textContent = "+ Start adding your financial activity";
    }

    updateDonut(expense);
    updateCategories();
    displayTransactions();
    updateAdvisor();
}

/* =========================================================
   DONUT
   ========================================================= */

function getCategoryTotals() {
    const totals = {};

    transactions.forEach((transaction) => {
        if (transaction.type !== "expense") return;

        const category = transaction.category || "Other";
        totals[category] = (totals[category] || 0) + Number(transaction.amount || 0);
    });

    return totals;
}

function updateDonut(totalExpense) {
    const donut = $("donut");

    if (totalExpense <= 0) {
        donut.style.background =
            "conic-gradient(#2a2e3d 0deg 360deg)";
        return;
    }

    const totals = getCategoryTotals();
    const entries = Object.entries(totals);

    let currentDegree = 0;
    const gradients = [];

    entries.forEach(([category, amount], index) => {
        const degree = (amount / totalExpense) * 360;
        const end = currentDegree + degree;

        gradients.push(
            `${chartColors[index % chartColors.length]} ${currentDegree}deg ${end}deg`
        );

        currentDegree = end;
    });

    donut.style.background =
        `conic-gradient(${gradients.join(", ")})`;
}

/* =========================================================
   CATEGORY BREAKDOWN
   ========================================================= */

function updateCategories() {
    const totals = getCategoryTotals();
    const totalExpense = Object.values(totals)
        .reduce((sum, value) => sum + value, 0);

    const categories = Object.entries(totals)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    if (!categories.length) {
        categoryList.innerHTML = `
            <div class="category-empty">
                Add expenses to see your spending breakdown.
            </div>
        `;
        return;
    }

    categoryList.innerHTML = "";

    categories.forEach(([category, amount]) => {
        const percentage = Math.round((amount / totalExpense) * 100);

        const row = document.createElement("div");
        row.className = "category-row";

        row.innerHTML = `
            <div class="category-icon">
                ${categoryIcons[category] || "✦"}
            </div>
            <div class="category-name">
                ${escapeHTML(category)}
            </div>
            <div class="category-percent">
                ${percentage}%
            </div>
        `;

        categoryList.appendChild(row);
    });
}

/* =========================================================
   TRANSACTIONS
   ========================================================= */

function displayTransactions() {
    const search = searchInput.value.toLowerCase().trim();
    const filter = filterType.value;

    const filtered = transactions.filter((transaction) => {
        const description = String(transaction.description || "").toLowerCase();
        const category = String(transaction.category || "").toLowerCase();

        const matchesSearch =
            description.includes(search) ||
            category.includes(search);

        const matchesFilter =
            filter === "all" ||
            transaction.type === filter;

        return matchesSearch && matchesFilter;
    });

    if (!filtered.length) {
        transactionList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">◌</div>
                <h3>${transactions.length ? "No matching transactions" : "No transactions yet"}</h3>
                <p>${transactions.length
                    ? "Try another search or filter."
                    : "Your financial activity will appear here."
                }</p>
            </div>
        `;
        return;
    }

    transactionList.innerHTML = "";

    filtered.forEach((transaction) => {
        const item = document.createElement("div");
        item.className = "transaction-item";

        const icon = categoryIcons[transaction.category] || "✦";
        const isIncome = transaction.type === "income";
        const sign = isIncome ? "+" : "-";
        const amountClass = isIncome ? "amount-income" : "amount-expense";

        item.innerHTML = `
            <div class="transaction-main">
                <div class="transaction-icon">${icon}</div>
                <div>
                    <div class="transaction-name">
                        ${escapeHTML(transaction.description)}
                    </div>
                    <div class="transaction-details">
                        ${escapeHTML(transaction.category || "Other")}
                        •
                        ${formatDate(transaction.date)}
                    </div>
                </div>
            </div>

            <div class="transaction-amount ${amountClass}">
                ${sign}${currency(transaction.amount)}
            </div>

            <button
                class="delete-btn"
                data-id="${transaction.id}"
                title="Delete transaction"
                aria-label="Delete transaction"
            >×</button>
        `;

        transactionList.appendChild(item);
    });
}

transactionList.addEventListener("click", (event) => {
    const button = event.target.closest(".delete-btn");
    if (!button) return;

    deleteTransaction(button.dataset.id);
});

function deleteTransaction(id) {
    const confirmed = confirm("Delete this transaction?");

    if (!confirmed) return;

    transactions = transactions.filter(
        (transaction) => String(transaction.id) !== String(id)
    );

    saveTransactions();
    updateDashboard();

    showToast("Transaction deleted.");
}

/* =========================================================
   AI-STYLE FINANCIAL ADVISOR
   =========================================================
   This is a rule-based recommendation engine, not a real
   generative AI model. It analyzes the user's own data.
   ========================================================= */

function updateAdvisor() {
    const { income, expense, balance } = calculateTotals();

    if (!transactions.length) {
        advisorHeadline.textContent = "Your financial picture is ready.";
        advisorSummary.textContent =
            "Add a few transactions and FINORA will analyze your spending patterns.";

        insightList.innerHTML = `
            <div class="insight-item neutral">
                <div class="insight-icon">✦</div>
                <div>
                    <strong>Smart insights will appear here</strong>
                    <span>FINORA looks for high spending, savings opportunities and investment readiness.</span>
                </div>
            </div>
        `;

        financeScore.textContent = "—";
        scoreRing.style.background =
            "conic-gradient(#2a2e3d 0deg 360deg)";

        return;
    }

    const savingsRate =
        income > 0
            ? ((income - expense) / income) * 100
            : 0;

    const categoryTotals = getCategoryTotals();
    const categoryEntries = Object.entries(categoryTotals)
        .sort((a, b) => b[1] - a[1]);

    const topCategory = categoryEntries[0] || ["Other", 0];
    const topCategoryName = topCategory[0];
    const topCategoryAmount = topCategory[1];

    const topCategoryPercent =
        expense > 0
            ? (topCategoryAmount / expense) * 100
            : 0;

    const essentialCategories = ["Bills", "Health", "Education", "Transport"];
    const essentialExpense = transactions
        .filter(
            (t) =>
                t.type === "expense" &&
                essentialCategories.includes(t.category)
        )
        .reduce((sum, t) => sum + Number(t.amount || 0), 0);

    const essentialPercent =
        expense > 0 ? (essentialExpense / expense) * 100 : 0;

    const score = calculateFinancialScore({
        income,
        expense,
        balance,
        savingsRate,
        topCategoryPercent
    });

    financeScore.textContent = score;

    const scoreDegree = Math.max(0, Math.min(score, 100)) * 3.6;

    scoreRing.style.background =
        `conic-gradient(#9a88ff 0deg ${scoreDegree}deg, rgba(255,255,255,.06) ${scoreDegree}deg 360deg)`;

    if (score >= 80) {
        advisorHeadline.textContent = "You're building a healthy money rhythm.";
    } else if (score >= 60) {
        advisorHeadline.textContent = "You're on a good path — a few changes can make it stronger.";
    } else if (score >= 40) {
        advisorHeadline.textContent = "Your spending has a few areas worth reviewing.";
    } else {
        advisorHeadline.textContent = "Your spending needs a little more attention this month.";
    }

    if (income > 0) {
        advisorSummary.textContent =
            `You've received ${currency(income)} and spent ${currency(expense)}. ` +
            `Your current savings rate is ${Math.round(savingsRate)}%.`;
    } else {
        advisorSummary.textContent =
            `You've recorded ${currency(expense)} in expenses so far. Add your income to unlock savings and investment-readiness insights.`;
    }

    const insights = [];

    /* High category spending */
    if (expense > 0 && topCategoryPercent >= 30) {
        const possibleSaving = topCategoryAmount * 0.15;

        insights.push({
            type: "warning",
            icon: "!",
            title: `${topCategoryName} is taking a large share`,
            text:
                `${topCategoryName} represents about ${Math.round(topCategoryPercent)}% of your spending. ` +
                `Reducing it by 15% could free roughly ${currency(possibleSaving)}.`
        });
    } else if (expense > 0 && topCategoryPercent >= 20) {
        insights.push({
            type: "info",
            icon: "◈",
            title: `Watch your ${topCategoryName} spending`,
            text:
                `${topCategoryName} is your largest expense category at about ${Math.round(topCategoryPercent)}% of total spending.`
        });
    } else if (expense > 0) {
        insights.push({
            type: "success",
            icon: "✓",
            title: "No single category dominates",
            text:
                "Your expenses are relatively distributed across categories, which can make budgeting easier."
        });
    }

    /* Savings */
    if (income > 0 && savingsRate < 10) {
        const target = income * 0.10;
        const gap = Math.max(0, target - Math.max(balance, 0));

        insights.push({
            type: "warning",
            icon: "₹",
            title: "Build your savings buffer",
            text:
                `Your current savings rate is ${Math.round(savingsRate)}%. ` +
                `A gradual target of 10% would mean setting aside about ${currency(target)} from this income.`
        });
    } else if (income > 0 && savingsRate < 20) {
        insights.push({
            type: "info",
            icon: "↗",
            title: "There is room to save more",
            text:
                `You're saving about ${Math.round(savingsRate)}% of income. ` +
                "Consider increasing this gradually before taking on higher-risk investments."
        });
    } else if (income > 0) {
        insights.push({
            type: "success",
            icon: "✓",
            title: "Strong savings pattern",
            text:
                `Your recorded savings rate is around ${Math.round(savingsRate)}%. Keep protecting your emergency savings before increasing investment risk.`
        });
    }

    /* Overspending */
    if (income > 0 && expense > income) {
        insights.push({
            type: "warning",
            icon: "↓",
            title: "Spending is above income",
            text:
                `You've spent ${currency(expense - income)} more than your recorded income. ` +
                "Review non-essential categories before increasing discretionary spending."
        });
    }

    /* Investment readiness */
    if (income > 0 && savingsRate >= 20 && balance > 0) {
        insights.push({
            type: "success",
            icon: "✦",
            title: "You may be ready to learn about investing",
            text:
                "Your current numbers show positive cash flow and a strong savings rate. Consider learning about diversified, long-term investment options after maintaining an emergency fund."
        });
    } else if (income > 0 && savingsRate >= 10 && balance > 0) {
        insights.push({
            type: "info",
            icon: "◇",
            title: "Focus on financial foundations first",
            text:
                "You have positive cash flow. Building a reliable emergency fund can be a useful step before increasing investment exposure."
        });
    } else if (income > 0) {
        insights.push({
            type: "neutral",
            icon: "•",
            title: "Investment comes after stability",
            text:
                "Before focusing on investments, work toward consistent positive cash flow and an emergency savings buffer."
        });
    }

    /* Essential vs discretionary */
    if (expense > 0 && essentialPercent >= 65) {
        insights.push({
            type: "info",
            icon: "◇",
            title: "Most spending is essential",
            text:
                `About ${Math.round(essentialPercent)}% of recorded spending is in essential categories. Look for small recurring savings rather than aggressive cuts.`
        });
    }

    insightList.innerHTML = "";

    insights.slice(0, 4).forEach((insight) => {
        const element = document.createElement("div");
        element.className = `insight-item ${insight.type}`;

        element.innerHTML = `
            <div class="insight-icon">${insight.icon}</div>
            <div>
                <strong>${escapeHTML(insight.title)}</strong>
                <span>${escapeHTML(insight.text)}</span>
            </div>
        `;

        insightList.appendChild(element);
    });
}

function calculateFinancialScore({
    income,
    expense,
    balance,
    savingsRate,
    topCategoryPercent
}) {
    if (income <= 0) {
        if (expense <= 0) return 50;
        return 30;
    }

    let score = 50;

    if (balance > 0) score += 15;
    if (balance < 0) score -= 25;

    if (savingsRate >= 20) score += 25;
    else if (savingsRate >= 10) score += 15;
    else if (savingsRate >= 5) score += 5;
    else score -= 10;

    if (topCategoryPercent >= 40) score -= 12;
    else if (topCategoryPercent >= 30) score -= 7;

    if (expense / income <= 0.7) score += 8;
    if (expense / income > 1) score -= 15;

    return Math.max(0, Math.min(100, Math.round(score)));
}

/* =========================================================
   SEARCH + FILTER
   ========================================================= */

searchInput.addEventListener("input", displayTransactions);
filterType.addEventListener("change", displayTransactions);

/* =========================================================
   NAVIGATION
   ========================================================= */

function setupNavigation() {
    const links = document.querySelectorAll(".nav-link");

    links.forEach((link) => {
        link.addEventListener("click", () => {
            links.forEach((item) => item.classList.remove("active"));
            link.classList.add("active");
        });
    });
}

/* =========================================================
   TOAST
   ========================================================= */

let toastTimer;

function showToast(message) {
    const title = toast.querySelector("strong");
    const subtitle = toast.querySelector("span");

    title.textContent = message;
    subtitle.textContent = "Your finances have been updated.";

    toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, 2600);
}

/* =========================================================
   SECURITY
   ========================================================= */

function escapeHTML(value) {
    const div = document.createElement("div");
    div.textContent = String(value ?? "");
    return div.innerHTML;
}
