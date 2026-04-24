// --- scene_past_forest.js ---
// --- 1. 狀態管理 (增加全域保護避免重置) ---
if (typeof window.carpenterTaskStep === "undefined") {
    window.carpenterTaskStep = "ask"; 
}

// 關鍵點：讓 local 的變數直接同步 window 的值
let carpenterTaskStep = window.carpenterTaskStep; 

// 更新函數：確保 local 和 window 同時被更新
function updateCarpenterStep(newStep) {
    window.carpenterTaskStep = newStep;
    carpenterTaskStep = newStep; 
}

let carpenterLine = "";
let pastForestSubScene = "main"; 


// --- 2. 核心渲染函式 (森林外圍) ---
function renderPastForest() {
    ctx.save();
    const currentBG = images.bgPastForest; 
    if (currentBG && currentBG.complete) {
        ctx.drawImage(currentBG, 0, 0, 800, 450);
    } else {
        ctx.fillStyle = "#06260f";
        ctx.fillRect(0, 0, 800, 450);
    }

    if (typeof drawDirectionArrow === "function") {
        drawDirectionArrow(20, 320, 60, 60, "left");
    }

    if (images.doorImg && images.doorImg.complete) {
        ctx.drawImage(images.doorImg, 420, 220, 80, 80);
    }
    ctx.restore();
}

// --- 2.1 核心渲染函式 (森林內部) ---
function renderPastForestInside() {
    ctx.save();
    
    // --- 【影子渲染邏輯：無論如何都先畫背景】 ---
    const currentBG = images.bgPastForestInside; 
    if (currentBG && currentBG.complete) {
        ctx.drawImage(currentBG, 0, 0, 800, 450);
    } else {
        ctx.fillStyle = "#021a08"; 
        ctx.fillRect(0, 0, 800, 450);
    }

    // 2. 繪製年輕木匠 (場景中的小人)
    if (images.npcCarpenter && images.npcCarpenter.complete) {
        ctx.drawImage(images.npcCarpenter, 280, 150, 250, 250);
    }

    // 3. 繪製左側回頭門
    if (images.doorImg && images.doorImg.complete) {
        ctx.drawImage(images.doorImg, -20, 20, 180, 400);
    }

    // --- 【關鍵：如果是在對話狀態，就在這層畫布上直接蓋上對話 UI】 ---
    // 這樣就算 main.js 只呼叫 renderPastForestInside，對話框也會出來
    if (gameState === "CarpenterDialog") {
        drawCarpenterUI(); 
    }

    ctx.restore();
}

function drawCarpenterUI() {
    const box = layout.textArea; 
    if (!box || !layout.btnYes) return;

    ctx.save();
    
    // --- 【新增修正：強制重置畫布狀態，防止傑哥遊戲干擾】 ---
    ctx.setTransform(1, 0, 0, 1, 0, 0); // 1. 座標歸零
    ctx.textAlign = "left";             // 2. 強制左對齊
    ctx.textBaseline = "top";           // 3. 強制頂部對齊
    // ----------------------------------------------

    // 1. 半透明遮罩與特寫圖
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(0, 0, 800, 320); 
    if (images.npcCarpenter && images.npcCarpenter.complete) {
        ctx.drawImage(images.npcCarpenter, 10, 50, 450, 450); 
    }

    // 2. 對話框底色與邊框
    ctx.fillStyle = "rgba(40, 25, 10, 0.95)"; 
    ctx.strokeStyle = "#ffcc00"; 
    ctx.lineWidth = 3;
    ctx.fillRect(box.x, box.y, box.w, box.h);
    ctx.strokeRect(box.x, box.y, box.w, box.h);

    // 3. 名字與基本文字設定
    ctx.fillStyle = "#ffcc00";
    ctx.font = "bold 24px 'Microsoft JhengHei'";
    // 稍微調整了一下 Y 座標 (+20)，配合 textBaseline="top" 會更精準
    ctx.fillText("年輕木匠-哈梅林", box.x + 20, box.y + 20); 

    ctx.fillStyle = "white";
    ctx.font = "20px 'Microsoft JhengHei'";

    // 4. 根據狀態顯示不同內容
    if (carpenterTaskStep === "ask") {
        ctx.fillText("我想學河神的魔法...", box.x + 20, box.y + 80);
        ctx.fillText("但是他不願意教我？真是氣死我了。", box.x + 20, box.y + 120);
        ctx.fillText("如果你願意幫我，我一定會報答你的！", box.x + 20, box.y + 160);
    } 
    else if (carpenterTaskStep === "choice") {
        ctx.fillText("你願意幫我嗎？", box.x + 20, box.y + 80);
        drawButton(layout.btnYes, "rgba(60, 40, 20, 0.8)", "#ffcc00", "是");
        drawButton(layout.btnNo, "rgba(60, 40, 20, 0.8)", "#ffcc00", "否");
    }
    else if (carpenterTaskStep === "check_status") {
        ctx.fillText("快告訴我，有好消息嗎？", box.x + 20, box.y + 80);
        drawButton(layout.btnYes, "rgba(60, 40, 20, 0.8)", "#ffcc00", "是");
        drawButton(layout.btnNo, "rgba(60, 40, 20, 0.8)", "#ffcc00", "否");
    }
    else if (carpenterTaskStep === "waiting_delivery") {
        ctx.fillText("趕快交給我！", box.x + 20, box.y + 80);
        drawButton(layout.btnNo, "rgba(60, 20, 20, 0.8)", "#ff4444", "算了");
    }
    else if (carpenterTaskStep === "response"|| 
             carpenterTaskStep === "finish_part1" || 
             carpenterTaskStep === "finish_part2" || 
             carpenterTaskStep === "final_talk") {
        const lines = (carpenterLine || "").split('\n');
        lines.forEach((line, index) => {
            ctx.fillText(line, box.x + 20, box.y + 80 + (index * 35));
        });
    }
    ctx.restore();
}

// --- 3. 點擊邏輯 (森林外圍) ---
function handlePastForestClick(tx, ty) {
    if (tx > 20 && tx < 80 && ty > 320 && ty < 380) {
        if (typeof pastSubScene !== 'undefined') pastSubScene = "river"; 
        else window.pastSubScene = "river";
        changeScene("past_river", false);
        return;
    }

    if (tx > 420 && tx < 500 && ty > 220 && ty < 300) {
        changeScene("past_forest_inside", true);
        if (typeof switchBGM === "function") switchBGM('minigame');
        return;
    }
}

function handlePastForestInsideClick(tx, ty) {
    const box = layout.textArea; // 確保與繪製時的 box 一致
    const bY = layout.btnYes;
    const bN = layout.btnNo;

    if (gameState === "CarpenterDialog") {
        // --- 點擊對話框主體即可關閉或下一步的狀態 ---
        const isClickInBox = (tx > box.x && tx < box.x + box.w && ty > box.y && ty < box.y + box.h);

        if (carpenterTaskStep === "ask") {
            if (isClickInBox) {
                updateCarpenterStep("choice"); 
                return;
            }
        }
        else if (carpenterTaskStep === "choice") {
            if (tx > bY.x && tx < bY.x + bY.w && ty > bY.y && ty < bY.y + bY.h) {
                addItem("hamelinletter");
                carpenterLine = "太好了！這封信你拿著，\n傳說河神那邊有一種『河神魔力』，\n如果你能弄來，我一定重謝！\n我等你的好消息。";
                updateCarpenterStep("response");
                return;
            } else if (tx > bN.x && tx < bN.x + bN.w && ty > bN.y && ty < bN.y + bN.h) {
                carpenterLine = "切...不幫就算了\n別打擾我研究！";
                updateCarpenterStep("response");
                return;
            }
        }
        else if (carpenterTaskStep === "check_status") {
            if (tx > bY.x && tx < bY.x + bY.w && ty > bY.y && ty < bY.y + bY.h) {
                updateCarpenterStep("waiting_delivery");
                return;
            } else if (tx > bN.x && tx < bN.x + bN.w && ty > bN.y && ty < bN.y + bN.h) {
                carpenterLine = "我等你的好消息。";
                updateCarpenterStep("response");
                return;
            }
        }
        else if (carpenterTaskStep === "waiting_delivery") {
            if (tx > bN.x && tx < bN.x + bN.w && ty > bN.y && ty < bN.y + bN.h) {
                carpenterLine = "我等你的好消息。";
                updateCarpenterStep("response");
                return;
            }
        }
        else if (carpenterTaskStep === "finish_part1") {
            if (isClickInBox) {
                if (typeof addItem === "function") {
                    addItem("papermaking");
                    showSystemMessage("獲得了造紙術！");
                }
                carpenterLine = "我將無意間的發現送給你，\n木頭的皮可以造紙，\n很神奇吧！";
                updateCarpenterStep("finish_part2"); 
                return;
            }
        }
        else if (carpenterTaskStep === "finish_part2") {
            if (isClickInBox) {
                gameState = "past_forest_inside";
                updateCarpenterStep("completed"); 
                return;
            }
        }
        else if (carpenterTaskStep === "response") {
            if (isClickInBox) {
                gameState = "past_forest_inside";
                if (carpenterLine.includes("等你的好消息") || carpenterLine.includes("只想學魔法")) {
                    updateCarpenterStep("gave_letter"); 
                } else {
                    updateCarpenterStep("ask"); 
                }
                return;
            }
        }
        else if (carpenterTaskStep === "final_talk") {
            if (isClickInBox) {
                gameState = "past_forest_inside";
                return;
            }
        }
        return; 
    }

    // --- 場景中點擊 NPC 觸發對話 ---
    if (tx > 280 && tx < 530 && ty > 150 && ty < 400) {
        if (sfx && sfx.carpenter) {
            sfx.carpenter.currentTime = 0;
            sfx.carpenter.play().catch(e => {});
        }
        gameState = "CarpenterDialog";
        const currentStep = window.carpenterTaskStep; 

        if (currentStep === "completed" || currentStep === "final_talk") {
            carpenterLine = "別打擾我......\n我要造出魔法之笛。";
            updateCarpenterStep("final_talk"); 
        } else if (currentStep === "gave_letter" || currentStep === "check_status" || currentStep === "waiting_delivery") {
            updateCarpenterStep("check_status"); 
        } else {
            updateCarpenterStep("ask");
        }
        return;
    }

    // --- 門的判定 ---
    if (tx > -20 && tx < 160 && ty > 20 && ty < 420) {
        changeScene("past_forest", true);
    }
}

function onDeliverToCarpenter(itemId) {
    if (window.carpenterTaskStep !== "waiting_delivery") {
        showSystemMessage("木匠現在不想理你。");
        return;
    }

    if (itemId === "rivergodmagic") {
        removeItem("rivergodmagic");
        // 優化後的對話：加入換行符號 \n 確保在對話框中顯示美觀
        carpenterLine = "哈哈哈，有了河神的魔法，\n我就可以造出魔法之笛了！\n為了答謝你...";
        updateCarpenterStep("finish_part1"); 
    } else {
        carpenterLine = "我只想學魔法，不要給我有的沒的。";
        updateCarpenterStep("response"); 
    }
    
    if (typeof autoArrangeAll === "function") autoArrangeAll();
}
// 別忘了註冊到全域，主引擎才抓得到
window.onDeliverToCarpenter = onDeliverToCarpenter;
// --- 4. 註冊到全域 ---
window.renderPastForest = renderPastForest;
window.handlePastForestClick = handlePastForestClick;

window.renderPastForestInside = renderPastForestInside;
window.handlePastForestInsideClick = handlePastForestInsideClick;