// --- scene_castle.js ---

// ===================== 城堡門口 (外側) =====================
function renderCastleScene() {
    // 1. 繪製背景
    ctx.save();
    ctx.globalAlpha = 1.0;
    if (images.bgCastle) {
        ctx.drawImage(images.bgCastle, 0, 0, 800, 450);
    } else {
        ctx.fillStyle = "#333";
        ctx.fillRect(0, 0, 800, 450);
        ctx.fillStyle = "white";
        ctx.fillText("城堡場景載入中...", 350, 225);
    }
    ctx.restore();

    // 2. 繪製導航箭頭
    ctx.save();
    // 向下的箭頭：回到河邊 (River)
    drawDirectionArrow(layout.castleDown.x, layout.castleDown.y, layout.castleDown.w, layout.castleDown.h, "down");
    // 正中間向上的箭頭：進入城堡內部 (Castle Inside)
    drawDoor(layout.castleUp);
    ctx.restore();
}

function handleCastleClick(tx, ty) {
    if (checkClick(tx, ty, layout.castleDown)) {
        changeScene("river");
    } else if (checkClick(tx, ty, layout.castleUp)) {
        changeScene("castle_inside", true); // 前進城堡內部
    }
}

// ===================== 城堡內部 =====================


let queenPage = 0;
let isQueenRejected = false;

const queenDialogs = [
    ["我的朋友們不見了啦！", "他們答應要駕馬車"],
    ["載我去王宮參加舞會", "讓我認識帥哥王子"],
    ["現在他們都不見了", "我再也得不到幸福了"],
    ["你幫我帶他們回來了嗎?"] // 最後一頁
];

const queenRejectDialog = [
    ["我再也得不到幸福了..."]
];

const queenWrongItemDialog = [
    ["這不是我的朋友啊！"],
    ["我再也得不到幸福了..."]
  
];
let queenAcceptDialog = [["太好了，帶他們來見我"]];
const queenSuccessDialog = [
    ["這就是我的朋友老鼠！\n謝謝你幫我找回他們。"],
    ["為了報答你，\n請收下這個「愛的加護」。"],
    ["這能證明你擁有一部份的善良。"]
];

function renderCastleInside() {
    // 1. 繪製內部背景
    ctx.save();
    ctx.globalAlpha = 1.0;
    if (images.bgCastleInside) {
        ctx.drawImage(images.bgCastleInside, 0, 0, 800, 450);
    } else {
        ctx.fillStyle = "#111";
        ctx.fillRect(0, 0, 800, 450);
    }
    ctx.restore();

    if (isQueenTalking) {
        // 2. 繪製皇后立繪 (直接顯示在左側，不使用圓形遮罩)
        const queenImg = images.npcQueen;
        if (queenImg && queenImg.complete) {
            ctx.save();
            // 將皇后放大顯示在對話框左側對應位置
            // 座標調整為 (50, 80)，大小放大至 (300, 350) 左右
            ctx.drawImage(queenImg, 50, 80, 300, 350); 
            ctx.restore();
        }

        // 3. 繪製右側對話框 (與之前 NPC 風格一致)
        drawQueenSideDialog();
    } else {
        // 4. 平時狀態：畫出縮小版的皇后在場景中
        if (images.npcQueen) {
            ctx.drawImage(images.npcQueen, 400, 230, 100, 120);
        }
        // 回門口的箭頭
       drawDoor(layout.castleDown);
    }
}

function drawQueenSideDialog() {
    const boxX = 420, boxY = 50, boxW = 350, boxH = 250;
    
    // ... (繪製背景框部分維持不變) ...
    ctx.fillStyle = "rgba(40, 0, 60, 0.85)";
    ctx.fillRect(boxX, boxY, boxW, boxH);
    ctx.strokeStyle = "#ff88ff";
    ctx.lineWidth = 3;
    ctx.strokeRect(boxX, boxY, boxW, boxH);
    ctx.fillStyle = "#ffccff";
    ctx.font = "bold 24px 'Microsoft JhengHei'";
    ctx.fillText("皇后-仙杜瑞拉", boxX + 20, boxY + 50);
    ctx.fillStyle = "white";
    ctx.font = "18px 'Microsoft JhengHei'";

    // --- 修改後的對話選取邏輯 ---
    let currentPool;

// 1. 最優先：正在播放「換到道具」的感謝對話 (Success 狀態)
if (isQueenRejected === "success") {
    currentPool = queenSuccessDialog;
} 
// 2. 其次：已經換完道具了，之後再點皇后 (Owned 狀態)
else if (items.love && items.love.isOwned) {
    currentPool = [["我的老鼠朋友們不愛我了..."]];
}
    else if (isQueenRejected === "denied") {
        currentPool = queenRejectDialog;
    } 
    else if (isQueenRejected === "wrong") {
        currentPool = queenWrongItemDialog;
    } 
    else if (isQueenRejected === "accepted") {
        currentPool = queenAcceptDialog; // 等待中顯示 "太好了，帶他們來見我"
    } 
    else {
        currentPool = queenDialogs;
    }

    const lines = currentPool[queenPage];
    if (lines) {
        let yOffset = 0;
        lines.forEach((line) => {
            const subLines = line.split('\n');
            subLines.forEach((subLine) => {
                ctx.fillText(subLine, boxX + 20, boxY + 100 + yOffset);
                yOffset += 35;
            });
        });
    }

    // 按鈕邏輯
    if (!items.love || !items.love.isOwned || isQueenRejected === "success") {
        if (isQueenRejected === false && queenPage === queenDialogs.length - 1) {
            drawQueenButton(layout.btnYes, "是", "#552255");
            drawQueenButton(layout.btnNo, "否", "#552255");
        } else if (isQueenRejected === "accepted") {
            drawQueenButton(layout.btnNo, "算了", "#AA0000"); 
        }
    }
}

function handleCastleInsideClick(tx, ty) {
    const boxArea = { x: 420, y: 50, w: 350, h: 250 };
    
    if (isQueenTalking) {
    // --- 關鍵修正：只有在不是 "success" 狀態時，持有加護才直接關閉 ---
    // 這樣才能讓 success 狀態下的三頁對話順利跑完
    if (items.love && items.love.isOwned && isQueenRejected !== "success") {
        if (checkClick(tx, ty, boxArea)) {
            isQueenTalking = false;
            queenPage = 0;
        }
        return;
    }

        // A. 如果處於「等待道具」狀態 (accepted)
        if (isQueenRejected === "accepted") {
            if (checkClick(tx, ty, layout.btnNo)) {
                isQueenRejected = "denied";
                queenPage = 0;
            }
            return; 
        }

        // --- B. 如果處於「拒絕/錯誤/成功」狀態 (翻頁邏輯) ---
if (isQueenRejected === "denied" || isQueenRejected === "wrong" || isQueenRejected === "success") {
        if (checkClick(tx, ty, boxArea)) {
            let currentPool = queenRejectDialog;
            if (isQueenRejected === "wrong") currentPool = queenWrongItemDialog;
            if (isQueenRejected === "success") currentPool = queenSuccessDialog; 

            if (queenPage < currentPool.length - 1) {
                queenPage++; // 這樣就會順利翻到第二、第三頁
            } else {
                // 三頁都看完了，才重置狀態
                isQueenTalking = false;
                isQueenRejected = false; // 這行執行後，下次再點皇后就會進到「不愛我了」的邏輯
                queenPage = 0;
            }
        }
        return; 
    }
        // C. 正常對話詢問中 (尚未選 是/否)
        if (queenPage === queenDialogs.length - 1) {
            if (checkClick(tx, ty, layout.btnYes)) {
                isQueenRejected = "accepted";
                queenPage = 0; 
            } else if (checkClick(tx, ty, layout.btnNo)) {
                isQueenRejected = "denied";
                queenPage = 0;
            }
        } else if (checkClick(tx, ty, boxArea)) {
            queenPage++;
        }

    } else {
        // --- 平時狀態：點擊皇后立繪或返回箭頭 ---
        // 1. 點擊皇后立繪
        if (tx > 380 && tx < 520 && ty > 200 && ty < 360) {
            if (sfx && sfx.queen) {
                sfx.queen.currentTime = 0;
                sfx.queen.play().catch(e => console.log("音效播放失敗", e));
            }
            isQueenTalking = true;
            queenPage = 0;

            // 只有在「沒拿到道具」時，才重置為詢問模式
            if (!(items.love && items.love.isOwned)) {
                isQueenRejected = false;
                hasMetQueen = true; 
            }
        }
        // 2. 點擊返回箭頭
        if (checkClick(tx, ty, layout.castleDown)) {
            changeScene("castle", true);
        }
    }
}

function onQueenReceivedItem(itemKey) {
    // 只有在玩家點了「是」，狀態處於 "accepted" (等待道具中) 時，才收件
    if (isQueenTalking && isQueenRejected === "accepted") {
        
        isQueenTalking = true; 
        queenPage = 0;
        
        if (itemKey === "mouse") {
            // --- 核心修正：時機點錯開 ---
            
            // 1. 先把老鼠從背包移除 (騰出空間)
            if (items.mouse) {
                items.mouse.isOwned = false;
            }

            // 2. 嘗試加入「愛的加護」
            if (addItem("love")) { 
                // 成功拿到加護
                isQueenRejected = "success"; 
                queenPage = 0;
                
                // 重新整理背包位置
                if (typeof autoArrangeAll === "function") autoArrangeAll();
                console.log("任務完成：獲得愛的加護");
            } else {
                // --- 萬一真的還是失敗的保險機制 ---
                // (通常不會發生，因為老鼠已經拿走了，除非 addItem 邏輯有其他限制)
                items.mouse.isOwned = true; // 把老鼠還給玩家
                alert("背包空間不足！請先清出位置。"); 
            }
        } else {
            // 給錯東西
            isQueenRejected = "wrong"; 
        }
    } else {
        console.log("皇后現在不想收東西，道具彈回背包");
        return; 
    }
}

// 補回被刪除的按鈕繪製函數
function drawQueenButton(rect, text, bgColor) {
    ctx.save();
    ctx.fillStyle = bgColor;
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
    
    ctx.fillStyle = "white";
    ctx.font = "bold 18px 'Microsoft JhengHei'";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    // 繪製文字在按鈕正中央
    ctx.fillText(text, rect.x + rect.w / 2, rect.y + rect.h / 2);
    ctx.restore();
}