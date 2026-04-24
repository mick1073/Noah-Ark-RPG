let scriptIndex = 0;
let isChoosing = false;
let isWaitingForItem = false;
let isQuestioning = false;   // 是否正在顯示三個問題選項
let hasGotBlessing = false;  // 是否已經拿過加護
let rejectScripts = ["看來你還沒準備好，\n等你想通了再來找我。", "先去尋找諾亞，出門向右轉，\n他就在城門外等你。"];
let isEndingDialogue = false; // 追蹤是否正處於「結束前」的台詞
let scripts = [
     "醒了嗎，被選中的人，\n這個世界，即將迎來滅亡。", 
                "上帝命諾亞建造方舟，\n卻未給予他任何資源。", "歷史只會記住洪水，\n卻不會記住——", "暗中協助他的人，是你。", 
                "去幫助這座村莊吧。\n他們的力量，\n將成為你完成天命的關鍵。", 
                "需要我的幫助嗎？\n你只需要支付一枚金幣。"
];

function renderCassandraScene() {
    // 1. 房間場景
    if (gameState === "room") {
        if (images.bgInside) ctx.drawImage(images.bgInside, 0, 0, 800, 450);
        
        if (images.npcCassandra) {
            ctx.drawImage(images.npcCassandra, 120, 180, 160, 200);
        }
        drawDoor(layout.arrowExit);
    } 
    // 2. 街道場景
    else if (gameState === "street") {
        if (images.bgStreet) ctx.drawImage(images.bgStreet, 0, 0, 800, 450);
        
        drawDoor(layout.streetUp);
        drawDirectionArrow(layout.streetLeft.x, layout.streetLeft.y, layout.streetLeft.w, layout.streetLeft.h, "left");
        drawDirectionArrow(layout.streetRight.x, layout.streetRight.y, layout.streetRight.w, layout.streetRight.h, "right");
    }
    // 3. 對話場景
    else if (gameState === "dialog") {
        if (images.bgInside) ctx.drawImage(images.bgInside, 0, 0, 800, 450);
        ctx.fillStyle = "rgba(0,0,0,0.4)";
        ctx.fillRect(0, 0, 800, 450);

        if (images.npcCassandra) {
            ctx.drawImage(images.npcCassandra, 20, 50, 320, 400);
        }

        // 對話框本體
        ctx.fillStyle = "rgba(20, 15, 10, 0.85)";
        ctx.strokeStyle = "#FF8C00";
        ctx.lineWidth = 3;
        ctx.fillRect(400, 50, 370, 260);
        ctx.strokeRect(400, 50, 370, 260);
        
        ctx.fillStyle = "#FF8C00";
        ctx.font = "bold 24px 'Microsoft JhengHei'";
        ctx.fillText("先知-卡珊德拉", 420, 90);

        let text = scripts[scriptIndex] || "";
        ctx.fillStyle = "white";
        ctx.font = "20px 'Microsoft JhengHei'";
        ctx.textAlign = "left"; // 確保台詞左對齊
        text.split('\n').forEach((line, i) => {
            ctx.fillText(line, 420, 115 + (i * 35));
        });

        // --- 狀態按鈕繪製 (優化版) ---
        if (isQuestioning) {
            const questions = ["關於諾亞", "關於仙杜瑞拉", "關於哈梅林"];
            [layout.btnQ1, layout.btnQ2, layout.btnQ3].forEach((btn, i) => {
                ctx.fillStyle = "#3d2b1f";
                ctx.strokeStyle = "#FF8C00";
                ctx.lineWidth = 2;
                ctx.fillRect(btn.x, btn.y, btn.w, btn.h);
                ctx.strokeRect(btn.x, btn.y, btn.w, btn.h);
                ctx.fillStyle = "white";
                ctx.font = "16px 'Microsoft JhengHei'";
                ctx.textAlign = "center";
                ctx.fillText(questions[i], btn.x + btn.w / 2, btn.y + 24);
            });
            ctx.textAlign = "left"; 
        } 
        else if (isChoosing || isWaitingForItem) {
            // 通用按鈕設定：置中對齊
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.font = "18px 'Microsoft JhengHei'";

            if (isChoosing) {
                [layout.btnYes, layout.btnNo].forEach((btn, i) => {
                    // 畫按鈕
                    ctx.fillStyle = "#5c4033";
                    ctx.fillRect(btn.x, btn.y, btn.w, btn.h);
                    ctx.strokeStyle = "#FF8C00";
                    ctx.lineWidth = 1;
                    ctx.strokeRect(btn.x, btn.y, btn.w, btn.h);
                    
                    // 畫文字 (置中)
                    ctx.fillStyle = "white";
                    ctx.fillText(i === 0 ? "是" : "否", btn.x + btn.w / 2, btn.y + btn.h / 2 + 2);
                });
            } 
            else if (isWaitingForItem) {
                let btn = layout.btnNo;
                ctx.fillStyle = "#8b0000";
                ctx.fillRect(btn.x, btn.y, btn.w, btn.h);
                ctx.strokeStyle = "white";
                ctx.lineWidth = 1;
                ctx.strokeRect(btn.x, btn.y, btn.w, btn.h);

                ctx.fillStyle = "white";
                ctx.fillText("算了", btn.x + btn.w / 2, btn.y + btn.h / 2 + 2);
            }
            
            // 還原繪製設定，避免影響台詞
            ctx.textAlign = "left";
            ctx.textBaseline = "alphabetic";
        } 
           }
}

function handleCassandraClick(tx, ty) {
    if (gameState === "room") {
        // 1. 點擊 NPC 進入對話 (背景不變，維持原樣)
        if (tx > 110 && tx < 290 && ty > 150 && ty < 380) { 
         if (sfx && sfx.cassandra) {
                    sfx.cassandra.currentTime = 0;
                    sfx.cassandra.play();
                }
            gameState = "dialog";
            scriptIndex = 0;
            isEndingDialogue = false; 
            
            scripts = [
                "醒了嗎，被選中的人，\n這個世界，即將迎來滅亡。", 
                "上帝命諾亞建造方舟，\n卻未給予他任何資源。", 
                "歷史只會記住洪水，\n卻不會記住——", 
                "暗中協助他的人，是你。", 
                "去幫助這座村莊吧。\n他們的力量，\n將成為你完成天命的關鍵。", 
                "需要我的幫助嗎？\n你只需要支付一枚金幣。"
            ];
            
            isChoosing = false; 
            isWaitingForItem = false;
            isQuestioning = false;
        } 
        // 2. 離開房間到街道 (換地圖，改用 changeScene)
        else if (isClicked(tx, ty, layout.arrowExit)) {
            changeScene("street", true); 
        }
    }
    else if (gameState === "street") {
        // 3. 左：去傑克街道 (換地圖，改用 changeScene)
        if (isClicked(tx, ty, layout.streetLeft)) {
            changeScene("jack_street");
            isJackTalking = false;     
        }
        // 4. 上：回先知家 (換地圖，改用 changeScene)
        else if (isClicked(tx, ty, layout.streetUp)) {
            changeScene("room", true);
        }
        // 5. 右：前往牧場 (換地圖，改用 changeScene)
        else if (isClicked(tx, ty, layout.streetRight)) {
            changeScene("pasture"); 
            console.log("前往牧場/諾亞院子");
        }
    }
    // ... 如果下方還有對話點擊邏輯 (scriptIndex++) 請維持原樣

    else if (gameState === "dialog") {
        // --- 1. 處理三個問題選項的點擊 ---
        if (isQuestioning) {
            let answered = false;
            if (isClicked(tx, ty, layout.btnQ1)) {
                scripts[scriptIndex] = "善良的諾亞需要造船材料，\n你需要參天大樹、砍樹工具，\n以及清澈水質的黑色物品。"; 
                answered = true;
            } else if (isClicked(tx, ty, layout.btnQ2)) {
                scripts[scriptIndex] = "仙杜瑞拉正在找尋她的朋友，\n她的朋友們是\"老鼠\"，\n但是誰帶走了老鼠呢？"; 
                answered = true;
            } else if (isClicked(tx, ty, layout.btnQ3)) {
                scripts[scriptIndex] = "假如你身上沒有能支付的費用，\n那麼就別付錢了，打敗他吧！"; 
                answered = true;
            }

            if (answered) {
                isQuestioning = false;
                scripts.push("很好，我在你的眼中看見希望。\n請接受我的祝福吧。");
            }
            return; // 點擊選項時不觸發下方的翻頁
        }

        // --- 2. 處理 是/否 選擇 ---
        if (isChoosing) {
            if (isClicked(tx, ty, layout.btnYes)) {
                isChoosing = false;
                isWaitingForItem = true;
                scripts[scriptIndex] = "那就拿出你的誠意吧。";
            } else if (isClicked(tx, ty, layout.btnNo)) {
                triggerDialogueExit(); // 修改這裡：點「否」後不直接退出，先播台詞
            }
            return;
        }

        // --- 3. 處理 等待金幣 (點擊「算了」) ---
       if (isWaitingForItem) {
            if (isClicked(tx, ty, layout.btnNo)) {
                triggerDialogueExit(); // 修改這裡：點「算了」後不直接退出
            }
            return;
        }
        
        // --- 4. 處理對話框翻頁 (包含給予祝福的判定) ---
        if (tx > 400 && tx < 770 && ty > 50 && ty < 310) {
            if (scriptIndex < scripts.length - 1) {
           
                scriptIndex++;
                
                // 核心更新：檢查是否切換到了祝福台詞
                if (scripts[scriptIndex].includes("請接受我的祝福吧") && !hasGotBlessing) {
                    items.blessing.isOwned = true; // 獲得道具
                    hasGotBlessing = true;
                    autoArrangeAll(); // 重新排列背包
                    console.log("獲得了希望的加護！");
                }

                // 核心更新：檢查是否切換到要付錢的台詞
                if (scripts[scriptIndex].includes("支付一枚金幣")) {
                    isChoosing = true;
                }
            } else {
                gameState = "room"; // 對話結束
            }
        }
    }
}
function isClicked(tx, ty, area) {
    return tx > area.x && tx < area.x + area.w && ty > area.y && ty < area.y + area.h;
}

function onCassandraReceivedItem(itemId) {
    // 如果不是在等待給東西的狀態，直接不理會
    if (!isWaitingForItem) return;

    if (itemId === "gold") {
        // --- 情況 A: 給對了 (金幣) ---
        items.gold.isOwned = false; 
        isWaitingForItem = false;
        isQuestioning = true;
        
        scripts[scriptIndex] = "很好，你想問什麼問題？";
        
        autoArrangeAll(); 
        console.log("金幣已成功交給先知");
    } else {
        // --- 情況 B: 給錯了 (除了金幣以外的任何東西) ---
        console.log("先知對這個沒興趣，觸發逐客令");
        triggerDialogueExit(); // 直接呼叫你寫好的拒絕邏輯
    }
}

function triggerDialogueExit() {
    scripts = [...rejectScripts]; // 把當前對話換成拒絕台詞
    scriptIndex = 0;             // 從拒絕台詞第一句開始
    isChoosing = false;          // 關閉所有選擇狀態
    isWaitingForItem = false;
    isQuestioning = false;
    isEndingDialogue = true;     // 標記現在是結束階段
}