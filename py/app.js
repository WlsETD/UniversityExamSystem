// ========================================================
// 0. 自動掃描所有 JSON 題庫（GitHub Pages 版本）
// ========================================================

// GitHub Pages raw JSON 來源
const JSON_BASE =
  "https://raw.githubusercontent.com/WlsETD/UniversityExamSystem/main/py/prob/";

// 自動抓取所有 JSON 題庫
async function loadAllJSONFiles() {
  try {
    const res = await fetch(
      "https://api.github.com/repos/WlsETD/UniversityExamSystem/contents/py/prob"
    );
    const files = await res.json();

    return files
      .filter((f) => f.name.endsWith(".json"))
      .map((f) => f.name);
  } catch (err) {
    console.error("⚠️ 無法讀取 GitHub JSON 清單");
    return [];
  }
}

// ========================================================
// 1. 載入單一 JSON 題庫
// ========================================================
async function loadJSON(filename) {
  const url = JSON_BASE + filename;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("JSON 無法讀取");
    return await res.json();
  } catch (err) {
    console.error("❌ JSON 載入失敗：", url);
    return null;
  }
}

// ========================================================
// 2. 動態題庫列表
// ========================================================
let PROBLEM_SETS = [];

async function loadCategories() {
  const container = document.getElementById("category-list");
  if (!container) return;

  // 自動取得所有 JSON 題庫
  PROBLEM_SETS = await loadAllJSONFiles();
  container.innerHTML = "";

  for (const filename of PROBLEM_SETS) {
    const data = await loadJSON(filename);
    if (!data) continue;

    container.appendChild(
      renderCategoryBox(filename, data.category, data.problems.length)
    );
  }
}

function renderCategoryBox(filename, title, count) {
  const div = document.createElement("div");
  div.className = "category-card";
  div.onclick = () => openCategory(filename);
  div.innerHTML = `
        <h3>${title}</h3>
        <p class="filename">${filename}</p>
        <p class="count">共 ${count} 題</p>
    `;
  return div;
}

function openCategory(filename) {
  location.href = `problem.html?file=${filename}`;
}

// ========================================================
// 3. 題目列表 + 難度過濾 + 進度條
// ========================================================
let CURRENT_PROBLEMS = [];
let CURRENT_DIFFICULTY = "all";

async function loadProblemList() {
  const list = document.getElementById("problem-list");
  if (!list) return;

  const url = new URL(location.href);
  const filename = url.searchParams.get("file");

  const data = await loadJSON(filename);
  if (!data) return;

  document.getElementById("category-title").innerText = data.category;
  document.getElementById("problem-count").innerText =
    `共 ${data.problems.length} 題`;

  CURRENT_PROBLEMS = data.problems;
  renderProblemList(filename);
  updateProgress(filename);
}

function renderProblemList(filename) {
  const list = document.getElementById("problem-list");
  list.innerHTML = "";

  let filtered =
    CURRENT_DIFFICULTY === "all"
      ? CURRENT_PROBLEMS
      : CURRENT_PROBLEMS.filter((p) => p.difficulty === CURRENT_DIFFICULTY);

  filtered.forEach((p) => list.appendChild(renderProblemItem(filename, p)));
}

function filterDifficulty(level) {
  CURRENT_DIFFICULTY = level;

  const body = document.body;
  body.classList.remove("bg-default", "bg-easy", "bg-medium", "bg-hard");

  if (level === "Easy") body.classList.add("bg-easy");
  else if (level === "Medium") body.classList.add("bg-medium");
  else if (level === "Hard") body.classList.add("bg-hard");
  else body.classList.add("bg-default");

  const url = new URL(location.href);
  const filename = url.searchParams.get("file");
  renderProblemList(filename);
}

function renderProblemItem(filename, p) {
  const div = document.createElement("div");
  div.className = "problem-item";
  div.onclick = () => openProblem(filename, p.id);
  div.innerHTML = `<strong>${p.id}</strong> — ${p.title}`;
  return div;
}

function openProblem(filename, pid) {
  location.href = `question.html?file=${filename}&id=${pid}`;
}

// ========================================================
// 4. Pyodide 引擎
// ========================================================
let pyodide = null;

async function loadPyodideEngine() {
  if (!pyodide) {
    pyodide = await loadPyodide();
    console.log("🔥 Pyodide 已載入");
  }
}

function createInputFunction(inputs) {
  let index = 0;
  return function () {
    const v = inputs[index];
    index++;
    return v;
  };
}

async function runPythonWithInput(code, inputString) {
  await loadPyodideEngine();

  const inputs = inputString.split("\n");

  pyodide.globals.set("input", createInputFunction(inputs));

  let output = "";
  pyodide.globals.set("print", (...args) => {
    output += args.join(" ") + "\n";
  });

  try {
    await pyodide.runPythonAsync(code);
  } catch (err) {
    return "⚠️ 錯誤：" + err;
  }

  return output.trim();
}

// ========================================================
// 5. 題目讀取 + 自動測試
// ========================================================
async function loadQuestion() {
  const url = new URL(location.href);
  const filename = url.searchParams.get("file");
  const pid = url.searchParams.get("id");

  const data = await loadJSON(filename);
  if (!data) return;

  const prob = data.problems.find((p) => p.id === pid);
  if (!prob) return;

  document.getElementById("q-title").innerText = `${pid} — ${prob.title}`;
  document.getElementById("q-desc").innerText = prob.description;

  const sampleBox = document.getElementById("sample-box");
  sampleBox.innerHTML = "";

  prob.testCases.forEach((tc) => {
    const box = document.createElement("div");
    box.className = "sample-item";
    box.innerText = `輸入：${tc.input} → 預期：${tc.expected}`;
    sampleBox.appendChild(box);
  });

  const upload = document.createElement("input");
  upload.type = "file";
  upload.accept = ".txt,.py";
  upload.id = "uploadAnswer";
  upload.style = "margin-top:15px;";
  upload.onchange = () => checkUploadedAnswerPyodide(prob, filename);
  sampleBox.appendChild(upload);
}

// ========================================================
// 6. 自動測試 + 紀錄通過進度
// ========================================================
async function checkUploadedAnswerPyodide(prob, filename) {
  const file = document.getElementById("uploadAnswer").files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = async () => {
    const userCode = reader.result;

    let allPass = true;

    for (const tc of prob.testCases) {
      const expected = tc.expected.toString();
      const actual = await runPythonWithInput(userCode, tc.input);

      if (actual !== expected) {
        allPass = false;
        break;
      }
    }

    const result = document.getElementById("result");

    if (allPass) {
      result.innerHTML = `
            <div class="success-box">
                🎉 <strong>全部測試通過！</strong>
            </div>`;
      saveProgress(filename, prob.id);
      updateProgress(filename);
    } else {
      result.innerHTML = `
            <div class="fail-box">
                ❌ <strong>測試未通過</strong>
            </div>`;
    }
  };

  reader.readAsText(file);
}

// ========================================================
// 7. 進度儲存 + 進度條
// ========================================================
function saveProgress(filename, pid) {
  const key = "prog_" + filename;
  let prog = JSON.parse(localStorage.getItem(key) || "[]");
  if (!prog.includes(pid)) prog.push(pid);
  localStorage.setItem(key, JSON.stringify(prog));
}

function updateProgress(filename) {
  const key = "prog_" + filename;
  const prog = JSON.parse(localStorage.getItem(key) || "[]");

  const total = CURRENT_PROBLEMS.length;
  const done = prog.length;

  const percent = total === 0 ? 0 : Math.round((done / total) * 100);

  const bar = document.getElementById("progress-bar");
  const text = document.getElementById("progress-text");

  if (bar) bar.style.width = percent + "%";
  if (text) text.innerText = `完成度：${done}/${total}（${percent}%）`;
}
function renderProblemItem(filename, p) {

    // 難度顏色
    let color = "#999"; // default
    if (p.difficulty === "Easy") color = "#27ae60";     // green
    if (p.difficulty === "Medium") color = "#f1c40f";   // yellow
    if (p.difficulty === "Hard") color = "#e74c3c";     // red

    const div = document.createElement("div");
    div.className = "problem-item";
    div.onclick = () => openProblem(filename, p.id);

    div.innerHTML = `
        <div class="problem-row">
            <span class="diff-dot" style="background:${color};"></span>
            <strong>${p.id}</strong> — ${p.title}
        </div>
    `;

    return div;
}

// ========================================================
// 8. 初始化
// ========================================================
window.onload = function () {
  loadCategories();
  loadProblemList();
  loadQuestion();
  loadPyodideEngine();
};
