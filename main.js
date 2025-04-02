const repite = require("./repite");
const express=require('express');

const app=express();
const port=3000;
app.set('view engine','ejs');

app.get('/',async(req,res)=>{
   try{
        const wordData=await repite.start();
        res.json(wordData);
        console.log("爬取完畢");
   } catch (error){
        console.error("爬取資料錯誤:",error);
        res.status(500).send("內部錯誤");
   }
});

/*
const start=async(){
    
};
*/

app.listen(port,'0.0.0.0',()=>{
    console.log(`Server running`);
})