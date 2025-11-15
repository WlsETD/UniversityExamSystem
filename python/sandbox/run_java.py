import os, sys, subprocess, uuid, shutil

code_path = sys.argv[1]
func_name = sys.argv[2]
arg = sys.argv[3]

uid = str(uuid.uuid4())
sandbox = "./sandbox/javarun"
os.makedirs(sandbox, exist_ok=True)

new_file = f"{sandbox}/{uid}.java"
shutil.copy(code_path, new_file)

compile_result = subprocess.run(["javac", new_file], capture_output=True)
if compile_result.returncode != 0:
    print("COMPILE ERROR")
    print(compile_result.stderr.decode())
    sys.exit()

# 假設 class 名稱是 Main
run_result = subprocess.run(
    ["java", "-cp", sandbox, "Main", func_name, arg],
    capture_output=True
)

print(run_result.stdout.decode())
