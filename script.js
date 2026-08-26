let entries = JSON.parse(localStorage.getItem("apprenticeHours")) || [];
let weeklyChart, monthlyChart;

// Login
function showLogin() {
  document.getElementById("loginScreen").style.display = "block";
  document.getElementById("appScreen").style.display = "none";
}

function showApp() {
  document.getElementById("loginScreen").style.display = "none";
  document.getElementById("appScreen").style.display = "block";
  showSection("dashboardSection");
  renderTable();
  updateSummaries();
  initCharts();
}

function login() {
  const u = document.getElementById("username").value;
  const p = document.getElementById("password").value;
  if (u === "Kevin" && p === "electrician") {
    localStorage.setItem("loggedIn", "true");
    showApp();
  } else {
    alert("Invalid login");
  }
}

function logout() {
  localStorage.removeItem("loggedIn");
  showLogin();
}

// Sidebar & dark mode
function setupSidebar() {
  document.getElementById("openMenu").onclick = () => {
    document.getElementById("sidebar").style.left = "0";
  };
  document.getElementById("closeMenu").onclick = () => {
    document.getElementById("sidebar").style.left = "-250px";
  };

  document.querySelectorAll("#sidebar a[data-section]").forEach(link => {
    link.onclick = (e) => {
      e.preventDefault();
      const section = link.getAttribute("data-section");
      showSection(section);
      document.getElementById("sidebar").style.left = "-250px";
    };
  });

  document.getElementById("toggleDark").onclick = (e) => {
    e.preventDefault();
    document.body.classList.toggle("dark");
    localStorage.setItem("darkMode", document.body.classList.contains("dark"));
  };

  document.getElementById("logout").onclick = (e) => {
    e.preventDefault();
    logout();
  };

  if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark");
  }
}

function showSection(id) {
  ["dashboardSection", "hoursSection", "reportSection"].forEach(sec => {
    document.getElementById(sec).style.display = (sec === id) ? "block" : "none";
  });
  if (id === "reportSection") generateReport();
}

// Hours logic
function saveEntries() {
  localStorage.setItem("apprenticeHours", JSON.stringify(entries));
}

function addEntry() {
  const date = document.getElementById("date").value;
  const job = document.getElementById("job").value;
  const task = document.getElementById("task").value;
  const hours = parseFloat(document.getElementById("hours").value);

  if (!date || !job || !hours) {
    alert("Please fill out all fields.");
    return;
  }

  entries.push({ date, job, task, hours });
  saveEntries();
  renderTable();
  updateSummaries();
  updateCharts();
}

function deleteEntry(index) {
  entries.splice(index, 1);
  saveEntries();
  renderTable();
  updateSummaries();
  updateCharts();
}

function renderTable() {
  const table = document.getElementById("hoursTable");
  table.innerHTML = `
    <tr>
      <th>Date</th>
      <th>Job</th>
      <th>Task</th>
      <th>Hours</th>
      <th>Delete</th>
    </tr>
  `;
  let total = 0;
  entries.forEach((entry, index) => {
    total += entry.hours;
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${entry.date}</td>
      <td>${entry.job}</td>
      <td>${entry.task}</td>
      <td>${entry.hours}</td>
      <td><button class="delete-btn" onclick="deleteEntry(${index})">X</button></td>
    `;
    table.appendChild(row);
  });
  document.getElementById("totalHours").innerText = "Total Hours: " + total.toFixed(1);
}

// Summaries
function getWeeklyHoursArray() {
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  const daily = [0,0,0,0,0,0,0]; // Sun-Sat
  entries.forEach(e => {
    const d = new Date(e.date);
    if (d >= weekStart) {
      const day = d.getDay();
      daily[day] += e.hours;
    }
  });
  return daily;
}

function getMonthlyHoursArray() {
  const now = new Date();
  const month = now.getMonth();
  const days = {};
  entries.forEach(e => {
    const d = new Date(e.date);
    if (d.getMonth() === month) {
      const key = e.date;
      days[key] = (days[key] || 0) + e.hours;
    }
  });
  const labels = Object.keys(days).sort();
  const data = labels.map(l => days[l]);
  return { labels, data };
}

function updateSummaries() {
  const total = entries.reduce((sum, e) => sum + e.hours, 0);
  const weekly = getWeeklyHoursArray().reduce((sum, h) => sum + h, 0);
  const monthData = getMonthlyHoursArray();
  const monthly = monthData.data.reduce((sum, h) => sum + h, 0);

  document.getElementById("summaryText").innerText =
    `Total: ${total.toFixed(1)} hrs | This week: ${weekly.toFixed(1)} hrs | This month: ${monthly.toFixed(1)} hrs`;
}

// Charts
function initCharts() {
  const weeklyCtx = document.getElementById("weeklyChart");
  const monthlyCtx = document.getElementById("monthlyChart");

  const weeklyData = getWeeklyHoursArray();
  weeklyChart = new Chart(weeklyCtx, {
    type: "bar",
    data: {
      labels: ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],
      datasets: [{
        label: "Hours This Week",
        data: weeklyData,
        backgroundColor: "#0a4a8a"
      }]
    }
  });

  const monthData = getMonthlyHoursArray();
  monthlyChart = new Chart(monthlyCtx, {
    type: "line",
    data: {
      labels: monthData.labels,
      datasets: [{
        label: "Hours This Month",
        data: monthData.data,
        borderColor: "#0a4a8a",
        fill: false
      }]
    }
  });
}

function updateCharts() {
  if (!weeklyChart || !monthlyChart) return;
  const weeklyData = getWeeklyHoursArray();
  weeklyChart.data.datasets[0].data = weeklyData;
  weeklyChart.update();

  const monthData = getMonthlyHoursArray();
  monthlyChart.data.labels = monthData.labels;
  monthlyChart.data.datasets[0].data = monthData.data;
  monthlyChart.update();
}

// CSV export
function exportCSV() {
  if (entries.length === 0) {
    alert("No hours to export.");
    return;
  }
  let csv = "Date,Job,Task,Hours\n";
  entries.forEach(entry => {
    csv += `${entry.date},${entry.job},${entry.task},${entry.hours}\n`;
  });
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "apprentice_hours.csv";
  a.click();
  URL.revokeObjectURL(url);
}

// Report
function generateReport() {
  const div = document.getElementById("report");
  if (!div) return;
  div.innerHTML = entries.map(e =>
    `<p>${e.date} — ${e.job} — ${e.task} — ${e.hours} hrs</p>`
  ).join("");
}

// Init
window.onload = () => {
  setupSidebar();

  document.getElementById("loginBtn").onclick = login;
  document.getElementById("addEntryBtn").onclick = addEntry;
  document.getElementById("exportCsvBtn").onclick = exportCSV;

  if (localStorage.getItem("loggedIn") === "true") {
    showApp();
  } else {
    showLogin();
  }
};
