from flask import Flask, request, render_template, jsonify
import json, os, uuid, subprocess, time
import sqlite3

DB_PATH = "submit_history.db"

# -------------------------------------------------------------
# 初始化資料庫
# -------------------------------------------------------------
def init_db():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            filename TEXT,
            lang TEXT,
            score INTEGER,
            total INTEGER,
            attempts INTEGER,
            time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()
    conn.close()

init_db()


app = Flask(__name__)

PROB_DIR = "./prob"
UPLOAD_DIR = "./uploads"


# -------------------------------------------------------------
# 記錄作答紀錄
# -------------------------------------------------------------
def record_history(filename, lang, score, total):
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    cur.execute("SELECT COUNT(*) FROM history WHERE filename=? AND lang=?", (filename, lang))
    attempts = cur.fetchone()[0] + 1

    cur.execute(
        "INSERT INTO history (filename, lang, score, total, attempts) VALUES (?, ?, ?, ?, ?)",
        (filename, lang, score, total, attempts)
    )

    conn.commit()
    conn.close()

    return attempts


# -------------------------------------------------------------
# 首頁：題庫分類列表
# -------------------------------------------------------------
@app.route("/")
def index():
    categories = []

    for f in os.listdir(PROB_DIR):
        if f.endswith(".json"):
            path = os.path.join(PROB_DIR, f)
            with open(path, "r", encoding="utf8") as fp:
                data = json.load(fp)

            if "problems" in data:
                count = len(data["problems"])
            else:
                count = 1  # 舊格式

            categories.append({
                "filename": f,
                "count": count
            })

    return render_template("index.html", categories=categories)


# -------------------------------------------------------------
# 顯示題庫內題目列表
# -------------------------------------------------------------
@app.route("/category/<filename>")
def category(filename):
    path = os.path.join(PROB_DIR, filename)
    with open(path, "r", encoding="utf8") as f:
        data = json.load(f)

    # 多題格式
    if "problems" in data:
        problems = data["problems"]
        category_name = data.get("category", filename)
        return render_template("category.html",
                               problems=problems,
                               category=category_name,
                               filename=filename)

    # 舊格式 → 直接跳單題
    return render_template("problem_detail.html", problem=data, filename=filename, pid="single")


# -------------------------------------------------------------
# 顯示某一題（多題格式）
# -------------------------------------------------------------
@app.route("/category/<filename>/<pid>")
def problem(filename, pid):
    path = os.path.join(PROB_DIR, filename)
    with open(path, "r", encoding="utf8") as f:
        data = json.load(f)

    if "problems" in data:
        for p in data["problems"]:
            if p["id"] == pid:
                return render_template(
                    "problem_detail.html",
                    problem=p,
                    filename=filename,
                    pid=pid
                )
        return "題目不存在", 404

    return "此 JSON 不是多題格式", 400


# -------------------------------------------------------------
# 多題版提交答案 /submit/<filename>/<pid>
# -------------------------------------------------------------
@app.route("/submit/<filename>/<pid>", methods=["POST"])
def submit(filename, pid):
    lang = request.form.get("lang")
    file = request.files["code"]

    uid = str(uuid.uuid4())
    save_path = f"{UPLOAD_DIR}/{lang}/{uid}.{ 'py' if lang=='python' else 'java'}"
    file.save(save_path)

    result = run_test(filename, pid, save_path, lang)

    # attempts 記錄使用 filename_pid 做區分
    attempts = record_history(filename + "_" + pid, lang, result["score"], result["total"])
    result["attempts"] = attempts

    return jsonify(result)


# -------------------------------------------------------------
# 支援多題版本的 run_test
# -------------------------------------------------------------
def run_test(filename, pid, code_path, lang):
    prob_path = os.path.join(PROB_DIR, filename)
    with open(prob_path, "r", encoding="utf8") as f:
        data = json.load(f)

    # 找題目
    target = None
    if "problems" in data:
        for p in data["problems"]:
            if p["id"] == pid:
                target = p
                break
    else:
        target = data  # fallback（舊格式）

    if not target:
        return {"score": 0, "total": 0, "details": []}

    testCases = target["testCases"]
    call = target["call"]

    outputs = []
    score = 0

    for case in testCases:
        inp = case["input"]
        expected = case["expected"]

        out = run_code(lang, code_path, call, inp)

        passed = (str(out) == str(expected))
        if passed:
            score += 1

        outputs.append({
            "input": inp,
            "expected": expected,
            "output": out,
            "passed": passed
        })

    return {
        "score": score,
        "total": len(testCases),
        "details": outputs
    }


# -------------------------------------------------------------
# 改善錯誤訊息的 sandbox 執行
# -------------------------------------------------------------
def run_code(lang, code_path, call, inp):
    try:
        if lang == "python":
            out = subprocess.check_output(
                ["python", "sandbox/run_python.py", code_path, call, str(inp)],
                stderr=subprocess.STDOUT,
                timeout=2
            )
            return out.decode("utf8").strip()

        elif lang == "java":
            out = subprocess.check_output(
                ["python", "sandbox/run_java.py", code_path, call, str(inp)],
                stderr=subprocess.STDOUT,
                timeout=3
            )
            return out.decode("utf8").strip()

    except subprocess.CalledProcessError as e:
        err = e.output.decode()

        # Python 常見錯誤美化
        if "SyntaxError" in err:
            return "❌ Syntax Error：語法錯誤"
        if "NameError" in err:
            return "❌ Name Error：未定義變數"
        if "TypeError" in err:
            return "❌ Type Error：資料型態不匹配"
        if "ZeroDivisionError" in err:
            return "❌ Runtime Error：除以零錯誤"

        # 取最後一行最重要
        return "❌ Error：" + err.splitlines()[-1]

    except subprocess.TimeoutExpired:
        return "⏳ TIMEOUT：執行超時（2 秒）"

    except Exception as e:
        return f"❌ Unexpected Error：{str(e)}"


# -------------------------------------------------------------
# 啟動 Flask
# -------------------------------------------------------------
if __name__ == "__main__":
    app.run(debug=True)
