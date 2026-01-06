import importlib.util
import sys

code_path = sys.argv[1]
func_name = sys.argv[2]
arg = sys.argv[3]

spec = importlib.util.spec_from_file_location("usercode", code_path)
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)

func = getattr(module, func_name)
result = func(eval(arg))
print(result)
