// --- scene_bar.js ---

const CassandraChapter2 = {
    dialogIndex: 0,
    dialogs:[
        "我就知道你們能成功。", // 第一頁
        "但是現在人類的文明\n已經不復存在。", // 第二頁 (使用 \n 換行)
        "唯一的辦法，就是用我的魔力，\n開啟通往過去的大門。", // 第三頁
        "我們即刻出發吧！\n前往二十年前..." // 第四頁
    ],
    // 用來判斷是否已經點擊了 NPC 開始對話
    isTalking: false, 
    // 場景中小圖 NPC 的點擊判定位置 (你可以調整這裡的數值)
    npcRect: { x: 330, y: 240, w: 160, h: 240 } 
};

// --- 第一章專用：普通酒吧 ---
function renderBarScene() {
    drawBarBackground();
    // 只畫門
    if (typeof drawDoor === "function") {
        drawDoor(layout.barExit);
    }
}

// --- 第二章專用：卡珊德拉的避難所 ---
function renderBarChapter2() {
    // 1. 底層：場景與背景
    drawBarBackground();
    
    // 2. 中層：小人 (NPC)
    drawCassandraSmallNPC();

    // 3. 狀態同步
    window.isBarCassandraTalking = CassandraChapter2.isTalking; 

    // 4. 對話層 (只有點擊後才會出現)
    if (CassandraChapter2.isTalking) {
        drawCassandraBigAvatar(); 
        if (CassandraChapter2.dialogIndex < CassandraChapter2.dialogs.length) {
            drawCassandraDialog();
        }
    }

    
}

// --- 公用部分：背景繪製 ---
function drawBarBackground() {
    ctx.save();
    if (images.bgBar) {
        ctx.drawImage(images.bgBar, 0, 0, 800, 450);
    } else {
        ctx.fillStyle = "#1a0f00";
        ctx.fillRect(0, 0, 800, 450);
    }
    ctx.restore();
}

window.renderBarInternal = renderBarScene;     // 第一章
window.renderBarChapter2 = renderBarChapter2;   // 第二章

// 2. 點擊函數對接 (讓兩個名字都指向 handleBarClick)
window.handleBarClick = handleBarClick;         
window.handleBarChapter2Click = handleBarClick;
// 在場景中的「小圖」NPC
function drawCassandraSmallNPC() {
    if (images.npcCassandra) {
        ctx.save();
        // 這裡渲染在背景裡的小人，位置由 npcRect 決定
        const r = CassandraChapter2.npcRect;
        ctx.drawImage(images.npcCassandra, r.x, r.y, r.w, r.h);
        ctx.restore();
    }
}

// 觸發對話後的「大頭貼」
function drawCassandraBigAvatar() {
    if (images.npcCassandra) {
        ctx.save();
        // 這裡是你原本設定的大圖位置
        ctx.drawImage(images.npcCassandra, 0, 50, 350, 400); 
        ctx.restore();
    }
}

function drawCassandraDialog() {
    const box = layout.textArea;
    ctx.save();
    
    // 1. 畫背景框 (維持原樣)
    ctx.fillStyle = "rgba(0,0,0,0.8)";
    ctx.fillRect(box.x, box.y, box.w, box.h);
    ctx.strokeStyle = "#9370DB"; 
    ctx.lineWidth = 3;
    ctx.strokeRect(box.x, box.y, box.w, box.h);

    // 2. 畫名字 (維持原樣)
    ctx.fillStyle = "#DA70D6";
    ctx.font = "bold 24px 'Microsoft JhengHei'";
    ctx.fillText("先知-卡珊德拉", box.x + 20, box.y + 40);

    // 3. --- 重點：處理換行內文 ---
    ctx.fillStyle = "white";
    ctx.font = "20px 'Microsoft JhengHei'";
    
    const text = CassandraChapter2.dialogs[CassandraChapter2.dialogIndex];
    const lines = text.split('\n'); // 根據 \n 拆分成陣列
    const lineHeight = 30; // 設定每一行的高度間距

    lines.forEach((line, index) => {
        // 每多一行，y 座標就往下移動一個 lineHeight
        ctx.fillText(line, box.x + 20, box.y + 80 + (index * lineHeight));
    });

    ctx.restore();
}

function handleBarClick(tx, ty) {
    // 只要是第二章場景或標記為 true，就走先知邏輯
    if (gameState === "bar_chapter2" || window.isChapter2Bar) {
        
        if (!CassandraChapter2.isTalking) {
            const r = CassandraChapter2.npcRect;
            if (tx > r.x && tx < r.x + r.w && ty > r.y && ty < r.y + r.h) {
              if (sfx && sfx.cassandra) {
                    sfx.cassandra.currentTime = 0;
                    sfx.cassandra.play();
                }
                CassandraChapter2.isTalking = true;
                return;
            }
        }else {
            const box = layout.textArea;
            if (tx > box.x && tx < box.x + box.w && ty > box.y && ty < box.y + box.h) {
                CassandraChapter2.dialogIndex++;

                // --- 檢查對話是否結束 ---
                if (CassandraChapter2.dialogIndex >= CassandraChapter2.dialogs.length) {
                    triggerTimeTravel(); // 觸發穿越轉場
                }
                return;
            }
        }
    } else {
        // 第一章邏輯 (維持原樣)
        const exitRect = layout.barExit;
        if (tx > exitRect.x && tx < exitRect.x + exitRect.w && ty > exitRect.y && ty < exitRect.y + exitRect.h) {
            if (typeof changeScene === "function") changeScene("river", true);
        }
    }
}