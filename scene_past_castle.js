// ===================== 古代城堡門口 (Past Castle) =====================

function renderPastCastleScene() {
    // 1. 繪製背景
    ctx.save();
    if (images.bgPastCastle) {
        ctx.drawImage(images.bgPastCastle, 0, 0, 800, 450);
    } else {
        ctx.fillStyle = "#222"; 
        ctx.fillRect(0, 0, 800, 450);
        ctx.fillStyle = "white";
        ctx.font = "20px 'Microsoft JhengHei'";
        ctx.textAlign = "center";
        ctx.fillText("古代城堡場景載入中...", 400, 225);
    }
    ctx.restore();

    // 2. 繪製導航箭頭 (回古代河流 - 往下)
    ctx.save();
    const backBtn = { x: 370, y: 380, w: 60, h: 60 }; 
    if (typeof drawDirectionArrow === "function") {
        drawDirectionArrow(backBtn.x, backBtn.y, backBtn.w, backBtn.h, "down");
    }
    ctx.restore();

    // 3. --- 新增：繪製城堡大門 ---
    ctx.save();
    
    // 【老師修改這裡】：定義門的位置與大小
    const doorArea = { x: 375, y: 325, w: 50, h: 50 };
    
    if (images.doorImg && images.doorImg.complete) {
        ctx.drawImage(images.doorImg, doorArea.x, doorArea.y, doorArea.w, doorArea.h);
    } else {
        // 如果圖片沒載入，保底畫一個黑色的矩形
        ctx.fillStyle = "rgba(0,0,0,0.8)";
        ctx.fillRect(doorArea.x, doorArea.y, doorArea.w, doorArea.h);
        ctx.strokeStyle = "#444";
        ctx.lineWidth = 2;
        ctx.strokeRect(doorArea.x, doorArea.y, doorArea.w, doorArea.h);
    }
    ctx.restore();
}

function handlePastCastleClick(tx, ty) {
    // 1. 判定點擊「向下」箭頭回古代河流
    const backArea = { x: 370, y: 380, w: 60, h: 60 };
    if (tx > backArea.x && tx < backArea.x + backArea.w && 
        ty > backArea.y && ty < backArea.y + backArea.h) {
        if (typeof changeScene === "function") {
            pastSubScene = "river"; 
            isTransitioningToRiver = false; 
            changeScene("past_river", false); // 走回戶外不播門聲
            return;
        }
    }

    // 2. --- 新增：判定點擊大門進入城堡內部 ---
    const doorArea = { x: 375, y: 325, w: 50, h: 50 };
    if (tx > doorArea.x && tx < doorArea.x + doorArea.w && 
        ty > doorArea.y && ty < doorArea.y + doorArea.h) {
        
        if (typeof changeScene === "function") {
            // 進入室內，這裡可以設為 true 播放開門聲
            changeScene("past_castle_inside", true);
            console.log("進入古代城堡內部");
        }
    }
}

function handlePastCastleClick(tx, ty) {
    // 1. 判定點擊「向下」箭頭回古代河流
    const backArea = { x: 370, y: 380, w: 60, h: 60 };
    if (tx > backArea.x && tx < backArea.x + backArea.w && 
        ty > backArea.y && ty < backArea.y + backArea.h) {
        if (typeof changeScene === "function") {
            pastSubScene = "river"; 
            isTransitioningToRiver = false; 
            changeScene("past_river", false); // 走回戶外不播門聲
            return;
        }
    }

    // 2. --- 新增：判定點擊大門進入城堡內部 ---
    const doorArea = { x: 375, y: 325, w: 50, h: 50 };
    if (tx > doorArea.x && tx < doorArea.x + doorArea.w && 
        ty > doorArea.y && ty < doorArea.y + doorArea.h) {
        
        if (typeof changeScene === "function") {
            // 進入室內，這裡可以設為 true 播放開門聲
            changeScene("past_castle_inside", true);
            console.log("進入古代城堡內部");
        }
    }
}

// ===================== 古代城堡內部 (Past Castle Inside) =====================

function renderPastCastleInsideScene() {
    // 1. 繪製背景
    ctx.save();
    if (images.bgPastCastleInside) {
        ctx.drawImage(images.bgPastCastleInside, 0, 0, 800, 450);
    } else {
        ctx.fillStyle = "#111"; 
        ctx.fillRect(0, 0, 800, 450);
    }
    ctx.restore();

    // 2. 繪製正下方出口的大門
    ctx.save();
    const mainDoor = { x: 370, y: 380, w: 60, h: 60 };
    if (images.doorImg && images.doorImg.complete) {
        ctx.drawImage(images.doorImg, mainDoor.x, mainDoor.y, mainDoor.w, mainDoor.h);
    }
    ctx.restore();

    // 3. 繪製左邊的大門 (通往地下室)
    ctx.save();
    const leftDoor = { x: 90, y: 200, w: 150, h: 200 }; 
    if (images.doorImg && images.doorImg.complete) {
        ctx.drawImage(images.doorImg, leftDoor.x, leftDoor.y, leftDoor.w, leftDoor.h);
    }
    ctx.restore();

    // 4. --- 新增：繪製富有的小矮人 ---
    ctx.save();
    // 【老師可以在這裡調整小矮人的位置與大小】
    const richDwarfPos = { x: 500, y: 300, w: 120, h: 120 }; 
    
    if (images.npcRichdwarf && images.npcRichdwarf.complete) {
        ctx.drawImage(images.npcRichdwarf, richDwarfPos.x, richDwarfPos.y, richDwarfPos.w, richDwarfPos.h);
    } else {
        // 圖片沒出來時，畫個金色的圓形代表有錢的小矮人
        ctx.fillStyle = "gold";
        ctx.beginPath();
        ctx.arc(richDwarfPos.x + 60, richDwarfPos.y + 60, 40, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.fillText("小矮人", richDwarfPos.x + 60, richDwarfPos.y + 110);
    }
    ctx.restore();
}

function handlePastCastleInsideClick(tx, ty) {
    // --- 【修正：對話狀態邏輯】 ---
    if (gameState === "DwarfDialog") {
        if (!currentDialogue) return;
        const currentLine = currentDialogue[dialogueIndex];

        // 1. 判定是否為「是/否」分支出現頁面
        if (currentLine.isBranch) {
            const { btnYes, btnNo } = layout; 
            
            // 點擊「是」
            if (tx > btnYes.x && tx < btnYes.x + btnYes.w && ty > btnYes.y && ty < btnYes.y + btnYes.h) {
                console.log("玩家選擇：是 (進入小遊戲)");
                gameState = "past_singing_game"; 
                if (typeof startSingingGame === "function") startSingingGame();
                return;
            }
            // 點擊「否」
            if (tx > btnNo.x && tx < btnNo.x + btnNo.w && ty > btnNo.y && ty < btnNo.y + btnNo.h) {
                console.log("玩家選擇：否");
                currentDialogue = [
                    { 
                        name: "城主-安多奇跋", 
                        text: "原來你也不會唱歌\n別來浪費我時間\n有錢人的時間是很珍貴的",
                        isBranch: false 
                    }
                ];
                dialogueIndex = 0; 
                return; 
            }

            // --- 關鍵修正：如果是分支頁面，但沒點到按鈕，直接 return，不准關閉或翻頁 ---
            return; 
        }

        // 2. 非分支頁面（普通翻頁邏輯）
        const box = layout.textArea;
        if (tx > box.x && tx < box.x + box.w && ty > box.y && ty < box.y + box.h) {
            // 只有在不是 isBranch 的時候，點擊對話框才會翻頁
            dialogueIndex++;
            if (dialogueIndex >= currentDialogue.length) {
                gameState = "past_castle_inside"; 
            }
        }
        return; 
    }

    // --- 【原本的場景點擊邏輯】 ---

    // 1. 判定點擊「正下方門」回城堡門口
    const mainDoor = { x: 370, y: 380, w: 60, h: 60 };
    if (tx > mainDoor.x && tx < mainDoor.x + mainDoor.w && 
        ty > mainDoor.y && ty < mainDoor.y + mainDoor.h) {
        if (typeof changeScene === "function") {
            changeScene("past_castle", true); 
            return;
        }
    }

    // 2. 判定點擊「左邊門」進入地下室
    const leftDoor = { x: 90, y: 200, w: 150, h: 200 }; 
    if (tx > leftDoor.x && tx < leftDoor.x + leftDoor.w && 
        ty > leftDoor.y && ty < leftDoor.y + leftDoor.h) {
        if (typeof changeScene === "function") {
            changeScene("past_castle_base", true);
            console.log("進入古代城堡地下室");
            return;
        }
    }
// 判定點擊「富有的小矮人」
const richDwarfPos = { x: 500, y: 300, w: 120, h: 120 }; 
if (tx > richDwarfPos.x && tx < richDwarfPos.x + richDwarfPos.w && 
    ty > richDwarfPos.y && ty < richDwarfPos.y + richDwarfPos.h) {
    if (typeof sfx !== 'undefined' && sfx.richdwarf) {
            sfx.richdwarf.currentTime = 0; // 每次點擊都從頭播放
            sfx.richdwarf.play();
        }

    if (isDwarfTaskDone) {
        // --- 【任務完成後的「胖虎」台詞】 ---
        currentDialogue = [
            { 
                name: "城主-安多奇跋", 
                text: "我~是胖~虎~，我~是孩~子王~",
                isBranch: false 
            }
        ];
    } else {
        // --- 【原本的任務對話】 ---
        currentDialogue = [
            { 
                name: "城主-安多奇跋", 
                text: "真是的，錢多到花不完...\n但是每個矮人必備的唱歌技能\n我卻不會...",
                isBranch: false
            },
            { 
                name: "城主-安多奇跋", 
                text: "你願意教我唱歌嗎？", 
                isBranch: true 
            }
        ];
    }

    dialogueIndex = 0;
    gameState = "DwarfDialog"; 
    return;
}
}

function drawDwarfUI() {
    if (!currentDialogue) return;
    const currentLine = currentDialogue[dialogueIndex];
    
    // 使用系統統一的 layout
    const box = (typeof layout !== 'undefined' && layout.textArea) ? layout.textArea : { x: 380, y: 50, w: 380, h: 260 };

    // 1. 左側大立繪 (城主安多奇跋)
    if (images.npcRichdwarf && images.npcRichdwarf.complete) {
        ctx.save();
        ctx.drawImage(images.npcRichdwarf, 0, 50, 350, 350); 
        ctx.restore();
    }

    // 2. 右側對話框底板
    ctx.fillStyle = "rgba(30, 30, 30, 0.95)"; 
    ctx.strokeStyle = "gold";
    ctx.lineWidth = 3;
    ctx.fillRect(box.x, box.y, box.w, box.h);
    ctx.strokeRect(box.x, box.y, box.w, box.h);

    // 3. 名字
    ctx.fillStyle = "gold";
    ctx.font = "bold 24px 'Microsoft JhengHei'";
    ctx.textAlign = "left";
    ctx.fillText(currentLine.name, box.x + 20, box.y + 45);

    // 4. 對話內容
    ctx.fillStyle = "white";
    ctx.font = "20px 'Microsoft JhengHei'";
    const lines = currentLine.text.split('\n');
    lines.forEach((line, index) => {
        ctx.fillText(line, box.x + 20, box.y + 90 + (index * 32));
    });

    // --- 【優化修改：風格統一的是/否按鈕】 ---
    if (currentLine.isBranch && typeof layout !== 'undefined' && layout.btnYes) {
        const { btnYes, btnNo } = layout;

        ctx.lineWidth = 2;
        ctx.font = "bold 20px 'Microsoft JhengHei'";
        ctx.textAlign = "center";

        // --- 畫「是」按鈕 ---
        // 使用深色背景避免全透明看不到，但外框用金色
        ctx.fillStyle = "rgba(50, 50, 50, 0.8)"; 
        ctx.fillRect(btnYes.x, btnYes.y, btnYes.w, btnYes.h);
        ctx.strokeStyle = "gold"; // 與主框一致
        ctx.strokeRect(btnYes.x, btnYes.y, btnYes.w, btnYes.h);
        
        ctx.fillStyle = "gold"; // 文字也用金色
        ctx.fillText("是", btnYes.x + btnYes.w / 2, btnYes.y + 32);

        // --- 畫「否」按鈕 ---
        ctx.fillStyle = "rgba(50, 50, 50, 0.8)";
        ctx.fillRect(btnNo.x, btnNo.y, btnNo.w, btnNo.h);
        ctx.strokeStyle = "gold";
        ctx.strokeRect(btnNo.x, btnNo.y, btnNo.w, btnNo.h);

        ctx.fillStyle = "gold";
        ctx.fillText("否", btnNo.x + btnNo.w / 2, btnNo.y + 32);
        
        // 恢復原本的對齊方式
        ctx.textAlign = "left";
    }
}

function handleSingingGameSuccess() {
    // 1. 給予玩家道具：骯髒的打火石
    if (items.dirty) {
        items.dirty.isOwned = true;
        console.log("獲得道具：骯髒的打火石");
        
        // 如果您的背包系統有自動整理功能，也可以在這裡呼叫
        if (typeof autoArrangeAll === "function") autoArrangeAll();
    }

    // 2. 更新任務狀態 (關鍵！確保任務不會重複觸發)
    isDwarfTaskDone = true; 

    // 3. 設定獲勝後的感謝對話
    currentDialogue = [
        { 
            name: "城主-安多奇跋", 
            text: "喔~~這首歌真是太好聽了，\n謝謝你們教會我這麼好聽的歌，\n送給你們這個東西，",
            isBranch: false
        },
        { 
            name: "城主-安多奇跋", 
            text: "不要小看它喔，\n只要清潔一番就能一直生出火來。",
            isBranch: false
        }
    ];
    
    dialogueIndex = 0;
    gameState = "DwarfDialog"; // 切換回對話介面顯示感謝台詞
}

// ===================== 古代城堡地下室 (Past Castle Base) =====================

function renderPastCastleBaseScene() {
    // 1. 繪製背景
    ctx.save();
    if (images.bgPastCastleBase) {
        ctx.drawImage(images.bgPastCastleBase, 0, 0, 800, 450);
    } else {
        ctx.fillStyle = "#050505"; 
        ctx.fillRect(0, 0, 800, 450);
        ctx.fillStyle = "white";
        ctx.font = "20px 'Microsoft JhengHei'";
        ctx.textAlign = "center";
        ctx.fillText("地下室載入中...", 400, 225);
    }
    ctx.restore();

    // 2. 繪製回二樓的「樓梯」
    ctx.save();
    const exitStairs = { x: 360, y: 125, w: 150, h: 150 };
    if (images.stairsImg && images.stairsImg.complete) {
        ctx.drawImage(images.stairsImg, exitStairs.x, exitStairs.y, exitStairs.w, exitStairs.h);
    } else {
        ctx.fillStyle = "#666";
        ctx.fillRect(exitStairs.x, exitStairs.y, exitStairs.w, exitStairs.h);
        ctx.fillStyle = "white";
        ctx.fillText("樓梯", exitStairs.x + 75, exitStairs.y + 75);
    }
    ctx.restore();

    // 3. --- 修改：繪製清潔工 ---
    // 我們加上一個判斷：只有在「不是對話狀態」時才畫小圖
    if (gameState !== "CleanerDialog") {
        ctx.save();
        const cleanerPos = { x: 200, y: 150, w: 250, h: 270 }; 
        
        if (images.npcCleaner && images.npcCleaner.complete) {
            ctx.drawImage(images.npcCleaner, cleanerPos.x, cleanerPos.y, cleanerPos.w, cleanerPos.h);
        } else {
            // 圖片尚未載入時的保底顯示
            ctx.fillStyle = "rgba(150, 150, 150, 0.5)";
            ctx.fillRect(cleanerPos.x, cleanerPos.y, cleanerPos.w, cleanerPos.h);
            ctx.fillStyle = "white";
            ctx.textAlign = "center";
            ctx.fillText("清潔工", cleanerPos.x + 125, cleanerPos.y + 170); // 這裡配合寬度 250 把文字置中
        }
        ctx.restore();
    }
}

function handlePastCastleBaseClick(tx, ty) {
    // 【第一優先：對話攔截】
    if (gameState === "CleanerDialog") {
        const box = layout.textArea;
        const currentLine = currentDialogue[dialogueIndex];

        // 1. 處理普通對話翻頁
        if (currentLine && !currentLine.isBranch) {
            if (tx > box.x && tx < box.x + box.w && ty > box.y && ty < box.y + box.h) {
                dialogueIndex++;
                if (dialogueIndex >= currentDialogue.length) {
                    gameState = "past_castle_base";
                }
            }
        } 
        // 2. 處理分支選項
        else if (currentLine && currentLine.isBranch) {
            // --- 判定「是」 (btnYes) ---
            if (tx > layout.btnYes.x && tx < layout.btnYes.x + layout.btnYes.w &&
                ty > layout.btnYes.y && ty < layout.btnYes.y + layout.btnYes.h) {
                
                // 如果是在等待交付狀態（畫面上只有一個紅色的「算了」，但位置仍是 btnNo，所以這裡不處理 btnYes）
                if (currentLine.isWaitingItem) return; 

                if (window.hasFinishedCleanerTask) {
                    // 【清潔大師狀態】：進入等待交付
                    currentDialogue = [{ 
                        name: "清潔工-仙杜瑞拉", 
                        text: "請把想清洗的東西拿給我吧。", 
                        isBranch: true,
                        isWaitingItem: true 
                    }];
                } else {
                    // 【原本找牛狀態】：進入等待交付
                    currentDialogue = [{ 
                        name: "清潔工-仙杜瑞拉", 
                        text: "太好了，趕快給我看看", 
                        isBranch: true,
                        isWaitingItem: true 
                    }];
                }
                dialogueIndex = 0;
            }
            // --- 判定「否」或「算了」 (btnNo) ---
            else if (tx > layout.btnNo.x && tx < layout.btnNo.x + layout.btnNo.w &&
                     ty > layout.btnNo.y && ty < layout.btnNo.y + layout.btnNo.h) {
                
                if (window.hasFinishedCleanerTask) {
                    // 【清潔大師狀態下拒絕】：顯示結束台詞，點擊後才結束
                    currentDialogue = [{ 
                        name: "清潔工-仙杜瑞拉", 
                        text: "有需要我幫忙再告訴我。", 
                        isBranch: false 
                    }];
                } else {
                    // 【原本找牛狀態下拒絕】
                    currentDialogue = [{ 
                        name: "清潔工-仙杜瑞拉", 
                        text: "唉~真想看看牛長什麼樣子...", 
                        isBranch: false 
                    }];
                }
                dialogueIndex = 0;
            }
        }
        return;
    }

    // --- 場景判定 (樓梯) ---
    const exitStairs = { x: 360, y: 125, w: 150, h: 150 };
    if (tx > exitStairs.x && tx < exitStairs.x + exitStairs.w && 
        ty > exitStairs.y && ty < exitStairs.y + exitStairs.h) {
        if (typeof changeScene === "function") {
            changeScene("past_castle_inside", true); 
            return;
        }
    }

    // --- 2. 判定點擊清潔工 (啟動對話) ---
    const cleanerPos = { x: 200, y: 150, w: 210, h: 270 }; 
    if (tx > cleanerPos.x && tx < cleanerPos.x + cleanerPos.w && 
        ty > cleanerPos.y && ty < cleanerPos.y + cleanerPos.h) {
        if (typeof sfx !== 'undefined' && sfx.cleaner) {
            sfx.cleaner.currentTime = 0; // 回到開頭
            sfx.cleaner.play();
        }
        
        if (window.hasFinishedCleanerTask) {
            currentDialogue = [
                { name: "清潔工-仙杜瑞拉", text: "你有需要清潔的物品嗎？", isBranch: true }
            ];
        } else {
            currentDialogue = [
                { name: "清潔工-仙杜瑞拉", text: "整天在這裡打掃清潔，\n真是悶死了。", isBranch: false },
                { name: "清潔工-仙杜瑞拉", text: "外面的世界長什麼樣子呢？\n我都還沒看過牛呢！", isBranch: false },
                { name: "清潔工-仙杜瑞拉", text: "你願意帶牛給我看嗎？", isBranch: true }
            ];
        }
        dialogueIndex = 0;
        gameState = "CleanerDialog"; 
        return;
    }
}

function drawCleanerUI() {
    if (!currentDialogue) return;
    const currentLine = currentDialogue[dialogueIndex];
    const box = layout.textArea; 

    // 1. 左側大立繪
    if (images.npcCleaner && images.npcCleaner.complete) {
        ctx.save();
        ctx.drawImage(images.npcCleaner, 20, 50, 350, 350); 
        ctx.restore();
    }

    // 2. 右側對話框底板
    ctx.fillStyle = "rgba(20, 20, 20, 0.9)"; 
    ctx.strokeStyle = "#888"; 
    ctx.lineWidth = 3;
    ctx.fillRect(box.x, box.y, box.w, box.h);
    ctx.strokeRect(box.x, box.y, box.w, box.h);

    // 3. 名字
    ctx.fillStyle = "#aaa";
    ctx.font = "bold 24px 'Microsoft JhengHei'";
    ctx.textAlign = "left";
    ctx.fillText(currentLine.name, box.x + 20, box.y + 45);

    // 4. 對話內容
    ctx.fillStyle = "white";
    ctx.font = "20px 'Microsoft JhengHei'";
    const lines = currentLine.text.split('\n');
    lines.forEach((line, index) => {
        ctx.fillText(line, box.x + 20, box.y + 90 + (index * 32));
    });

    // --- 修改：繪製分支按鈕 ---
    if (currentLine.isBranch) {
        if (currentLine.isWaitingItem) {
            // 【等待交付狀態】：只畫一個紅色的「算了」在原本「否」的位置
            const btn = layout.btnNo;
            ctx.fillStyle = "rgba(200, 0, 0, 0.8)"; // 紅色
            ctx.strokeStyle = "white";
            ctx.lineWidth = 2;
            ctx.fillRect(btn.x, btn.y, btn.rect ? btn.rect.w : btn.w, btn.rect ? btn.rect.h : btn.h);
            ctx.strokeRect(btn.x, btn.y, btn.rect ? btn.rect.w : btn.w, btn.rect ? btn.rect.h : btn.h);

            ctx.fillStyle = "white";
            ctx.font = "20px 'Microsoft JhengHei'";
            ctx.textAlign = "center";
            ctx.fillText("算了", btn.x + (btn.w || btn.rect.w) / 2, btn.y + 28);
        } else {
            // 【初始詢問狀態】：畫原本的一致風格 是/否
            const buttons = [
                { rect: layout.btnYes, label: "是" },
                { rect: layout.btnNo, label: "否" }
            ];

            buttons.forEach(btn => {
                ctx.fillStyle = "rgba(20, 20, 20, 0.9)";
                ctx.strokeStyle = "#888";
                ctx.lineWidth = 2;
                ctx.fillRect(btn.rect.x, btn.rect.y, btn.rect.w, btn.rect.h);
                ctx.strokeRect(btn.rect.x, btn.rect.y, btn.rect.w, btn.rect.h);

                ctx.fillStyle = "white";
                ctx.font = "20px 'Microsoft JhengHei'";
                ctx.textAlign = "center";
                ctx.fillText(btn.label, btn.rect.x + btn.rect.w / 2, btn.rect.y + 28);
            });
        }
   }

    ctx.textAlign = "left"; // 恢復對齊設定，避免影響後續繪製
}

function onCleanerReceivedItem(itemKey) {
    // 檢查是否已經完成「看牛」任務
    const isTaskDone = window.hasFinishedCleanerTask;

    if (!isTaskDone) {
        // ==========================
        // 第一階段：找牛期 (任務未完成)
        // ==========================
        if (itemKey === "rich_bull") {
            currentDialogue = [
                { name: "清潔工-仙杜瑞拉", text: "哈哈哈，原來不是尖尖的腳...", isBranch: false },
                { name: "清潔工-仙杜瑞拉", text: "而是尖尖的角啊！", isBranch: false },
                { name: "清潔工-仙杜瑞拉", text: "真謝謝你讓我知道牛的樣子。", isBranch: false },
                { name: "清潔工-仙杜瑞拉", text: "以後只要有關清潔的任務我都會幫你。", isBranch: false }
            ];
            // 任務成功邏輯
            if (items[itemKey]) items[itemKey].isOwned = false;
            window.hasFinishedCleanerTask = true; 
            if (typeof sfx !== 'undefined' && sfx.get_item) sfx.get_item.play();
        } else {
            // 給了牛以外的東西
            currentDialogue = [
                { name: "清潔工-仙杜瑞拉", text: "這好像不是牛...", isBranch: false },
                { name: "清潔工-仙杜瑞拉", text: "我聽說牛有尖尖的腳...", isBranch: false },
                { name: "清潔工-仙杜瑞拉", text: "唉~真想看看牛長什麼樣子...", isBranch: false }
            ];
        }
    } else {
        // ==========================
        // 第二階段：大師期 (任務已完成)
        // ==========================
        if (itemKey === "dirty") {
            // 成功交付：骯髒的打火石
            currentDialogue = [
                { name: "清潔工-仙杜瑞拉", text: "這看起來真髒，我已經清洗過了。", isBranch: false },
                { name: "清潔工-仙杜瑞拉", text: "有需要我幫忙再告訴我。", isBranch: false }
            ];
            // 道具轉換
            if (items["dirty"]) items["dirty"].isOwned = false;
            if (items["firestone"]) items["firestone"].isOwned = true;
            if (typeof sfx !== 'undefined' && sfx.get_item) sfx.get_item.play();
        } else {
            // 給了髒石頭以外的東西 (包含再丟一次公牛)
            currentDialogue = [
                { name: "清潔工-仙杜瑞拉", text: "這個東西已經很乾淨了，\n我幫不上忙。", isBranch: false }
            ];
        }
    }

    // 重設對話索引
    dialogueIndex = 0;
}


// --- 數據區 ---
var SingingGame = {
    correctAnswers: ["胖", "虎", "我", "是", "孩", "子", "王"],
    slots: [null, null, null, null, null, null, null],
    pool: ["胖", "虎", "我", "是", "孩", "子", "王", "朕", "皇", "尊", "神", "聖", "幻", "影", "龍", "霸", "天", "地", "凡", "塵"],
    draggingChar: null,
    dragX: 0,
    dragY: 0,
    layout: {
        bg: { x: 50, y: 30, w: 700, h: 400 },
        slotsY: 150,    // 往下移一點，避免碰到標題歌詞
        poolY: 250,     // 選字池也跟著往下移，拉開距離
        slotSize: 40,   // 方框縮小，字才不會顯得擁擠
        // 重新分配 X 座標，確保「~，」這類長符號不會疊字
        slotX: [180, 265, 370, 440, 510, 580, 650], 
        btnSubmit: { x: 325, y: 360, w: 150, h: 50 }
    }
};

// --- 初始化與判定 ---
function startSingingGame() {
    gameState = "past_singing_game"; 
    SingingGame.slots = [null, null, null, null, null, null, null];
    SingingGame.draggingChar = null;

    // --- 【新增：洗牌邏輯】 ---
    // 使用 Fisher-Yates 演算法將 pool 陣列隨機打亂
    for (let i = SingingGame.pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [SingingGame.pool[i], SingingGame.pool[j]] = [SingingGame.pool[j], SingingGame.pool[i]];
    }
    
    console.log("教唱歌遊戲開始，字池已重新洗牌");
}

function checkSingingWin() {
    // 判定是否通關：必須「填滿」且「內容與正解完全一致」
    const isWin = SingingGame.slots.every((val, index) => val === SingingGame.correctAnswers[index]);
    
    if (isWin) {
        // 成功：進入成功處理邏輯
        if (typeof handleSingingGameSuccess === "function") {
            handleSingingGameSuccess();
        }
    } else {
        // 失敗結局：不論是沒填完、填錯字、順序反了，通通觸發這段對話
        gameState = "DwarfDialog"; 
        dialogueIndex = 0;
        currentDialogue = [
            { 
                name: "城主-安多奇跋", 
                text: "這什麼歌啊！難聽死了！",
                isBranch: false 
            },
            { 
                name: "城主-安多奇跋", 
                text: "你不會唱歌不要浪費我的時間，\n有錢人的時間是很寶貴的！",
                isBranch: false 
            }
        ];
        console.log("提交失敗（未完成或錯誤），城主很生氣");
    }
}
// --- 繪製區 ---
function drawSingingGameUI() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
    ctx.fillRect(0, 0, 800, 450);

    const { bg, slotSize, slotsY, poolY, btnSubmit, slotX } = SingingGame.layout;

    // 1. 主框
    ctx.fillStyle = "rgba(20, 20, 20, 0.95)";
    ctx.strokeStyle = "gold";
    ctx.lineWidth = 3;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(bg.x, bg.y, bg.w, bg.h, 10);
    ctx.fill();
    ctx.stroke();

    // 2. 固定歌詞文字 (放在 slotsY 上方一點點)
    ctx.textAlign = "left";
    ctx.fillStyle = "white";
    ctx.font = "bold 26px 'Microsoft JhengHei'";
    ctx.fillText("歌詞：我~是", bg.x + 30, slotsY - 30); // 這裡往上提

    // 3. 繪製方框與嚴格符號
    SingingGame.slots.forEach((char, i) => {
        const sx = slotX[i];
        
        // 畫框 □
        ctx.strokeStyle = "gold";
        ctx.lineWidth = 2;
        ctx.strokeRect(sx, slotsY, slotSize, slotSize);

        // 畫符號
        ctx.fillStyle = "gold";
        ctx.font = "bold 22px 'Microsoft JhengHei'";
        ctx.textAlign = "left";

        // 根據老師要求的格式：□~□~，□~□□~□□~
        if (i === 0) ctx.fillText("~", sx + slotSize + 5, slotsY + 28);
        if (i === 1) ctx.fillText("~，", sx + slotSize + 5, slotsY + 28);
        if (i === 2) ctx.fillText("~", sx + slotSize + 5, slotsY + 28);
        if (i === 4) ctx.fillText("~", sx + slotSize + 5, slotsY + 28);
        if (i === 6) ctx.fillText("~", sx + slotSize + 5, slotsY + 28);

        // 填入字體
        if (char) {
            ctx.fillStyle = "cyan";
            ctx.textAlign = "center";
            ctx.font = "bold 26px 'Microsoft JhengHei'";
            ctx.fillText(char, sx + slotSize / 2, slotsY + 30);
        }
    });

    // 4. 選字池提示
    ctx.textAlign = "left";
    ctx.fillStyle = "#888";
    ctx.font = "16px 'Microsoft JhengHei'";
    ctx.fillText("點擊選取「正確」的字：", bg.x + 35, poolY - 15);

    // 5. 繪製選字池
    ctx.textAlign = "center";
    SingingGame.pool.forEach((char, i) => {
        const row = Math.floor(i / 10);
        const col = i % 10;
        const px = bg.x + 55 + col * 65;
        const py = poolY + row * 55;
        const isUsed = SingingGame.slots.includes(char);
        
        ctx.globalAlpha = isUsed ? 0.2 : 1.0;
        ctx.fillStyle = isUsed ? "#555" : "gold";
        ctx.font = "bold 24px 'Microsoft JhengHei'";
        ctx.fillText(char, px, py + 30);
        ctx.globalAlpha = 1.0;
    });

    // 6. 按鈕
    ctx.fillStyle = "darkred";
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(btnSubmit.x, btnSubmit.y, btnSubmit.w, btnSubmit.h, 8);
    ctx.fill();
    ctx.fillStyle = "white";
    ctx.font = "bold 20px 'Microsoft JhengHei'";
    ctx.fillText("唱給城主聽", btnSubmit.x + btnSubmit.w / 2, btnSubmit.y + 32);

    // 7. 拖曳
    if (SingingGame.draggingChar) {
        ctx.fillStyle = "yellow";
        ctx.font = "bold 38px 'Microsoft JhengHei'";
        ctx.fillText(SingingGame.draggingChar, SingingGame.dragX, SingingGame.dragY);
    }
}

// --- 點擊判定區 ---
function handleSingingGameClick(tx, ty, type) {
    const { bg, slotsY, poolY, slotSize, btnSubmit, slotX } = SingingGame.layout;

    if (type === "down") {
        // 1. 優先檢查提交按鈕
        if (tx > btnSubmit.x && tx < btnSubmit.x + btnSubmit.w && ty > btnSubmit.y && ty < btnSubmit.y + btnSubmit.h) {
            checkSingingWin();
            return;
        }

        // 2. 檢查選字池 (抓取)
        SingingGame.pool.forEach((char, i) => {
            const row = Math.floor(i / 10);
            const col = i % 10;
            // 注意：這裡 px 座標必須跟 draw 邏輯完全一致 (bg.x + 55)
            const px = bg.x + 55 + col * 65; 
            const py = poolY + row * 55;
            
            // 點擊判定：以字中心為基準的小範圍
            if (tx > px - 30 && tx < px + 30 && ty > py && ty < py + 40) {
                if (!SingingGame.slots.includes(char)) {
                    SingingGame.draggingChar = char;
                    SingingGame.dragX = tx;
                    SingingGame.dragY = ty;
                }
            }
        });

        // 3. 檢查填字框 (撤回)
        SingingGame.slots.forEach((char, i) => {
            const sx = slotX[i];
            if (tx > sx && tx < sx + slotSize && ty > slotsY && ty < slotsY + slotSize) {
                SingingGame.slots[i] = null;
            }
        });

    } else if (type === "move" && SingingGame.draggingChar) {
        SingingGame.dragX = tx;
        SingingGame.dragY = ty;

    } else if (type === "up" && SingingGame.draggingChar) {
        let placed = false;
        // 4. 判定放入哪一個框
        SingingGame.slots.forEach((_, i) => {
            const sx = slotX[i];
            // 增加判定寬容度，稍微靠近框框就能吸進去
            if (tx > sx - 10 && tx < sx + slotSize + 10 && ty > slotsY - 10 && ty < slotsY + slotSize + 10) {
                SingingGame.slots[i] = SingingGame.draggingChar;
                placed = true;
            }
        });
        
        SingingGame.draggingChar = null;
    }
}