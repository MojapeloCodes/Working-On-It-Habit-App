const mainContent = document.getElementById("mainContent");

let startTime = null;
let timerInterval = null;

/* ---------- VIEWS ---------- */
function showMainView(view) {
  switch(view) {

    case 'dashboard':
      mainContent.innerHTML = `<h1>Welcome to My Habit App</h1>`;
      break;

    case 'working':
      mainContent.innerHTML = `
        <h2>What are you working on?</h2>
        <input id="label" placeholder="Activity label">
        <textarea id="description" placeholder="Short description"></textarea>
        <button onclick="startTracking()">Start</button>
        <button onclick="stopTracking()">Stop</button>
        <h3 id="timer">00:00:00</h3>
      `;
      break;

    case 'activity':
      mainContent.innerHTML = `
        <h2>Activity Calendar</h2>
        <div class="calendar" id="calendar"></div>
      `;
      renderCalendar();
      break;

    case 'biggerPicture':
      mainContent.innerHTML = `
        <h2>The Bigger Picture</h2>
        <select id="filter" onchange="renderSessions()">
          <option value="all">All</option>
          <option value="day">Today</option>
          <option value="week">This Week</option>
        </select>
        <ul id="sessionsList"></ul>
      `;
      renderSessions();
      break;

    case 'analysis':
      mainContent.innerHTML = `
        <h2>Analysis</h2>
        <table id="analysisTable">
          <thead>
            <tr>
              <th>Label</th>
              <th>Duration</th>
              <th>Sessions</th>
            </tr>
          </thead>
          <tbody></tbody>
        </table>
        <canvas id="pieChart"></canvas>
      `;
      renderAnalysis();
      break;
  }
}

/* ---------- TIMER ---------- */
function startTracking() {
  if (timerInterval) return;
  startTime = Date.now();
  timerInterval = setInterval(updateTimer, 1000);
}

function stopTracking() {
  if (!startTime) return;

  clearInterval(timerInterval);
  timerInterval = null;

  const duration = Math.floor((Date.now() - startTime) / 1000);
  startTime = null;

  const label = document.getElementById("label").value.trim();
  const description = document.getElementById("description").value.trim();

  if (!label) {
    alert("Please enter a label.");
    return;
  }

  const tempSession = {
    label,
    description,
    date: new Date().toISOString().split("T")[0],
    duration
  };

  // ⬇️ THIS is what was missing
  openReflectionModal(tempSession);
}

function submitReflection(tempSession) {
  const completed = document.getElementById("completed").value;
  const reflection = document.getElementById("reflection").value;
  const lifeAreaSelect = document.getElementById("lifeArea");

  const lifeAreas = Array.from(lifeAreaSelect.selectedOptions)
    .map(o => o.value);

  const finalSession = {
    ...tempSession,
    mood: selectedMood,
    completed,
    lifeAreas,
    reflection
  };

  saveSession(finalSession);
  function closeModal() {
  document.querySelector(".modal")?.remove();
}


  alert("Well done! 🎉");
}



/* ---------- STORAGE ---------- */
function saveSession(session) {
  const data = JSON.parse(localStorage.getItem("sessions")) || [];
  data.push(session);
  localStorage.setItem("sessions", JSON.stringify(data));
}

/* ---------- RENDER ---------- */
function renderSessions() {
  const list = document.getElementById("sessionsList");
  if (!list) return;

  list.innerHTML = "";
  const sessions = JSON.parse(localStorage.getItem("sessions")) || [];

  sessions.forEach(s => {
    const li = document.createElement("li");
    li.innerHTML = `<strong>${s.label}</strong> – ${formatTime(s.duration)}`;
    list.appendChild(li);
  });
}

function renderCalendar() {
  const cal = document.getElementById("calendar");
  const sessions = JSON.parse(localStorage.getItem("sessions")) || [];
  cal.innerHTML = "";

  for (let i = 1; i <= 30; i++) {
    const day = document.createElement("div");
    day.className = "day";
    day.innerHTML = `<span>${i}</span>`;

    sessions
      .filter(s => s.date.endsWith(`-${String(i).padStart(2,"0")}`))
      .forEach(s => {
        const block = document.createElement("div");
        block.className = "activity-block";
        block.style.background = generateColors(1)[0];
        block.innerText = s.label;
        day.appendChild(block);
      });

    cal.appendChild(day);
  }
}

function renderAnalysis() {
  const tbody = document.querySelector("#analysisTable tbody");
  if (!tbody) return;

  const sessions = JSON.parse(localStorage.getItem("sessions")) || [];
  const summary = {};

  sessions.forEach(s => {
    summary[s.label] ??= { duration: 0, count: 0 };
    summary[s.label].duration += s.duration;
    summary[s.label].count++;
  });

  tbody.innerHTML = "";
  Object.entries(summary).forEach(([label, data]) => {
    tbody.innerHTML += `
      <tr>
        <td>${label}</td>
        <td>${formatTime(data.duration)}</td>
        <td>${data.count}</td>
      </tr>
    `;
  });

  const ctx = document.getElementById("pieChart");
  new Chart(ctx, {
    type: "pie",
    data: {
      labels: Object.keys(summary),
      datasets: [{
        data: Object.values(summary).map(s => s.duration),
        backgroundColor: generateColors(Object.keys(summary).length)
      }]
    }
  });
}

/* ---------- HELPERS ---------- */
function updateTimer() {
  const sec = Math.floor((Date.now() - startTime) / 1000);
  document.getElementById("timer").innerText = formatTime(sec);
}

function formatTime(sec) {
  return new Date(sec * 1000).toISOString().substr(11, 8);
}

function generateColors(n) {
  return Array.from({length: n}, (_, i) =>
    `hsl(${i * 360 / n}, 70%, 60%)`
  );
}

function openReflectionModal(tempSession) {
  const modal = document.createElement("div");
  modal.className = "modal";

  modal.innerHTML = `
    <div class="modal-content">
      <h3>Session Reflection</h3>

      <label>How did you feel?</label>
      <div style="display:flex; gap:6px; margin-bottom:10px;">
        ${[1,2,3,4,5].map(n =>
          `<button onclick="selectMood(${n})">😊</button>`
        ).join("")}
      </div>

      <label>Did you complete the task?</label>
      <select id="completed">
        <option value="yes">Yes</option>
        <option value="no">Still working on it</option>
      </select>

      <label>Which areas did it improve?</label>
      <select id="lifeArea" multiple>
        <option>Mental Health</option>
        <option>Logic / Learning</option>
        <option>Social</option>
        <option>Spiritual</option>
        <option>Physical</option>
        <option>Creativity</option>
        <option>Career</option>
      </select>

      <textarea id="reflection" placeholder="Short reflection"></textarea>

      <button onclick='submitReflection(${JSON.stringify(tempSession)})'>
        Submit
      </button>
      <button onclick="closeModal()">Cancel</button>
    </div>
  `;

  document.body.appendChild(modal);
}

let selectedMood = null;

function selectMood(mood) {
  selectedMood = mood;
}

