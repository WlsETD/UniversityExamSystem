/* ============================================================
   Java → JavaScript Execution Engine (Final Stable Version)
   修復：main 擷取錯誤 / print 破壞 parentheses / args[] / ...
============================================================ */

console.log("[Java Engine] Initializing...");

/* ============================================================
   0. Timeout Wrapper
============================================================ */
function javaRunWithTimeout(fn, ms) {
    return Promise.race([
        new Promise((resolve, reject) =>
            setTimeout(() => reject("⏳ Java Time Limit Exceeded (2000ms)"), ms)
        ),
        fn()
    ]);
}

/* ============================================================
   1. Scanner 模擬器
============================================================ */
class JavaScanner {
    constructor(input) {
        this.data = input.split(/\s+/);
        this.i = 0;
    }
    next() { return this.data[this.i++]; }
    nextInt() { return parseInt(this.data[this.i++]); }
    nextDouble() { return parseFloat(this.data[this.i++]); }
    nextLine() { return this.data[this.i++]; }
}

/* ============================================================
   2. System.out 模擬器
============================================================ */
class JavaPrintStream {
    constructor() { this.output = ""; }
    print(x) { this.output += (x !== undefined ? x : ""); }
    println(x="") { this.output += (x !== undefined ? x : "") + "\n"; }
}

const System = { out: new JavaPrintStream() };


/* ============================================================
   3. 強化括號擷取器
============================================================ */
function extractParenthesis(code, startIndex) {
    let i = startIndex;
    let depth = 0;
    let inside = false;
    let quote = "";
    let content = "";

    while (i < code.length) {
        const c = code[i];

        // 字串處理
        if (!inside && (c === '"' || c === "'")) {
            inside = true;
            quote = c;
            content += c;
            i++;
            continue;
        }
        if (inside) {
            content += c;
            if (c === "\\" && i+1 < code.length) {
                content += code[i+1];
                i+=2;
                continue;
            }
            if (c === quote) inside = false;
            i++;
            continue;
        }

        // 括號深度
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

/* ============================================================
   4. print/println 重建器
============================================================ */
function enhancePrintReplace(code, name) {
    let result = "";
    let i = 0;

    while (i < code.length) {
        if (code.startsWith(name, i)) {
            result += name;
            i += name.length;

            while (/\s/.test(code[i])) i++;

            if (code[i] !== "(") continue;

            const parsed = extractParenthesis(code, i);
            if (!parsed) return code;

            const args = parsed.content;
            i = parsed.endIndex + 1;

            while (/\s/.test(code[i])) i++;
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

    code = code.replace(/package\s+.*?;/g, "");
    code = code.replace(/import\s+.*?;/g, "");

    // Scanner
    code = code.replace(
        /Scanner\s+([A-Za-z0-9_]+)\s*=\s*new\s+Scanner\(System\.in\);/g,
        `let $1 = new JavaScanner(__input__);`
    );

    // 型別 → let
    code = code.replace(/\bint\s+([A-Za-z0-9_]+)/g, "let $1");
    code = code.replace(/\bdouble\s+([A-Za-z0-9_]+)/g, "let $1");
    code = code.replace(/\bboolean\s+([A-Za-z0-9_]+)/g, "let $1");
    code = code.replace(/\bString\s+([A-Za-z0-9_]+)/g, "let $1");

    // 字串方法
    code = code.replace(/\.length\(\)/g, ".length");

    // 陣列
    code = code.replace(/new\s+int\s*\[\s*([0-9]+)\s*\]/g, "new Array($1).fill(0)");

    // print/println
    code = fixPrintSystem(code);

    return code;
}


/* ============================================================
   6. main() 擷取修正版（吃到最後一個大括號）
============================================================ */
function extractMainBody(javaCode) {

    const mainIndex = javaCode.search(/public\s+static\s+void\s+main/);
    if (mainIndex === -1) return null;

    const braceIndex = javaCode.indexOf("{", mainIndex);
    if (braceIndex === -1) return null;

    let depth = 1;
    let i = braceIndex + 1;

    while (i < javaCode.length) {
        if (javaCode[i] === "{") depth++;
        else if (javaCode[i] === "}") depth--;

        if (depth === 0) {
            const body = javaCode.substring(braceIndex + 1, i);
            return body;
        }
        i++;
    }

    return null;
}


/* ============================================================
   7. 執行 Java main()
============================================================ */
async function runJavaCode(javaCode, inputText) {
    System.out = new JavaPrintStream();

    return javaRunWithTimeout(() => new Promise((resolve, reject) => {

        try {
            const body = extractMainBody(javaCode);
            if (!body) return reject("⚠ 無法找到 main 方法");

            const transpiled = javaToJsTranspile(body);

            const fn = new Function("__input__", transpiled);
            fn(inputText);

            resolve(System.out.output.trim());

        } catch (err) {
            reject("⚠ Java 執行錯誤：" + err);
        }

    }), 2000);
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

console.log("[Java Engine] Loaded ✔");
window.dispatchEvent(new Event("java-engine-ready"));