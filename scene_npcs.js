// --- scene_npcs.js ---

// 1. 初始化全域狀態

window.yafDialogState = "init"; // "init", "waiting_bull", "waiting_treasures", "feedback"
window.yafCurrentFeedback = "";
window.gameProgress.isYafBullDone = false; // 是否已交出公牛
window.gameProgress.isYafTreasuresDone = false; // 是否已完成寶物任務

window.gameProgress.isBullTaskDone = false;
window.currentYafScene = ""; 
window.isNpcTalking = false; 
window.activeNpcType = null; 

// --- 在初始化全域狀態區加入 ---
window.bullDialogState = "init"; // "init" 或 "asking"
window.bullButtons = []; // 存放隨機後的按鈕順序
window.bullCurrentFeedback = ""; // 點擊按鈕後的牛回覆
window.gameProgress.hasMetYaf = false; // 新增：是否已跟雅弗搭過話

const bullOptions = [
    { id: "prophet", name: "先知", text: "先知大人據說不只有預言能力，\n還能送人到過去未來。\n但她絕對不會找我，\n因為我之前偷吃了她的衣服。" },
    { id: "dwarf", name: "矮人", text: "矮人唱歌有夠難聽，\n什麼胖虎什麼孩子王。\n他只想要黃金\n才不會找我。" },
    { id: "river_god", name: "河神", text: "河神大人喜歡說故事，\n但是實在聽膩了。\n就算祂想找我，\n我也不想找祂。" },
    { id: "piper", name: "吹笛人", text: "哈梅林最恐怖了，\n每次看他吹笛子，\n後面不是跟著老鼠就是蟑螂。\n我一點也不想靠近他。" },
    { id: "jack", name: "傑克", text: "傑克找的是一頭母牛。\n你看我這帥氣的外表，\n高雅的談吐，\n怎麼看也不像母牛啊！" },
    { id: "noah", name: "諾亞", text: "諾亞這個人瘋瘋癲癲的，\n他說什麼你可千萬別信。\n啊？你信啦？\n總之我是不會去找他的。" },
    { id: "queen", name: "皇后", text: "皇后說她朋友不見了，\n你知道她朋友是什麼嗎？\n是老鼠！是討厭的老鼠！\n我可不會跟老鼠的朋友做朋友。" },
    { id: "owner", name: "牧場主人", text: "他家的母牛要找個伴？\n你覺得我是個好色之徒嗎？\n我可是非常正直的，\n其實是那頭母牛太老了。" },
    { id: "yaf", name: "雅弗", text: "", trigger: true }
];

// 2. 定義各場景的固定出現座標 (x, y, w, h)
const npcPositions = {
    "bgStreet": {
        bull: { x: 170, y: 220, w: 120, h: 150 },
        yaf:  { x: 550,  y: 240, w: 80, h: 100 }
    },
    "bgJackStreet": {
        bull: { x: 350, y: 240, w: 100, h: 125 },
        yaf:  { x: 100, y: 240, w: 90, h: 110 }
    },
    "bgMine": {
        bull: { x: 300, y: 280, w: 160, h:200  },
        yaf:  { x: 280, y: 280, w: 120, h: 150 }
    },
    "bgPasture": {
        bull: { x: 120, y: 210, w: 210, h: 250 },
        yaf:  { x: 550, y: 220, w: 120, h: 150 }
    },
    "bgRiver": {
        bull: { x: 520, y: 270, w: 80, h: 95 },
        yaf:  { x: 100, y: 180, w: 60, h: 75 }
    },
    "bgCastle": {
        bull: { x: 160, y: 340, w: 80, h: 100 },
        yaf:  { x: 560, y: 350, w: 80, h: 100 }
    },
    "bgForest": {
        bull: { x: 70, y: 300, w: 40, h: 50 },
        yaf:  { x: 180, y: 360, w: 50, h: 65 }
    }
};

const npcAvailableScenes = Object.keys(npcPositions);

function randomizeNpcLocations() {
    // 1. 定義所有可能的背景
    const allScenes = ["bgStreet", "bgJackStreet", "bgMine", "bgPasture", "bgRiver", "bgCastle", "bgForest"];

    // 2. 【優先排班：雅弗】雅弗是老大，他先在世界地圖選一個地方找牛
    let yafIdx = Math.floor(Math.random() * allScenes.length);
    window.currentYafScene = allScenes[yafIdx];

    // 3. 【後續排班：公牛】公牛則是躲著雅弗，或者只是剛好錯開
    if (!window.gameProgress.isBullTaskDone) {
        // 從「雅弗不在」的場景清單中選一個
        let availableForBull = allScenes.filter(s => s !== window.currentYafScene);
        let cowIdx = Math.floor(Math.random() * availableForBull.length);
        window.currentCowScene = availableForBull[cowIdx];
    } else {
        // 任務完成，公牛從地圖消失
        window.currentCowScene = "";
    }

    console.log(`[捉迷藏模式] 雅弗正在：${window.currentYafScene} | 公牛躲在：${window.currentCowScene || "已被捕獲"}`);
}

// 4. 渲染函數 (修正版)
function drawDynamicNPCs(currentGameState) {
    let sceneMapping = {
        "street": "bgStreet", "jack_street": "bgJackStreet", "dwarf_mine": "bgMine",
        "pasture": "bgPasture", "river": "bgRiver", "castle": "bgCastle", "forest": "bgForest"
    };
    let currentBg = sceneMapping[currentGameState] || currentGameState;

    // --- 修正公牛渲染判定 ---
    // 條件：(牛還在場景內) 或者 (目前正在跟牛說話)
   const isBullHereBySchedule = (currentBg === window.currentCowScene);
    // 2. 對話狀態：如果正在跟牛說話，且就是在這個場景開始對話的
    const isTalkingToBullHere = (window.isNpcTalking && 
                                 window.activeNpcType === "bull" && 
                                 currentBg === window.talkingNpcScene);

    if ((isBullHereBySchedule || isTalkingToBullHere) && images.npcBull) {
        let pos = npcPositions[currentBg]?.bull;
        if (pos) {
            ctx.drawImage(images.npcBull, pos.x, pos.y, pos.w, pos.h);
        }
    }
    
    // 雅弗渲染
    if (currentBg === window.currentYafScene && images.npcYaf) {
        let pos = npcPositions[currentBg].yaf;
        ctx.drawImage(images.npcYaf, pos.x, pos.y, pos.w, pos.h);
    }

    
}


// 5. 點擊判定
function handleDynamicNpcClick(tx, ty, currentGameState) {
    let sceneMapping = { 
        "street": "bgStreet", "jack_street": "bgJackStreet", "dwarf_mine": "bgMine", 
        "pasture": "bgPasture", "river": "bgRiver", "castle": "bgCastle", "forest": "bgForest" 
    };
    let currentBg = sceneMapping[currentGameState] || currentGameState;

    // A. 點擊場景中的公牛本體
    if (!window.isNpcTalking && currentBg === window.currentCowScene) {
        let p = npcPositions[currentBg].bull;
        if (tx > p.x && tx < p.x + p.w && ty > p.y && ty < p.y + p.h) {
if (sfx && sfx.bull) {
                sfx.bull.currentTime = 0; // 重設播放時間
                sfx.bull.play().catch(e => console.log("公牛音效播放失敗", e));
            }
            window.isNpcTalking = true;
            window.activeNpcType = "bull";
            window.bullDialogState = "init"; 
            window.talkingNpcScene = currentBg;
            window.bullCurrentFeedback = "";
            window.bullButtons = [...bullOptions].sort(() => Math.random() - 0.5);
            return true;
        }
    }

   // [修正] 點擊場景中的雅弗本體
    if (!window.isNpcTalking && currentBg === window.currentYafScene) {
    let p = npcPositions[currentBg]?.yaf;
    if (p && tx > p.x && tx < p.x + p.w && ty > p.y && ty < p.y + p.h) {
if (sfx && sfx.yaf) {
            sfx.yaf.currentTime = 0;
            sfx.yaf.play().catch(e => console.log("雅弗音效播放失敗", e));
        }
        window.isNpcTalking = true;
        window.activeNpcType = "yaf";
        
        // --- 修正重點：除非公牛已經交出去了，否則一律從 init (第一頁) 開始走流程 ---
        if (!window.gameProgress.isYafBullDone) {
            window.yafDialogState = "init";
        } else if (!window.gameProgress.isYafTreasuresDone) {
            // 公牛已交，進入寶物階段
            window.yafDialogState = "waiting_treasures";
        } else {
            // 全部完成
            window.yafDialogState = "init";
        }
        
        window.yafCurrentFeedback = ""; 
        return true; 
    }
}

    // B. 處理公牛九宮格按鈕
    if (window.isNpcTalking && window.activeNpcType === "bull" && window.bullDialogState === "asking") {
        for (let i = 0; i < 9; i++) {
            let btnRect = getBullButtonRect(i);
            if (tx > btnRect.x && tx < btnRect.x + btnRect.w && ty > btnRect.y && ty < btnRect.y + btnRect.h) {
                let choice = window.bullButtons[i];
                
              // 在公牛按鈕判定的地方
if (choice.id === "yaf") {
    // 只要「見過雅弗」或是「任務已經在收尾階段」
    const canTakeBull = window.gameProgress.hasMetYaf || window.gameProgress.isYafBullDone;

    if (!canTakeBull) {
        window.bullCurrentFeedback = "雅弗找我什麼事？\n你問清楚再來告訴我...";
        window.bullCurrentTriggerSuccess = false; 
    } else {
        window.bullCurrentFeedback = "我就覺得氣候有點不太對勁...\n原來是大洪水要來了！\n那你快帶我去找雅弗吧！";
        
        if (typeof addItem === "function") {
            let result = addItem("talking_bull");
            if (result === "BAG_FULL") {
                window.bullCurrentFeedback = "你的包包太擠了，我才不要進去！";
                window.bullCurrentTriggerSuccess = false;
            } else {
                window.bullCurrentTriggerSuccess = true;
                // 帶走牛後，若玩家之前點「否」，這裡強制把雅弗狀態拉回等待收牛
                window.yafDialogState = "waiting_bull"; 
            }
        }
    }
}
               else {
                    // 一般選項處理
                    window.bullCurrentFeedback = choice.text;
                    window.bullCurrentTriggerSuccess = false;
                }

                window.bullDialogState = "feedback";
                return true;
            }
        }
    }

   // C. 雅弗的對話框點擊處理
   if (window.isNpcTalking && window.activeNpcType === "yaf") {
    
    // --- 第一階段：找公牛任務的「換頁」與「是/否」 ---
    if (!window.gameProgress.isYafBullDone) {
        // 1. 雅弗第一階段：點擊對話框任何地方換到第二頁
        if (window.yafDialogState === "init") {
            window.yafDialogState = "init_page2";
            // --- 關鍵注入：只要進入第二頁，就算「對話過」了 ---
            window.gameProgress.hasMetYaf = true; 
            return true; 
        }

        // 2. 雅弗第二階段：在第二頁處理 [是/否] 按鈕
        if (window.yafDialogState === "init_page2") {
            // 判定「是」
            if (tx > layout.btnYes.x && tx < layout.btnYes.x + layout.btnYes.w &&
                ty > layout.btnYes.y && ty < layout.btnYes.y + layout.btnYes.h) {
                window.yafDialogState = "waiting_bull";
                window.gameProgress.hasMetYaf = true; // 雙重保險
                return true;
            }
            // 判定「否」
            if (tx > layout.btnNo.x && tx < layout.btnNo.x + layout.btnNo.w &&
                ty > layout.btnNo.y && ty < layout.btnNo.y + layout.btnNo.h) {
                window.yafCurrentFeedback = "我的工作並不是那麼容易的，\n再見，我繼續去找公牛了。";
                window.yafDialogState = "feedback";
                window.gameProgress.hasMetYaf = true; // 點否也算見過面
                return true;
            }
            // 在這一頁，點擊按鈕以外的地方不應該有反應（避免直接關掉）
            return true; 
        }
    }

    // --- 共通處理：等待道具階段的「算了」按鈕 ---
    if (window.yafDialogState === "waiting_bull" || window.yafDialogState === "waiting_treasures") {
        const quitBtn = layout.btnNo; 
        if (tx > quitBtn.x && tx < quitBtn.x + quitBtn.w && ty > quitBtn.y && ty < quitBtn.y + quitBtn.h) {
            if (window.yafDialogState === "waiting_treasures") {
                // 若有點到算了，要把身上暫存的寶物還給玩家
                if (window.yafReceivedTreasures && window.yafReceivedTreasures.length > 0) {
                    window.yafReceivedTreasures.forEach(itemId => {
                        if (typeof addItem === "function") addItem(itemId);
                    });
                    window.yafReceivedTreasures = []; 
                }
                window.yafCurrentFeedback = "想當個善良的人沒那麼容易，\n等你找到三樣寶物再過來找我。";
            } else {
                window.yafCurrentFeedback = "我的工作並不是那麼容易的，\n再見，我繼續去找公牛了。";
            }
            window.yafDialogState = "feedback";
            window.gameProgress.hasMetYaf = true; // 這裡也補上
            return true;
        }
    }
}
}

// 6. 輔助函數：計算 3x3 九宮格按鈕位置 (確保只有一個)
function getBullButtonRect(index) {
    const box = (layout && layout.textArea) ? layout.textArea : { x: 400, y: 50, w: 370, h: 260 };
    const startX = box.x + 15;
    const startY = box.y + 90; 
    const w = 110, h = 35, gap = 10;
    const col = index % 3;
    const row = Math.floor(index / 3);
    return {
        x: startX + col * (w + gap),
        y: startY + row * (h + gap),
        w: w, h: h
    };
}

// 7. 渲染對話框 (修正版)
function drawNpcDialogBox() {
    const box = (layout && layout.textArea) ? layout.textArea : { x: 400, y: 50, w: 370, h: 260 };
    
   
    // 2. 畫對話框本體 (只畫右邊這一塊，不會蓋到背包)
    ctx.fillStyle = "rgba(30, 30, 60, 0.95)";
    ctx.strokeStyle = "#00FFFF";
    ctx.lineWidth = 3;
    ctx.fillRect(box.x, box.y, box.w, box.h);
    ctx.strokeRect(box.x, box.y, box.w, box.h);

   

    // 4. 畫名字
    ctx.fillStyle = "#00FFFF";
    ctx.font = "bold 24px 'Microsoft JhengHei'";
    ctx.fillText(window.activeNpcType === "bull" ? "會說話的公牛" : "雅弗", box.x + 20, box.y + 40);

    // 5. 畫文字內容
    ctx.fillStyle = "white";
    ctx.font = "18px 'Microsoft JhengHei'";
    let content = "";
    let showButtons = false;

    if (window.activeNpcType === "bull") {
        if (window.bullDialogState === "init") {
            content = "牛會講話有什麼好奇怪？\n從我祖父開始我們家族就會說話。\n你說誰要找我？";
        } else if (window.bullDialogState === "asking") {
            window.bullButtons.forEach((btn, i) => {
                let r = getBullButtonRect(i);
                ctx.fillStyle = "#334466";
                ctx.strokeStyle = "#00FFFF";
                ctx.fillRect(r.x, r.y, r.w, r.h);
                ctx.strokeRect(r.x, r.y, r.w, r.h);
                ctx.fillStyle = "white";
                ctx.font = "14px 'Microsoft JhengHei'";
                ctx.textAlign = "center";
                ctx.fillText(btn.name, r.x + r.w/2, r.y + r.h/2 + 6);
            });
            ctx.textAlign = "left";
        } else if (window.bullDialogState === "feedback") {
            content = window.bullCurrentFeedback;
            ctx.fillStyle = "#FFFF00";
        }
    } else if (window.activeNpcType === "yaf") {
        if (!window.gameProgress.isYafBullDone) {
            if (window.yafDialogState === "init") content = "我執行父親交代我的任務，\n上船的動物都由我篩選，\n現在只差一隻公牛沒找到了。";
            else if (window.yafDialogState === "init_page2") { content = "你有看見公牛嗎?"; showButtons = true; }
            else if (window.yafDialogState === "waiting_bull") content = "請交給我來篩選";
        } else if (!window.gameProgress.isYafTreasuresDone) {
            const count = window.yafReceivedTreasures ? window.yafReceivedTreasures.length : 0;
            content = count === 0 ? "將三樣寶物放上來我看看。" : `不錯，我收下了這份證明。\n還差 ${3 - count} 樣寶物。`;
            if (window.yafDialogState === "init") window.yafDialogState = "waiting_treasures";
        } else {
            content = "我爸爸應該已經建造好船了，\n趕快去找他吧。";
            window.yafDialogState = "init";
        }
        if (window.yafCurrentFeedback) content = window.yafCurrentFeedback;
    }

    if (content) {
        content.split('\n').forEach((l, i) => ctx.fillText(l, box.x + 20, box.y + 90 + (i * 35)));
    }

    // 6. 畫雅弗的按鈕
    if (window.activeNpcType === "yaf") {
        if (showButtons && !window.yafCurrentFeedback) {
            if (typeof drawYafChoiceButtons === "function") drawYafChoiceButtons();
        } else if (!window.gameProgress.isYafTreasuresDone && (window.yafDialogState === "waiting_bull" || window.yafDialogState === "waiting_treasures")) {
            if (typeof drawStandardYafButton === "function") drawStandardYafButton(layout.btnNo, "算了", "#8b0000");
        }
    }
}

function handleNpcDialogClose() {
    if (window.activeNpcType === "bull") {
        if (window.bullDialogState === "init") {
            window.bullDialogState = "asking";
        } else if (window.bullDialogState === "feedback") {
            if (window.bullCurrentTriggerSuccess === true) {
                window.gameProgress.isBullTaskDone = true; 
                window.currentCowScene = "";               
            }
            window.isNpcTalking = false;
            window.activeNpcType = null;
            window.talkingNpcScene = null;
            window.bullDialogState = "init";
            window.bullCurrentFeedback = "";
            window.bullCurrentTriggerSuccess = false;
        }
    } else if (window.activeNpcType === "yaf") {
        // 修正：只要點擊對話框外關閉，或者是在回饋狀態
        // 我們就把狀態重置，這樣下次點擊雅弗才會重新執行 init 的流程
        if (window.yafDialogState === "feedback" || 
            window.yafDialogState === "init" || 
            window.yafDialogState === "init_page2") {
            window.yafDialogState = "init"; 
        }

        // 注意：如果狀態是 waiting_bull 或 waiting_treasures，
        // 則不在此處重置（由 main_engine 擋掉點擊），除非玩家點了「算了」。
        
        window.isNpcTalking = false;
        window.activeNpcType = null;
        window.yafCurrentFeedback = "";
    }
}




function drawYafChoiceButtons(box) {
    // 直接調用 layout 裡的標準位置：btnYes (440, 220) 與 btnNo (670, 220)
    // 這裡我們傳入 "是" 與 "否"
    drawStandardYafButton(layout.btnYes, "是");
    drawStandardYafButton(layout.btnNo, "否");
}

// 建立一個符合主幹風格的繪製函式，新增 color 參數，預設為原本的深藍/黑色
function drawStandardYafButton(rect, text, color = "#150e0a") {
    // 背景：使用傳入的 color，若沒傳則預設為 #150e0a
    ctx.fillStyle = color; 
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    
    // 邊框：始終使用亮青色
    ctx.strokeStyle = "#00FFFF";
    ctx.lineWidth = 2;
    ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
    
    // 文字：置中白色
    ctx.fillStyle = "white";
    ctx.font = "bold 20px 'Microsoft JhengHei'";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, rect.x + rect.w/2, rect.y + rect.h/2);
    
    // 恢復設定
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
}

// --- 雅弗接收道具的處理中心 ---
function onYafReceivedItem(itemId) {
    if (window.activeNpcType !== "yaf") return;

    // A. 處理第一階段：收公牛
    if (window.yafDialogState === "waiting_bull") {
        if (itemId === "talking_bull") {
            if (typeof removeItem === "function") removeItem("talking_bull");
            if (typeof addItem === "function") addItem("gold"); 
            
            window.gameProgress.isYafBullDone = true;
            window.yafCurrentFeedback = "這頭公牛符合上船資格，太好了！\n這枚金幣就送給你當報酬。\n大洪水要來了，如果你也想上船，\n需要三樣寶物來證明你的善良。";
            window.yafDialogState = "feedback"; // 成功才進 feedback，點擊會關閉
        } else {
            // 放錯公牛：不改狀態，只改文字
            window.yafCurrentFeedback = "這並不是我要找的那頭公牛...。";
            // 3秒後自動恢復提示文字，或者讓玩家繼續拖曳
            setTimeout(() => { 
                if(window.yafDialogState === "waiting_bull") window.yafCurrentFeedback = ""; 
            }, 1000);
        }
    }
    
    // B. 處理第二階段：收三寶
    else if (window.yafDialogState === "waiting_treasures") {
        const treasures = ["love", "courage", "blessing"];
        if (treasures.includes(itemId)) {
            if (!window.yafReceivedTreasures) window.yafReceivedTreasures = [];
            
            if (window.yafReceivedTreasures.includes(itemId)) {
                window.yafCurrentFeedback = "這件寶物你剛才給過我了。";
            } else {
                if (typeof removeItem === "function") removeItem(itemId);
                window.yafReceivedTreasures.push(itemId);
                
                if (window.yafReceivedTreasures.length === 3) {
                    if (typeof addItem === "function") addItem("kindness"); 
                    window.gameProgress.isYafTreasuresDone = true;
                    window.yafCurrentFeedback = "善良的人必要有愛、勇氣與希望。\n這個「善良的證明」交給你，\n帶著它交給我的父親諾亞吧。";
                    window.yafDialogState = "feedback"; // 全部集齊才進 feedback
                } else {
                    window.yafCurrentFeedback = `不錯，我收下了。\n還差 ${3 - window.yafReceivedTreasures.length} 樣寶物。`;
                }
            }
        } else {
            // --- 你的需求：放錯寶物時的處理 ---
            window.yafCurrentFeedback = "這並不能證明你的善良。";
            // 不更動 yafDialogState，這樣對話框就不會因為點擊而關閉
        }
        
        // 如果是放錯東西，3秒後把回饋文字清掉，回復原本的「將三樣寶物...」
        if (window.yafDialogState === "waiting_treasures") {
            setTimeout(() => {
                if(window.yafDialogState === "waiting_treasures") window.yafCurrentFeedback = "";
            }, 1000);
        }
    }
}

function drawNpcBigAvatar() {
    const box = (layout && layout.textArea) ? layout.textArea : { x: 400, y: 50, w: 370, h: 260 };
    if (window.activeNpcType === "bull" && images.npcBull) {
        ctx.save();
        const avatarW = 400, avatarH = 480;
        const avatarX = box.x - avatarW - 20;
        const avatarY = (box.y + (box.h - avatarH) / 2) + 60;
        ctx.translate(avatarX + avatarW / 2, avatarY + avatarH / 2);
        ctx.scale(-1, 1);
        ctx.drawImage(images.npcBull, -avatarW / 2, -avatarH / 2, avatarW, avatarH);
        ctx.restore();
    } else if (window.activeNpcType === "yaf" && images.npcYaf) {
        const avW = 380, avH = 380; // 雅弗稍微調大一點
        const avX = box.x - avW - 20;
        const avY = box.y + (box.h - avH) / 2 + 50;
        ctx.drawImage(images.npcYaf, avX, avY, avW, avH);
    }
}