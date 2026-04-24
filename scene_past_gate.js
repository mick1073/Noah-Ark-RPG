// --- 1. 變數與對話定義 ---
let hasReceivedFish = false;
let hasReceivedCompass = false;
let blacksmithDialogueIndex = 0;
let showRejectText = false;

const blacksmithLines = [
    "呼！裡面好熱喔！",
    "整天工作累死了，",
    "你要不要陪我玩個數學遊戲？",
    "如果你贏了我就送你個禮物。" 
];

let blacksmithWinLines = [
    "你真厲害...\n現在已經很少人這麼有耐心，", 
    "這條20斤重的金魚\n是我不久前在河邊用漁籠抓到的", 
    "真的很罕見，就送給你吧\n以後跟鐵有關的事情就來問我吧"
];

let blacksmithAfterLines = [
    "歡迎光臨",
    "你有跟「鐵」有關的問題想問我嗎？" 
];

let blacksmithFailLines = []; 

// 小遊戲變數
let gameAnswer = [];
let currentGuess = [];
let guessHistory = [];
let maxAttempts = 10;
let gameStatus = "playing";

// --- 2. 核心函數 ---

function initBlacksmithGame() {
    let nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    nums.sort(() => Math.random() - 0.5);
    gameAnswer = nums.slice(0, 4);
    currentGuess = [];
    guessHistory = [];
    gameStatus = "playing";
    showRejectText = false;
    gameState = "BlacksmithGame";
}

function renderPastGate() {
    // A. 背景與 NPC
    if (images.bgPastGate && images.bgPastGate.complete) {
        ctx.drawImage(images.bgPastGate, 0, 0, 800, 450);
    }
    if (images.npcBlacksmith && images.npcBlacksmith.complete) {
        ctx.drawImage(images.npcBlacksmith, 450, 250, 120, 120);
    }
    
    // B. UI 分流
    if (gameState === "BlacksmithGame") {
        renderNumberGameUI(); 
    } else if (["BlacksmithDialog", "BlacksmithWinDialog", "BlacksmithFailDialog", "BlacksmithWaitingItem"].includes(gameState)) {
        renderBlacksmithDialogUI(); 
    }

    // C. 箭頭
    if (gameState === "past_gate") {
        if (typeof drawDirectionArrow === "function") {
            drawDirectionArrow(700, 370, 70, 70, "right");
        }
    }
}

function handlePastGateClick(tx, ty) {
    const box = layout.textArea;
    const bY = layout.btnYes; 
    const bN = layout.btnNo;

    // 1. 小遊戲中
    if (gameState === "BlacksmithGame") {
        handleGameAction(tx, ty);
        return;
    }

    // --- ✨ 新增：等待丟道具狀態下的「算了」點擊 ---
    if (gameState === "BlacksmithWaitingItem") {
        if (tx > bN.x && tx < bN.x + bN.w && ty > bN.y && ty < bN.y + bN.h) {
            showRejectText = true; // 跳到「好吧，謝謝光臨」
            gameState = "BlacksmithDialog"; 
            return;
        }
        return; // 等待狀態中不給翻頁，強迫玩家要麼丟道具，要麼點算了
    }

    // 2. 對話中
   if (["BlacksmithDialog", "BlacksmithWinDialog", "BlacksmithFailDialog"].includes(gameState)) {
    let linesToDisplay;

    // 1. 優先判斷是否處於「勝利」或「失敗」狀態（這包含丟完磁鐵的瞬間）
    if (gameState === "BlacksmithWinDialog") {
        linesToDisplay = blacksmithWinLines;
    } 
    else if (gameState === "BlacksmithFailDialog") {
        linesToDisplay = blacksmithFailLines;
    } 
    // 2. 如果只是普通對話，再判斷是否要給售後台詞
    else if (hasReceivedFish) {
        linesToDisplay = blacksmithAfterLines;
    } 
    // 3. 都不是的話，就是初始對話
    else {
        linesToDisplay = blacksmithLines;
    }

        // 判斷按鈕點擊 (售後服務的「是/否」)
        if (gameState === "BlacksmithDialog" && blacksmithDialogueIndex === linesToDisplay.length - 1 && !showRejectText) {
            if (tx > bY.x && tx < bY.x + bY.w && ty > bY.y && ty < bY.y + bY.h) {
                if (!hasReceivedFish) {
                    initBlacksmithGame();
                } else {
                    // ✨ 進入等待狀態
                    gameState = "BlacksmithWaitingItem";
                }
                return;
            }
            if (tx > bN.x && tx < bN.x + bN.w && ty > bN.y && ty < bN.y + bN.h) {
                showRejectText = true;
                return;
            }
        }

        // 一般翻頁邏輯
if (gameState === "BlacksmithDialog" && blacksmithDialogueIndex === linesToDisplay.length - 1 && !showRejectText) {
    // 檢查點擊位置是否在按鈕上
    const clickedYes = (tx > bY.x && tx < bY.x + bY.w && ty > bY.y && ty < bY.y + bY.h);
    const clickedNo = (tx > bN.x && tx < bN.x + bN.w && ty > bN.y && ty < bN.y + bN.h);
    
    // 如果點的不是按鈕，就 return 結束函數，什麼都不要做 (對話就不會關閉)
    if (!clickedYes && !clickedNo) return; 
}

// 攔截 2: 當正在「等待道具」時 (您之前有寫一部分，我們確保它徹底攔截)
if (gameState === "BlacksmithWaitingItem") {
    const clickedCancel = (tx > bN.x && tx < bN.x + bN.w && ty > bN.y && ty < bN.y + bN.h);
    if (clickedCancel) {
        showRejectText = true;
        gameState = "BlacksmithDialog";
    }
    return; // 這裡一定要 return，確保點擊其他地方不會結束對話
}
        if (tx > box.x && tx < box.x + box.w && ty > box.y && ty < box.y + box.h) {
            if (showRejectText) {
                gameState = "past_gate";
                showRejectText = false;
                return;
            }

            if (blacksmithDialogueIndex < linesToDisplay.length - 1) {
    blacksmithDialogueIndex++; // 先翻到下一頁
    
    // 🎁 關鍵修改：翻頁後立刻檢查目前的台詞
    const currentLine = linesToDisplay[blacksmithDialogueIndex];

    // 1. 領取金魚的時機 (維持原樣)
    if (gameState === "BlacksmithWinDialog" && !hasReceivedFish) {
        if (currentLine.includes("金魚") || blacksmithDialogueIndex === 1) {
            if (addItem("river_daughter") === "SUCCESS") {
                hasReceivedFish = true;
                if (sfx.itemGet) sfx.itemGet.play();
            }
        }
    }

    // 2. ✨ 領取羅盤的時機：當台詞出現「改良」時
    if (gameState === "BlacksmithWinDialog" && hasReceivedFish && !hasReceivedCompass) {
        if (currentLine.includes("改良")) { // 偵測到「我把它改良了一下」這句話
            if (addItem("compass") === "SUCCESS") {
                hasReceivedCompass = true; // 鎖上，避免重複獲得
                if (sfx.itemGet) sfx.itemGet.play();
                showSystemMessage("獲得了 羅盤！");
            }
        }
    }
} else {
    // 這裡原本領道具的邏輯就可以刪掉了，因為上面已經領過了
    gameState = "past_gate";
    blacksmithDialogueIndex = 0;
}
        }
        return;
    }

    // 3. 點擊 NPC (進入對話)
    if (tx > 450 && tx < 570 && ty > 250 && ty < 370) {
        blacksmithDialogueIndex = 0;
        showRejectText = false;
        gameState = "BlacksmithDialog";
        if (sfx.blacksmith) { sfx.blacksmith.currentTime = 0; sfx.blacksmith.play(); }
        return;
    }

    // 4. 點擊箭頭
    if (gameState === "past_gate") {
        if (tx > 700 && tx < 770 && ty > 370 && ty < 440) {
            if (typeof changeScene === "function") changeScene("past_pasture");
        }
    }
}

// --- 3. UI 繪製函數 ---

function renderBlacksmithDialogUI() {
    ctx.save();
    const box = layout.textArea;
    const bY = layout.btnYes;
    const bN = layout.btnNo;

    // 繪製大立繪
    if (images.npcBlacksmith && images.npcBlacksmith.complete) {
        ctx.drawImage(images.npcBlacksmith, 0, 50, 400, 400); 
    }

    // 1. 對話框背景
    ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
    ctx.strokeStyle = "#d4af37";
    ctx.lineWidth = 4;
    ctx.fillRect(box.x, box.y, box.w, box.h);
    ctx.strokeRect(box.x, box.y, box.w, box.h);

    // 強制重設對齊方式
    ctx.textAlign = "left"; 
    ctx.textBaseline = "top";

    // 2. 名字
    ctx.fillStyle = "#d4af37";
    ctx.font = "bold 24px 'Microsoft JhengHei'";
    ctx.fillText("鐵匠-傑哥", box.x + 25, box.y + 25); 

    // 3. 文字內容與按鈕分流 -----------------------------------------
    ctx.fillStyle = "white";
    ctx.font = "20px 'Microsoft JhengHei'";
    
    // ✨ 核心修改：判斷是否在「等待丟道具」狀態
    if (gameState === "BlacksmithWaitingItem") {
       ctx.fillStyle = "white";
    ctx.font = "20px 'Microsoft JhengHei'";
    ctx.fillText("請讓我看看。", box.x + 25, box.y + 80);
                
        // 🔴 繪製紅色的「算了」 (座標使用 btnNo)
        drawSpecialRedBtn(bN.x, bN.y, bN.w, bN.h, "算了");

    } else if (showRejectText) {
        // 拒絕台詞
        ctx.fillText(hasReceivedFish ? "好吧，謝謝光臨。" : "哼！你真無趣。", box.x + 25, box.y + 80);
    } else {
        // 一般對話台詞
        let lines = blacksmithLines;
        if (gameState === "BlacksmithFailDialog") lines = blacksmithFailLines;
        else if (gameState === "BlacksmithWinDialog") lines = blacksmithWinLines;
        else if (hasReceivedFish) lines = blacksmithAfterLines; // 售後台詞

        if (lines && lines[blacksmithDialogueIndex]) {
            const currentText = lines[blacksmithDialogueIndex];
            const subLines = currentText.split("\n");
            subLines.forEach((line, i) => {
                ctx.fillText(line, box.x + 25, box.y + 80 + (i * 35));
            });
        }

        // 4. 按鈕判定 (只有在最後一頁才顯示)
        if (gameState === "BlacksmithDialog" && blacksmithDialogueIndex === lines.length - 1) {
            // ✨ ✨ ✨ 修正點：無論是否拿過魚，這裡都畫 「是」 和 「否」
            drawGameChoiceBtn(bY.x, bY.y, bY.w, bY.h, "是");
            drawGameChoiceBtn(bN.x, bN.y, bN.w, bN.h, "否");
        }
    }
    ctx.restore();
}

function drawGameChoiceBtn(x, y, w, h, text) {
    ctx.save();
    ctx.fillStyle = "rgba(40, 40, 40, 0.9)";
    ctx.strokeStyle = "#d4af37";
    ctx.lineWidth = 2;
    ctx.fillRect(x, y, w, h);
    ctx.strokeRect(x, y, w, h);
    ctx.fillStyle = "white";
    ctx.font = "bold 18px 'Microsoft JhengHei'";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, x + w / 2, y + h / 2);
    ctx.restore();
}

function drawSpecialRedBtn(x, y, w, h, text) {
    ctx.save();
    ctx.fillStyle = "rgba(139, 0, 0, 0.9)";
    ctx.strokeStyle = "#ff4d4d";
    ctx.lineWidth = 2;
    ctx.fillRect(x, y, w, h);
    ctx.strokeRect(x, y, w, h);
    ctx.fillStyle = "white";
    ctx.font = "bold 18px 'Microsoft JhengHei'";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, x + w / 2, y + h / 2);
    ctx.restore();
}

function renderNumberGameUI() {

    // A. 遮罩背景 (維持全黑)

    ctx.fillStyle = "black";

    ctx.fillRect(0, 0, 800, 450);



    // B. 正上方規則說明 (稍微調小，留出空間)

    ctx.fillStyle = "#f1c40f";

    ctx.font = "bold 20px 'Microsoft JhengHei'";

    ctx.textAlign = "center";

    ctx.fillText("【 猜數字遊戲 】", 400, 30);

    ctx.font = "14px 'Microsoft JhengHei'";

    ctx.fillStyle = "#aaa";

    ctx.fillText("規則:從1-9選4個數字。A:數字位置皆對 | B:數字對位置錯", 400, 55);



    // --- 左側區域 (1-9 鍵盤 + 提交) ---

    const keyStartX = 100, keyStartY = 100, bSize = 65, gap = 15;

    for (let i = 0; i < 9; i++) {

        let x = keyStartX + (i % 3) * (bSize + gap);

        let y = keyStartY + Math.floor(i / 3) * (bSize + gap);

        

        // 繪製按鈕底色

        ctx.fillStyle = currentGuess.includes(i + 1) ? "#333" : "rgba(212, 175, 55, 0.2)";

        ctx.strokeStyle = "#d4af37";

        ctx.lineWidth = 2;

        ctx.fillRect(x, y, bSize, bSize);

        ctx.strokeRect(x, y, bSize, bSize);

        

        // 數字

        ctx.fillStyle = currentGuess.includes(i + 1) ? "#666" : "#d4af37";

        ctx.font = "bold 26px Arial";

        ctx.textAlign = "center";

        ctx.fillText(i + 1, x + bSize / 2, y + bSize / 2 + 10);

    }



    // 提交按鈕 (與鍵盤拉開距離)

    const subX = keyStartX, subY = 360, subW = (bSize * 3) + (gap * 2);

    ctx.fillStyle = (currentGuess.length === 4) ? "rgba(39, 174, 96, 0.3)" : "rgba(0, 0, 0, 0)";

    ctx.strokeStyle = (currentGuess.length === 4) ? "#2ecc71" : "#555";

    ctx.lineWidth = 3;

    ctx.fillRect(subX, subY, subW, 45);

    ctx.strokeRect(subX, subY, subW, 45);

    ctx.fillStyle = (currentGuess.length === 4) ? "#2ecc71" : "#555";

    ctx.font = "bold 20px 'Microsoft JhengHei'";

    ctx.fillText("提 交 答 案", subX + subW / 2, subY + 30);



    // --- 右側區域 (輸入格 + 歷史紀錄) ---

    const rightX = 450;



    // 1. 繪製 4 個輸入格 (放在右上)

    ctx.textAlign = "left";

    ctx.fillStyle = "#888";

    ctx.font = "16px 'Microsoft JhengHei'";

    ctx.fillText("目前輸入：", rightX, 90);



    for (let i = 0; i < 4; i++) {

        ctx.strokeStyle = "#d4af37";

        ctx.lineWidth = 2;

        ctx.strokeRect(rightX + i * 65, 105, 55, 55);

        if (currentGuess[i]) {

            ctx.fillStyle = "white";

            ctx.font = "bold 30px Arial";

            ctx.textAlign = "center";

            ctx.fillText(currentGuess[i], rightX + i * 65 + 27, 145);

        }

    }



    // 2. 歷史紀錄看板

    ctx.textAlign = "left";

    ctx.fillStyle = "#f1c40f";

    ctx.font = "16px 'Microsoft JhengHei'";

    ctx.fillText(`歷史紀錄 (剩餘次數: ${maxAttempts - guessHistory.length})`, rightX, 195);

    

    // 繪製歷史清單 (分左右兩欄顯示)

    guessHistory.forEach((h, i) => {

        let yPos = 225 + i * 22;

        ctx.font = "16px Courier New";

        

        // A. 顯示順序與數字

        ctx.textAlign = "left";

        ctx.fillStyle = "#aaa";

        ctx.fillText(`${i + 1}.`, rightX, yPos);

        ctx.fillStyle = "white";

        ctx.fillText(`[ ${h.guess.split('').join(' ')} ]`, rightX + 30, yPos);

        

        // B. 拆解 A 和 B 的數值 (例如 "1A2B" 拆出 1 和 2)

        let aCount = h.result.split('A')[0];

        let bCount = h.result.split('A')[1].split('B')[0];



        // C. 繪製 A (綠色或黃色)

        ctx.fillStyle = "#f1c40f"; // 黃色

        ctx.fillText(`${aCount}A`, rightX + 160, yPos);



        // D. 繪製 B (橘色)

        ctx.fillStyle = "#e67e22"; // 橘色

        ctx.fillText(`${bCount}B`, rightX + 200, yPos);

    });



    // G. 勝負處理

    if (gameStatus !== "playing") {

        ctx.fillStyle = "rgba(0, 0, 0, 0.9)";

        ctx.fillRect(rightX - 10, 350, 320, 80);

        ctx.strokeStyle = "#d4af37";

        ctx.lineWidth = 2;

        ctx.strokeRect(rightX - 10, 350, 320, 80);

        

        ctx.textAlign = "center";

        ctx.font = "bold 28px 'Microsoft JhengHei'";

        

        if (gameStatus === "win") {

            ctx.fillStyle = "#2ecc71"; // 綠色

            ctx.fillText("遊 戲 勝 利", rightX + 150, 400);

        } else {

            ctx.fillStyle = "#e74c3c"; // 紅色

            ctx.fillText("遊 戲 失 敗", rightX + 150, 400);

        }

    }

}

function handleGameAction(tx, ty) {
    // A. 遊戲結束狀態：點擊畫面任何地方後的操作
    if (gameStatus !== "playing") {
        if (sfx.blacksmith) {
            sfx.blacksmith.currentTime = 0;
            sfx.blacksmith.play();
        }

        if (gameStatus === "fail") {
            gameState = "BlacksmithFailDialog"; 
            blacksmithDialogueIndex = 0; // 確保從第一句開始
        } 
        else if (gameStatus === "win") {
            // ✨ ✨ ✨ 修正：贏了要進入「贏家對話狀態」而不是回大地圖
            gameState = "BlacksmithWinDialog";
            blacksmithDialogueIndex = 0; 
            
            // 如果還沒拿過魚，確保對話內容是送魚的台詞
            if (!hasReceivedFish) {
                blacksmithWinLines = [
                    "你真厲害...\n現在已經很少人這麼有耐心，", 
                    "這條20斤重的金魚\n是我不久前在河邊用漁籠抓到的", 
                    "真的很罕見，就送給你吧\n以後跟鐵有關的事情就來問我吧"
                ];
            }
        }

        gameStatus = "playing"; // 重置狀態
        return;
    }



    const keyStartX = 100, keyStartY = 100, bSize = 65, gap = 15;

    const rightX = 450;



    // 1. 偵測 1-9 鍵盤 (左側)

    for (let i = 0; i < 9; i++) {

        let x = keyStartX + (i % 3) * (bSize + gap);

        let y = keyStartY + Math.floor(i / 3) * (bSize + gap);

        

        if (tx > x && tx < x + bSize && ty > y && ty < y + bSize) {

            let num = i + 1;

            if (!currentGuess.includes(num) && currentGuess.length < 4) {

                currentGuess.push(num);

            }

            return; 

        }

    }



    // 2. 點擊右側輸入格：退格功能

    if (tx > rightX && tx < rightX + 260 && ty > 105 && ty < 160) {

        if (currentGuess.length > 0) currentGuess.pop();

        return;

    }



    // 3. 提交按鈕

    const subX = keyStartX, subY = 360, subW = (bSize * 3) + (gap * 2);

    if (tx > subX && tx < subX + subW && ty > subY && ty < subY + 45 && currentGuess.length === 4) {

        

        // 判定 A B 邏輯

        let a = 0, b = 0;

        currentGuess.forEach((n, i) => {

            if (n === gameAnswer[i]) a++;

            else if (gameAnswer.includes(n)) b++;

        });



        let res = `${a}A${b}B`;

        guessHistory.push({ guess: currentGuess.join(""), result: res });



        // --- 勝負判定區 ---

        if (res === "4A0B") {

            gameStatus = "win";

        } else if (guessHistory.length >= maxAttempts) {

            gameStatus = "fail";

            // 動態生成失敗對話內容

            blacksmithFailLines = [

                `哈...你真笨，答案是 ${gameAnswer.join("")}`,

                "但是跟你玩很有趣，",

                "隨時歡迎你再來挑戰"

            ];

            blacksmithDialogueIndex = 0; 

        }



        currentGuess = []; // 提交後清空

    }

}

function onBlacksmithReceivedItem(itemKey) {
    // 1. 檢查是否在等待狀態
    if (gameState !== "BlacksmithWaitingItem") return;

    // 2. 如果給的是正確道具：磁鐵 (magnet)
    if (itemKey === "magnet") {
        // 先移除玩家手中的磁鐵
        if (typeof removeItem === "function") removeItem("magnet");

        // 設定獲勝對話
        blacksmithWinLines = [
            "嗯...這塊鐵真有意思",
            "我把它改良了一下",
            "就叫做羅盤吧！",
            "羅盤可以為你指出方位\n特別方便。"
        ];
        
        // 切換到勝利對話狀態
        gameState = "BlacksmithWinDialog";
        blacksmithDialogueIndex = 0;
        
        // 註：道具 compass 的給予邏輯放在 handlePastGateClick 的翻頁判斷中 (見下文)
    } 
    // 3. 如果給錯道具
    else {
        blacksmithFailLines = [
            "這不是鐵，不是我的專業。"
        ];
        gameState = "BlacksmithFailDialog";
        blacksmithDialogueIndex = 0;
    }
}


window.onBlacksmithReceivedItem = onBlacksmithReceivedItem;
window.renderPastGate = renderPastGate;
window.handlePastGateClick = handlePastGateClick;