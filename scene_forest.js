// --- scene_forest.js ---

var hamelinTaskStep = "intro";
var isHamelinGameActive = false;
var hamelinCircles = []; // 儲存 15 個圓圈的物件
var selectedIndices = []; // 玩家目前選中的圓圈索引
var gameTurn = "player"; // "player" 或 "hamelin"
var isMouseGiven = false;
var lastPlayerMoveCount = 0;
var hasMetQueen = false;

function renderForestScene() {
    ctx.save();
    if (images.bgForest) {
        ctx.drawImage(images.bgForest, 0, 0, 800, 450);
    }
    drawDirectionArrow(layout.forestToRiver.x, layout.forestToRiver.y, 
                       layout.forestToRiver.w, layout.forestToRiver.h, "left");
    drawDoor(layout.hamelinDoor);
    ctx.restore();
}

function renderForestInside() {
    ctx.save();
    if (images.bgForestInside) {
        ctx.drawImage(images.bgForestInside, 0, 0, 800, 450);
    }
    drawDoor(layout.hamelinExit);

    if (images.npcHamelin) {
        ctx.drawImage(images.npcHamelin, 685, 210, 120, 130);
    }

    if (isHamelinTalking) {
        drawHamelinDialog();
    }
    if (isHamelinGameActive) {
        drawHamelinMiniGame();
    }
    ctx.restore();
}

function handleForestClick(tx, ty) {
    if (isHamelinGameActive) {
        handleHamelinGameClick(tx, ty);
        return;
    }
    if (isHamelinTalking) {
        handleHamelinDialogClick(tx, ty);
        return; 
    }

    if (gameState === "forest") {
        if (checkClick(tx, ty, layout.forestToRiver)) {
            changeScene("river");
        }
        else if (checkClick(tx, ty, layout.hamelinDoor)) {
            changeScene("forest_inside", true);
        }
    } 
    else if (gameState === "forest_inside") {
        if (checkClick(tx, ty, layout.hamelinExit)) {
            isHamelinTalking = false;
            changeScene("forest", true);
        }
        else if (tx > 685 && tx < 800 && ty > 210 && ty < 340) {
            if (sfx && sfx.hamelin) {
                sfx.hamelin.currentTime = 0;
                sfx.hamelin.play().catch(e => console.log("哈梅林音效播放失敗"));
            }
            isHamelinTalking = true;

        }
    }
}

function handleHamelinDialogClick(tx, ty) {
    const box = layout.textArea;
    
    // --- A. 遊戲結束後的處理 (贏或輸) ---
   if (hamelinTaskStep === "hamelinWin" || hamelinTaskStep === "playerWin") {
        if (checkClick(tx, ty, box)) {
            // 這裡已經在 checkGameOver 給過道具了，所以只處理狀態切換
            isHamelinTalking = false;
            hamelinTaskStep = "after_game"; // 永久切換到日常模式
            // changeScene("forest_inside"); <-- 刪除這行，直接留在屋內
            return; 
        }
    }

// --- C. 第二種對話：日常模式 ---
   else if (hamelinTaskStep === "after_game") {
    if (checkClick(tx, ty, layout.btnMouse)) {
        // --- 核心連動檢查 ---
        if (!hasMetQueen) {
            // 如果還沒見過皇后，哈梅林不打算聊這件事
            hamelinTaskStep = "mouse_locked"; 
        } 
        else if (isMouseGiven) {
            hamelinTaskStep = "mouse_already_given"; 
        } 
        else {
            // 見過皇后了，且還沒領過，正式進入領取流程
            if (typeof addItem === "function") {
                addItem("mouse"); 
                showSystemMessage("獲得了：好朋友老鼠");
            }
            isMouseGiven = true;
            hamelinTaskStep = "give_mouse";
        }
    }
        else if (checkClick(tx, ty, layout.btnCow)) {
            hamelinTaskStep = "talk_cow";   // 討論母牛
        }
        else if (checkClick(tx, ty, layout.btnYaf)) {
            hamelinTaskStep = "talk_yaf";   // 討論雅弗
        }
        else if (checkClick(tx, ty, layout.btnReplay)) {
            isHamelinTalking = false;
            initHamelinGame();              // 重新開始遊戲，注意：這時 winnerStep 會指向 replay 結局
            hamelinTaskStep = "replaying";  // 標記現在是純娛樂局
        }
        else if (checkClick(tx, ty, box)) {
            isHamelinTalking = false;
        }
    }
    else if (["mouse_locked","give_mouse", "mouse_already_given", "talk_cow", "talk_yaf", "replayWin", "replayLose"].includes(hamelinTaskStep)) {
        if (checkClick(tx, ty, box)) {
            // 這裡不再進行 addItem，因為在 handleHamelinDialogClick 的 after_game 判斷中已經給過了
            
            // 單純回到日常選單狀態
            hamelinTaskStep = "after_game";
            isHamelinTalking = false;
        }
    }

    // --- B. 一般對話流程 ---

    // 1. 初始對話
    if (hamelinTaskStep === "intro") {
        if (checkClick(tx, ty, box)) hamelinTaskStep = "askPay";
    } 
    // 2. 詢問付錢
    else if (hamelinTaskStep === "askPay") {
        if (checkClick(tx, ty, layout.btnYes)) {
            hamelinTaskStep = "accepted";
            showSystemMessage("你答應幫忙付錢。");
        } 
        else if (checkClick(tx, ty, layout.btnNo)) {
            hamelinTaskStep = "challenge";
        }
    }
    // 3. 答應付錢後點擊「算了」
    else if (hamelinTaskStep === "accepted") {
        if (checkClick(tx, ty, layout.btnNo)) {
            hamelinTaskStep = "challenge";
        }
    }
    // 4. 挑戰開始前對話
    else if (hamelinTaskStep === "challenge" || hamelinTaskStep === "wrongItem") {
        if (checkClick(tx, ty, box)) {
            isHamelinTalking = false;
            // 準備進入遊戲時，hamelinTaskStep 最好先保留或清空，看你的邏輯
            initHamelinGame(); 
        }
    }
    // 5. 給錢成功後結束 (金幣包路徑)
    else if (hamelinTaskStep === "finish") {
        if (checkClick(tx, ty, box)) {
            isHamelinTalking = false;
            hamelinTaskStep = "intro"; 
        }
    }
}

function drawHamelinDialog() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)"; 
    ctx.fillRect(0, 0, 800, 450);
    const box = layout.textArea;

    if (images.npcHamelin) {
        ctx.save();
        ctx.drawImage(images.npcHamelin, 0, 50, 380, 400); 
        ctx.restore();
    }

    ctx.fillStyle = "rgba(20, 10, 5, 0.9)";
    ctx.fillRect(box.x, box.y, box.w, box.h);
    ctx.strokeStyle = "#deb887";
    ctx.lineWidth = 3;
    ctx.strokeRect(box.x, box.y, box.w, box.h);

    ctx.fillStyle = "#deb887";
    ctx.font = "bold 24px 'Microsoft JhengHei'";
    ctx.fillText("吹笛人-哈梅林", box.x + 20, box.y + 45);

    const textX = box.x + 30; 
    const textY = box.y + 85; // 補上這個變數定義，解決報錯
    ctx.fillStyle = "white";
    ctx.font = "17px 'Microsoft JhengHei'";

    // --- 開始對話內容邏輯 ---

    if (hamelinTaskStep === "after_game") {
        ctx.fillText("唷！勇者，你又來啦？找我什麼事？", textX, textY + 15);
        drawChoiceButton(layout.btnMouse, "找老鼠");
        drawChoiceButton(layout.btnCow, "找母牛");
        drawChoiceButton(layout.btnYaf, "找雅弗");
        drawChoiceButton(layout.btnReplay, "玩遊戲", "#228b22");
    } 
    else if (hamelinTaskStep === "give_mouse") {
        ctx.fillText("原來之前幫皇后除去蟑螂，", textX, textY);
        ctx.fillText("一併抓走了皇后的朋友-老鼠。", textX, textY + 30);
        ctx.fillText("真不好意思，我以為是害蟲，", textX, textY + 60);
        ctx.fillText("謝謝你幫我解除誤會。", textX, textY + 90);
        ctx.fillText("這是皇后的朋友-老鼠，", textX, textY + 120);
        ctx.fillText("這請你幫我還給她。", textX, textY + 150);
    } 
    else if (hamelinTaskStep === "mouse_already_given") {
        ctx.fillText("你當我吃飽很閒啊？", textX, textY + 15);
        ctx.fillText("都說是誤會一場了，", textX, textY + 45);
        ctx.fillText("別再來煩我這件事。", textX, textY + 75);
    }
    else if (hamelinTaskStep === "talk_cow") {
        ctx.fillText("我的笛子可以控制害蟲，", textX, textY + 15);
        ctx.fillText("那麼大的生物我可控制不了。", textX, textY + 45);
    } 
    else if (hamelinTaskStep === "talk_yaf") {
        ctx.fillText("我的笛子可以控制害蟲，", textX, textY + 15);
        ctx.fillText("你認為雅弗是害蟲嗎？", textX, textY + 45);
        ctx.fillText("你也太過份了！", textX, textY + 75);
    } 
    else if (hamelinTaskStep === "replayWin") {
        ctx.fillText("這次是你贏了，歡迎再來一起玩！", textX, textY + 15);
    } 
    else if (hamelinTaskStep === "replayLose") {
        ctx.fillText("哈哈，我果然是最強大腦，", textX, textY + 15);
        ctx.fillText("歡迎再來一起玩！", textX, textY + 45);
    } 
    else if (hamelinTaskStep === "intro") {
        ctx.fillText("哼，真是氣死我了！", textX, textY);
        ctx.fillText("我幫仙子國除去蟑螂威脅，", textX, textY + 30);
        ctx.fillText("皇后說要給我好大一筆錢卻不信守承諾...", textX, textY + 60);
        ctx.fillText("我一定要回到城市裡，擄走所有小孩！", textX, textY + 90);
    } 
    else if (hamelinTaskStep === "askPay") {
        ctx.fillText("你在這邊幹麻？", textX, textY + 15);
        ctx.fillText("想幫皇后付那筆欠款嗎？", textX, textY + 45);
        drawChoiceButton(layout.btnYes, "是");
        drawChoiceButton(layout.btnNo, "否");
    } 
    else if (hamelinTaskStep === "accepted") {
        ctx.fillText("喔？那筆錢是 1000 金幣。", textX, textY + 15);
        ctx.fillText("交出來，不然要你好看。", textX, textY + 45);
        drawChoiceButton(layout.btnNo, "算了", "#8b0000");
    } 
    else if (hamelinTaskStep === "challenge" || hamelinTaskStep === "wrongItem") {
        const line1 = hamelinTaskStep === "wrongItem" ? "這什麼？跟 1000 金幣可差遠了！" : "站住，你以為我這邊是說來就來說走就走嗎？";
        ctx.fillText(line1, textX, textY);
        ctx.fillText("想離開？除非你能贏得了我！", textX, textY + 30);
    } 
    else if (hamelinTaskStep === "hamelinWin" || hamelinTaskStep === "playerWin") {
        const winLine = hamelinTaskStep === "hamelinWin" ? "哈哈，是我贏了！不過..." : "沒想到你竟然贏了我...";
        ctx.fillText(winLine, textX, textY);
        ctx.fillText("我可是最強大腦。敢跟我對戰也算你有勇氣。", textX, textY + 30);
        ctx.fillText("這個勇氣的加護就送給你了，歡迎再來挑戰！", textX, textY + 60);
    }
    else if (hamelinTaskStep === "mouse_locked") {
    ctx.fillText("老鼠？我是抓了一大堆，", textX, textY + 15);
    ctx.fillText("他們現在是我的小幫手。", textX, textY + 45);
    ctx.fillText("沒事別來煩我，我很忙的。", textX, textY + 75);
}
}

function drawChoiceButton(rect, text, bgColor = "#3d2b1f") {
    ctx.fillStyle = bgColor; 
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    ctx.strokeStyle = "#deb887";
    ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
    ctx.fillStyle = "white";
    ctx.font = "bold 20px 'Microsoft JhengHei'";
    ctx.textAlign = "center";
    ctx.fillText(text, rect.x + rect.w/2, rect.y + rect.h/2 + 7);
    ctx.textAlign = "left"; 
}

function onHamelinReceivedItem(itemKey) {
    // 【嚴格限定】只有在哈梅林開口要錢 (accepted) 
    // 或者 玩家剛給錯東西 (wrongItem) 正在重給時，才受理
    const isReadyToReceive = (hamelinTaskStep === "accepted" || hamelinTaskStep === "wrongItem");

    if (!isReadyToReceive) {
        // 時機不對（例如還在 intro、askPay 或 after_game 狀態），直接退回
        return; 
    }

    // --- 進入此區代表時機正確 ---
    isHamelinTalking = true; 

    if (itemKey === "gold_bag") { 
        showSystemMessage("你交出了金幣。");
        hamelinTaskStep = "finish"; 
    } else {
        // 雖然他在收錢，但你給了不對的東西
        hamelinTaskStep = "wrongItem"; 
    }
}

function checkClick(tx, ty, area) {
    return area && tx > area.x && tx < area.x + area.w && ty > area.y && ty < area.y + area.h;
}

function initHamelinGame() {
    hamelinCircles = [];
    selectedIndices = [];
    gameTurn = "player";
    isHamelinGameActive = true;

    const startX = 400; 
    const startY = 120;
    const gap = 50;   

    let idCounter = 1; // <--- 新增 ID 計數器
    for (let row = 0; row < 5; row++) {
        for (let col = 0; col <= row; col++) {
            hamelinCircles.push({
                id: idCounter++, // <--- 注入秘籍對應的 ID
                x: startX - (row * gap / 2) + (col * gap),
                y: startY + (row * gap * 0.866), 
                r: 18,
                active: true,
                isFading: false,
                opacity: 1.0,
                row: row,
                col: col
            });
        }
    }
}

// --- 哈梅林小遊戲核心邏輯：最強大腦版 ---

function drawHamelinMiniGame() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
    ctx.fillRect(0, 0, 800, 450);

    ctx.fillStyle = "white";
    ctx.font = "bold 24px 'Microsoft JhengHei'";
    ctx.textAlign = "center";
    // 小細節：文字也改一下，更有感覺
    ctx.fillText(gameTurn === "player" ? "輪到你了：拿走1~3 隻害蟲，只能相鄰且直線，拿走最後一隻輸" : "哈梅林正在移動...", 400, 50);
    
    hamelinCircles.forEach((c, index) => {
        if (!c.active && !c.isFading) return; 

        if (c.isFading) {
            c.opacity -= 0.05; 
            if (c.opacity <= 0) {
                c.opacity = 0;
                c.isFading = false;
                c.active = false; 
            }
        }

        ctx.save();
        ctx.globalAlpha = c.opacity;

        // --- 【唯一的修改區：從這裡開始】 ---
        
        // 1. 檢查圖片是否存在並且載入完成
        if (images.bugImg && images.bugImg.complete) {
            
            // 設定蟲子的大小 (圓形直徑的 2.5 倍，看起來比較剛好)
            const size = c.r * 2.5; 
            
            // 計算圖片的左上角坐標 ( c.x, c.y 是中心)
            const drawX = c.x - size / 2;
            const drawY = c.y - size / 2;

            // 2. 如果這隻蟲子被選中了，畫一個金色的發光特效在背後
            if (selectedIndices.includes(index)) {
                // 特效 A: 背後畫一個半透明金色圓形
                ctx.fillStyle = "rgba(255, 215, 0, 0.4)"; 
                ctx.beginPath();
                ctx.arc(c.x, c.y, c.r * 1.3, 0, Math.PI * 2);
                ctx.fill();
                
                // 特效 B: 加上金色外框
                ctx.strokeStyle = "#ffd700";
                ctx.lineWidth = 3;
                ctx.stroke();
            }

            // 3. 畫出蟲子圖片
            ctx.drawImage(images.bugImg, drawX, drawY, size, size);
            
        } else {
            // --- 防呆備案 (如果你貼給我的原本代碼) ---
            // 如果圖片還沒好，至少要畫個東西，不能讓畫面空空的
            ctx.beginPath();
            ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
            ctx.fillStyle = selectedIndices.includes(index) ? "#ffd700" : "#00ffff";
            ctx.fill();
            ctx.strokeStyle = "white";
            ctx.lineWidth = 2;
            ctx.stroke();
        }
        
        // --- 【修改區結束】 ---

        ctx.restore();
    });

    if (selectedIndices.length > 0 && gameTurn === "player") {
        drawChoiceButton({x: 350, y: 380, w: 100, h: 40}, "確認消除", "#228b22");
    }
    ctx.textAlign = "left"; 
}


function handleHamelinGameClick(tx, ty) {
    if (gameTurn !== "player") return;

    // --- 1. 確認按鈕的判定 (維持原樣) ---
    if (selectedIndices.length > 0 && tx > 350 && tx < 450 && ty > 380 && ty < 420) {
        confirmMove();
        return;
    }

    // --- 2. 蟲子圖片的點擊判定 ---
    hamelinCircles.forEach((c, index) => {
        if (!c.active) return;

        // 【優化點】我們改用矩形判定，讓點擊圖片的感應更直覺
        // 假設你的圖片顯示大小是直徑的 1.2 倍（比較好點）
        const hitArea = c.r * 1.5; 
        const isClicked = tx > c.x - hitArea && tx < c.x + hitArea &&
                          ty > c.y - hitArea && ty < c.y + hitArea;

        if (isClicked) {
            if (selectedIndices.includes(index)) {
                // 如果已經選了，就取消選取
                selectedIndices = selectedIndices.filter(i => i !== index);
                console.log("取消選取蟲子 ID:", c.id);
            } else if (selectedIndices.length < 3) {
                // 嘗試加入選取清單
                let tempSelection = [...selectedIndices, index];
                
                if (checkLineValid(tempSelection)) {
                    selectedIndices.push(index);
                    console.log("選取蟲子 ID:", c.id);
                } else {
                    showSystemMessage("只能選擇同方向且相鄰的蟲子！");
                }
            }
        }
    });
}

function checkLineValid(indices) {
    if (indices.length <= 1) return true;
    let balls = indices.map(i => hamelinCircles[i]);
    let rows = balls.map(b => b.row);
    let cols = balls.map(b => b.col);
    
    const isH = rows.every(r => r === rows[0]);
    const isRD = cols.every(c => c === cols[0]);
    const isLD = balls.every(b => (b.row - b.col) === (balls[0].row - balls[0].col));

    let sorted;
    if (isH) sorted = cols.sort((a,b)=>a-b);
    else if (isRD || isLD) sorted = rows.sort((a,b)=>a-b);
    else return false;

    for (let i = 0; i < sorted.length - 1; i++) {
        if (sorted[i+1] - sorted[i] !== 1) return false;
    }
    return true;
}

function confirmMove() {
    lastPlayerMoveCount = selectedIndices.length; 
    selectedIndices.forEach(idx => { 
        hamelinCircles[idx].isFading = true; // 球開始消失
    });
    // 注意：這裡不要清空 selectedIndices 太快，或者在 setTimeOut 前確保變數已存
    selectedIndices = []; 
    if (checkGameOver("player")) return; 
    gameTurn = "hamelin";
    setTimeout(hamelinAI, 1000); 
}

// 辨識群組與形狀的插件
function getGroups(activeBalls) {
    let groups = [];
    let visited = new Set();
    activeBalls.forEach(b => {
        if (!visited.has(b)) {
            let group = [];
            let queue = [b];
            visited.add(b);
            while (queue.length > 0) {
                let curr = queue.shift();
                group.push(curr);
                activeBalls.forEach(other => {
                    if (!visited.has(other) && isAdjacent(curr, other)) {
                        visited.add(other);
                        queue.push(other);
                    }
                });
            }
            groups.push(group);
        }
    });
    return groups;
}

function isAdjacent(b1, b2) {
    const dr = Math.abs(b1.row - b2.row);
    const dc = Math.abs(b1.col - b2.col);
    const dl = Math.abs((b1.row - b1.col) - (b2.row - b2.col));
    return (dr <= 1 && dc <= 1 && dl <= 1) && (dr + dc + dl <= 2);
}

function isTriangle(group) {
    if (!group || group.length !== 3) return false;
    // 三顆不連成一線即為三角形
    return !checkLineValid_ForAI(group);
}
const HAMELIN_DIRECTIONS = {
    hor: [[1],[2,3],[4,5,6],[7,8,9,10],[11,12,13,14,15]],
    left: [[11],[12,7],[13,8,4],[14,9,5,2],[15,10,6,3,1]],
    right: [[15],[10,14],[6,9,13],[3,5,8,12],[1,2,4,7,11]]
};

// --- 最強大腦 AI 邏輯 ---
function hamelinAI() {
    let possibleMoves = getAllLegalMoves();
    let currentActive = hamelinCircles.filter(c => c.active && !c.isFading);
    if (possibleMoves.length === 0) return;

    // --- 【物理斷路】偵測玩家是否動了核心球 ---
    // 這裡我們稍微放寬 opacity 判定，確保只要還在消失中的球都能被抓到
    let playerLastBalls = hamelinCircles.filter(c => c.isFading && c.opacity > 0.1); 
    let hitCore = playerLastBalls.some(b => [5, 8, 9].includes(b.id));

    if (hitCore) {
        // --- 核心秘技：強行移除哈梅林的 4-5-6 記憶 ---
        // 只要這組步法裡面包含了 ID 為 4, 5, 或 6 的球，直接過濾掉
        let saferMoves = possibleMoves.filter(move => {
            return !move.some(ball => [4, 5, 6].includes(ball.id));
        });

        // 只有在過濾後還有步可走的情況下，才取代原本的清單
        if (saferMoves.length > 0) {
            possibleMoves = saferMoves;
        }
    }

    // --- 0. 斬殺邏輯 (依然保留，AI 還是要贏，但不能用 4-5-6 贏) ---
    let killMove = possibleMoves.find(m => (currentActive.length - m.length) === 1);
    if (killMove) { executeMove(killMove); return; }

    let bestMove = null;
    let highestWeight = -1;

  
    for (let move of possibleMoves) {
        let ballsAfter = currentActive.filter(b => !move.includes(b));
        let groupsAfter = getGroups(ballsAfter);
        
        let pattern = [];
        groupsAfter.forEach(g => {
            let isLine = checkLineValid_ForAI(g);
            if (g.length === 1) pattern.push("1");
            else if (g.length === 2 && isLine) pattern.push("2");
            else if (g.length === 3 && isLine) pattern.push("3");
            else if (g.length === 3 && !isLine) {
                pattern.push(isPerfectTriangleEnhanced(g) ? "TRI" : "MANG");
            }
            else if (g.length === 4 && !isLine) pattern.push("PARA");
            else pattern.push(g.length.toString());
        });

        let sizeStr = JSON.stringify(pattern.sort());
        const winList = [
            '["PARA","TRI","TRI"]', '["1","TRI","TRI"]', '["1","1","1","TRI"]',
            '["1","1","1"]', '["1","1","1","1","1"]', '["2","2"]',
            '["1","TRI"]', '["PARA"]', '["2","2","TRI"]', '["1","1","PARA"]',
            '["1","1","2","2"]'
        ];

       if (winList.includes(sizeStr)) {
            let moveWeight = 0;

            // --- 偵測玩家動作 ---
            let playerLastBalls = hamelinCircles.filter(c => c.isFading && c.opacity > 0.5); 
            let hitCore = playerLastBalls.some(b => [5, 8, 9].includes(b.id));

            if (lastPlayerMoveCount === 1 && hitCore) {
                // 【核心修正】：如果玩家點了 5,8,9，AI 禁止消 3 顆！
                if (move.length === 3) {
                    moveWeight = -999999; // 直接扔進垃圾桶，絕對不選
                } else {
                    // 隨機選消 1 或 2，讓妳算不下去
                    moveWeight = 100000 + Math.random() * 10000; 
                }
            } else {
                // 正常模式
                moveWeight = move.length * 1000;
            }

            // 清理 MANG 的加分 (只在非干擾模式下加分，避免 4-5-6 靠這招翻身)
            if (!(lastPlayerMoveCount === 1 && hitCore)) {
                let currentMangs = getGroups(currentActive).filter(g => g.length === 3 && !isPerfectTriangleEnhanced(g)).length;
                let postMangs = groupsAfter.filter(g => g.length === 3 && !isPerfectTriangleEnhanced(g)).length;
                if (postMangs < currentMangs) moveWeight += 50000;
            }

            if (moveWeight > highestWeight) {
                highestWeight = moveWeight;
                bestMove = move;
            }
        }
    }

    // --- 2. 兜底邏輯：找不到必勝態時，優先消長的 ---
    if (!bestMove) {
        possibleMoves.sort((a, b) => b.length - a.length);
        bestMove = possibleMoves[0];
    }

    executeMove(bestMove);
}

function isPerfectTriangleEnhanced(group) {
    if (group.length !== 3) return false;
    
    // 取得號碼
    let ids = group.map(b => b.id).sort((a, b) => a - b);
    
    // 檢查是不是直線 (如果在任何一組秘籍裡三顆都在同一行，就不是三角形)
    for (let key in HAMELIN_DIRECTIONS) {
        let lines = HAMELIN_DIRECTIONS[key];
        if (lines.some(line => ids.every(id => line.includes(id)))) return false;
    }

    // 如果不是直線，且長度為 3，那麼在完美的 15 顆陣列中，
    // 它必須是妳定義的那種對稱形狀。
    // 這裡我們用一個簡單的「鄰接檢驗」：三角形的三顆球必須互相緊貼
    let b1 = group[0], b2 = group[1], b3 = group[2];
    let adjCount = 0;
    if (isAdjacent(b1, b2)) adjCount++;
    if (isAdjacent(b2, b3)) adjCount++;
    if (isAdjacent(b3, b1)) adjCount++;

    // 真正的 TRI，三顆球會兩兩相鄰 (構成閉環)
    // 妳說的 2-3-4 雖然相鄰，但它是直線 (已被上面的直線判定排除)
    // 妳說的 8-11-12 這種斷掉的，adjCount 會小於 3
    return adjCount === 3;
}

// 輔助函式：執行並切換回合
function executeMove(move) {
    move.forEach(ball => {
        let idx = hamelinCircles.indexOf(ball);
        if (idx !== -1) hamelinCircles[idx].isFading = true;
    });
    if (!checkGameOver("hamelin")) {
        gameTurn = "player";
    }
}


function getAllLegalMoves() {
    let moves = [];
    let active = hamelinCircles.filter(c => c.active && !c.isFading);
    
    // --- 1. 定義「鄰接」規則 (這次要把斜向判定鎖死) ---
    const isAdj = (b1, b2) => {
        const dr = Math.abs(b1.row - b2.row);
        const dc = Math.abs(b1.col - b2.col);
        const dl = Math.abs((b1.row - b1.col) - (b2.row - b2.col));
        // 三個方向的距離都不能超過 1，且必須是相鄰的
        return (dr <= 1 && dc <= 1 && dl <= 1);
    };

    // --- 2. 掃描函式 (尋找直線組合) ---
    function find(balls, keyFn) {
        let groups = {};
        balls.forEach(b => { 
            let k = keyFn(b); 
            if(!groups[k]) groups[k] = []; 
            groups[k].push(b); 
        });

        for (let k in groups) {
            // 先排序，確保掃描是按順序的
            let line = groups[k].sort((a,b) => a.row - b.row || a.col - b.col);
            
            for (let i = 0; i < line.length; i++) {
                // 選 1 顆
                moves.push([line[i]]);
                
                // 選 2 顆 (必須跟前一顆相鄰)
                if(i + 1 < line.length && isAdj(line[i], line[i+1])) {
                    moves.push([line[i], line[i+1]]);
                    
                    // 選 3 顆 (必須跟前一顆相鄰)
                    if(i + 2 < line.length && isAdj(line[i+1], line[i+2])) {
                        moves.push([line[i], line[i+1], line[i+2]]);
                    }
                }
            }
        }
    }

    // --- 3. 執行三向掃描 ---
    find(active, b => "h" + b.row);           // 水平方向
    find(active, b => "rd" + b.col);          // 右斜下方向 (\)
    find(active, b => "ld" + (b.row - b.col)); // 左斜下方向 (/)

    return moves;
}

function isWinningPatternForHamelin() {
    // 取得「假設 AI 拿走後」剩下的球
    let remaining = hamelinCircles.filter(c => c.active && !c.isFading && c.tempActive !== false);
    let n = remaining.length;

    // 基礎尼姆博弈必輸點 (對手拿到這些數量通常會輸)
    // 在 1-3 步的規則下，目標是留給玩家 1, 5, 9, 13 顆球
    const losingNumbers = [1, 5, 9, 13];
    
    if (losingNumbers.includes(n)) {
        // 如果剩下這些數量，且這些球是分散的（對手無法一波帶走），AI 就有優勢
        return true;
    }

    // 殘局神技：如果剩下 2 顆或 3 顆，且它們「不」在同一條直線上
    // 這樣玩家下一輪只能拿 1 顆，AI 就能拿走最後一顆之前的倒數第二顆，把最後一顆留給玩家
    if (n === 2) {
        return !checkLineValid_ForAI(remaining); 
    }

    return false;
}

// 輔助函式：判斷這組球是否在同一直線上（AI 模擬用）
function checkLineValid_ForAI(balls) {
    if (balls.length <= 1) return true;
    let rows = balls.map(b => b.row);
    let cols = balls.map(b => b.col);
    const isH = rows.every(r => r === rows[0]);
    const isRD = cols.every(c => c === cols[0]);
    const isLD = balls.every(b => (b.row - b.col) === (balls[0].row - balls[0].col));
    
    if (!(isH || isRD || isLD)) return false;
    
    let sorted = isH ? cols.sort((a,b)=>a-b) : rows.sort((a,b)=>a-b);
    for (let i = 0; i < sorted.length - 1; i++) {
        if (sorted[i+1] - sorted[i] !== 1) return false;
    }
    return true;
}

// --- 修改後的遊戲結束判定 ---
function checkGameOver(whoJustMoved) {
    let realRemaining = hamelinCircles.filter(c => c.active && !c.isFading).length;
    
    if (realRemaining === 0) {
        let finalWinnerStep;
        
        // 判斷是「第一次對戰」還是「娛樂局」
        if (hamelinTaskStep === "replaying") {
            finalWinnerStep = (whoJustMoved === "player") ? "replayLose" : "replayWin";
        } else {
            // 第一次對戰：給道具
            finalWinnerStep = (whoJustMoved === "player") ? "hamelinWin" : "playerWin";
            if (typeof addItem === "function") addItem("courage");
            showSystemMessage("獲得了：勇氣的加護");
        }

        setTimeout(() => {
            isHamelinGameActive = false;
            isHamelinTalking = true;
            hamelinTaskStep = finalWinnerStep;
        }, 800);
        
        return true;
    }
    return false;
}