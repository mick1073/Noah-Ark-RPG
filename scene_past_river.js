// --- 1. 狀態管理 ---
let pastSubScene = "bar";        
let seerTaskStep = "intro";      
let hasMetSeer = false;     
let isTransitioningToRiver = false; 


if (!window.gameProgress) window.gameProgress = {};
window.gameProgress.isSeerTaskDone = window.gameProgress.isSeerTaskDone || false; 

let seerTempReceived = []; 
let seerDynamicLine1 = ""; 
let seerDynamicLine2 = ""; 
const SEER_TARGETS = ["compass", "firestone", "papermaking"];

let riverGodTaskStep = "ask"; // 狀態：ask(詢問), response(回覆後等待關閉)
let riverGodLine = "";

// --- 2. 核心渲染函式 ---
function renderPastRiver() {
if (isEndingVideoPlaying) return;
    // --- 1. 自動換景邏輯 ---
    if (isTransitioningToRiver) {
        if (typeof fadeAlpha !== 'undefined' && fadeAlpha >= 0.95) {
            pastSubScene = (pastSubScene === "bar") ? "river" : "bar";
            isTransitioningToRiver = false; 
        }
    }

    // --- 2. 繪製背景 (基礎層) ---
    const currentBG = (pastSubScene === "bar") ? images.bgPastBar : images.bgPastRiver;
    if (currentBG && currentBG.complete) {
        ctx.drawImage(currentBG, 0, 0, 800, 450);
    }

    // --- 3. 場景物件渲染 ---
    if (pastSubScene === "bar") {
        // 酒吧場景物件
        if (images.npcSeer && images.npcSeer.complete) ctx.drawImage(images.npcSeer, 330, 240, 160, 240);
        if (images.doorImg && images.doorImg.complete) ctx.drawImage(images.doorImg, 700, 330, 100, 100);
        if (typeof drawDirectionArrow === "function") drawDirectionArrow(720, 250, 50, 50, "right");
        
        // 酒吧對話 UI
        if (gameState === "SeerDialog") {
            drawSeerDialogUI();
        }
    } 
    else if (pastSubScene === "river") {
        // 河流場景基礎物件 (原本的回頭小門)
        if (images.doorImg && images.doorImg.complete) ctx.drawImage(images.doorImg, 120, 50, 40, 40);
       

        // 【關鍵修正位置】：箭頭導航
        // 只有在正常的河流探索狀態下才顯示箭頭
        if (gameState === "past_river") {
            drawRiverNavigation(); 
        }

        // 河神對話 UI
        if (gameState === "RiverGodDialog") {
            drawRiverGodUI();
        }
    }
}

function drawRiverNavigation() {
    // 【關鍵修正】：將 images.arrow 改為 images.arrowImg
    const arrow = images.arrowImg; 
    
    // 檢查是否真的抓到圖片物件
    if (!arrow) {
        console.error("找不到 images.arrowImg，請確認 assets 載入名稱是否正確");
        return;
    }

    // 確保圖片已完全載入
    if (!arrow.complete) return;

    // 定義箭頭座標 (引用你提供的位址)
    const nav = {
        left:  { x: 20,  y: 110, w: 60, h: 60 }, // 逆時針 180度
        up:    { x: 180, y: 100, w: 60, h: 60 }, // 逆時針 90度
        right: { x: 700, y: 330, w: 60, h: 60 }  // 不旋轉
    };

    ctx.save();
    
    // 1. 畫左方箭頭 (逆時針 180 度 = 向左)
    // 我們將繪圖中心移到 nav.left 的中心，旋轉後再畫
    ctx.save();
    const lCX = nav.left.x + nav.left.w / 2;
    const lCY = nav.left.y + nav.left.h / 2;
    ctx.translate(lCX, lCY);
    ctx.rotate(Math.PI); // 180度 = PI 弧度
    ctx.drawImage(arrow, -nav.left.w / 2, -nav.left.h / 2, nav.left.w, nav.left.h);
    ctx.restore();

    // 2. 畫上方箭頭 (逆時針 90 度 = 向上)
    ctx.save();
    const uCX = nav.up.x + nav.up.w / 2;
    const uCY = nav.up.y + nav.up.w / 2;
    ctx.translate(uCX, uCY);
    ctx.rotate(-Math.PI / 2); // 逆時針 90度 = -PI/2 弧度
    ctx.drawImage(arrow, -nav.up.w / 2, -nav.up.h / 2, nav.up.w, nav.up.h);
    ctx.restore();

    // 3. 畫右方箭頭 (不旋轉 = 預設向右)
    ctx.drawImage(arrow, nav.right.x, nav.right.y, nav.right.w, nav.right.h);

    ctx.restore();
}

function drawRiverGodUI() {
    // 這裡直接引用 layout.textArea，保證河神跟先知的框位置一模一樣
    const box = layout.textArea;  
    const bY = layout.btnYes;
    const bN = layout.btnNo;

    ctx.save();
    
    // 1. 繪製背景框 (跟隨先知的樣式與位置)
    ctx.fillStyle = "rgba(10, 40, 80, 0.95)";
    ctx.strokeStyle = "#00ffff"; // 河神用青色
    ctx.lineWidth = 3;
    ctx.fillRect(box.x, box.y, box.w, box.h);
    ctx.strokeRect(box.x, box.y, box.w, box.h);

    // 2. 標題
    ctx.fillStyle = "#00ffff";
    ctx.font = "bold 24px 'Microsoft JhengHei'";
    ctx.textAlign = "left";
    const name = window.gameProgress.isRiverDaughterTaskDone ? "河神-泊紐" : "神秘的老伯";
    ctx.fillText(name, box.x + 20, box.y + 40);

    // 3. 內容文字 (修正文字偏移：統一使用 box.x + 20)
    ctx.fillStyle = "white";
    ctx.font = "20px 'Microsoft JhengHei'";
    
    if (riverGodTaskStep === "ask") {
        if (!window.gameProgress.isRiverDaughterTaskDone) {
            ctx.fillText("我的女兒，我的女兒不見了，", box.x + 20, box.y + 100);
            ctx.fillText("請問有沒有看到我的女兒？", box.x + 20, box.y + 140);
        } else {
            ctx.fillText("大恩人，", box.x + 20, box.y + 100);
            ctx.fillText("找我還有什麼事嗎？", box.x + 20, box.y + 140);
        }
        // 按鈕：drawButton 內部會處理置中，我們只要傳入正確的 layout 座標
        drawButton(bY, "rgba(0, 255, 255, 0.3)", "#00ffff", "是");
        drawButton(bN, "rgba(255, 255, 255, 0.2)", "white", "否");

    } else if (riverGodTaskStep === "waiting") {
        if (!window.gameProgress.isRiverDaughterTaskDone) {
            ctx.fillText("趕快帶過來給我！", box.x + 20, box.y + 100);
        } else {
            ctx.fillText("你說有什麼東西要交給我？", box.x + 20, box.y + 100);
        }
        drawButton(bN, "rgba(255, 0, 0, 0.6)", "white", "算了");

    } else if (riverGodTaskStep === "response") {
        ctx.font = "18px 'Microsoft JhengHei'";
        const lines = riverGodLine.split('\n');
        lines.forEach((line, index) => {
            // 文字起始位置與 box 對齊
            ctx.fillText(line, box.x + 20, box.y + 100 + (index * 30));
        });
    }
    
    ctx.restore();
}

// 輔助小函式，讓代碼乾淨點
function drawButton(rect, fill, stroke, label) {
    ctx.save(); // 保護目前的繪圖狀態
    
    // 1. 畫按鈕背景
    ctx.fillStyle = fill;
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    
    // 2. 畫按鈕邊框
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 2;
    ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
    
    // 3. 畫文字 (關鍵修正)
    ctx.fillStyle = "white"; // 或者改用 stroke 傳進來的顏色
    ctx.font = "bold 18px 'Microsoft JhengHei'"; // 確保字體大小固定
    ctx.textAlign = "center";
    ctx.textBaseline = "middle"; // 使用 middle 垂直居中比 +7 更準確
    
    // 繪製文字
    ctx.fillText(label, rect.x + rect.w / 2, rect.y + rect.h / 2);
    
    ctx.restore(); // 恢復狀態，避免影響到後續的畫布操作
}

// --- 3. 內部對話 UI 繪製 (保持不變) ---
function drawSeerDialogUI() {
    const box = layout.textArea; 
    ctx.fillStyle = "rgba(20, 20, 40, 0.95)"; 
    ctx.strokeStyle = "#d4af37"; 
    ctx.lineWidth = 3;
    ctx.fillRect(box.x, box.y, box.w, box.h);
    ctx.strokeRect(box.x, box.y, box.w, box.h);

    ctx.fillStyle = "#d4af37";
    ctx.font = "bold 24px 'Microsoft JhengHei'";
    ctx.textAlign = "left";
    ctx.fillText("先知-卡珊德拉", box.x + 20, box.y + 40);

    ctx.fillStyle = "white";
    ctx.font = "20px 'Microsoft JhengHei'";
    
    let line1 = "";
    let line2 = "";
    let line3 = "";
    let line4 = "";

    if (seerDynamicLine1) {
        line1 = seerDynamicLine1;
        line2 = seerDynamicLine2;
    } else {
        switch(seerTaskStep) {
            case "intro": 
                line1 = "時間旅者，我知道你會過來";
                line2 = "來這個時代帶走文明回到未來";
                break;
            case "mission": 
                line1 = "人類的文明有三樣重要的發明";
                line2 = "蒐集齊全後再回來找我吧";
                line3 = "這個東西你先收著，";
                line4 = "關鍵時刻絕對會派上用場。";
                break;
            case "recheck":
                line1 = "你找到三樣文明了嗎？";
                line2 = "";
                break;
            case "waiting":
                line1 = "請交給我吧。";
                line2 = `( 目前已收集: ${seerTempReceived.length} / 3 )`;
                break;
            case "all_done":
                line1 = "旅人，謝謝妳，辛苦你了。";
                line2 = "你延續了人類的文明... ";
                break;
        }
    }

    ctx.fillText(line1, box.x + 20, box.y + 100);
    if (line2) ctx.fillText(line2, box.x + 20, box.y + 140);
    if (line3) ctx.fillText(line3, box.x + 20, box.y + 180);
    if (line4) ctx.fillText(line4, box.x + 20, box.y + 220);

    const isShowingEndMessage = (seerDynamicLine1 === "沒關係，慢慢來。");
    if ((seerTaskStep === "recheck" || seerTaskStep === "waiting") && !isShowingEndMessage) {
        drawSeerChoiceButtons();
    }
}

function drawSeerChoiceButtons() {
    const bY = layout.btnYes;
    const bN = layout.btnNo;
    ctx.font = "bold 20px 'Microsoft JhengHei'";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    if (seerTaskStep === "recheck") {
        ctx.fillStyle = "rgba(212, 175, 55, 0.3)";
        ctx.fillRect(bY.x, bY.y, bY.w, bY.h);
        ctx.strokeStyle = "#d4af37";
        ctx.strokeRect(bY.x, bY.y, bY.w, bY.h);
        ctx.fillStyle = "white";
        ctx.fillText("是", bY.x + bY.w / 2, bY.y + bY.h / 2);
    }

    if (seerTaskStep === "waiting") {
        ctx.fillStyle = "#8b0000"; 
        ctx.fillRect(bN.x, bN.y, bN.w, bN.h);
        ctx.strokeStyle = "white";
        ctx.strokeRect(bN.x, bN.y, bN.w, bN.h);
        ctx.fillStyle = "white";
        ctx.fillText("算了", bN.x + bN.w / 2, bN.y + bN.h / 2);
    } else {
        ctx.fillStyle = "rgba(212, 175, 55, 0.3)";
        ctx.fillRect(bN.x, bN.y, bN.w, bN.h);
        ctx.strokeStyle = "#d4af37";
        ctx.strokeRect(bN.x, bN.y, bN.w, bN.h);
        ctx.fillStyle = "white";
        ctx.fillText("否", bN.x + bN.w / 2, bN.y + bN.h / 2);
    }
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
}

// --- 4. 翻頁與點擊邏輯 ---
function handleSeerDialogNext() {
    if (seerDynamicLine1) {
        if (seerDynamicLine1 === "沒關係，慢慢來。") {
            gameState = "past_river";
        }
        seerDynamicLine1 = "";
        seerDynamicLine2 = "";
        return;
    }

    if (seerTaskStep === "recheck" || seerTaskStep === "waiting") return; 

   if (seerTaskStep === "intro") {
        // --- 關鍵位置：準備進入 mission 顯示四行字的那一刻 ---
        seerTaskStep = "mission";
        
        // 同時撥發道具
        if (items && items.powder && !items.powder.isOwned) {
            if (typeof addItem === "function") {
                addItem("powder");
                console.log("【系統】先知遞給了你古怪的粉末");
            }
        }
    } 
    else if (seerTaskStep === "mission") {
        // 這裡就是看完四行字後點擊，切換到下一個狀態並關閉對話
        hasMetSeer = true;
        seerTaskStep = "recheck"; 
        gameState = "past_river"; 
    } 
    else if (seerTaskStep === "all_done") {
        // ✨ ✨ ✨ 關鍵修改：啟動全劇終影片 ✨ ✨ ✨
        startEndingVideo();
    }
}

function handlePastRiverClick(tx, ty) {
    const bY = layout.btnYes;
    const bN = layout.btnNo;
    const area = layout.textArea; // 取得統一的對話框範圍

    if (gameState === "RiverGodDialog") {
        if (riverGodTaskStep === "ask") {
            // --- 點擊「是」 ---
            if (tx > bY.x && tx < bY.x + bY.w && ty > bY.y && ty < bY.y + bY.h) {
                riverGodTaskStep = "waiting"; 
                return;
            }
            // --- 點擊「否」 ---
            if (tx > bN.x && tx < bN.x + bN.w && ty > bN.y && ty < bN.y + bN.h) {
                if (!window.gameProgress.isRiverDaughterTaskDone) {
                    riverGodLine = "我太著急了... \n請幫忙找到我的女兒。";
                } else {
                    riverGodLine = "既然沒事，那就好。";
                }
                riverGodTaskStep = "response"; 
                return;
            }
        } 
        else if (riverGodTaskStep === "waiting") {
            // --- 在等待交付模式點擊右下角的「算了/否」 ---
            if (tx > bN.x && tx < bN.x + bN.w && ty > bN.y && ty < bN.y + bN.h) {
                if (!window.gameProgress.isRiverDaughterTaskDone) {
                    riverGodLine = "我太著急了...\n請幫忙找到我的女兒。";
                } else {
                    riverGodLine = "既然沒事，那就好。";
                }
                riverGodTaskStep = "response";
                return;
            }
        } 
        else if (riverGodTaskStep === "response") {
            // 改成抓 layout.textArea 的範圍
            if (tx > area.x && tx < area.x + area.w && ty > area.y && ty < area.y + area.h) {
                gameState = "past_river";
                riverGodTaskStep = "ask"; 
            }
        }
        return; // 結束 RiverGodDialog 的處理
    }

    // --- 原有的先知對話邏輯 ---
    if (gameState === "SeerDialog") {
        // 將判斷範圍統一改為 area (layout.textArea)
        const isInsideBox = (tx > area.x && tx < area.x + area.w && ty > area.y && ty < area.y + area.h);

        if (seerDynamicLine1 === "沒關係，慢慢來。") {
            if (isInsideBox) handleSeerDialogNext();
            return;
        }

        const clickedYes = (tx > bY.x && tx < bY.x + bY.w && ty > bY.y && ty < bY.y + bY.h);
        const clickedNo  = (tx > bN.x && tx < bN.x + bN.w && ty > bN.y && ty < bN.y + bN.h);

        // 【修正點 1】：只有在 recheck 階段，點擊「是」才有反應
        if (clickedYes && seerTaskStep === "recheck") {
            seerTaskStep = "waiting";
            return; 
        }

        // 【修正點 2】：只有在 recheck 或 waiting 階段，點擊「否/算了」才有反應
        if (clickedNo && (seerTaskStep === "recheck" || seerTaskStep === "waiting")) {
            if (seerTaskStep === "waiting") refundSeerItems();
            seerDynamicLine1 = "沒關係，慢慢來。";
            seerDynamicLine2 = "";
            seerTaskStep = "recheck"; 
            return;
        }

        // 點擊對話框任何地方 (排除按鈕判定後) 進行下一頁
        if (isInsideBox) {
            handleSeerDialogNext();
        }
    }

    // --- 場景點擊邏輯 ---
    else if (gameState === "past_river") {
        if (pastSubScene === "bar") {
            // 點先知
            if (tx > 330 && tx < 490 && ty > 240 && ty < 480) {
                if (sfx && sfx.cassandra) {
                    sfx.cassandra.currentTime = 0;
                    sfx.cassandra.play().catch(e => console.log("先知音效播放失敗", e));
                }
                gameState = "SeerDialog";
                seerTaskStep = (!hasMetSeer) ? "intro" : "recheck";
                return;
            }
            // 點出門
            if (tx > 700 && tx < 800 && ty > 330 && ty < 430) {
                if (typeof changeScene === "function") {
                    isTransitioningToRiver = true; 
                    changeScene("past_river", true);
                }
                return;
            }
        } 
        else if (pastSubScene === "river") {
            // 點擊左邊箭頭去古代牧場
            if (tx > 20 && tx < 20 + 60 && ty > 110 && ty < 110 + 60) {
                if (typeof changeScene === "function") {
                    changeScene("past_pasture", false); 
                    console.log("切換場景至：古代牧場");
                }
                return;
            }
            // 點擊河神判定區
            if (tx > 290 && tx < 340 && ty > 200 && ty < 300) {
                if (sfx && sfx.pastrivergod) {
                    sfx.pastrivergod.currentTime = 0;
                    sfx.pastrivergod.play().catch(e => console.log("河神音效播放失敗", e));
                }
                gameState = "RiverGodDialog"; // 進入河神對話狀態
                return;
            }
            // 點擊上方箭頭去古代城堡
            if (tx > 180 && tx < 180 + 60 && ty > 100 && ty < 100 + 60) {
                if (typeof changeScene === "function") {
                    changeScene("past_castle", false);
                    console.log("切換場景至：古代城堡");
                }
                return;
            }
            // 點回頭
            if (tx > 110 && tx < 170 && ty > 40 && ty < 100) {
                if (typeof changeScene === "function") {
                    isTransitioningToRiver = true; 
                    changeScene("past_river", true); 
                }
                return;
            }
            // 點擊右邊箭頭去古代森林
            if (tx > 700 && tx < 780 && ty > 330 && ty < 410) {
                if (typeof changeScene === "function") {
                    changeScene("past_forest", false); 
                    console.log("切換場景至：古代森林");
                } else {
                    gameState = "past_forest";
                }
                return;
            }
        }
    }
}

// --- 5. 道具與拖拽邏輯 ---
function handleMouseUp(e) {
    let draggedItem = Object.values(items).find(it => it.isDragging);
    if (!draggedItem) return;

    draggedItem.isDragging = false;
    const itemCenterX = draggedItem.x + draggedItem.w / 2;
    const itemCenterY = draggedItem.y + draggedItem.h / 2;
    const riverBox = { x: 400, y: 50, w: 370, h: 260 };

    // --- 河神專屬判斷 ---
    if (gameState === "RiverGodDialog") {
        const isOverBox = (itemCenterX > riverBox.x && itemCenterX < riverBox.x + riverBox.w &&
                           itemCenterY > riverBox.y && itemCenterY < riverBox.y + riverBox.h);

        // 強制規則：只有在 waiting 狀態且丟對位置，才觸發交付邏輯
        if (riverGodTaskStep === "waiting" && isOverBox) {
            onDeliverToRiverGod(draggedItem.id);
        } else {
            // 只要不是 waiting（包括 ask 或 response 階段），或者丟歪了
            // 通通執行歸位，不觸發任何對話
            autoArrangeAll(); 
        }
        return; // 處理完河神就結束，不要往下跑
    }

    // --- 先知專屬判斷 (你說本來就是對的，保持邏輯一致) ---
    if (gameState === "SeerDialog") {
        const seerRect = { x: 330, y: 240, w: 160, h: 240 };
        const isOverSeer = (itemCenterX > seerRect.x && itemCenterX < seerRect.x + seerRect.w &&
                            itemCenterY > seerRect.y && itemCenterY < seerRect.y + seerRect.h);

        if (seerTaskStep === "waiting" && isOverSeer) {
            onSeerReceivedItem(draggedItem.id);
        } else {
            autoArrangeAll();
        }
        return;
    }

    // --- 其他所有情況（如普通場景） ---
    autoArrangeAll();
}

function onDeliverToRiverGod(itemId) {
    // 【核心修正】檢查目前是否處於可以接收道具的「等待階段」
    if (riverGodTaskStep !== "waiting") {
        if (typeof autoArrangeAll === "function") autoArrangeAll();
        return; 
    }

    // --- 邏輯分流：根據是否完成過女兒任務來處理 ---
    
    if (!window.gameProgress.isRiverDaughterTaskDone) {
        // 【第一階段：原本的找女兒任務邏輯】
        if (itemId === "river_daughter") {
            if (typeof removeItem === "function") removeItem("river_daughter");
            if (typeof addItem === "function") addItem("magnet");

            riverGodLine = "太感謝你們找到我的女兒\n我是河神-泊紐\n我的河流充滿魔力\n這顆石頭浸泡在河裡許久\n產生了魔力，就送給你當禮物吧";
            
            // 標記任務完成，下次對話會切換到「大恩人」模式
            window.gameProgress.isRiverDaughterTaskDone = true; 
            riverGodTaskStep = "response";
        } else {
            riverGodLine = "這不是我的女兒... \n請再幫我找找。";
            riverGodTaskStep = "response";
        }
    } else {
        // 【第二階段：大恩人階段 - 處理哈梅林的書信】
        if (itemId === "hamelinletter") {
            removeItem("hamelinletter");
            addItem("rivergodmagic");

            // 確保這裡使用 \n 作為換行符號
            riverGodLine = "小木匠哈梅林啊？\n" + 
                           "他的確有找過我學魔法\n" + 
                           "不過我見他心術不正不願教他\n" + 
                           "但既然是大恩人的委託\n" + 
                           "我就答應了，請將魔法交給他";
            
            riverGodTaskStep = "response";
        }else {
            // 【新增邏輯】：第二階段丟錯東西
            riverGodLine = "這個東西是？我不明白。"; 
            riverGodTaskStep = "response";
        }
    }

    if (typeof autoArrangeAll === "function") autoArrangeAll();
}

function onSeerReceivedItem(itemId) {
    if (seerTaskStep !== "waiting") return;
    seerDynamicLine1 = ""; 
    seerDynamicLine2 = "";

    if (SEER_TARGETS.includes(itemId)) {
        if (typeof removeItem === "function") removeItem(itemId);
        if (!seerTempReceived.includes(itemId)) seerTempReceived.push(itemId);
        if (seerTempReceived.length === 3) {
            window.gameProgress.isSeerTaskDone = true;
            seerTaskStep = "all_done";
        } else {
            seerDynamicLine1 = `喔！這確實是其中之一...`;
            seerDynamicLine2 = `還差 ${3 - seerTempReceived.length} 件。`;
        }
    } else {
        seerDynamicLine1 = "這個物品...";
        seerDynamicLine2 = "好像對人類的文明沒有幫助。";
    }
}

function refundSeerItems() {
    if (seerTempReceived.length > 0) {
        seerTempReceived.forEach(id => { if (items[id]) items[id].isOwned = true; });
        seerTempReceived = [];
        if (typeof autoArrangeAll === "function") autoArrangeAll();
    }
}

function startEndingVideo() {
    if (isEndingVideoPlaying) return;
    isEndingVideoPlaying = true;

    console.log("【系統】準備播放謝幕影片，開始清理音訊...");

    // 1. 停止 bgm 物件裡所有的背景音樂
    if (typeof bgm === "object") {
        Object.values(bgm).forEach(audio => {
            audio.pause();
            audio.currentTime = 0;
        });
    }

    // 2. 停止 sfx 物件裡所有的音效 (防止最後一刻的點擊聲殘留)
    if (typeof sfx === "object") {
        Object.values(sfx).forEach(audio => {
            audio.pause();
            audio.currentTime = 0;
        });
    }

    // 3. 雙重保險：萬一還有其他沒被歸類到的音訊
    document.querySelectorAll('audio, video').forEach(el => {
        el.pause();
        el.muted = true;
    });

    // 4. 影片顯示與播放
    if (endingVideo) {
        // 更新一次位置，防止縮放後跑掉
        const gameCanvas = document.getElementById('gameCanvas') || document.getElementById('game');
        if (gameCanvas) {
            endingVideo.style.width = gameCanvas.width + "px";
            endingVideo.style.height = gameCanvas.height + "px";
            endingVideo.style.top = gameCanvas.offsetTop + "px";
            endingVideo.style.left = gameCanvas.offsetLeft + "px";
        }

        endingVideo.style.display = "block";
        endingVideo.muted = false; // 謝幕影片要有聲音！
        endingVideo.volume = 1.0;

        endingVideo.play().then(() => {
            console.log("【系統】謝幕影片播放成功。");
        }).catch(e => {
            console.error("影片播放失敗：", e);
            // 備案：如果瀏覽器擋住自動播放，彈窗提示
            alert("請點擊確定以觀看謝幕影片。");
            endingVideo.play();
        });

        endingVideo.onended = function() {
            alert("感謝遊遊玩：諾亞方舟。大威老師 ＆ AI 協作 90小時完工。");
            // location.reload(); // 若要回標題畫面可開啟
        };
    }
}

// 註冊
window.renderPastRiver = renderPastRiver;
window.handleSeerDialogNext = handleSeerDialogNext;
window.handlePastRiverClick = handlePastRiverClick;
window.onSeerReceivedItem = onSeerReceivedItem;
window.handleMouseUp = handleMouseUp;