// scene_after.js

const AfterChapter = {
    dialogIndex: 0,
    dialogs: [
        "洪水終於退去，我們安全了，",
        "接著我們會很忙碌，",
        "去找先知-卡珊德拉吧！",
        "她應該還活著，",
        "我們會需要她的力量。"
    ],
    isActive: false
};

const chapter2Layout = {
    // 避難所位置：(70, 40)
    shelter: { x: 70, y: 40, w: 100, h: 50 } 
};

function startChapter2() {
    console.log("第二章啟動成功");
    gameState = "chapter2_start"; 
    AfterChapter.isActive = true;
    AfterChapter.dialogIndex = 0;
    
    isNoahTalking = false;
    window.isNpcTalking = false;
}

function renderAfterScene() {
    // 1. 永遠畫背景
    if (images.bgAfter) {
        ctx.drawImage(images.bgAfter, 0, 0, 800, 450);
    }

    // 2. 對話階段：畫諾亞與對話框
    if (gameState === "chapter2_start") {
        drawNoahFinalAppearance();
        drawAfterDialog();
    }

   }

function drawNoahFinalAppearance() {
    if (images.npcNoah) {
        ctx.save();
        ctx.drawImage(images.npcNoah, -200, -100, 700, 700); 
        ctx.restore();
    }
}

function drawAfterDialog() {
    const box = layout.textArea;
    ctx.fillStyle = "rgba(0,0,0,0.7)";
    ctx.fillRect(box.x, box.y, box.w, box.h);
    ctx.strokeStyle = "white";
    ctx.strokeRect(box.x, box.y, box.w, box.h);

    ctx.fillStyle = "#FFD700";
    ctx.font = "bold 24px 'Microsoft JhengHei'";
    ctx.fillText("諾亞", box.x + 20, box.y + 40);

    ctx.fillStyle = "white";
    ctx.font = "20px 'Microsoft JhengHei'";
    ctx.fillText(AfterChapter.dialogs[AfterChapter.dialogIndex], box.x + 20, box.y + 80);
}

function handleChapter2Click(tx, ty) {
    // 模式 A：處理開場對話
    if (gameState === "chapter2_start") {
        const box = layout.textArea;
        if (tx > box.x && tx < box.x + box.w && ty > box.y && ty < box.y + box.h) {
            AfterChapter.dialogIndex++;
            if (AfterChapter.dialogIndex >= AfterChapter.dialogs.length) {
                gameState = "chapter2_explore";
                AfterChapter.isActive = false;
                console.log("對話結束，進入自由探索（尋找避難所）");
            }
            return; // 點擊對話框後不觸發後方的判斷
        }
    } 

    // 模式 B：處理避難所盲點判定
    if (gameState === "chapter2_explore") {
        const s = chapter2Layout.shelter;
        if (tx > s.x && tx < s.x + s.w && ty > s.y && ty < s.y + s.h) {
          if (sfx && sfx.breakdoor) {
                sfx.breakdoor.currentTime = 0; // 重置音效進度
                sfx.breakdoor.play().catch(e => console.log("音效播放失敗:", e));
            }
            console.log("發現避難所！前往酒吧。");
            window.isChapter2Bar = true; // 重要：讓 scene_bar.js 知道要畫卡珊德拉
            changeScene("bar_chapter2");             return;
        }
    }
}