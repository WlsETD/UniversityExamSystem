import os
import time
import subprocess
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
from datetime import datetime

# === 1️⃣ 修改這裡：你的專案資料夾 ===
FOLDER = r"C:\Users\willli\OneDrive\桌面\網頁設計\段考練習系統"

# === 2️⃣ 上傳分支（通常是 main） ===
BRANCH = "main"

# === 3️⃣ 日誌檔案 ===
LOG_FILE = os.path.join(FOLDER, "sync_log.txt")

def log(message):
    """紀錄同步狀態到檔案與終端"""
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    text = f"[{now}] {message}"
    print(text)
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(text + "\n")

def run_cmd(cmd):
    """執行指令並回傳成功與否"""
    result = subprocess.run(cmd, shell=True, cwd=FOLDER)
    return result.returncode == 0

def git_sync():
    """執行 Git 同步流程"""
    log("🔄 檢測到檔案變更，開始同步...")
    if not run_cmd("git add ."):
        log("❌ 無法執行 git add")
        return
    run_cmd('git commit -m "auto sync"')
    # 嘗試上傳最多3次
    for i in range(3):
        if run_cmd(f"git pull origin {BRANCH} --rebase") and run_cmd(f"git push origin {BRANCH}"):
            log("✅ 同步成功！")
            return
        else:
            log(f"⚠️ 第 {i+1} 次同步失敗，3 秒後重試...")
            time.sleep(3)
    log("❌ 多次嘗試仍失敗，請檢查網路或權限設定。")

class AutoSyncHandler(FileSystemEventHandler):
    def on_any_event(self, event):
        if not event.is_directory:
            git_sync()

if __name__ == "__main__":
    log(f"🟢 開始監控資料夾：{FOLDER}")
    event_handler = AutoSyncHandler()
    observer = Observer()
    observer.schedule(event_handler, FOLDER, recursive=True)
    observer.start()

    try:
        while True:
            time.sleep(2)
    except KeyboardInterrupt:
        log("🛑 停止監控")
        observer.stop()
    observer.join()
