// 1. 傑克專用的狀態變數
let jackScriptIndex = 0;

let isJackChoosing = false;
let isJackWaitingCow = false;
let isJackTradeDone = false;
let jackScripts = [];

// 2. 繪製場景
function renderJackScene() {
    // 1. 畫背景
    const bg = images.bgJackStreet || images.bgStreet; 
    if (bg && bg.complete && bg.naturalWidth !== 0) {
        ctx.drawImage(bg, 0, 0, 800, 450);
    }

    // 2. 畫街道上的傑克本人
    if (images.npcJack && images.npcJack.complete && images.npcJack.naturalWidth !== 0) {
        ctx.drawImage(images.npcJack, 500, 250, 100, 125);
    } else {
        ctx.fillStyle = "green";
        ctx.fillRect(520, 180, 160, 200);
        ctx.fillStyle = "white";
        ctx.font = "16px 'Microsoft JhengHei'";
        ctx.fillText("傑克載入失敗", 530, 250);
    }

    // 3. 畫場景導引箭頭
    drawDirectionArrow(layout.jackStreetRight.x, layout.jackStreetRight.y, layout.jackStreetRight.w, layout.jackStreetRight.h, "right");
    drawDirectionArrow(layout.jackStreetGate.x, layout.jackStreetGate.y, layout.jackStreetGate.w, layout.jackStreetGate.h, "left");

    // 4. 處理對話顯示
    if (isJackTalking) {
        // 全銀幕半透明遮罩
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.fillRect(0, 0, 800, 450);

        // 傑克立繪 (左側放大圖)
        if (images.npcJack && images.npcJack.complete) {
            ctx.drawImage(images.npcJack, 20, 50, 320, 400);
        }

        // 對話框本體
        ctx.fillStyle = "rgba(10, 20, 30, 0.9)"; 
        ctx.strokeStyle = "#4ea1d3"; // 傑克的代表藍
        ctx.lineWidth = 3;
        ctx.fillRect(400, 50, 370, 260);
        ctx.strokeRect(400, 50, 370, 260);

        // 角色名字
        ctx.fillStyle = "#4ea1d3";
        ctx.font = "bold 24px 'Microsoft JhengHei'";
        ctx.textAlign = "left"; // 確保文字左對齊
        ctx.fillText("懊悔的傑克", 420, 90);

        // 台詞內容
        let text = jackScripts[jackScriptIndex];
        ctx.fillStyle = "white";
        ctx.font = "20px 'Microsoft JhengHei'";
        if (text) {
            text.split('\n').forEach((line, i) => {
                ctx.fillText(line, 420, 130 + (i * 35));
            });
        }

        // --- 狀態按鈕繪製 (強迫症一致化版本) ---
        if (isJackChoosing || isJackWaitingCow) {
            // 設定文字置中模式
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.font = "18px 'Microsoft JhengHei'";

            if (isJackChoosing) {
                [layout.btnYes, layout.btnNo].forEach((btn, i) => {
                    // 按鈕背景
                    ctx.fillStyle = "#2c3e50";
                    ctx.fillRect(btn.x, btn.y, btn.w, btn.h);
                    
                    // 按鈕邊框 (藍色系)
                    ctx.strokeStyle = "#4ea1d3";
                    ctx.lineWidth = 1;
                    ctx.strokeRect(btn.x, btn.y, btn.w, btn.h);

                    // 文字置中
                    ctx.fillStyle = "white";
                    ctx.fillText(i === 0 ? "是" : "否", btn.x + btn.w / 2, btn.y + btn.h / 2 + 2);
                });
            } else if (isJackWaitingCow) {
                let btn = layout.btnNo;
                // 「算了」按鈕：鮮豔紅底 + 白色邊框
                ctx.fillStyle = "#c0392b";
                ctx.fillRect(btn.x, btn.y, btn.w, btn.h);
                
                ctx.strokeStyle = "white";
                ctx.lineWidth = 1;
                ctx.strokeRect(btn.x, btn.y, btn.w, btn.h);

                ctx.fillStyle = "white";
                ctx.fillText("算了", btn.x + btn.w / 2, btn.y + btn.h / 2 + 2);
            }

            // 畫完後一定要重置對齊方式，避免後續文字出錯
            ctx.textAlign = "left";
            ctx.textBaseline = "alphabetic";
        }    }
}

// 3. 處理點擊
function handleJackClick(tx, ty) {
    if (!isJackTalking) {
        // --- 探索模式 ---
        if (tx > 500 && tx < 680 && ty > 180 && ty < 380) {
            if (sfx && sfx.jack) {
                sfx.jack.currentTime = 0; // 回到音效起點
                sfx.jack.play().catch(e => console.log("傑克音效播放被瀏覽器攔截", e));
            }
            startJackDialogue();
        }
       else if (isClicked(tx, ty, layout.jackStreetRight)) {
            changeScene("street");
        }
        else if (isClicked(tx, ty, layout.jackStreetGate)) {
            changeScene("noah_yard");
        }
    } else {
        // --- 對話模式 ---
        if (isJackChoosing) {
            if (isClicked(tx, ty, layout.btnYes)) {
                isJackChoosing = false;
                isJackWaitingCow = true;
                jackScripts[jackScriptIndex] = "真的嗎？那快把母牛牽來給我！";
            } else if (isClicked(tx, ty, layout.btnNo)) {
                triggerJackExit(); 
            }
        } 
        else if (isJackWaitingCow) {
            if (isClicked(tx, ty, layout.btnNo)) {
                triggerJackExit(); 
            }
        } // <--- 之前這裡漏掉了這個括號！
        else {
            // --- 4. 處理對話框翻頁 ---
            if (tx > 400 && tx < 770 && ty > 50 && ty < 310) {
                if (jackScriptIndex < jackScripts.length - 1) {
                    jackScriptIndex++;
                    if (jackScripts[jackScriptIndex].includes("換豆子嗎")) {
                        isJackChoosing = true;
                    }
                } else {
                    isJackTalking = false; 
                }
            }
        }
    } // 這是對話模式的結束括號
}

function startJackDialogue() {
    isJackTalking = true;
    jackScriptIndex = 0;
    isJackChoosing = false;
    isJackWaitingCow = false;

    // ✨ 修改：如果交易過了，就只顯示嘲諷台詞
    if (isJackTradeDone) {
        jackScripts = [
            "哈哈哈，",
            "是你自己要跟我換的，",
            "我可沒逼你。"
        ];
    } else {
        // 原本的初次見面台詞
        jackScripts = [
            "我怎麼會這麼笨？\n用我的牛去換這幾顆豆子？",
            "雖然這些豆子有魔法，\n澆水能長出參天大樹",
            "但這世界上根本沒有\n乾淨的水能灌溉了。",
            "我家那頭母牛\n至少還能擠點牛奶。",
            "你願意用母牛跟我換豆子嗎？"
        ];
    }
}

// 畫對話框翻頁箭頭 (複用邏輯)
function drawDialogArrow() {
    ctx.fillStyle = "#4ea1d3";
    let bob = Math.sin(Date.now() / 200) * 5;
    ctx.beginPath();
    ctx.moveTo(740, 280 + bob);
    ctx.lineTo(755, 280 + bob);
    ctx.lineTo(747.5, 290 + bob);
    ctx.fill();
}

// 接收物品邏輯 (當玩家把牛丟給傑克)
function onJackReceivedItem(itemId) {
    if (!isJackWaitingCow) return;

    if (itemId === "cow") {
        // 1. 道具所有權轉換
        items.cow.isOwned = false;   
        items.beans.isOwned = true;  
        
        // 2. 狀態切換
        isJackWaitingCow = false;
        isJackChoosing = false;
        isJackTalking = true;
        isJackTradeDone = true; // ✨ 關鍵：標記交易已完成

        // 3. 交易當下的台詞（傑克此時還在裝客氣或是剛拿到牛的喜悅）
        jackScripts = [
            "這是你要的魔法豆子！", 
            "聽說只要一點點清澈的水，\n它就能長到天上去。", 
            "但是乾淨的水很難取得，\n哈，竟然有人比我還笨。",
            "實在太好囉！"
        ];
        jackScriptIndex = 0;

        autoArrangeAll();
        console.log("交易完成：標記已更新。");
    } else {
        triggerJackExit("這不是我要的母牛啊..."); 
    }
}

function triggerJackExit(line1) {
    // 預設台詞：如果沒傳 line1 (點選「否」或「算了」)，就直接走兩句
    if (!line1) {
        jackScripts = [
            "唉，也是啦...", 
            "畢竟沒有人比我還笨，\n願意用母牛換豆子。"
        ];
    } else {
        // 如果有傳 line1 (丟錯東西時)，就變成三句組合
        jackScripts = [
            line1,             // "這不是我要的母牛啊..."
            "唉，也是啦...", 
            "畢竟沒有人比我還笨，\n願意用母牛換豆子。"
        ];
    }

    jackScriptIndex = 0;       
    isJackChoosing = false;    
    isJackWaitingCow = false;  
    isJackTalking = true;      
}
