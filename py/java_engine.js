/* ============================================================
   Java → JavaScript Execution Engine (Enhanced Judge Version)
   支援：
   - Scanner (next / nextInt / nextDouble / nextLine)
   - System.out.print / println
   - int / double / boolean / String / StringBuilder
   - 一維 / 二維 int / boolean / String 陣列
   - for-each：for (int v : arr)
   - Arrays.sort / Arrays.copyOfRange / Arrays.binarySearch
============================================================ */

console.log("[Java Engine] Initializing...");

/* ============================================================
   0. Timeout Wrapper
============================================================ */
function javaRunWithTimeout(fn, ms) {
    return Promise.race([
        new Promise((_, reject) =>
            setTimeout(() => reject("⏳ Java Time Limit Exceeded (" + ms + "ms)"), ms)
        ),
        fn()
    ]);
}

/* ============================================================
   1. Scanner 模擬器
============================================================ */
class JavaScanner {
    constructor(input) {
        this.raw = input || "";
        this.data = this.raw.split(/\s+/).filter(t => t.length > 0);
        this.i = 0;
        this.lines = this.raw.split(/\r?\n/);
        this.li = 0;
    }
    next() {
        if (this.i < this.data.length) return this.data[this.i++];
        return "";
    }
    nextInt() {
        const v = parseInt(this.next(), 10);
        return isNaN(v) ? 0 : v;
    }
    nextDouble() {
        const v = parseFloat(this.next());
        return isNaN(v) ? 0 : v;
    }
    nextLine() {
        if (this.li < this.lines.length) return this.lines[this.li++];
        return "";
    }
}

// 讓 new Function 也能找到
globalThis.JavaScanner = JavaScanner;

/* ============================================================
   2. System.out 模擬器
============================================================ */
class JavaPrintStream {
    constructor() {
        this.output = "";
    }
    print(x) {
        if (x !== undefined) this.output += String(x);
    }
    println(x = "") {
        if (x !== undefined) this.output += String(x);
        this.output += "\n";
    }
}

const System = { out: new JavaPrintStream() };
globalThis.System = System;

/* ============================================================
   3. Java 標準工具：Arrays / StringBuilder
============================================================ */
const Arrays = {
    sort(arr) {
        if (!Array.isArray(arr)) return;
        arr.sort((a, b) => a - b);
    },
    copyOfRange(arr, from, to) {
        // to 為排除上界
        return arr.slice(from, to);
    },
    binarySearch(arr, key) {
        let l = 0, r = arr.length - 1;
        while (l <= r) {
            const m = (l + r) >> 1;
            if (arr[m] === key) return m;
            if (arr[m] < key) l = m + 1;
            else r = m - 1;
        }
        return -1;
    }
};
globalThis.Arrays = Arrays;

class StringBuilder {
    constructor(initial = "") {
        this._s = String(initial);
    }
    append(v) {
        this._s += String(v);
        return this;
    }
    toString() {
        return this._s;
    }
}
globalThis.StringBuilder = StringBuilder;

/* ============================================================
   4. 括號擷取器（給 print/println 用）
============================================================ */
function extractParenthesis(code, startIndex) {
    let i = startIndex;
    let depth = 0;
    let inString = false;
    let quote = "";
    let content = "";

    while (i < code.length) {
        const c = code[i];

        if (!inString && (c === '"' || c === "'")) {
            inString = true;
            quote = c;
            content += c;
            i++;
            continue;
        }
        if (inString) {
            content += c;
            if (c === "\\" && i + 1 < code.length) {
                content += code[i + 1];
                i += 2;
                continue;
            }
            if (c === quote) inString = false;
            i++;
            continue;
        }

        if (c === "(") {
            depth++;
            if (depth > 1) content += c;
        } else if (c === ")") {
            depth--;
            if (depth === 0) {
                return { content, endIndex: i };
            }
            content += c;
        } else {
            content += c;
        }
        i++;
    }
    return null;
}

function enhancePrintReplace(code, name) {
    let result = "";
    let i = 0;

    while (i < code.length) {
        if (code.startsWith(name, i)) {
            result += name;
            i += name.length;

            // 找 "("
            while (i < code.length && /\s/.test(code[i])) i++;
            if (code[i] !== "(") {
                continue; // 非合法呼叫，直接略過
            }

            const parsed = extractParenthesis(code, i);
            if (!parsed) return code; // 放棄強化，回傳原始 code

            const args = parsed.content;
            i = parsed.endIndex + 1;

            // 吃掉後面的空白與多餘分號
            while (i < code.length && /\s/.test(code[i])) i++;
            if (code[i] === ";") i++;

            result += "(" + args + ");";
        } else {
            result += code[i++];
        }
    }
    return result;
}

function fixPrintSystem(code) {
    code = enhancePrintReplace(code, "System.out.println");
    code = enhancePrintReplace(code, "System.out.print");
    return code;
}

/* ============================================================
   5. Java → JS 轉譯器
============================================================ */
function javaToJsTranspile(code) {
    // 標準化換行
    code = code.replace(/\r\n/g, "\n");

    // 移除 package / import
    code = code.replace(/package\s+[^{;]+;/g, "");
    code = code.replace(/import\s+[^;]+;/g, "");

    // Scanner
    code = code.replace(
        /Scanner\s+([A-Za-z_][A-Za-z0-9_]*)\s*=\s*new\s+Scanner\(System\.in\);/g,
        "let $1 = new JavaScanner(__input__);"
    );

    // 將 printf 降級成 print
    code = code.replace(/System\.out\.printf/g, "System.out.print");

    // for-each：for (int v : arr)
    code = code.replace(
        /for\s*\(\s*int\s+([A-Za-z_][A-Za-z0-9_]*)\s*:\s*([A-Za-z_][A-Za-z0-9_]*)\s*\)/g,
        "for (let $1 of $2)"
    );

    // 陣列宣告（要先處理帶 [] 的，避免被下面的一般 int 取代）
    code = code.replace(/\bint\s*\[\s*\]\s*\[\s*\]\s+([A-Za-z_][A-Za-z0-9_]*)/g, "let $1");
    code = code.replace(/\bint\s*\[\s*\]\s+([A-Za-z_][A-Za-z0-9_]*)/g, "let $1");
    code = code.replace(/\bdouble\s*\[\s*\]\s+([A-Za-z_][A-Za-z0-9_]*)/g, "let $1");
    code = code.replace(/\bboolean\s*\[\s*\]\s+([A-Za-z_][A-Za-z0-9_]*)/g, "let $1");
    code = code.replace(/\bString\s*\[\s*\]\s+([A-Za-z_][A-Za-z0-9_]*)/g, "let $1");

    // 一般變數宣告
    code = code.replace(/\bStringBuilder\s+([A-Za-z_][A-Za-z0-9_]*)/g, "let $1");
    code = code.replace(/\bint\s+([A-Za-z_][A-Za-z0-9_]*)/g, "let $1");
    code = code.replace(/\bdouble\s+([A-Za-z_][A-Za-z0-9_]*)/g, "let $1");
    code = code.replace(/\bboolean\s+([A-Za-z_][A-Za-z0-9_]*)/g, "let $1");
    code = code.replace(/\bString\s+([A-Za-z_][A-Za-z0-9_]*)/g, "let $1");

    // 多維 / 一維陣列建立：先 2D 再 1D
    code = code.replace(
        /new\s+int\s*\[\s*([^\]]+)\s*\]\s*\[\s*([^\]]+)\s*\]/g,
        "Array.from({length: $1}, () => new Array($2).fill(0))"
    );

    code = code.replace(/new\s+int\s*\[\s*([^\]]+)\s*\]/g, "new Array($1).fill(0)");
    code = code.replace(/new\s+double\s*\[\s*([^\]]+)\s*\]/g, "new Array($1).fill(0)");
    code = code.replace(/new\s+boolean\s*\[\s*([^\]]+)\s*\]/g, "new Array($1).fill(false)");
    code = code.replace(/new\s+String\s*\[\s*([^\]]+)\s*\]/g, "new Array($1).fill(\"\")");

    // length() → length
    code = code.replace(/\.length\(\)/g, ".length");

    // 強化 System.out.print / println
    code = fixPrintSystem(code);

    return code;
}

/* ============================================================
   6. 擷取 main(...) 的程式本體
============================================================ */
function extractMainBody(javaCode) {
    const mainIndex = javaCode.search(/public\s+static\s+void\s+main/);
    if (mainIndex === -1) return null;

    const braceIndex = javaCode.indexOf("{", mainIndex);
    if (braceIndex === -1) return null;

    let depth = 1;
    let i = braceIndex + 1;

    while (i < javaCode.length) {
        const c = javaCode[i];
        if (c === "{") depth++;
        else if (c === "}") depth--;

        if (depth === 0) {
            return javaCode.substring(braceIndex + 1, i);
        }
        i++;
    }
    return null;
}

/* ============================================================
   7. 執行 Java main()
============================================================ */
async function runJavaCode(javaCode, inputText) {
    // 每次執行重置輸出
    System.out = new JavaPrintStream();

    return javaRunWithTimeout(
        () =>
            new Promise((resolve, reject) => {
                try {
                    const body = extractMainBody(javaCode);
                    if (!body) return reject("⚠ 無法找到 main 方法");

                    const transpiled = javaToJsTranspile(body);
                    // 想 debug 可以打開：
                    // console.log("[Transpiled]\\n" + transpiled);

                    const fn = new Function("__input__", transpiled);
                    fn(inputText || "");

                    resolve(System.out.output.trim());
                } catch (err) {
                    reject("⚠ Java 執行錯誤：" + err);
                }
            }),
        2000
    );
}

/* ============================================================
   8. 對外 API
============================================================ */
async function runJavaWithInput(code, input) {
    try {
        return await runJavaCode(code, input);
    } catch (e) {
        return e.toString();
    }
}

// 掛到 window，跟原來一樣給外面呼叫
if (typeof window !== "undefined") {
    window.runJavaWithInput = runJavaWithInput;
    window.dispatchEvent(new Event("java-engine-ready"));
    console.log("[Java Engine] Ready ✔");
}
