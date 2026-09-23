require("dotenv").config();
const express=require("express"),cors=require("cors");
const app=express(); app.use(cors()); app.use(express.json());
let devices=[],news=[
{id:"1",cat:"भारत",time:"10 min ago",title:"सरकार ने नई डिजिटल पहल का ऐलान किया",summary:"नई पहल का उद्देश्य डिजिटल सेवाओं को आम लोगों तक आसान तरीके से पहुंचाना है।",source:"Licious News",url:"https://news.google.com/"},
{id:"2",cat:"बिजनेस",time:"25 min ago",title:"भारतीय बाजार में निवेशकों की नजर चुनिंदा सेक्टर्स पर",summary:"निवेशक कई प्रमुख सेक्टर्स पर नजर रख रहे हैं। निवेश से पहले जोखिम और वैल्यूएशन देखना जरूरी है।",source:"Licious News",url:"https://news.google.com/"}
];

app.get("/api/news",(req,res)=>res.json({news}));
app.post("/api/devices",(req,res)=>{if(req.body.token&&!devices.includes(req.body.token))devices.push(req.body.token);res.json({ok:true})});
app.get("/api/admin/news",(req,res)=>{if(req.headers["x-admin-key"]!==process.env.ADMIN_KEY)return res.status(401).json({error:"Unauthorized"});res.json({news,devices:devices.length})});
app.post("/api/admin/news",(req,res)=>{if(req.headers["x-admin-key"]!==process.env.ADMIN_KEY)return res.status(401).json({error:"Unauthorized"});const n={id:Date.now().toString(),time:"just now",...req.body};news.unshift(n);res.json(n)});

// AI summarization adapter: connect your chosen LLM provider here.
// Input: {title, article}; Output: {summary}
app.post("/api/summarize",async(req,res)=>{
 const {title,article}=req.body||{};
 if(!article)return res.status(400).json({error:"article required"});
 // Safe fallback until an AI provider key/SDK is configured.
 const clean=article.replace(/\s+/g," ").trim();
 const summary=clean.length>320?clean.slice(0,317)+"...":clean;
 res.json({title,summary});
});

app.get("/health",(req,res)=>res.json({ok:true,service:"Licious News API"}));
app.listen(process.env.PORT||3000,()=>console.log("Licious News API running"));