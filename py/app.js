/* ========================================================
   Online Judge — Final Stable Version (2025)
   支援三頁架構：
   1. index.html    → 題庫分類
   2. problem.html  → 題目列表
   3. question.html → 單題練習頁
======================================================== */

/* ========================================================
   0. 全域設定
======================================================== */

const JSON_BASE =
  "https://raw.githubusercontent.com/WlsETD/UniversityExamSystem/main/py/prob/";

let PROBLEM_SETS = [];
let CURRENT_PROBLEMS = [];
let CURRENT_DIFFICULTY = "all";

let pyodide = null;

// 🔹 目前正在作答的題目（給上傳檔案自動批改用）
let CURRENT_PROB_OBJ = null;
let CURRENT_FILENAME = null;

/* ========================================================
   1. 共用工具
======================================================== */

async function loadJSON(filename) {
  try {
    const res = await fetch(JSON_BASE + filename);
    if (!res.ok) throw new Error("JSON 無法載入");
    return await res.json();
  } catch (err) {
    console.warn("❌ JSON 載入失敗: ", filename);
    return null;
  }
}

async function loadJSONList() {
  try {
    const res = await fetch(
      "https://api.github.com/repos/WlsETD/UniversityExamSystem/contents/py/prob"
    );
    const files = await res.json();
    return files
      .filter((f) => f.name.endsWith(".json"))
      .map((f) => f.name);
  } catch (err) {
    console.warn("⚠ 無法取得 JSON 清單");
    return [];
  }
}

/* 🔹 輸出正規化：讓判題對換行／行尾空白比較寬鬆 */
function normalizeOutput(str) {
  if (str == null) return "";

  // 統一換行符號
  str = String(str).replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  let lines = str.split("\n").map((line) =>
    // 只刪除「行尾」空白，保留左邊縮排（星星題目才不會壞）
    line.replace(/\s+$/g, "")
  );

  // 移除結尾多餘的空白行
  while (lines.length > 0 && lines[lines.length - 1] === "") {
    lines.pop();
  }

  return lines.join("\n");
}

/* ========================================================
   2. 分類首頁 index.html
======================================================== */

async function loadCategories() {
  const container = document.getElementById("category-list");
  if (!container) return;

  PROBLEM_SETS = await loadJSONList();
  container.innerHTML = "";

  for (const filename of PROBLEM_SETS) {
    const data = await loadJSON(filename);
    if (!data) continue;

    const div = document.createElement("div");
    div.className = "category-card";
    div.onclick = () => openCategory(filename);

    div.innerHTML = `
      <h3>${data.category}</h3>
      <p class="filename">${filename}</p>
      <p class="count">共 ${data.problems.length} 題</p>
    `;

    container.appendChild(div);
  }
}

function openCategory(filename) {
  location.href = `problem.html?file=${filename}`;
}

/* ========================================================
   3. 題目列表 problem.html
======================================================== */

async function loadProblemList() {
  const listArea = document.getElementById("problem-list");
  if (!listArea) return;

  const url = new URL(location.href);
  const filename = url.searchParams.get("file");

  const data = await loadJSON(filename);
  if (!data) return;

  CURRENT_PROBLEMS = data.problems;

  const titleEl = document.getElementById("category-title");
  const countEl = document.getElementById("problem-count");

  if (titleEl) titleEl.innerText = data.category;
  if (countEl) countEl.innerText = `共 ${data.problems.length} 題`;

  renderProblemList(filename);
  updateProgress(filename);

  // 預設背景
  document.body.classList.add("bg-default");
}

function renderProblemList(filename) {
  const listArea = document.getElementById("problem-list");
  if (!listArea) return;

  listArea.innerHTML = "";

  const filtered = CURRENT_PROBLEMS.filter(
    (p) => CURRENT_DIFFICULTY === "all" || p.difficulty === CURRENT_DIFFICULTY
  );

  filtered.forEach((p) => {
    const key = "prog_" + filename;
    const prog = JSON.parse(localStorage.getItem(key) || "[]");
    const done = prog.includes(p.id);

    const color =
      p.difficulty === "Easy"
        ? "#27ae60"
        : p.difficulty === "Medium"
        ? "#f1c40f"
        : "#e74c3c";

    const div = document.createElement("div");
    div.className = "problem-item";
    div.onclick = () => openProblem(filename, p.id);

    div.style.opacity = done ? "0.55" : "1";

    div.innerHTML = `
      <div class="problem-row">
        <span class="diff-dot" style="background:${color};"></span>
        <strong>${p.id}</strong> — ${p.title}
        ${done ? `<span style="color:#2ecc71;">✓</span>` : ""}
      </div>
    `;

    listArea.appendChild(div);
  });
}

function openProblem(filename, pid) {
  location.href = `question.html?file=${filename}&id=${pid}`;
}

/* 🔹 難度切換 + 背景切換 */
function filterDifficulty(difficulty) {
  CURRENT_DIFFICULTY = difficulty;

  const url = new URL(location.href);
  const filename = url.searchParams.get("file");

  renderProblemList(filename);
  updateProgress(filename);

  const body = document.body;
  body.classList.remove("bg-default", "bg-easy", "bg-medium", "bg-hard");

  if (difficulty === "Easy") {
    body.classList.add("bg-easy");
  } else if (difficulty === "Medium") {
    body.classList.add("bg-medium");
  } else if (difficulty === "Hard") {
    body.classList.add("bg-hard");
  } else {
    body.classList.add("bg-default");
  }
}

/* 🔹 清除目前題庫的作答進度 */
function clearProgress() {
  const url = new URL(location.href);
  const filename = url.searchParams.get("file");
  if (!filename) return;

  const key = "prog_" + filename;
  localStorage.removeItem(key);

  renderProblemList(filename);
  updateProgress(filename);
}

/* ========================================================
   4. Python 執行器
======================================================== */

async function loadPyodideEngine() {
  if (!pyodide) {
    pyodide = await loadPyodide();
  }
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
    return "⚠ Python 錯誤：" + err;
  }

  return output.trimEnd();
}

/* ========================================================
   5. 載入單題 question.html
======================================================== */

async function loadQuestion() {
  if (!document.getElementById("sample-box")) return;

  const url = new URL(location.href);
  const filename = url.searchParams.get("file");
  const pid = url.searchParams.get("id");

  const data = await loadJSON(filename);
  if (!data) return;

  const prob = data.problems.find((p) => p.id === pid);
  if (!prob) return;

  // 🔹 記錄當前題目（給上傳檔案用）
  CURRENT_PROB_OBJ = prob;
  CURRENT_FILENAME = filename;

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

  // 上傳檔案 → 自動批改
  const uploadEl = document.getElementById("uploadAnswer");
  if (uploadEl) {
    // 避免重複綁定
    uploadEl.removeEventListener("change", handleUploadChange);
    uploadEl.addEventListener("change", handleUploadChange);
  }

  await loadPyodideEngine();
}

/* 🔸 上傳檔案後的事件處理：自動批改目前題目 */
async function handleUploadChange() {
  if (!CURRENT_PROB_OBJ || !CURRENT_FILENAME) return;
  await validateUploaded(CURRENT_PROB_OBJ, CURRENT_FILENAME);
}

/* ========================================================
   6. 載入的檔案格式檢查
======================================================== */

async function validateUploaded(prob, filename) {
  const fileInput = document.getElementById("uploadAnswer");
  const file = fileInput?.files[0];
  if (!file) return;

  const ext = file.name.split(".").pop().toLowerCase();
  const code = await file.text();

  if (ext === "py") return judgePython(prob, filename, code);
  if (ext === "java") return judgeJava(prob, filename, code);

  alert("❌ 僅支援 .py 或 .java！");
}

/* ========================================================
   7. Python / Java 批改
======================================================== */

async function judgePython(prob, filename, code) {
  let ok = true;

  for (const tc of prob.testCases) {
    const actualRaw = await runPythonWithInput(code, tc.input);
    const expectedRaw = tc.expected.toString();

    const actual = normalizeOutput(actualRaw);
    const expected = normalizeOutput(expectedRaw);

    if (actual !== expected) ok = false;
  }

  showResult(ok, filename, prob);
}

async function judgeJava(prob, filename, code) {
  let ok = true;

  for (const tc of prob.testCases) {
    const actualRaw = await runJavaWithInput(code, tc.input);
    const expectedRaw = tc.expected.toString();

    const actual = normalizeOutput(actualRaw);
    const expected = normalizeOutput(expectedRaw);

    if (actual !== expected) ok = false;
  }

  showResult(ok, filename, prob);
}

/* ========================================================
   8. 顯示批改結果 & 儲存進度
======================================================== */

function showResult(ok, filename, prob) {
  const box = document.getElementById("result");
  if (!box) return;

  if (ok) {
    saveProgress(filename, prob.id);
    box.innerHTML = `<div class="result-pass">🎉 全部通過！</div>`;
  } else {
    box.innerHTML = `<div class="result-fail">❌ 答案不正確</div>`;
  }

  updateProgress(filename);
}

/* ========================================================
   儲存 / 更新進度
======================================================== */

function saveProgress(filename, pid) {
  const key = "prog_" + filename;
  let prog = JSON.parse(localStorage.getItem(key) || "[]");

  if (!prog.includes(pid)) prog.push(pid);

  localStorage.setItem(key, JSON.stringify(prog));
}

function updateProgress(filename) {
  const key = "prog_" + filename;
  const prog = JSON.parse(localStorage.getItem(key) || "[]");

  const done = prog.length;
  const total = CURRENT_PROBLEMS.length;

  const textEl = document.getElementById("progress-text");
  if (textEl) {
    textEl.innerText = `完成度：${done}/${total}`;
  }

  const bar = document.getElementById("progress-bar");
  if (bar) {
    const percent = total ? (done / total) * 100 : 0;
    bar.style.width = percent + "%";
  }
}

/* ========================================================
   9. 手動執行（單筆測資）
======================================================== */

async function manualRun() {
  const fileInput = document.getElementById("uploadAnswer");
  const file = fileInput?.files[0];
  if (!file) return alert("請上傳 .py 或 .java 檔案");

  const ext = file.name.split(".").pop().toLowerCase();
  const code = await file.text();

  const url = new URL(location.href);
  const filename = url.searchParams.get("file");
  const pid = url.searchParams.get("id");

  const data = await loadJSON(filename);
  if (!data) return;

  const prob = data.problems.find((p) => p.id === pid);
  if (!prob) return;

  const first = prob.testCases[0];

  let outRaw = "";
  if (ext === "py") outRaw = await runPythonWithInput(code, first.input);
  else outRaw = await runJavaWithInput(code, first.input);

  const out = normalizeOutput(outRaw);

  const box = document.getElementById("result");
  if (box) {
    // 🔧 改成用 <pre> 顯示，保留多行 / 縮排
    box.innerHTML = `
      <div class="result-pass">
        <h6 class="text-center">手動執行結果：</h6>
        <pre>${out}</pre>
      </div>
    `;
  }
}

/* ========================================================
   10. 自動測試所有測資
======================================================== */

async function runAllTests() {
  const fileInput = document.getElementById("uploadAnswer");
  const file = fileInput?.files[0];
  if (!file) return alert("請上傳 .py 或 .java 檔案");

  const ext = file.name.split(".").pop().toLowerCase();
  const code = await file.text();

  const url = new URL(location.href);
  const filename = url.searchParams.get("file");
  const pid = url.searchParams.get("id");

  const data = await loadJSON(filename);
  if (!data) return;

  const prob = data.problems.find((p) => p.id === pid);
  if (!prob) return;

  let allPass = true;
  let html = "";

  for (let i = 0; i < prob.testCases.length; i++) {
    const tc = prob.testCases[i];

    let actualRaw =
      ext === "py"
        ? await runPythonWithInput(code, tc.input)
        : await runJavaWithInput(code, tc.input);

    const expectedRaw = tc.expected.toString();

    const actual = normalizeOutput(actualRaw);
    const expected = normalizeOutput(expectedRaw);

    const pass = actual === expected;
    if (!pass) allPass = false;

    // 🔧 預期 / 實際 改成換行顯示整段輸出
    html += `
      <div class="mb-3 log">
        <strong>測試案 ${i + 1}</strong>
        <pre>輸入：${tc.input}</pre>
        <pre>預期：
${expectedRaw}</pre>
        <pre>實際：
${actualRaw}</pre>
        ${pass ? "✓ 通過" : "✗ 失敗"}
      </div>
      <hr>
    `;
  }

  const box = document.getElementById("result");
  if (!box) return;

  if (allPass) {
    saveProgress(filename, prob.id);
    updateProgress(filename);

    box.innerHTML = `
      <div class="result-pass">🎉 所有測資全部通過！</div>
      ${html}
    `;
  } else {
    box.innerHTML = `
      <div class="result-fail">❌ 部分測資未通過</div>
      ${html}
    `;
  }
}

/* ========================================================
   11. 初始化入口
======================================================== */

window.onload = async () => {
  if (document.getElementById("category-list")) loadCategories();

  if (document.getElementById("problem-list")) loadProblemList();

  if (document.getElementById("sample-box")) {
    await loadQuestion();
  }
};
