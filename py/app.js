// ========================================================
// 0. 自動掃描所有 JSON 題庫（GitHub Pages 版本）
// ========================================================

const JSON_BASE =
  "https://raw.githubusercontent.com/WlsETD/UniversityExamSystem/main/py/prob/";

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
// 2. 題庫分類列表
// ========================================================
let PROBLEM_SETS = [];

async function loadCategories() {
  const container = document.getElementById("category-list");
  if (!container) return;

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
let CURRENT_DIFFICULTY = "all"; // ✅ 正確名稱（修正）

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

  // ⭐ 確保第一次載入就會顯示題目
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
  CURRENT_DIFFICULTY = level; // ⭐ 正確變數名稱

  const body = document.body;
  body.classList.remove("bg-default", "bg-easy", "bg-medium", "bg-hard");

  if (level === "Easy") body.classList.add("bg-easy");
  else if (level === "Medium") body.classList.add("bg-medium");
  else if (level === "Hard") body.classList.add("bg-hard");
  else body.classList.add("bg-default");

  const url = new URL(location.href);
  renderProblemList(url.searchParams.get("file"));
}

// ⭐ 顯示題目列表（含 ✓ 已完成）
function renderProblemItem(filename, p) {
  const key = "prog_" + filename;
  const prog = JSON.parse(localStorage.getItem(key) || "[]");

  const isDone = prog.includes(p.id);

  let color = "#999";
  if (p.difficulty === "Easy") color = "#27ae60";
  if (p.difficulty === "Medium") color = "#f1c40f";
  if (p.difficulty === "Hard") color = "#e74c3c";

  const div = document.createElement("div");
  div.className = "problem-item";
  div.onclick = () => openProblem(filename, p.id);

  div.style.opacity = isDone ? "0.55" : "1";

  div.innerHTML = `
    <div class="problem-row">
        <span class="diff-dot" style="background:${color};"></span>
        <strong>${p.id}</strong> — ${p.title}
        ${isDone ? `<span style="color:#2ecc71; margin-left:8px;">✓</span>` : ""}
    </div>
  `;
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
  if (!pyodide) pyodide = await loadPyodide();
}

function createInputFunction(inputs) {
  let index = 0;
  return () => inputs[index++];
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
// 5. 題目內容 & 自動測試
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

  const box = document.getElementById("sample-box");
  box.innerHTML = "";

  prob.testCases.forEach((tc) => {
    const d = document.createElement("div");
    d.className = "sample-item";
    d.innerText = `輸入：${tc.input} → 預期：${tc.expected}`;
    box.appendChild(d);
  });

  const upload = document.createElement("input");
  upload.type = "file";
  upload.accept = ".py,.txt";
  upload.id = "uploadAnswer";
  upload.style = "margin-top:15px;";
  upload.onchange = () => checkUploadedAnswerPyodide(prob, filename);
  box.appendChild(upload);
}

// ========================================================
// 6. 自動測試 + 儲存通過紀錄
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

    const resultBox = document.getElementById("result");

    if (allPass) {
      saveProgress(filename, prob.id);

      resultBox.innerHTML = `
    <div class="result-pass">
        🎉 <strong>全部測試通過！</strong>
    </div>
`;
    } else {
      resultBox.innerHTML = `
        <div class="result-fail">
            ❌ <strong>答案不正確，請再試一次。</strong>
        </div>
      `;
    }

    updateProgress(filename);
    loadProblemList(filename); // ⭐ 更新✓完成標記
  };

  reader.readAsText(file);
}

// ========================================================
// 7. 進度儲存 + 進度條 + 清除進度
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

  document.getElementById("progress-bar").style.width = percent + "%";
  document.getElementById("progress-text").innerText =
    `完成度：${done}/${total}（${percent}%）`;
}

function clearProgress() {
  const url = new URL(location.href);
  const filename = url.searchParams.get("file");

  localStorage.removeItem("prog_" + filename);
  updateProgress(filename);
  loadProblemList(filename);

  alert("已清除所有進度！");
}

// ========================================================
// 8. 初始化（⭐修正不顯示BUG）
// ========================================================
window.onload = async () => {
  await loadCategories();
  await loadProblemList();
  await loadQuestion();
  await loadPyodideEngine();
};
