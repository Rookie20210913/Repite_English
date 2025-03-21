const fs = require("fs"); // 檔案套件
// fs.readFile 讀取檔案，但不會阻塞其他程式
// fs.readFileSync 同步讀取檔案，阻塞程式碼執行
// fs.writeFile 非同步寫入檔案，如果檔案不存在，則創建新檔案
// fs.writeFileSync 則是同步版本

const path = require("path");
const readline = require("readline");

// __dirname 檔案所在目錄
//path.join 組合路徑
const filePath = path.join(__dirname, "english_word.txt");  // 確保變數 `filePath` 定義在所有函式可訪問的範圍

// 建立 input output 的 readline 介面
const rl = readline.createInterface({
    // stdin 接收使用者輸入 stdout 將內容輸出終端機
    input: process.stdin,
    output: process.stdout
});

// 新增單字並避免重複逗號
let addWord=(word)=> {
    //trim 移除前後空白 toLowerCase 轉成小寫
    word = word.trim().toLowerCase();
    if (!word) return; // 輸入為空則直接返回

    let existingWords = "";
    if (fs.existsSync(filePath)) { // 檢查文件是否存在
        existingWords = fs.readFileSync(filePath, "utf8").trim();
    }

    // 轉成陣列處理，確保沒有多餘的 ","
    /*
    let wordsArray;
    if (existingWords) {
        wordsArray = existingWords.split(",");
    } else {
        wordsArray = [];
    }
    */
    const wordsArray = existingWords ? existingWords.split(",") : [];
    
    // includes() 查找指定值是否存在陣列
    if (!wordsArray.includes(word)){
        wordsArray.push(word); // node 使用 push 加入陣列
    }
    // 重新組合，確保格式正確
    fs.writeFileSync(filePath, wordsArray.join(","), "utf8");

    console.log(`"${word}" 已寫入 words.txt`);
}

// 互動式輸入
let promptWord=()=> {
    rl.question("輸入英文單字 (輸入 exit 即可寫入離開): ", (word) => {
        if (word.toLowerCase() === "exit") {
            console.log("單字已存入 words.txt，程式結束。");
            rl.close();
            return;
        }
        addWord(word);
        promptWord();
    });
}

// 啟動輸入
promptWord();