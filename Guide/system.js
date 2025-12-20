/* =========================================================
   Guide/system.js  (可直接覆蓋)
   - 支援 banks.index.json → 各分類 banks.json → 題庫檔(questions)
   - 題庫檔支援：
     1) 直接是陣列：[ {type,question,...}, ... ]
     2) 或 { banks:[...] } / { questions:[...] } 等常見包裝
   - 題型支援：fill-in / multiple-choice / multi-select
   ========================================================= */

(() => {
  "use strict";

  /* ========= CONFIG (此檔案放在 Guide/ 時) ========= */
  const INDEX_URL = "./banks.index.json"; // Guide/banks.index.json
  const DEFAULT_TITLE = "段考練習系統";

  /* ========= DOM ========= */
  const questionNumberElement = document.getElementById("question-number");
  const questionTextElement = document.getElementById("question-text");
  const optionsContainer = document.getElementById("options-container");
  const feedbackElement = document.getElementById("feedback");
  const submitButton = document.getElementById("submit-btn");
  const nextButton = document.getElementById("next-btn");
  const progressElement = document.getElementById("progress");
  const totalAnsweredElement = document.getElementById("total-answered");
  const accuracyElement = document.getElementById("accuracy");
  const themeToggle = document.getElementById("theme-toggle");
  const downloadErrorsButton = document.getElementById("download-errors-btn");

  /* ========= STATE ========= */
  let originalQuestions = [];      // 未洗牌、標準化後的題目（含 _qid）
  let shuffledQuestions = [];      // 用於出題（含選項洗牌後的題目）
  let currentQuestionIndex = 0;

  let selectedOption = null;
  let selectedOptions = new Set();
  let fillInAnswer = "";

  let totalAnswered = 0;
  let correctAnswers = 0;

  // 存原始題目（未洗牌的那份）
  let incorrectQuestions = [];

  // 題庫資訊（用來顯示/下載檔名）
  let currentCatId = "";
  let currentCatName = "";
  let currentBankId = "";
  let currentBankName = "";

  /* ========= UTIL ========= */
  function $(id) { return document.getElementById(id); }

  function escapeFileName(s) {
    return String(s || "").replace(/[\\/:*?"<>|]/g, "_").trim() || "錯題本";
  }

  function normalizeText(s) {
    return String(s ?? "")
      .toLowerCase()
      .replace(/\s+/g, "")
      .trim();
  }

  async function fetchJson(url) {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}：${url}`);
    return await res.json();
  }

  function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }

  /* ========= THEME ========= */
  function toggleTheme() {
    document.body.classList.toggle("dark-mode");
    const isDark = document.body.classList.contains("dark-mode");
    if (themeToggle) themeToggle.textContent = isDark ? "☀️" : "🌙";
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }

  function loadTheme() {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      document.body.classList.add("dark-mode");
      if (themeToggle) themeToggle.textContent = "☀️";
    }
  }

  /* ========= BANK INDEX LOADER =========
     URL: system.html?cat=english&bank=general
  */
  function getParams() {
    const sp = new URLSearchParams(location.search);
    return {
      cat: sp.get("cat") || "",
      bank: sp.get("bank") || ""
    };
  }

  function normalizeIndex(raw) {
    if (!Array.isArray(raw)) throw new Error("banks.index.json 必須是陣列");
    return raw.map(c => ({
      id: String(c.id),
      name: String(c.name || c.id),
      manifest: String(c.manifest) // e.g. ./english/banks.json
    }));
  }

  function normalizeBanksManifest(raw) {
    // 支援：[] 或 {banks:[]}
    const arr = Array.isArray(raw) ? raw : raw?.banks;
    if (!Array.isArray(arr)) throw new Error("banks.json 必須是陣列或 {banks:[...]}");
    return arr.map(b => ({
      id: String(b.id),
      name: String(b.name || b.title || b.id),
      file: String(b.file || b.src || "") // e.g. text.json
    }));
  }

  function normalizeQuestionsFile(raw) {
    // 支援：[] 或 {questions:[]} 或 {items:[]} 或 {data:[]}
    const arr =
      Array.isArray(raw) ? raw :
      (Array.isArray(raw?.questions) ? raw.questions :
      (Array.isArray(raw?.items) ? raw.items :
      (Array.isArray(raw?.data) ? raw.data : null)));

    if (!Array.isArray(arr)) {
      throw new Error("題庫檔必須是陣列，或 {questions:[...]} 格式");
    }
    return arr;
  }

  function normalizeQuestion(q, idx) {
    if (!q || typeof q !== "object") {
      throw new Error(`題目格式錯誤：第 ${idx + 1} 題不是物件`);
    }

    const type = String(q.type || "").trim();
    const question = String(q.question || "").trim();
    if (!type) throw new Error(`第 ${idx + 1} 題缺少 type`);
    if (!question) throw new Error(`第 ${idx + 1} 題缺少 question`);

    const base = { ...q, type, question, _qid: String(idx) };

    if (type === "fill-in") {
      const correctAnswer = String(q.correctAnswer ?? "").trim();
      const correctAnswer2 = q.correctAnswer2 != null ? String(q.correctAnswer2).trim() : "";

      // acceptableAnswers 可省略：自動補齊
      let acceptableAnswers = Array.isArray(q.acceptableAnswers) ? q.acceptableAnswers : [];
      acceptableAnswers = acceptableAnswers
        .map(x => String(x).trim())
        .filter(Boolean);

      if (correctAnswer) acceptableAnswers.unshift(correctAnswer);
      if (correctAnswer2) acceptableAnswers.unshift(correctAnswer2);

      // 去重
      const seen = new Set();
      acceptableAnswers = acceptableAnswers.filter(a => {
        const key = normalizeText(a);
        if (!key) return false;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      return {
        ...base,
        correctAnswer: correctAnswer || (acceptableAnswers[0] || ""),
        correctAnswer2: correctAnswer2 || undefined,
        acceptableAnswers
      };
    }

    if (type === "multiple-choice") {
      const options = Array.isArray(q.options) ? q.options.map(x => String(x)) : null;
      if (!options || options.length < 2) {
        throw new Error(`第 ${idx + 1} 題 multiple-choice 缺少 options 或 options 太少`);
      }

      let ca = q.correctAnswer;

      // correctAnswer 允許傳文字，轉成 index
      if (typeof ca === "string") {
        const find = options.findIndex(o => normalizeText(o) === normalizeText(ca));
        if (find === -1) throw new Error(`第 ${idx + 1} 題 correctAnswer 文字找不到對應選項`);
        ca = find;
      }

      // 必須是數字 index
      if (typeof ca !== "number" || !Number.isInteger(ca)) {
        throw new Error(`第 ${idx + 1} 題 correctAnswer 必須是選項索引(整數)`);
      }
      if (ca < 0 || ca >= options.length) {
        throw new Error(`第 ${idx + 1} 題 correctAnswer 超出 options 範圍`);
      }

      return { ...base, options, correctAnswer: ca };
    }

    if (type === "multi-select") {
      const options = Array.isArray(q.options) ? q.options.map(x => String(x)) : null;
      if (!options || options.length < 2) {
        throw new Error(`第 ${idx + 1} 題 multi-select 缺少 options 或 options 太少`);
      }

      let ca = q.correctAnswer;
      if (!Array.isArray(ca)) {
        throw new Error(`第 ${idx + 1} 題 multi-select correctAnswer 必須是索引陣列`);
      }
      ca = ca.map(x => Number(x)).filter(x => Number.isInteger(x));
      ca.forEach(x => {
        if (x < 0 || x >= options.length) {
          throw new Error(`第 ${idx + 1} 題 multi-select correctAnswer 超出 options 範圍`);
        }
      });

      // 去重
      ca = Array.from(new Set(ca)).sort((a, b) => a - b);

      return { ...base, options, correctAnswer: ca };
    }

    // 其他題型先原樣保留（不直接爆）
    return base;
  }

  function shuffleQuestionOptions(question) {
    // fill-in 不洗牌
    if (question.type === "fill-in") return { ...question };

    if (question.type === "multiple-choice") {
      const correctAnswerText = question.options[question.correctAnswer];
      const indices = question.options.map((_, i) => i);
      const shuffledIndices = shuffleArray(indices);
      const shuffledOptions = shuffledIndices.map(i => question.options[i]);
      const newCorrectAnswer = shuffledOptions.indexOf(correctAnswerText);

      return { ...question, options: shuffledOptions, correctAnswer: newCorrectAnswer };
    }

    if (question.type === "multi-select") {
      const correctAnswerTexts = question.correctAnswer.map(idx => question.options[idx]);
      const indices = question.options.map((_, i) => i);
      const shuffledIndices = shuffleArray(indices);
      const shuffledOptions = shuffledIndices.map(i => question.options[i]);

      const newCorrectAnswers = correctAnswerTexts
        .map(text => shuffledOptions.indexOf(text))
        .filter(idx => idx >= 0)
        .sort((a, b) => a - b);

      return { ...question, options: shuffledOptions, correctAnswer: newCorrectAnswers };
    }

    return { ...question };
  }

  function updateStats() {
    if (totalAnsweredElement) totalAnsweredElement.textContent = String(totalAnswered);
    const accuracy = totalAnswered > 0 ? Math.round((correctAnswers / totalAnswered) * 100) : 0;
    if (accuracyElement) accuracyElement.textContent = `${accuracy}%`;

    if (downloadErrorsButton) {
      downloadErrorsButton.style.display = incorrectQuestions.length > 0 ? "block" : "none";
    }
  }

  function displayQuestion() {
    const q = shuffledQuestions[currentQuestionIndex];
    if (!q) return;

    // 題號 / 進度
    if (questionNumberElement) {
      questionNumberElement.textContent = `題目 ${currentQuestionIndex + 1}/${shuffledQuestions.length}`;
    }
    if (questionTextElement) questionTextElement.textContent = q.question;
    if (progressElement) {
      progressElement.style.width = `${((currentQuestionIndex + 1) / shuffledQuestions.length) * 100}%`;
    }

    // 清 UI
    if (optionsContainer) optionsContainer.innerHTML = "";
    selectedOptions.clear();
    selectedOption = null;
    fillInAnswer = "";

    // 題型渲染
    if (q.type === "multiple-choice") {
      q.options.forEach((opt, index) => {
        const el = document.createElement("div");
        el.className = "option";
        el.textContent = opt;
        el.dataset.index = String(index);

        el.addEventListener("click", () => {
          if (submitButton?.style.display === "none") return;
          document.querySelectorAll(".option").forEach(x => x.classList.remove("selected"));
          el.classList.add("selected");
          selectedOption = index;
          if (submitButton) submitButton.disabled = false;
        });

        optionsContainer.appendChild(el);
      });
    } else if (q.type === "multi-select") {
      q.options.forEach((opt, index) => {
        const el = document.createElement("div");
        el.className = "option";
        el.textContent = opt;
        el.dataset.index = String(index);

        el.addEventListener("click", () => {
          if (submitButton?.style.display === "none") return;

          if (selectedOptions.has(index)) {
            selectedOptions.delete(index);
            el.classList.remove("selected");
          } else {
            selectedOptions.add(index);
            el.classList.add("selected");
          }
          if (submitButton) submitButton.disabled = selectedOptions.size === 0;
        });

        optionsContainer.appendChild(el);
      });
    } else {
      // fill-in
      const input = document.createElement("input");
      input.type = "text";
      input.className = "fill-in-input";
      input.placeholder = "請輸入答案...";
      input.id = "fill-in-input";

      input.addEventListener("input", (e) => {
        fillInAnswer = String(e.target.value || "").trim();
        if (submitButton) submitButton.disabled = fillInAnswer.length === 0;
      });

      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && fillInAnswer.length > 0) checkAnswer();
      });

      optionsContainer.appendChild(input);

      const hint = document.createElement("div");
      hint.className = "fill-in-hint";
      hint.textContent = "提示：輸入完成後按 Enter 或點擊提交按鈕";
      optionsContainer.appendChild(hint);

      setTimeout(() => input.focus(), 80);
    }

    if (feedbackElement) {
      feedbackElement.className = "feedback";
      feedbackElement.textContent = "";
    }

    if (submitButton) {
      submitButton.style.display = "block";
      submitButton.disabled = true;
    }
    if (nextButton) nextButton.style.display = "none";
    if (downloadErrorsButton) {
      downloadErrorsButton.style.display = incorrectQuestions.length > 0 ? "block" : "none";
    }

    // ✅ 第一題畫面出來後，通知 system.html 可以關掉開頭動畫
    if (currentQuestionIndex === 0) {
      window.dispatchEvent(new Event("system:ready"));
    }
  }

  function checkAnswer() {
    const q = shuffledQuestions[currentQuestionIndex];
    if (!q) return;

    let isCorrect = false;
    let correctDisplay = "";

    // 找回未洗牌的原始題目（用 _qid）
    const orig = originalQuestions.find(x => x._qid === q._qid) || q;

    if (q.type === "multiple-choice") {
      if (selectedOption === null) return;
      isCorrect = selectedOption === q.correctAnswer;
      correctDisplay = q.options[q.correctAnswer];
    } else if (q.type === "multi-select") {
      if (selectedOptions.size === 0) return;
      const correctSet = new Set(q.correctAnswer);
      isCorrect = selectedOptions.size === correctSet.size &&
        [...selectedOptions].every(idx => correctSet.has(idx));
      correctDisplay = q.correctAnswer.map(idx => q.options[idx]).join("、");
    } else {
      if (!fillInAnswer) return;
      const ans = normalizeText(fillInAnswer);
      isCorrect = (orig.acceptableAnswers || []).some(a => normalizeText(a) === ans);
      correctDisplay = orig.correctAnswer || (orig.acceptableAnswers?.[0] || "");
    }

    totalAnswered++;
    if (isCorrect) {
      correctAnswers++;
    } else {
      // 存回「原始題目」以方便下載
      const already = incorrectQuestions.some(x => x.question === orig.question);
      if (!already) {
        const clean = { ...orig };
        delete clean._qid;
        incorrectQuestions.push(clean);
      }
    }
    updateStats();

    if (feedbackElement) {
      feedbackElement.className = `feedback ${isCorrect ? "correct" : "incorrect"}`;
      feedbackElement.textContent = isCorrect ? "✓ 回答正確！" : `✗ 回答錯誤。正確答案是：${correctDisplay}`;
    }

    // 鎖定選項
    if (q.type === "multiple-choice") {
      document.querySelectorAll(".option").forEach((el, idx) => {
        el.style.pointerEvents = "none";
        if (idx === q.correctAnswer) el.classList.add("correct");
        else if (idx === selectedOption && !isCorrect) el.classList.add("incorrect");
      });
    } else if (q.type === "multi-select") {
      const correctSet = new Set(q.correctAnswer);
      document.querySelectorAll(".option").forEach((el, idx) => {
        el.style.pointerEvents = "none";
        if (correctSet.has(idx)) el.classList.add("correct");
        else if (selectedOptions.has(idx)) el.classList.add("incorrect");
      });
    } else {
      const input = $("fill-in-input");
      if (input) {
        input.disabled = true;
        input.classList.add(isCorrect ? "correct" : "incorrect");
      }
    }

    if (submitButton) submitButton.style.display = "none";
    if (nextButton) nextButton.style.display = "block";
  }

  function nextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex >= shuffledQuestions.length) {
      // 無限循環：重新洗牌一輪
      currentQuestionIndex = 0;
      shuffledQuestions = shuffleArray([...originalQuestions]).map(shuffleQuestionOptions);
    }
    displayQuestion();
  }

  /* ========= Download Wrong Book ========= */
  function downloadIncorrectQuestions() {
    if (incorrectQuestions.length === 0) {
      alert("目前沒有錯誤題目可以下載！");
      return;
    }

    const title = document.title || DEFAULT_TITLE;
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const extra = `${currentCatId || "cat"}_${currentBankId || "bank"}`;
    const fileName = `${escapeFileName(title)}_${escapeFileName(extra)}_${dateStr}.json`;

    const payload = {
      meta: {
        title,
        category: { id: currentCatId, name: currentCatName },
        bank: { id: currentBankId, name: currentBankName },
        exportedAt: new Date().toISOString(),
        count: incorrectQuestions.length
      },
      questions: incorrectQuestions
    };

    const jsonData = JSON.stringify(payload, null, 2);
    const blob = new Blob([jsonData], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /* ========= BOOT ========= */
  async function loadFromQuery() {
    const { cat, bank } = getParams();

    const indexAbs = new URL(INDEX_URL, location.href).toString();
    const index = normalizeIndex(await fetchJson(indexAbs));

    // 找分類：若沒有參數，取第一個
    const catObj = index.find(x => x.id === cat) || index[0];
    if (!catObj) throw new Error("banks.index.json 沒有任何分類");

    currentCatId = catObj.id;
    currentCatName = catObj.name;

    const manifestAbs = new URL(catObj.manifest, indexAbs).toString();
    const banksManifest = normalizeBanksManifest(await fetchJson(manifestAbs));

    // 找題庫：若沒有參數，取第一個
    const bankObj = banksManifest.find(x => x.id === bank) || banksManifest[0];
    if (!bankObj) throw new Error(`分類 ${catObj.id} 的 banks.json 沒有任何題庫`);

    currentBankId = bankObj.id;
    currentBankName = bankObj.name;

    // 題庫檔路徑相對 banks.json 解析
    const questionsAbs = new URL(bankObj.file, manifestAbs).toString();
    const rawQuestions = normalizeQuestionsFile(await fetchJson(questionsAbs));

    // 標準化題目
    originalQuestions = rawQuestions.map((q, i) => normalizeQuestion(q, i));

    if (originalQuestions.length === 0) throw new Error("題庫是空的，沒有題目可練習");

    // 產出出題用陣列（洗題目順序 + 洗選項）
    shuffledQuestions = shuffleArray([...originalQuestions]).map(shuffleQuestionOptions);

    // 更新 title（可選）
    document.title = `${currentCatName} / ${currentBankName}`;
  }

  async function init() {
    loadTheme();

    // 綁事件
    if (themeToggle) themeToggle.addEventListener("click", toggleTheme);
    if (submitButton) submitButton.addEventListener("click", checkAnswer);
    if (nextButton) nextButton.addEventListener("click", nextQuestion);
    if (downloadErrorsButton) downloadErrorsButton.addEventListener("click", downloadIncorrectQuestions);

    try {
      await loadFromQuery();

      // reset stats
      totalAnswered = 0;
      correctAnswers = 0;
      incorrectQuestions = [];
      updateStats();

      currentQuestionIndex = 0;
      displayQuestion();

      // ✅ 保險：如果你 system.html 有 loader，但第一題不是 index 0（或你改流程）
      window.dispatchEvent(new Event("system:ready"));
    } catch (err) {
      console.error(err);
      if (feedbackElement) {
        feedbackElement.className = "feedback incorrect";
        feedbackElement.textContent = `題庫載入失敗：${err.message || String(err)}`;
      }
      if (submitButton) submitButton.style.display = "none";
      if (nextButton) nextButton.style.display = "none";
      if (downloadErrorsButton) downloadErrorsButton.style.display = "none";

      // 也把 loader 關掉，避免卡住
      window.dispatchEvent(new Event("system:ready"));
    }
  }

  window.addEventListener("load", init);
})();
