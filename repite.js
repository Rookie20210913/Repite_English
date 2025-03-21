const fs=require('fs');
const path=require('path');
const puppeteer=require('puppeteer');

const path_file=path.join(__dirname,'test.txt');
const url="https://dictionary.cambridge.org/zht/%E8%A9%9E%E5%85%B8/%E8%8B%B1%E8%AA%9E-%E6%BC%A2%E8%AA%9E-%E7%B9%81%E9%AB%94";


let getWords=()=>{ // 檢查 english_txt 文件是否存在
    if (fs.existsSync(path_file)){
        const data=fs.readFileSync(path_file,'utf-8').trim();
        return data ? data.split(",") : [];
    }else{
        console.log("english_txt 不存在");
        return [];
    };
};

// 爬取劍橋字典
async function fetchWordData(word) {
    const Url_combine=`${url}/${word}`;
    console.log(Url_combine);

    const browser = await puppeteer.launch({ headless: "new" }); // new 是新模式，可以更好的繞開反爬蟲
    const page = await browser.newPage();

    try {
        await page.goto(Url_combine, { waitUntil: "domcontentloaded" }); // waitUntil 查

        const pos=await page.$eval(".pos-header .pos.dpos", el => el.innerText.trim()); //page.  查
        const ipaList=await page.$$eval(".pos-header .ipa.dipa.lpr-2.lpl-1", elements =>  // elements 之後的查看用法
            elements.map(el => el.innerText.replace(/\//g, "").trim())  // innerText 查  replace 查

        );
        const ukIPA=ipaList[0] || "N/A";  // 查
        const usIPA=ipaList[1] || "N/A";
        console.log(`單字: ${word}\t詞性: ${pos}\tUK 發音: /${ukIPA}/\t US 發音: /${usIPA}/`);
        
        
        // 抓取所有的解釋區塊
        const wordDefinitions = await page.$$eval('.def-block.ddef_block', blocks => {
            return blocks.map(block => {
                // 抓取英文解釋
                const englishDefinitions = block.querySelectorAll('.def.ddef_d.db');
                const englishTexts = Array.from(englishDefinitions).map(el => el.innerText.trim());

                // 抓取中文翻譯
                const chineseTranslations = block.querySelectorAll('.trans.dtrans.dtrans-se .dtrans');
                const chineseTexts = Array.from(chineseTranslations).map(el => el.innerText.trim());

                // 每個英文解釋都可能對應多個中文翻譯
                return englishTexts.map((english, index) => ({
                    english: english,
                    chinese: chineseTexts.join('; ') || "無翻譯" // 這裡是將所有翻譯合併為一個字符串
                }));
            });
        });

        // 顯示所有解釋和翻譯
        wordDefinitions.flat().forEach((definition, index) => {
            console.log(`解釋 ${index + 1}:`);
            console.log(`英文: ${definition.english}`);
            console.log(`中文: ${definition.chinese}`);
            console.log('-------------------------');
        });

        console.log("\n\n句子部分\n\n")


        // 抓取所有英文句子和翻譯
        const exampleSentences = await page.$$eval('.examp.dexamp', blocks => {
            return blocks.map(block => {
                const englishSentence = block.querySelector('.eg.deg') ? block.querySelector('.eg.deg').innerText.trim() : null;
                const chineseTranslation = block.querySelector('.trans.dtrans.dtrans-se') ? block.querySelector('.trans.dtrans.dtrans-se').innerText.trim() : null;
                return { english: englishSentence, chinese: chineseTranslation };
            });
        });

        // 顯示英文句子和翻譯
        exampleSentences.forEach((sentence, index) => {
            console.log(`例句 ${index + 1}:`);
            console.log(`英文: ${sentence.english}`);
            console.log(`中文: ${sentence.chinese}`);
            console.log('-------------------------');
        });




    } catch (error) {
        console.log(`⚠️ 無法取得「${word}」的資訊`);
    } finally {
        await browser.close();
    }
}

// 主執行函式
async function start() {
    const words = getWords();

    if (words.length === 0) {
        console.log("❌ 沒有單字需要爬取");
        return;
    }

    for (const word of words) {
        await fetchWordData(word);
    }
}

//module.exports = { start };

fetchWordData("abstract");