// 1. 諾亞專用狀態變數
if (!window.gameProgress) {
    window.gameProgress = { hasReceivedNoahAxe: false };
}

let noahTempReceived = [];
let noahTaskStage = 0; 
let noahScriptIndex = 0;

let isNoahChoosing = false;
let isNoahWaitingItem = false;
let noahScripts = [];
let noahReceivedList = { sharp_axe: false, beans: false, charcoal: false };
// 補在原本的狀態變數區
window.gameProgress.isNoahTaskDone = window.gameProgress.isNoahTaskDone || false; // 是否集齊三寶
window.gameProgress.isNoahFinalDone = window.gameProgress.isNoahFinalDone || false; // 是否交出善良證明


// 2. 渲染函數
function renderNoahScene() {
    const bg = images.bgNoah || images.bgStreet;
    if (bg && bg.complete) ctx.drawImage(bg, 0, 0, 800, 450);

    // 畫諾亞
    if (images.npcNoah && images.npcNoah.complete) {
        if (isNoahTalking) {
            ctx.fillStyle = "rgba(0,0,0,0.4)";
            ctx.fillRect(0, 0, 800, 450);
            ctx.drawImage(images.npcNoah, -200, -100, 700, 700); 
        } else {
            ctx.drawImage(images.npcNoah, 350, 250, 100, 125); 
        }
    }

    if (isNoahTalking) {
        // --- 對話框繪製 (略) ---
        ctx.fillStyle = "rgba(20, 30, 20, 0.9)"; 
        ctx.strokeStyle = "#4CAF50"; 
        ctx.lineWidth = 3;
        ctx.fillRect(400, 50, 370, 260);
        ctx.strokeRect(400, 50, 370, 260);
        ctx.fillStyle = "#4CAF50";
        ctx.font = "bold 24px 'Microsoft JhengHei'";
        ctx.fillText("造船匠-諾亞", 420, 90);

        let text = noahScripts[noahScriptIndex] || "...";
        ctx.fillStyle = "white";
        ctx.font = "20px 'Microsoft JhengHei'";
        text.split('\n').forEach((line, i) => {
            ctx.fillText(line, 420, 130 + (i * 35));
        });

        if (isNoahChoosing || isNoahWaitingItem) {
            drawNoahButtons();
        } 
        if (typeof drawUI === "function") drawUI();
    } else {
        // --- 探索模式：顯示箭頭 ---
        if (layout.noahBack) {
            drawDirectionArrow(layout.noahBack.x, layout.noahBack.y, layout.noahBack.w, layout.noahBack.h, "left");
        }
        if (layout.noahToJackStreet) {
            drawDirectionArrow(layout.noahToJackStreet.x, layout.noahToJackStreet.y, layout.noahToJackStreet.w, layout.noahToJackStreet.h, "right");
        }
        
        // 【修正點】前往礦坑箭頭：移到頂部中心
        if (layout.noahToMine) {
            // 強制設定視覺座標在上方，不被諾亞擋住
            drawDirectionArrow(360, 180, 80, 80, "up"); 
        }
    }
}

// 3. 點擊處理 (整合修正版)
function handleNoahClick(tx, ty) {
    if (!isNoahTalking) {
        // --- A. 前往礦坑箭頭 ---
        if (tx > 360 && tx < 440 && ty > 180 && ty < 260) {
            changeScene("dwarf_mine");
            return; 
        }
        
        // --- B. 點擊 NPC (諾亞) ---
        else if (tx > 350 && tx < 450 && ty >= 250 && ty < 375) {
          if (sfx && sfx.noah) {
                sfx.noah.currentTime = 0; // 回到起點
                sfx.noah.play().catch(e => console.log("諾亞音效播放被攔截", e));
            }
            isNoahTalking = true;
            noahScriptIndex = 0;
            isNoahChoosing = false;
            isNoahWaitingItem = false;

            // --- 核心邏輯進度判斷 ---
            if (window.gameProgress.isNoahFinalDone) {
                // 結局後台詞
                noahScripts = ["上船吧！未來就靠我們了。"];
            }
            else if (window.gameProgress.isNoahTaskDone) {
                // 狀態 3：已完成三寶，詢問善良證明
                noahScripts = ["你能證明你的善良嗎？"];
                isNoahChoosing = true; 
            }
            else if (gameProgress.hasReceivedNoahAxe) {
                // 狀態 2：已領斧頭，等待三寶中
                noahTaskStage = 1; 
                isNoahWaitingItem = true;
                noahScripts = ["我需要三樣物品,\n請快點把東西拿過來吧。"];
            } 
            else {
                // 狀態 1：初始狀態
                noahScripts = ["唉，洪水就要來了...\n上帝要我造出方舟", "但我手邊連一點\n造船的木材都沒有。", "更糟的是，我唯一的一把\n破舊的斧頭也鈍得不能用。", "你願意幫忙嗎？"];
            }
        } 
        
        // --- C. 返回街道 ---
        else if (isClicked(tx, ty, layout.noahToJackStreet)) {
            changeScene("jack_street");
            isNoahTalking = false;
        }
    } 
    else {
        // --- 對話模式點擊邏輯 ---
        let buttonClicked = false;
        
        if (isNoahChoosing) {
            // --- 處理 [是 / 否] 選項 ---
            if (isClicked(tx, ty, layout.btnYes)) {
                if (!window.gameProgress.isNoahTaskDone) {
                    // 第一階段：領取斧頭
                    let result = addItem("axe"); 
                    if (result === "SUCCESS") {
                        gameProgress.hasReceivedNoahAxe = true; 
                        noahTaskStage = 1; 
                        noahScripts = ["太感謝你們了，雖然很不好意思...", "但我全身上下只有這把\n「破舊的斧頭」", "不嫌棄就交給你了。"];
                    } else if (result === "BAG_FULL") {
                        noahScripts = ["哎呀，你的包包看起來塞不下了！", "先清出一些空間，\n再來找我拿這把斧頭吧。"];
                    }
                } else {
                    // 第三階段：等待善良證明
                    noahScripts = ["喔？請讓我看看。"];
                    isNoahWaitingItem = true; 
                }
                isNoahChoosing = false;
                noahScriptIndex = 0;
                buttonClicked = true;
            } 
            else if (isClicked(tx, ty, layout.btnNo)) {
                // 【分歧點】點選「否」
                if (!window.gameProgress.isNoahTaskDone) {
                    // 不幫忙：唉...果然大家都不相信我
                    noahScripts = ["唉...果然大家都不相信我。"];
                } else {
                    // 證明階段拒絕：我的船建造得差不多...
                    noahScripts = ["我的船建造得差不多，\n你也要加快腳步了。"];
                }
                noahScriptIndex = 0;
                isNoahChoosing = false;
                buttonClicked = true;
            }
        } 
        else if (isNoahWaitingItem) {
            // --- 處理 [算了] 選項 ---
            if (isClicked(tx, ty, layout.btnNo)) {
                // 【分歧點】點選「算了」
                if (!window.gameProgress.isNoahTaskDone) {
                    // 三寶階段算了：執行退件並顯示傷心台詞
                    refundNoahItems();
                    noahScripts = ["唉...果然大家都不相信我。"];
                } else {
                    // 證明階段算了：顯示催促台詞
                    noahScripts = ["我的船建造得差不多，\n你也要加快腳步了。"];
                }
                noahScriptIndex = 0;
                isNoahWaitingItem = false;
                buttonClicked = true;
            }
        }

        // 防穿透
        if ((isNoahChoosing || isNoahWaitingItem) && !buttonClicked) return;
        
        // 翻頁或關閉對話
        if (!buttonClicked && tx > 400 && tx < 770 && ty > 50 && ty < 310) {
            if (noahScriptIndex < noahScripts.length - 1) {
                noahScriptIndex++;
                if (noahScripts[noahScriptIndex].includes("願意幫忙嗎")) {
                    isNoahChoosing = true;
                }
            } else {
                if (noahScripts[noahScriptIndex].includes("未來就靠我們了")) {
                    isNoahTalking = false; // 關閉對話框
                    startFloodCutscene();  // 啟動你的大洪水影片！
                } else {
                    // 一般情況下的關閉對話
                    isNoahTalking = false;
                    isNoahWaitingItem = false;
                    isNoahChoosing = false;
                }
            }
        }
    }
}

// 4. 接收道具與工具函數 (其餘保持不變)
// ... onNoahReceivedItem, refundNoahItems, exitNoahDialogue, drawNoahButtons, drawNoahDialogArrow ...
// 補回缺失的工具函數 1：繪製對話框小箭頭


function drawToMineArrow() {
    // 檢查 layout 是否存在，避免報錯
    if (!layout.noahToMine) return;

    ctx.fillStyle = "#FFD700"; // 維持金黃色
    
    // 設定基準點 (這是箭頭的尖端)
    let bx = layout.noahToMine.x;
    let by = layout.noahToMine.y;

    ctx.beginPath();
    
    // 1. 尖端：指向前方 (11點鐘方向)
    ctx.moveTo(bx, by); 
    
    // 2. 右下底角 1：靠近中心軸，縮短距離營造「窄感」
    // 增加 x 和 y 的偏移量，但讓它們比例接近，看起來才會像往後方延伸
    ctx.lineTo(bx + 35, by + 10); 
    
    // 3. 右下底角 2：
    // 這是讓箭頭變「尖」的關鍵，讓兩點靠得很近
    ctx.lineTo(bx + 10, by + 35); 
    
    ctx.closePath();
    ctx.fill();

    // --- 選擇性：增加一點陰影感，更有立體感 ---
    ctx.strokeStyle = "rgba(0, 0, 0, 0.3)";
    ctx.lineWidth = 1;
    ctx.stroke();
}

// 補回缺失的工具函數 2：繪製選項按鈕 (是/否/算了)
function drawNoahButtons() {
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "bold 20px 'Microsoft JhengHei'";
    
    [layout.btnYes, layout.btnNo].forEach((btn, i) => {
        // 如果是在等待道具階段，隱藏「是」按鈕
        if (isNoahWaitingItem && i === 0) return; 
        
        ctx.fillStyle = (isNoahWaitingItem && i === 1) ? "#8b0000" : "#2e3b23";
        ctx.fillRect(btn.x, btn.y, btn.w, btn.h);
        ctx.strokeStyle = "white";
        ctx.strokeRect(btn.x, btn.y, btn.w, btn.h);
        ctx.fillStyle = "white";
        
        let label = (isNoahWaitingItem && i === 1) ? "算了" : (i === 0 ? "是" : "否");
        ctx.fillText(label, btn.x + btn.w/2, btn.y + btn.h/2 + 2);
    });
    
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
}

function onNoahReceivedItem(itemId) {
    if (!isNoahTalking) return;

    // --- 階段 A：收集造船三寶 ---
    if (noahTaskStage === 1 && !window.gameProgress.isNoahTaskDone) {
        const targets = ["sharp_axe", "beans", "charcoal"];
        if (targets.includes(itemId)) {
            if (typeof removeItem === "function") removeItem(itemId);
            if (!noahTempReceived.includes(itemId)) noahTempReceived.push(itemId);
            
            if (noahTempReceived.length === 3) {
                window.gameProgress.isNoahTaskDone = true;
                noahTaskStage = 2;
                isNoahWaitingItem = false;
                noahTempReceived = []; 
                noahScripts = [
                    "喔喔！這真是太神奇了！",
                    "木炭淨化了污水，\n灌溉魔豆長出了巨大的樹，",
                    "加上這把鋒利的斧頭...\n我很快就能造好方舟了！",
                    "太感謝你們了。",
                    "不過，船上位置有限，\n只能載善良的人...",
                    "我兒「雅弗」正在街道上觀察大家，\n去證明你的善良吧！"
                ];
            } else {
                noahScripts = [`喔！是${items[itemId].name}啊，先幫你收著。\n還差 ${3 - noahTempReceived.length} 樣。`];
            }
            noahScriptIndex = 0;
        } else {
            noahScripts = ["這東西...對方舟的建造好像沒什麼幫助。"];
            noahScriptIndex = 0;
        }
    } 
    // --- 階段 B：交付善良證明 ---
    else if (window.gameProgress.isNoahTaskDone && !window.gameProgress.isNoahFinalDone) {
        if (itemId === "kindness") {
            if (typeof removeItem === "function") removeItem("kindness");
            window.gameProgress.isNoahFinalDone = true;
            noahScripts = ["看來我兒子認可你了，\n我也相信我的眼光。", "上船吧！未來就靠我們了。"];
            isNoahWaitingItem = false;
        } else {
            // 給錯東西不結束對話
            noahScripts = ["這並不能證明你的善良。"];
        }
        noahScriptIndex = 0;
    }
}

// --- 關鍵補完：處理退出與退還 ---
function exitNoahDialogue(line) {
    refundNoahItems(); // 點下「算了」要把東西還給玩家
    noahScripts = [line];
    noahScriptIndex = 0;
    isNoahChoosing = false;
    isNoahWaitingItem = false;
    isNoahTalking = true; // 保持對話框顯示最後一句遺憾台詞
}

function refundNoahItems() {
    if (noahTempReceived.length > 0) {
        noahTempReceived.forEach(itemId => {
            if (items[itemId]) items[itemId].isOwned = true;
        });
        noahTempReceived = []; // 清空暫存清單
        autoArrangeAll(); // 重新整理背包
    }
}
