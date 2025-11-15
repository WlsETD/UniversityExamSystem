// ========================================================
// 0. JSON 路徑
// ========================================================
function getJSONPath(file) {
    const base = location.pathname;
    if (base.includes("/py/")) {
        return `${location.origin}/py/prob/${file}`;
    }
    return `${location.origin}/prob/${file}`;
}

// ========================================================
// 1. 載入 JSON
// ========================================================
async function loadJSON(file) {
    const path = getJSONPath(file);
    try {
        const res = await fetch(path);
        if (!res.ok) throw new Error("JSON not found");
        return await res.json();
    } catch (e) {
        console.error("❌ JSON 讀取失敗：", path);
        return null;
    }
}

// ========================================================
// 2. 題庫清單
// ========================================================
const PROBLEM_SETS = ["Chapter1.json","Chapter2.json","Chapter3.json","Chapter4.json","Chapter5.json","Chapter6.json"];

// ========================================================
// 3. 首頁：題庫分類
// ========================================================
async function loadCategories() {
    const container = document.getElementById("category-list");
    if (!container) return;

    container.innerHTML = "";
    for (const filename of PROBLEM_SETS) {
        const data = await loadJSON(filename);
        if (!data) continue;

        container.appendChild(renderCategoryBox(filename, data.category, data.problems.length));
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
// 4. 題庫列表 + 難度過濾 + 進度更新
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
    document.getElementById("problem-count").innerText = `共 ${data.problems.length} 題`;

    CURRENT_PROBLEMS = data.problems;

    // ⭐ 更新進度條
    updateProgress(data.problems);

    renderProblemList(filename);
}

function renderProblemList(filename) {
    const list = document.getElementById("problem-list");
    list.innerHTML = "";

    let filtered = CURRENT_PROBLEMS;
    if (CURRENT_DIFFICULTY !== "all") {
        filtered = CURRENT_PROBLEMS.filter(p => p.difficulty === CURRENT_DIFFICULTY);
    }

    filtered.forEach(p => list.appendChild(renderProblemItem(filename, p)));
}

function filterDifficulty(level) {
    CURRENT_DIFFICULTY = level;

    const url = new URL(location.href);
    const filename = url.searchParams.get("file");

    renderProblemList(filename);

    // ⭐ 背景顏色切換（含緩慢過渡）
    const body = document.body;
    body.classList.remove("bg-default", "bg-easy", "bg-medium", "bg-hard");

    if (level === "Easy") body.classList.add("bg-easy");
    else if (level === "Medium") body.classList.add("bg-medium");
    else if (level === "Hard") body.classList.add("bg-hard");
    else body.classList.add("bg-default");
}

function renderProblemItem(filename, p) {
    const div = document.createElement("div");
    div.className = "problem-item";

    let solved = JSON.parse(localStorage.getItem("solved") || "{}");
    let icon = solved[p.id] ? "✔️" : "";

    // 決定難度 class
    let diffClass =
        p.difficulty === "Easy" ? "diff-easy" :
        p.difficulty === "Medium" ? "diff-medium" :
        "diff-hard";

    div.onclick = () => openProblem(filename, p.id);

    div.innerHTML = `
        <div class="diff-bar ${diffClass}"></div>
        <div class="problem-text">
            <strong>${p.id}</strong> — ${p.title} ${icon}
        </div>
    `;

    return div;
}


function openProblem(filename, pid) {
    location.href = `question.html?file=${filename}&id=${pid}`;
}

// ========================================================
// ⭐ 5. 載入 Pyodide（Python 執行引擎）
// ========================================================
let pyodide = null;

async function loadPyodideEngine() {
    if (!pyodide) {
        pyodide = await loadPyodide();
        console.log("🔥 Pyodide 已載入");
    }
}

// 注入 input() → 依序回傳 testCase 的輸入
function createInputFunction(inputs) {
    let index = 0;
    return function () {
        const value = inputs[index];
        index++;
        return value;
    };
}

// 執行 Python + 捕捉 print()
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
        return "⚠️ 執行錯誤：" + err;
    }

    return output.trim();
}

// ========================================================
// 6. 渲染單題頁面
// ========================================================
async function loadQuestion() {
    const url = new URL(location.href);
    const filename = url.searchParams.get("file");
    const pid = url.searchParams.get("id");

    const data = await loadJSON(filename);
    if (!data) return;

    const prob = data.problems.find(p => p.id === pid);
    if (!prob) return;

    document.getElementById("q-title").innerText = `${pid} — ${prob.title}`;
    document.getElementById("q-desc").innerText = prob.description;

    const sampleBox = document.getElementById("sample-box");
    sampleBox.innerHTML = "";

    if (prob.testCases) {
        prob.testCases.forEach(tc => {
            const div = document.createElement("div");
            div.className = "sample-item";
            div.innerText = `輸入：${tc.input} → 預期：${tc.expected}`;
            sampleBox.appendChild(div);
        });
    }

    // 上傳按鈕
    const upload = document.createElement("input");
    upload.type = "file";
    upload.accept = ".txt,.py";
    upload.id = "uploadAnswer";
    upload.style = "margin-top:15px;";
    upload.onchange = () => checkUploadedAnswerPyodide(prob);
    sampleBox.appendChild(upload);
}

// ========================================================
// 7. Pyodide 自動評測 + ✔ 記錄完成度
// ========================================================
async function checkUploadedAnswerPyodide(prob) {
    const file = document.getElementById("uploadAnswer").files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = async () => {
        const userCode = reader.result;
        let allPass = true;

        for (const tc of prob.testCases) {
            const actual = await runPythonWithInput(userCode, tc.input);
            if (actual !== tc.expected.toString()) {
                allPass = false;
                break;
            }
        }

        // ⭐ 顯示結果（一次性）
        if (allPass) {
            // ⭐ 記錄答對
            let solved = JSON.parse(localStorage.getItem("solved") || "{}");
            solved[prob.id] = true;
            localStorage.setItem("solved", JSON.stringify(solved));

            document.getElementById("result").innerHTML = `
                <div style="padding:15px;border-radius:8px;background:#0f5132;color:#d1fae5;">
                    🎉 <strong>全部測試通過！做得很好！</strong>
                </div>
            `;
        } else {
            document.getElementById("result").innerHTML = `
                <div style="padding:15px;border-radius:8px;background:#51230f;color:#ffe4e4;">
                    ❌ <strong>測試未通過，請再檢查你的程式。</strong>
                </div>
            `;
        }
    };

    reader.readAsText(file);
}

// ========================================================
// 8. 更新進度條
// ========================================================
function updateProgress(problems) {
    let solved = JSON.parse(localStorage.getItem("solved") || "{}");

    let solvedCount = problems.filter(p => solved[p.id]).length;
    let total = problems.length;

    let percent = (solvedCount / total) * 100;

    const text = document.getElementById("progress-text");
    const bar = document.getElementById("progress-bar");

    if (text) text.innerText = `完成度：${solvedCount} / ${total}`;
    if (bar) bar.style.width = percent + "%";
}
function clearProgress() {
    localStorage.removeItem("solved");

    // 更新進度 UI
    updateProgress(CURRENT_PROBLEMS);

    alert("所有進度已清除！");
    loadProblemList();
}
// ========================================================
// 10. 啟動
// ========================================================
window.onload = function () {
    loadCategories();
    loadProblemList();
    loadQuestion();
    loadPyodideEngine();
};
