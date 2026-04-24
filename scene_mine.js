// 1. 礦坑專用狀態
window.isMineTalking = false;     // 加 window
window.isMineWaitingItem = false; // 加 window
window.isMineChoosing = false;    // 加 window
window.mineScriptIndex = 0;
window.mineScripts = [];

// 2. 渲染函數
function renderMineScene() {
    // --- 背景繪製 (含裁切拉近邏輯) ---

    if (images.bgMine && images.bgMine.complete) {
        const img = images.bgMine;
        
        // 如果想拉得更近，可以把 0.8 改成 0.7
        let zoom = 0.8; 
        let sWidth = img.width * zoom;
        let sHeight = sWidth * (450 / 800);
        let sX = (img.width - sWidth) / 2;
        let sY = (img.height - sHeight) / 2;

        ctx.drawImage(img, sX, sY, sWidth, sHeight, 0, 0, 800, 450);
    } else {
        ctx.fillStyle = "#1a1a1a";
        ctx.fillRect(0, 0, 800, 450);
    }

    // 畫矮人 (安德)
   if (images.npcDwarf && images.npcDwarf.complete) {
        if (isMineTalking) {
            // 對話中的大頭貼模式
            ctx.fillStyle = "rgba(0,0,0,0.5)";
            ctx.fillRect(0, 0, 800, 450);
            ctx.drawImage(images.npcDwarf, 50, 50, 300, 400); 
        } else {
            // 平時場景中的小矮人
            ctx.drawImage(images.npcDwarf, 200, 330, 80, 100); 

            
        }
    }

    // 畫返回箭頭
   if (!isMineTalking) {
    // 座標設定：x=500 (中間偏右), y=380 (靠近底部), 寬高 60 (稍微縮小一點避免擋到)
    // 類型改為 "down" 代表往回走，或是維持 "right" 但位置放在下方
    drawDirectionArrow(500, 380, 80, 80, "down"); 
}

    // 3. 繪製對話框與名字
   if (isMineTalking) {
        // --- 先畫對話框底色與邊框 ---
        ctx.fillStyle = "rgba(40, 30, 20, 0.95)";
        ctx.strokeStyle = "#FFD700";
        ctx.lineWidth = 3;
        ctx.fillRect(400, 50, 370, 260);
        ctx.strokeRect(400, 50, 370, 260);

        // --- 名字與文字內容 ---
        ctx.fillStyle = "#FFD700";
        ctx.font = "bold 24px 'Microsoft JhengHei'";
        ctx.textAlign = "left";
        ctx.fillText("矮人安德", 420, 90);

       let text = mineScripts[mineScriptIndex] || "...";
ctx.fillStyle = "white";
ctx.font = "20px 'Microsoft JhengHei'";

let yOffset = 0; // 新增這行來動態計算行高
text.split('\n').forEach((line) => {
    ctx.fillText(line, 420, 140 + yOffset);
    yOffset += 35; // 每一行畫完，偏移量往下增加
});

        // --- 顯示按鈕或小箭頭 ---
        if (isMineChoosing || window.isMineWaitingItem) {
            drawMineButtons();
        } 
        // --- 【關鍵修正】對話時才呼叫 UI ---
        // 放在這裡，背包就會浮在對話框上方，且只有講話時看得到
        if (typeof drawUI === "function") {
           
            drawUI();
            
            
        }
    }
} // renderMineScene 結束

// 4. 點擊處理
function handleMineClick(tx, ty) {
    if (!isMineTalking) {
        // --- 擴大感應區 ---
        // 原本: x(200~280), y(330~430) 
        // 修正後: 左右各加 40，上方多加 50 像素的緩衝
        const isClickingDwarf = (tx > 190 && tx < 290 && ty > 320 && ty < 430);

        if (isClickingDwarf) { 
             if (sfx && sfx.dwaf) {
                sfx.dwaf.currentTime = 0; // 重設音效進度
                sfx.dwaf.play().catch(e => console.log("矮人音效播放失敗", e));
            }
            isMineTalking = true;
            mineScriptIndex = 0;
            isMineChoosing = false;
            window.isMineWaitingItem = false; // 確保重設狀態
            mineScripts = [
                "我們最喜歡黃金了\n每次挖到金礦，",
                "我們都會一起開心地唱歌，",
                "自從人類跟我們搶挖金礦\n金礦迅速地被挖光，",
                "以後再也聽不到\n我們矮人快樂的歌聲。",
                "你會分享給我黃金嗎?"
            ];
        }
        else if (tx > 500 && tx < 580 && ty > 380 && ty < 460) {
            changeScene("noah_yard");
        }
    } else {
        if (isMineChoosing){
    if (isClicked(tx, ty, layout.btnYes)) {
        // 進入等待交付黃金的狀態
        mineScripts = ["哇!你要送我黃金嗎?\n趕快交給我。"];
        mineScriptIndex = 0;
        
        // 關鍵：我們讓 isMineChoosing 保持 true，但等一下在繪圖時改變按鈕
        // 或者你可以新增一個變數 window.isMineWaitingItem = true;
        window.isMineWaitingItem = true; 
        isMineChoosing = false; // 關閉原本的「是/否」
    } else if (isClicked(tx, ty, layout.btnNo)) {
        mineScripts = ["哼，小氣的人類！"];
        mineScriptIndex = 0;
        isMineChoosing = false;
        window.isMineWaitingItem = false;
    }
} else if (window.isMineWaitingItem) {
    // 如果在等待道具時點了「算了」按鈕
    if (isClicked(tx, ty, layout.btnNo)) { 
        mineScripts = ["切...害我白開心一場。"];
        mineScriptIndex = 0;
        window.isMineWaitingItem = false;
    }
}else {
            if (tx > 400 && tx < 770 && ty > 50 && ty < 310) {
                if (mineScriptIndex < mineScripts.length - 1) {
                    mineScriptIndex++;
                    if (mineScripts[mineScriptIndex].includes("分享給我黃金")) {
                        isMineChoosing = true;
                    }
                } else {
                    isMineTalking = false;
                }
            }
        }
    }
}

function drawMineButtons() {
    ctx.textAlign = "center";
    ctx.font = "bold 20px 'Microsoft JhengHei'"; // 確保字體大小一致

    [layout.btnYes, layout.btnNo].forEach((btn, i) => {
        // --- 核心邏輯：如果是等待道具階段，不畫「是」按鈕 ---
        if (window.isMineWaitingItem && i === 0) return; 
        
        // 設定顏色：如果是「算了」可以用深紅色稍微區分，或者維持原色
        ctx.fillStyle = (window.isMineWaitingItem && i === 1) ? "#8b0000" : "#2e3b23";
        
        ctx.fillRect(btn.x, btn.y, btn.w, btn.h);
        ctx.strokeStyle = "white";
        ctx.strokeRect(btn.x, btn.y, btn.w, btn.h);
        
        ctx.fillStyle = "white";
        
        // 設定文字：如果是等待階段，原本「否」的位置改顯示「算了」
        let label;
        if (window.isMineWaitingItem) {
            label = "算了";
        } else {
            label = (i === 0 ? "是" : "否");
        }
        
        ctx.fillText(label, btn.x + btn.w/2, btn.y + btn.h/2 + 7);
    });
    
    ctx.textAlign = "left";
}


// --- 處理矮人收到道具的邏輯 ---
function onMineReceivedItem(itemId) {
    // 偵錯用：如果完全沒反應，請看控制台有沒有印出這一行
    console.log("礦坑收件函式被呼叫，收到 ID:", itemId);

    // 關鍵修正 1：確保 isMineTalking 也能被 main_engine 讀到，建議加上 window.
    if (window.isMineTalking && window.isMineWaitingItem) {
        
        if (itemId === "gold_axe") {
            // --- 成功劇本 ---
            mineScripts = [
                "這…這不就是黃金嗎？\n實在太美太美了，",
                "真的可以送給我嗎？\n我太開心了，",
                "我沒有什麼可以回報你們，\n只有這個木炭，",
                "這是我們煉金時用的，\n據說還有別的功用，",
                "就當作是回禮吧。\n現在你們又可以聽到我唱歌了。",
                "我~是胖~虎，我~是孩子~王"
            ];
            mineScriptIndex = 0;
            
            // 關鍵修正 2：狀態轉換，確保按鈕跟邏輯都重設
            window.isMineWaitingItem = false;
            window.isMineChoosing = false; // 加上 window 比較保險

            // 道具交換
            if (items.gold_axe) items.gold_axe.isOwned = false;
            if (items.charcoal) items.charcoal.isOwned = true;
            
            if (typeof autoArrangeAll === "function") autoArrangeAll();
            console.log("成功交換：獲得木炭");

        } else {
            // --- 失敗劇本 ---
            mineScripts = ["這不是黃金啊！\n切~害我白高興一場"];
            mineScriptIndex = 0;
            
            // 關鍵修正 3：失敗後，要不要讓玩家重新給？
            // 如果不加這行，玩家會卡在「趕快交給我」的對話但矮人臉很臭
            window.isMineWaitingItem = false; 
        }
    } else {
        console.log("不符合收件條件：對話中?", window.isMineTalking, "等待中?", window.isMineWaitingItem);
    }
}