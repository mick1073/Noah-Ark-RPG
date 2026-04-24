// scene_past_pasture.js

let bullDialogueIndex = 0;

const bullSuccessLines = [
    ["呸呸呸~你剛給我吃了什哞?", "有夠難吃的..."],
    ["奇怪，我會說話了!!", "真是神奇啊", "我這個大明星又更完哞了"],
    ["你站在這做什哞?", "好啦！我知道你想要我的畫像", "來~~送給你，不要跟我客氣。"]
];

function renderPastPasture() {
    // 1. 繪製牧場背景 (維持原樣)
    if (images.bgPastPasture && images.bgPastPasture.complete) {
        ctx.drawImage(images.bgPastPasture, 0, 0, 800, 450);
    }

    // 2. 繪製場景中的小公牛 (徹底無視 isOwned)
    // 只要圖片載入完成，就畫出來！不管玩家背包裡有沒有牛
    if (images.npcRichbull && images.npcRichbull.complete) {
        ctx.drawImage(images.npcRichbull, 220, 220, 120, 120);
    }

    // 3. 箭頭與對話框 (維持原樣)
    if (typeof drawDirectionArrow === "function") {
        drawDirectionArrow(700, 370, 60, 60, "right");
        drawDirectionArrow(40, 370, 60, 60, "left");
    }
    if (gameState === "BullDialog") {
        renderBullDialogUI(); 
    }
}

function handlePastPastureClick(tx, ty) {
    if (gameState === "BullDialog") {
        if (firstTimeFeeding) {
            bullDialogueIndex++; 
            
            // --- 關鍵修正：當翻到第三頁 (index 為 2) 時給道具 ---
            if (bullDialogueIndex === 2) {
                if (typeof addItem === "function") {
                    addItem("rich_bull");
                    console.log("獲得道具：大牛比較懶"); 
                }
            }

            // 如果超過總頁數，結束長對話模式
            if (bullDialogueIndex >= bullSuccessLines.length) {
                firstTimeFeeding = false;
                gameState = "past_pasture";
            }
            return;
        }

        // 一般關閉邏輯 (算了按鈕)
        const bN = layout.btnNo;
        if (tx > bN.x && tx < bN.x + bN.w && ty > bN.y && ty < bN.y + bN.h) {
            gameState = "past_pasture";
            return;
        }
        
        // 如果已經餵過了，再次點擊對話框任何地方就關閉
        if (hasFedBull) {
            gameState = "past_pasture";
            return;
        }
        return;
    }

    // ... 其餘判定 (點公牛、點回頭箭頭) 保持不變 ...
   if (tx > 220 && tx < 340 && ty > 220 && ty < 340) {

if (sfx && sfx.rich_bull) {
    sfx.rich_bull.currentTime = 0;
    sfx.rich_bull.play().catch(e => console.log("公牛音效播放失敗", e));
}
        bullWrongItem = false; // 重置錯誤訊息，回復初始對話
        gameState = "BullDialog";
        return;
    }

    if (tx > 700 && tx < 760 && ty > 370 && ty < 430) {
        if (typeof changeScene === "function") {
            if (typeof pastSubScene !== 'undefined') pastSubScene = "river"; 
            else window.pastSubScene = "river";
            changeScene("past_river", false);
        }return;
    }
    if (tx > 40 && tx < 100 && ty > 370 && ty < 430) {
        if (typeof changeScene === "function") {
            changeScene("past_gate"); // 切換到鐵匠所在的城門
        }
        return;
    }
}

// --- 分支渲染：大立繪 + 對話框 ---
function renderBullDialogUI() {
    // 1. 畫左側大立繪
    if (images.npcRichbull && images.npcRichbull.complete) {
        ctx.drawImage(images.npcRichbull, 0, 50, 400, 400); 
    }
    // 2. 畫右側對話框
    drawBullDialogBox(); 
}

function drawBullDialogBox() {
    const box = layout.textArea; 
    const bN = layout.btnNo; 
    
    ctx.save();
    // 1. 繪製對話框背景
    ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
    ctx.strokeStyle = "#d4af37";
    ctx.lineWidth = 4;
    ctx.fillRect(box.x, box.y, box.w, box.h);
    ctx.strokeRect(box.x, box.y, box.w, box.h);

    // 2. 名字
    ctx.fillStyle = "#d4af37";
    ctx.font = "bold 24px 'Microsoft JhengHei'";
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.fillText("明星-大牛比較懶", box.x + 25, box.y + 45);

    // 3. 對話內容
    ctx.fillStyle = "white";
    ctx.font = "20px 'Microsoft JhengHei'";
    const startX = box.x + 25;
    const startY = box.y + 100;
    const lineHeight = 40; // 既然分頁了，行距加寬更好看

    if (firstTimeFeeding) {
        // --- A. 餵完粉末的分頁長對白 (從 bullSuccessLines 陣列抓取) ---
        const currentLines = bullSuccessLines[bullDialogueIndex];
        
        if (currentLines) {
            currentLines.forEach((line, i) => {
                ctx.fillText(line, startX, startY + i * lineHeight);
            });
        }
        
       

    } else if (hasFedBull) {
        // --- B. 以後再點擊時的台詞 (短對白) ---
        ctx.fillText("天啊！我真是帥呆了，", startX, startY);
        ctx.fillText("現在又會說話，完哞~~", startX, startY + lineHeight);
    } else if (bullWrongItem) {
        // --- C. 餵錯東西時 ---
        ctx.fillText("哞~~~", startX, startY);
        ctx.fillText("哞哞哞~~~~~", startX, startY + lineHeight);
    } else {
        // --- D. 初始狀態 ---
        ctx.fillText("哞～", startX, startY);
        ctx.fillText("哞～～～", startX, startY + lineHeight);
    }

    // 4. 按鈕判定：只有在「尚未餵食成功」時才顯示「算了」按鈕
    if (!hasFedBull) {
        ctx.fillStyle = "#8b0000"; 
        ctx.fillRect(bN.x, bN.y, bN.w, bN.h);
        ctx.strokeStyle = "white";
        ctx.lineWidth = 2;
        ctx.strokeRect(bN.x, bN.y, bN.w, bN.h);
        
        ctx.fillStyle = "white";
        ctx.font = "bold 18px 'Microsoft JhengHei'";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("算了", bN.x + bN.w / 2, bN.y + bN.h / 2);
    }

    ctx.restore();
}
let hasFedBull = false; 
let bullWrongItem = false;
let firstTimeFeeding = false; // 新增：用來標記「剛餵完」的瞬間

function onBullReceivedItem(draggedItemKey) {
    if (draggedItemKey === "powder") {
        if (items.powder) items.powder.isOwned = false;
        hasFedBull = true;
        bullWrongItem = false;
        firstTimeFeeding = true; 
        bullDialogueIndex = 0; 

        // 這裡暫時不 addItem，我們移到翻頁邏輯去
    } else {
        bullWrongItem = true;
        firstTimeFeeding = false;
    }
}

window.onBullReceivedItem = onBullReceivedItem;

// 註冊至全域
window.renderPastPasture = renderPastPasture;
window.handlePastPastureClick = handlePastPastureClick;
window.renderBullDialogUI = renderBullDialogUI;