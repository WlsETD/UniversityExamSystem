/* ============================================================
   Java → JavaScript Execution Engine (Enhanced Judge Version)
   支援：
   - Scanner (next / nextInt / nextDouble / nextLine)
   - System.out.print / println
   - int / long / double / boolean / String / StringBuilder
   - 一維 / 二維 int / long / double / boolean / String 陣列
   - for-each：for (int v : arr) / for (long v : arr) / for (char c : s.toCharArray()) ...
   - Arrays.sort / Arrays.copyOfRange / Arrays.binarySearch
   - 忽略基本型別 cast：(int)、(double)、(long)… → 直接移除
   - static 輔助函式（例如 isPrime）
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
   4. 前處理：移除 package / import / 單行註解
============================================================ */
function javaPreprocess(javaCode) {
    let code = javaCode.replace(/\r\n/g, "\n");
    // 移除單行註解
    code = code.replace(/\/\/.*$/gm, "");
    // 移除 package / import
    code = code.replace(/package\s+[^{;]+;/g, "");
    code = code.replace(/import\s+[^;]+;/g, "");
    return code;
}

/* ============================================================
   5. 取出 class 內部內容（忽略外層 class 包裝）
============================================================ */
function stripOuterClass(javaCode) {
    const m = javaCode.match(/\bclass\s+[A-Za-z_][A-Za-z0-9_]*\s*{/);
    if (!m) return javaCode;

    const startBrace = javaCode.indexOf("{", m.index);
    if (startBrace === -1) return javaCode;

    let depth = 1;
    let i = startBrace + 1;
    while (i < javaCode.length) {
        const c = javaCode[i];
        if (c === "{") depth++;
        else if (c === "}") depth--;
        if (depth === 0) return javaCode.substring(startBrace + 1, i);
        i++;
    }
    return javaCode;
}

/* ============================================================
   6.1 for-each 轉換器：
       for (type v : expr)  →  for (let v of expr)
       支援 expr = 陣列 / 方法呼叫（如 s.toCharArray()）
============================================================ */
function transformForEachLoops(code) {
    let out = "";
    let i = 0;
    const n = code.length;
    const identRe = /[A-Za-z0-9_]/;

    while (i < n) {
        const idx = code.indexOf("for", i);
        if (idx === -1) {
            out += code.slice(i);
            break;
        }

        // 先把 "for" 前面的片段寫出
        out += code.slice(i, idx);

        const before = idx > 0 ? code[idx - 1] : "";
        const after = idx + 3 < n ? code[idx + 3] : "";

        // 不是獨立關鍵字 for，就略過（例如 "format"）
        if ((before && identRe.test(before)) || (after && identRe.test(after))) {
            out += "for";
            i = idx + 3;
            continue;
        }

        // 寫入 "for"
        out += "for";
        let j = idx + 3;

        // 保留空白
        while (j < n && /\s/.test(code[j])) {
            out += code[j];
            j++;
        }

        // 不符合 for(...)，直接跳過
        if (j >= n || code[j] !== "(") {
            i = j;
            continue;
        }

        // 解析 () 內容，取得整個 header
        const start = j;
        let depth = 0;
        let k = j;
        let inString = false;
        let quote = "";

        while (k < n) {
            const c = code[k];
            if (!inString && (c === '"' || c === "'")) {
                inString = true;
                quote = c;
            } else if (inString) {
                if (c === "\\" && k + 1 < n) {
                    k++; // 跳過 escaped 字元
                } else if (c === quote) {
                    inString = false;
                }
            } else {
                if (c === "(") depth++;
                else if (c === ")") {
                    depth--;
                    if (depth === 0) break;
                }
            }
            k++;
        }

        if (k >= n || depth !== 0) {
            // 括號沒配好，就原樣輸出
            out += code.slice(start, k);
            i = k;
            continue;
        }

        const header = code.slice(start + 1, k); // () 內的內容
        let newHeader = header;

        // for-each 不會有 ';'，有 ';' 的就是傳統 for
        if (!header.includes(";")) {
            const m = header
                .trim()
                .match(
                    /^\s*(?:final\s+)?(?:int|long|double|float|short|byte|char|boolean|String)\s+([A-Za-z_][A-Za-z0-9_]*)\s*:\s*(.+)$/s
                );
            if (m) {
                const varName = m[1];
                const expr = m[2].trim();
                newHeader = `let ${varName} of ${expr}`;
            }
        }

        out += "(" + newHeader + ")";
        i = k + 1;
    }

    return out;
}

/* ============================================================
   6. Java → JS 轉譯（處理型別、陣列、for-each 等）
============================================================ */
function javaToJsTranspileSimple(code) {
    // 先處理 for-each（包含字串 toCharArray 等複雜表達式）
    code = transformForEachLoops(code);

    code = code.replace(/\r\n/g, "\n");

    // 移除基本型別 cast：(int) / (double) / (long) / ...
    code = code.replace(
        /\(\s*(int|double|long|float|short|byte|boolean|char)\s*\)/g,
        ""
    );

    // Scanner
    code = code.replace(
        /Scanner\s+([A-Za-z_][A-Za-z0-9_]*)\s*=\s*new\s+Scanner\(System\.in\);/g,
        "let $1 = new JavaScanner(__input__);"
    );

    // 陣列 / 變數宣告（先處理帶 [] 的）
    code = code.replace(/\bint\s*\[\s*\]\s*\[\s*\]\s+([A-Za-z_][A-Za-z0-9_]*)/g, "let $1");
    code = code.replace(/\bint\s*\[\s*\]\s+([A-Za-z_][A-Za-z0-9_]*)/g, "let $1");
    code = code.replace(/\bdouble\s*\[\s*\]\s+([A-Za-z_][A-Za-z0-9_]*)/g, "let $1");
    code = code.replace(/\bboolean\s*\[\s*\]\s+([A-Za-z_][A-Za-z0-9_]*)/g, "let $1");
    code = code.replace(/\bString\s*\[\s*\]\s+([A-Za-z_][A-Za-z0-9_]*)/g, "let $1");

    // 其他基本型別陣列宣告 long / float / short / byte / char
    code = code.replace(/\b(long|float|short|byte|char)\s*\[\s*\]\s*\[\s*\]\s+([A-Za-z_][A-Za-z0-9_]*)/g, "let $2");
    code = code.replace(/\b(long|float|short|byte|char)\s*\[\s*\]\s+([A-Za-z_][A-Za-z0-9_]*)/g, "let $2");

    // StringBuilder 變數
    code = code.replace(/\bStringBuilder\s+([A-Za-z_][A-Za-z0-9_]*)/g, "let $1");

    // 一般標量變數
    code = code.replace(/\bint\s+([A-Za-z_][A-Za-z0-9_]*)/g, "let $1");
    code = code.replace(/\bdouble\s+([A-Za-z_][A-Za-z0-9_]*)/g, "let $1");
    code = code.replace(/\bboolean\s+([A-Za-z_][A-Za-z0-9_]*)/g, "let $1");
    code = code.replace(/\bString\s+([A-Za-z_][A-Za-z0-9_]*)/g, "let $1");
    // long / float / short / byte / char scalar
    code = code.replace(/\b(long|float|short|byte|char)\s+([A-Za-z_][A-Za-z0-9_]*)/g, "let $2");

    // 多維 / 一維陣列建立
    code = code.replace(
        /new\s+int\s*\[\s*([^\]]+)\s*\]\s*\[\s*([^\]]+)\s*\]/g,
        "Array.from({length: $1}, () => new Array($2).fill(0))"
    );
    code = code.replace(/new\s+int\s*\[\s*([^\]]+)\s*\]/g, "new Array($1).fill(0)");
    code = code.replace(/new\s+double\s*\[\s*([^\]]+)\s*\]/g, "new Array($1).fill(0)");
    code = code.replace(/new\s+boolean\s*\[\s*([^\]]+)\s*\]/g, "new Array($1).fill(false)");
    code = code.replace(/new\s+String\s*\[\s*([^\]]+)\s*\]/g, "new Array($1).fill(\"\")");

    // 其他基本型別陣列建立 long / float / short / byte / char
    code = code.replace(
        /new\s+(long|float|short|byte|char)\s*\[\s*([^\]]+)\s*\]\s*\[\s*([^\]]+)\s*\]/g,
        "Array.from({length: $2}, () => new Array($3).fill(0))"
    );
    code = code.replace(
        /new\s+(long|float|short|byte|char)\s*\[\s*([^\]]+)\s*\]/g,
        "new Array($2).fill(0)"
    );

    // length() → length
    code = code.replace(/\.length\(\)/g, ".length");

    // 陣列大括號初始化：int[] a = {1,2,3}; → let a = [1,2,3];
    code = code.replace(/=\s*{([^}]+)}/g, "= [$1]");

    return code;
}

/* ============================================================
   7. 參數列表：去掉型別，只留下變數名稱
============================================================ */
function convertParamsToJs(paramStr) {
    paramStr = paramStr.trim();
    if (!paramStr) return "";
    const parts = paramStr.split(",").map(p => p.trim()).filter(Boolean);
    const names = [];

    for (let p of parts) {
        // 移除泛型 <...>、final 等
        p = p.replace(/<[^>]+>/g, "");
        p = p.replace(/\bfinal\b/g, "").trim();
        const m = p.match(/([A-Za-z_][A-Za-z0-9_]*)\s*$/);
        names.push(m ? m[1] : "p");
    }
    return names.join(", ");
}

/* ============================================================
   8. 把 static 方法（包含 main）轉成 JS function
============================================================ */
function transformStaticMethods(classBody) {
    const jsChunks = [];
    const reMethod =
        /(public\s+|private\s+|protected\s+)?static\s+([A-Za-z0-9_<>\[\]]+)\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(([^)]*)\)\s*\{/gm;

    let idx = 0;
    let mainFound = false;
    let match;

    while ((match = reMethod.exec(classBody)) !== null) {
        const before = classBody.slice(idx, match.index);
        if (before.trim()) {
            jsChunks.push(javaToJsTranspileSimple(before));
        }

        const name = match[3];
        const paramsStr = match[4];

        const braceStart = reMethod.lastIndex - 1; // '{'
        let depth = 1;
        let i = braceStart + 1;

        while (i < classBody.length && depth > 0) {
            const c = classBody[i];
            if (c === "{") depth++;
            else if (c === "}") depth--;
            i++;
        }

        const body = classBody.slice(braceStart + 1, i - 1);
        idx = i;

        const bodyJs = javaToJsTranspileSimple(body);

        if (name === "main") {
            mainFound = true;
            jsChunks.push(
                "function __java_main__() {\n" +
                bodyJs +
                "\n}\n"
            );
        } else {
            const jsParams = convertParamsToJs(paramsStr);
            jsChunks.push(
                "function " + name + "(" + jsParams + ") {\n" +
                bodyJs +
                "\n}\n"
            );
        }
    }

    const tail = classBody.slice(idx);
    if (tail.trim()) {
        jsChunks.push(javaToJsTranspileSimple(tail));
    }

    let fullJs = jsChunks.join("\n");

    // 如果沒找到 main，就把整個 class 當作 main body
    if (!mainFound) {
        fullJs = "function __java_main__() {\n" + fullJs + "\n}\n";
    }

    return fullJs;
}

/* ============================================================
   9. 執行 Java main()
============================================================ */
async function runJavaCode(javaCode, inputText) {
    // 每次執行重置輸出
    System.out = new JavaPrintStream();

    return javaRunWithTimeout(
        () =>
            new Promise((resolve, reject) => {
                try {
                    const cleaned = javaPreprocess(javaCode);
                    const classBody = stripOuterClass(cleaned);
                    const jsCode = transformStaticMethods(classBody);

                    const wrapped =
                        jsCode +
                        "\n__java_main__();";

                    const fn = new Function("__input__", wrapped);
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
   10. 對外 API
============================================================ */
async function runJavaWithInput(code, input) {
    try {
        return await runJavaCode(code, input);
    } catch (e) {
        return e.toString();
    }
}

if (typeof window !== "undefined") {
    window.runJavaWithInput = runJavaWithInput;
    window.dispatchEvent(new Event("java-engine-ready"));
    console.log("[Java Engine] Ready ✔");
}
