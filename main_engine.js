// --- 影片管理 (建議放在主引擎) ---
const endingVideo = document.createElement("video");
endingVideo.src = "assets/videos/ending_credits.mp4"; 

// 1. 解決大小問題：動態抓取畫布 (Canvas) 的寬高
const gameCanvas = document.getElementById('gameCanvas') || { width: 800, height: 450 };
endingVideo.style.position = "absolute";
endingVideo.style.width = gameCanvas.width + "px";
endingVideo.style.height = gameCanvas.height + "px";

// 確保影片對齊畫布的位置 (假設畫布是置中的，這裡可能需要根據你的 CSS 調整)
endingVideo.style.top = gameCanvas.offsetTop + "px";
endingVideo.style.left = gameCanvas.offsetLeft + "px";

endingVideo.style.zIndex = "999"; 
endingVideo.style.display = "none"; 
document.body.appendChild(endingVideo);

let isEndingVideoPlaying = false;

let titleStep = 0;

const bgm = {
    main: new Audio('assets/audio/bgm_main.mp3'),
    minigame: new Audio('assets/audio/bgm_minigame.mp3'),
    rain: new Audio('assets/audio/rain.mp3'),
    past: new Audio('assets/audio/bgm_past.mp3')};

bgm.main.loop = true;
bgm.minigame.loop = true;
bgm.past.loop = true;

const sfx = {
    door: new Audio('assets/audio/door.mp3'),
    breakdoor: new Audio('assets/audio/breakdoor.mp3'),
    bull: new Audio('assets/audio/bull.mp3'),
    cassandra: new Audio('assets/audio/cassandra.mp3'),
    cow: new Audio('assets/audio/cow.mp3'),
    drop: new Audio('assets/audio/drop.mp3'),
    dwaf: new Audio('assets/audio/dwaf.mp3'),
    farmmer: new Audio('assets/audio/farmmer.mp3'),
    hamelin: new Audio('assets/audio/hamelin.mp3'),
    jack: new Audio('assets/audio/jack.mp3'),
    noah: new Audio('assets/audio/noah.mp3'),
    queen: new Audio('assets/audio/queen.mp3'),
    rivergod: new Audio('assets/audio/rivergod.mp3'),
    yaf: new Audio('assets/audio/yaf.mp3'),
    carpenter: new Audio('assets/audio/carpenter.mp3'),
    gopast: new Audio('assets/audio/gopast.mp3'),
    pastrivergod: new Audio('assets/audio/pastrivergod.mp3'),
    richdwarf: new Audio('assets/audio/richdwarf.mp3'),
    rich_bull: new Audio('assets/audio/rich_bull.mp3'),
    cleaner: new Audio('assets/audio/cleaner.mp3'),
    blacksmith: new Audio('assets/audio/blacksmith.mp3'),
};

function switchBGM(type) {
    const targetBGM = bgm[type];
    if (!targetBGM) {
        console.error("錯誤：找不到這首音樂的定義 ->", type);
        return;
    }

        if (!targetBGM.paused) {
        return; 
    }

    console.log("切換音樂中，目標：", type);

        Object.values(bgm).forEach(audio => {
        audio.pause();
        audio.currentTime = 0;
    });

    targetBGM.play().catch(e => console.log("BGM 播放失敗：", e));
}
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
var isRiverGodTalking = false; 
var isJackTalking = false;
var isNoahTalking = false;
var isMineTalking = false;
var isQueenTalking = false;
var isHamelinTalking = false;
var isDwarfTaskDone = false;
let longClickTimer;
let previewItem = null;


let fadeAlpha = 0;      
let fadeTarget = 0;     
let nextState = null;   
let isBagFullWarning = false; 
const fadeSpeed = 0.05; 


const layout = {
    textArea: { x: 400, y: 50, w: 370, h: 260 },
    
    btnYes: { x: 440, y: 220, w: 60, h: 40 }, 
    btnNo: { x: 670, y: 220, w: 60, h: 40 }, 
    btnQ1: { x: 450, y: 140, w: 280, h: 35 },
    btnQ2: { x: 450, y: 185, w: 280, h: 35 },
    btnQ3: { x: 450, y: 230, w: 280, h: 35 },
    arrowExit: { x: 360, y: 370, w: 80, h: 80 },
    streetLeft: {x: 20, y: 350, w: 80, h: 80 },
    streetRight: { x: 700, y: 350, w: 80, h: 80 },
    streetUp: { x: 375, y: 210, w: 50, h: 50 },
    jackStreetRight: { x: 700, y: 330, w: 80, h: 80 },
    jackStreetGate: { x: 250, y: 260, w: 80, h: 80 },
    noahToJackStreet: { x: 470, y: 200, w: 80, h: 80 },
    noahToMine: { x: 350, y: 200, w: 80, h: 80 },
    riverLeft:  { x: 20,  y: 110, w: 80, h: 80 },
    riverUp:    { x: 180, y: 100, w: 80, h: 80 },
    riverRight: { x: 700, y: 330, w: 80, h: 80 },
    pastureToRiver: { x: 700, y: 330, w: 80, h: 80 },
    riverGodClick: { x: 400, y: 220, w: 160, h: 50 },
    castleDown: { x: 360, y: 370, w: 80, h: 80 }, 
    castleUp:   { x: 375, y: 320, w: 50, h: 50 },
    barDoor: { x: 115, y: 55, w: 50, h: 50 },
    barExit: {  x: 360, y: 370, w: 80, h: 80 },
    riverToForest : { x: 700, y: 110, w: 80, h: 80 },
    forestToRiver : { x: 20, y: 330, w: 80, h: 80 },
    hamelinDoor : { x: 350, y: 300, w: 50, h: 50 },
    hamelinExit : { x: 20, y: 320, w: 80, h: 80 },
    pastureBack: { x: 20, y: 330, w: 80, h: 80 },
    btnMouse : {x: 430, y: 180, w: 120, h: 40},
    btnCow   : {x: 560, y: 180, w: 120, h: 40},
    btnYaf   : {x: 430, y: 230, w: 120, h: 40},
    btnReplay: {x: 560, y: 230, w: 120, h: 40}
};


const images = {};
const assetFiles = {
    bgInside: 'assets/scenes/bg_inside.png',
    bgStreet: 'assets/scenes/bg_street.png',
    bgJackStreet: 'assets/scenes/bg_jack_street.png', 
    bgNoah: 'assets/scenes/bg_noah.png',
    npcCassandra: 'assets/npcs/cassandra.png',
    npcDwarf: 'assets/npcs/dwarf.png',
    bgMine: 'assets/scenes/bg_mine.png',
    npcJack: 'assets/npcs/jack.png',
    bgPasture: 'assets/scenes/bg_pasture.png',
    npcNoah: 'assets/npcs/noah.png',
    npcOwner: 'assets/npcs/owner.png',    
    imgGrass: 'assets/items/grass.png',
    npcRiverGod: 'assets/npcs/god.png',
    bgRiver: 'assets/scenes/bg_river.png' , 
    bgCastle: 'assets/scenes/bg_castle.png',
    bgCastleInside: 'assets/scenes/bg_castle_inside.png',
    npcQueen: 'assets/npcs/queen.png',
    bgBar: 'assets/scenes/bg_bar.png',     
    arrowImg: 'assets/items/arrow.png',
    bgForest : 'assets/scenes/bg_forest.png',
    bgForestInside : 'assets/scenes/bg_forest_inside.png',
    npcHamelin : 'assets/npcs/hamelin.png',
    npcBull: 'assets/npcs/bull.png',  
    npcYaf: 'assets/npcs/yaf.png',
    title: 'assets/scenes/title.png',
    bgAfter: 'assets/scenes/after.png',
    bugImg: 'assets/items/bug.png',
    bgBarChapter2: 'assets/scenes/bg_bar.png',
    doorImg: 'assets/items/door.png',
    stairsImg: 'assets/items/stairs.png',
    bgPastBar: 'assets/scenes/past_bar.png',     
    bgPastRiver: 'assets/scenes/past_river.png',
    pastRiverGod: 'assets/npcs/past_rivergod.png',
    bgPastForest: 'assets/scenes/past_forest.png',
    bgPastForestInside : 'assets/scenes/past_forest_inside.png',
    bgPastCastle: 'assets/scenes/bg_castle.png', 
    bgPastPasture: 'assets/scenes/past_pasture.png',
    bgPastCastleInside: 'assets/scenes/bg_castle_inside.png',
    bgPastCastleBase: 'assets/scenes/past_castle_base.png',
    bgPastGate: 'assets/scenes/past_gate.png',
    npcBlacksmith: 'assets/npcs/blacksmith.png',
    npcCarpenter: 'assets/npcs/littlehamelin.png',
    npcRichdwarf: 'assets/npcs/richdwarf.png',
    npcCleaner:'assets/npcs/cleaner.png',
    npcRichbull:'assets/npcs/richbull.png',
    npcSeer: 'assets/npcs/cassandra.png'
};

let loadedCount = 0;
const totalAssets = Object.keys(assetFiles).length;

for (let key in assetFiles) {
    images[key] = new Image();
    images[key].src = assetFiles[key];
    images[key].onload = () => {
        loadedCount++;
        if (loadedCount === totalAssets) {
            console.log("資源載入完成，遊戲啟動");

            if (typeof randomizeNpcLocations === "function") randomizeNpcLocations();

            gameLoop();
        }
    };
    images[key].onerror = () => {
        console.error(`圖片載入失敗: ${assetFiles[key]}`);
        loadedCount++;
        if (loadedCount === totalAssets) gameLoop();
    };
}


function drawUI() {
    const isAnyTalking = (isRiverGodTalking || isJackTalking || isNoahTalking || isMineTalking || isQueenTalking || (typeof isHamelinTalking !== 'undefined' && isHamelinTalking) || window.isNpcTalking || gameState === "dialog" || gameState === "game"|| gameState === "chapter2_start"||window.isBarCassandraTalking||gameState === "SeerDialog"|| gameState === "RiverGodDialog"||gameState === "CarpenterDialog"|| gameState === "DwarfDialog"|| gameState === "CleanerDialog"|| gameState === "BullDialog"|| gameState === "BlacksmithDialog"|| gameState === "BlacksmithFailDialog"|| gameState === "BlacksmithWinDialog"|| gameState === "BlacksmithWaitingItem");

    if (isAnyTalking) {
        ctx.save();

        
        
        ctx.beginPath();
        ctx.moveTo(0, 450); 
        ctx.lineTo(0, 335); 
       
        ctx.bezierCurveTo(200, 310, 600, 310, 800, 335); 
        ctx.lineTo(800, 450);
        ctx.closePath();

       
        const bagGrad = ctx.createLinearGradient(0, 310, 0, 450);
        bagGrad.addColorStop(0, "#4e342e"); 
        bagGrad.addColorStop(0.1, "#3e2723"); 
        bagGrad.addColorStop(1, "#1b0a07");   
        
        ctx.fillStyle = bagGrad;
        
        ctx.shadowBlur = 15;
        ctx.shadowColor = "black";
        ctx.fill();
        ctx.shadowBlur = 0; 

        
        ctx.strokeStyle = "rgba(141, 110, 99, 0.4)"; 
        ctx.setLineDash([6, 4]);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(10, 440);
        ctx.lineTo(10, 345);
        ctx.bezierCurveTo(200, 320, 600, 320, 790, 345);
        ctx.lineTo(790, 440);
        ctx.stroke();
        ctx.setLineDash([]); 

        
        for (let i = 0; i < 6; i++) {
            const slotX = 25 + i * 128;
            const slotY = 350;
            const slotW = 90;
            const slotH = 90;

            
            ctx.fillStyle = "#120907";
            ctx.beginPath();
            if (ctx.roundRect) ctx.roundRect(slotX, slotY, slotW, slotH, 10);
            else ctx.fillRect(slotX, slotY, slotW, slotH);
            ctx.fill();

            
            ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
            ctx.lineWidth = 1;
            ctx.strokeRect(slotX, slotY, slotW, 1); 

            
            ctx.strokeStyle = "#261511";
            ctx.lineWidth = 3;
            ctx.stroke();
        }

                if (typeof items !== "undefined") {
            Object.values(items).forEach(item => {
                if (item.isOwned && item.imgObj && item.imgObj.complete) {
                    ctx.save();
                    
                    ctx.shadowBlur = 8;
                    ctx.shadowColor = "black";
                    ctx.shadowOffsetY = 4;
                    ctx.drawImage(item.imgObj, item.x, item.y, item.w, item.h);
                    ctx.restore();
                }
            });
        }
        ctx.restore();
    }

    
    if (previewItem) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
        ctx.fillRect(0, 0, 800, 450);
        const bigSize = 250; 
        const bx = 400 - bigSize / 2;
        const by = 225 - bigSize / 2;
        if (previewItem.imgObj.complete) {
            ctx.drawImage(previewItem.imgObj, bx, by, bigSize, bigSize);
        }
        ctx.fillStyle = "#FF8C00";
        ctx.font = "bold 36px 'Microsoft JhengHei'";
        ctx.textAlign = "center";
        ctx.fillText(previewItem.name, 400, by - 40);
        ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
        ctx.font = "18px 'Microsoft JhengHei'";
        ctx.fillText("點擊任意處返回", 400, by + bigSize + 50);
        ctx.textAlign = "left";
    }
}

function drawDirectionArrow(x, y, w, h, direction) {
    if (!images.arrowImg) return;
    ctx.save();
    ctx.translate(x + w / 2, y + h / 2);
    if (typeof direction === "number") ctx.rotate(direction * Math.PI / 180);
    else if (direction === "left") ctx.rotate(Math.PI);
    else if (direction === "up") ctx.rotate(-Math.PI / 2);
    else if (direction === "right") ctx.rotate(0);
    else if (direction === "down") ctx.rotate(Math.PI / 2);
    const size = Math.min(w, h) * 0.8;
    ctx.drawImage(images.arrowImg, -size / 2, -size / 2, size, size);
    ctx.restore();
}
function drawDoor(rect) {
    if (!images.doorImg || !images.doorImg.complete) return;
    ctx.save();
    ctx.drawImage(images.doorImg, rect.x, rect.y, rect.w, rect.h);
    ctx.restore();
}

let gameState = "title"; 
let isDraggingAny = true;

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (gameState === "title") {
        drawTitleScreen(); 
    } else if (gameState === "timeskip") {
        renderTimeSkipLogic(); 
    } else {
        if (["room", "street", "dialog"].includes(gameState)) { renderCassandraScene(); }
        else if (gameState === "jack_street") { if (typeof renderJackScene === "function") renderJackScene(); }
        else if (gameState === "noah_yard") { if (typeof renderNoahScene === "function") renderNoahScene(); }
        else if (gameState === "dwarf_mine") { if (typeof renderMineScene === "function") renderMineScene(); }
        else if (gameState === "pasture") { if (typeof renderPastureScene === "function") renderPastureScene(); }
        else if (gameState === "game") { renderPastureScene(); if (typeof renderStealthGame === "function") renderStealthGame(); }
        else if (gameState === "hamelin_game") { if (typeof renderHamelinScene === "function") renderHamelinScene(); }
        else if (gameState === "river") { if (typeof renderRiverScene === "function") renderRiverScene(); }
        else if (gameState === "castle") { if (typeof renderCastleScene === "function") renderCastleScene(); }
        else if (gameState === "castle_inside") { if (typeof renderCastleInside === "function") renderCastleInside(); }
        else if (gameState === "bar") { if (typeof renderBarInternal === "function") renderBarInternal(); }
        else if (gameState === "forest") { if (typeof renderForestScene === "function") renderForestScene(); }
        else if (gameState === "forest_inside") { if (typeof renderForestInside === "function") renderForestInside(); }
        else if (gameState === "chapter2_start" || gameState === "chapter2_explore") { if (typeof renderAfterScene === "function") renderAfterScene(); }
        else if (gameState === "bar_chapter2") { if (typeof renderBarChapter2 === "function") renderBarChapter2(); }
        else if (gameState === "past_forest") {if (typeof renderPastForest === "function") renderPastForest(); }
        else if (gameState === "past_forest_inside"|| gameState === "CarpenterDialog") {renderPastForestInside(); }
        else if (gameState === "past_castle") {if (typeof renderPastCastleScene === "function") renderPastCastleScene();}
        else if (gameState === "past_castle_inside" || gameState === "DwarfDialog") {if (typeof renderPastCastleInsideScene === "function") renderPastCastleInsideScene(); }
        else if (gameState === "past_singing_game") {renderPastCastleInsideScene(); drawSingingGameUI();}
        else if (gameState === "past_castle_base"|| gameState === "CleanerDialog") { if (typeof renderPastCastleBaseScene === "function") renderPastCastleBaseScene(); }
        else if (gameState === "past_gate" || gameState === "BlacksmithDialog"|| gameState === "BlacksmithGame"||gameState === "BlacksmithFailDialog"|| gameState === "BlacksmithWinDialog"|| gameState === "BlacksmithWaitingItem") { if (typeof renderPastGate === "function") renderPastGate();}
        else if (gameState === "past_pasture"|| gameState === "BullDialog") { if (typeof renderPastPasture === "function") renderPastPasture();}
        else if (gameState === "past_river" || gameState === "SeerDialog" || gameState === "RiverGodDialog") { 
            if (typeof renderPastRiver === "function") renderPastRiver(); 
        }

        if (typeof drawDynamicNPCs === "function") drawDynamicNPCs(gameState);

        
        const isAnySceneTalking = (isRiverGodTalking || isJackTalking || isNoahTalking || isMineTalking || isQueenTalking || (typeof isHamelinTalking !== 'undefined' && isHamelinTalking));
        const isCassandraBarTalking = (window.isBarCassandraTalking); 
        
        const isSeerTalking = (gameState === "SeerDialog");
        const isGeneralNpcTalking = (window.isNpcTalking); 
        const isBullTalking = (gameState === "BullDialog");
        const isPastRiverGodTalking = (gameState === "RiverGodDialog");
        const isDwarfTalking = (gameState === "DwarfDialog");
        const isCleanerTalking = (gameState === "CleanerDialog");
        const isBlacksmithTalking = (gameState === "BlacksmithDialog");
        const isBlacksmithFailTalking = (gameState === "BlacksmithFailDialog");
        const isBlacksmithWinTalking = (gameState === "BlacksmithWinDialog");
        const isBlacksmithWaiting = (gameState === "BlacksmithWaitingItem");
        const isAnyTalking = isAnySceneTalking || isCassandraBarTalking || isSeerTalking || isGeneralNpcTalking || isPastRiverGodTalking|| isDwarfTalking|| isCleanerTalking|| isBullTalking|| isBlacksmithTalking||isBlacksmithFailTalking||isBlacksmithWinTalking|| isBlacksmithWaiting;

        if (isAnyTalking) {
            ctx.fillStyle = "rgba(0, 0, 0, 0.5)"; 
            ctx.fillRect(0, 0, 800, 400); 
        }

        if (isAnySceneTalking) {
            if (gameState === "river" && isRiverGodTalking) renderRiverScene(); 
            else if (gameState === "jack_street" && isJackTalking) renderJackScene();
            else if (gameState === "noah_yard" && isNoahTalking) renderNoahScene();
            else if (gameState === "dwarf_mine" && isMineTalking) renderMineScene();
            else if (gameState === "castle_inside" && isQueenTalking) renderCastleInside();
            else if (gameState === "forest_inside" && isHamelinTalking) renderForestInside();
        } 
        else if (isCassandraBarTalking) {
            if (typeof drawCassandraBigAvatar === "function") drawCassandraBigAvatar();
            if (typeof drawCassandraDialog === "function") drawCassandraDialog();
        }
        else if (isSeerTalking) {
            if (images.npcSeer && images.npcSeer.complete) {
                ctx.drawImage(images.npcSeer, 50, 50, 300, 400); 
            }
            if (typeof drawSeerDialogUI === "function") drawSeerDialogUI();
        }else if (gameState === "DwarfDialog") { 
    if (typeof drawDwarfUI === "function") drawDwarfUI(); 
      } else if (isPastRiverGodTalking) {
    if (images.pastRiverGod && images.pastRiverGod.complete) {
        
        ctx.drawImage(images.pastRiverGod, 0, 50, 500, 500); 
    }
    if (typeof drawRiverGodUI === "function") drawRiverGodUI();}
    if (gameState === "CarpenterDialog") { drawCarpenterUI();}
    if (gameState === "CleanerDialog") { if (typeof drawCleanerUI === "function") drawCleanerUI();}
       else if (gameState === "BullDialog") { 
    if (typeof renderBullDialogUI === "function") renderBullDialogUI(); 
}
               else if (isBlacksmithTalking|| isBlacksmithFailTalking|| isBlacksmithWinTalking|| isBlacksmithWaiting) {
            if (typeof renderBlacksmithDialogUI === "function") renderBlacksmithDialogUI();
        }
               else if (isGeneralNpcTalking) {
            if (typeof drawNpcBigAvatar === "function") drawNpcBigAvatar();
            if (typeof drawNpcDialogContent === "function") drawNpcDialogContent();
        }
        
        drawUI(); 
    }

    if (gameState === "river" && typeof drawAxeFallingEffect === "function") drawAxeFallingEffect();
    handleFadeEffect(); 
    drawSystemAlert();  

    if (typeof flashOpacity !== 'undefined' && flashOpacity > 0) {
        ctx.fillStyle = `rgba(255, 255, 255, ${flashOpacity})`;
        ctx.fillRect(0, 0, 800, 450);
    }

    requestAnimationFrame(gameLoop);
}

function renderTimeSkipLogic() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, 800, 450);
    ctx.save();
    ctx.globalAlpha = timeskipAlpha; 
    ctx.fillStyle = "white"; 
    ctx.font = "bold 40px 'Microsoft JhengHei'";
    ctx.textAlign = "center";
    ctx.fillText("6 個月後...", 400, 225);
    ctx.restore();
}


function drawTitleScreen() {
    // 1. 優先畫背景圖 (全亮，不加遮罩)
    if (images.title && images.title.complete) {
        ctx.drawImage(images.title, 0, 0, 800, 450);
    } else {
        ctx.fillStyle = "#1a1a1a"; 
        ctx.fillRect(0, 0, 800, 450);
    }

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // 設定通用的外框顏色與粗細
    ctx.strokeStyle = "black"; 
    ctx.lineWidth = 6; // 外框寬度，可以根據喜好調整

    if (titleStep === 0) {
        // --- 第一頁：警告 ---
        ctx.font = "bold 64px 'Microsoft JhengHei'";
        
        // 先畫外框
        ctx.strokeText("警 告", 400, 200);
        // 再填顏色 (紅色)
        ctx.fillStyle = "#ff0000";
        ctx.fillText("警 告", 400, 200);

        // 小字也加框
        ctx.lineWidth = 4;
        ctx.font = "bold 20px 'Microsoft JhengHei'";
        ctx.strokeText("(點擊翻頁)", 400, 300);
        ctx.fillStyle = "white";
        ctx.fillText("(點擊翻頁)", 400, 300);

    } else if (titleStep === 1) {
        // --- 第二頁：說明 ---
        ctx.font = "bold 32px 'Microsoft JhengHei'";
        ctx.lineWidth = 5;

        // 第一行
        ctx.strokeText("本遊戲破關約需 30 分鐘", 400, 180);
        ctx.fillStyle = "#FF8C00";
        ctx.fillText("本遊戲破關約需 30 分鐘", 400, 180);

        // 第二行
        ctx.strokeText("中途無法紀錄", 400, 240);
        ctx.fillText("中途無法紀錄", 400, 240);

        // 小字
        ctx.lineWidth = 4;
        ctx.font = "bold 20px 'Microsoft JhengHei'";
        ctx.strokeText("(點擊翻頁)", 400, 320);
        ctx.fillStyle = "white";
        ctx.fillText("(點擊翻頁)", 400, 320);

    } else if (titleStep === 2) {
        // --- 第三頁：正式標題按鈕 ---
        ctx.fillStyle = "rgba(61, 43, 31, 0.8)"; 
        ctx.strokeStyle = "#FF8C00";
        ctx.lineWidth = 3;
        ctx.fillRect(300, 300, 200, 60); 
        ctx.strokeRect(300, 300, 200, 60);

        ctx.fillStyle = "white";
        ctx.font = "bold 24px 'Microsoft JhengHei'";
        ctx.fillText("開始遊戲", 400, 330);
    }

    // 恢復設定
    ctx.textAlign = "left"; 
    ctx.textBaseline = "alphabetic"; 
}

canvas.addEventListener("pointerdown", (e) => {

const el = document.documentElement;
    // 檢查是否已在全螢幕，避免重複請求
    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
        const rfs = el.requestFullscreen || el.webkitRequestFullScreen || el.mozRequestFullScreen || el.msRequestFullscreen;
        if (rfs) {
            rfs.call(el).catch(err => {
                // 這裡靜默處理，不噴紅字
            });
        }
    }
    const {tx, ty} = getMousePos(e); 
   if (gameState === "past_singing_game") {
        if (typeof handleSingingGameClick === "function") {
            handleSingingGameClick(tx, ty, "down");
        }
        return; // 這裡一定要 return，避免執行後面的代碼
    }

    if (previewItem) { 
        previewItem = null; 
        return; 
    }

    if (gameState === "past_river" || gameState === "past_forest" || gameState === "past_forest_inside"||gameState === "past_castle" ||gameState === "past_castle_inside" || gameState === "past_castle_base"||gameState === "past_pasture" ||gameState === "SeerDialog" || gameState === "RiverGodDialog"||gameState === "BullDialog" || gameState === "CarpenterDialog"||gameState === "DwarfDialog"|| gameState === "CleanerDialog"|| gameState === "BlacksmithDialog"|| gameState === "BlacksmithGame"|| gameState === "BlacksmithFailDialog"|| gameState === "BlacksmithWinDialog") {
   
    if (ty > 320 && (gameState === "SeerDialog" || gameState === "RiverGodDialog"|| gameState === "CarpenterDialog"|| gameState === "DwarfDialog"||gameState === "BullDialog" ||gameState ==="CleanerDialog"||gameState === "BlacksmithDialog"|| gameState === "BlacksmithFailDialog"|| gameState === "BlacksmithWinDialog")) {

    }else if (gameState === "BlacksmithGame") {
        if (typeof handlePastGateClick === "function") {
        handlePastGateClick(tx, ty);
    }
    return; 
} else {

        if (gameState === "past_forest") {
            if (typeof handlePastForestClick === "function") {
                handlePastForestClick(tx, ty);
            }
        }else if (gameState === "past_castle") { // <--- 新增這一段
            if (typeof handlePastCastleClick === "function") {
                handlePastCastleClick(tx, ty);
            }
        }else if (gameState === "past_castle_inside" || gameState === "DwarfDialog") {
                if (typeof handlePastCastleInsideClick === "function") handlePastCastleInsideClick(tx, ty);
            } else if (gameState === "past_forest_inside"|| gameState === "CarpenterDialog") { 
            if (typeof handlePastForestInsideClick === "function") {
                handlePastForestInsideClick(tx, ty);
            }
        }else if (gameState === "past_pasture"|| gameState === "BullDialog") {
    if (typeof handlePastPastureClick === "function") {
        handlePastPastureClick(tx, ty);
    }
       }else if (gameState === "past_gate" || gameState === "BlacksmithDialog"|| gameState === "BlacksmithGame"|| gameState === "BlacksmithFailDialog"|| gameState === "BlacksmithWinDialog"|| gameState === "BlacksmithWaitingItem") { 
            if (typeof handlePastGateClick === "function") handlePastGateClick(tx, ty);
        }else if (gameState === "past_castle_base"|| gameState === "CleanerDialog") { 
    if (typeof handlePastCastleBaseClick === "function") handlePastCastleBaseClick(tx, ty); 
      }
       else {

            if (typeof handlePastRiverClick === "function") {
                handlePastRiverClick(tx, ty);
            }
        }
        return; 
    }
}
    
    if (gameState === "bar_chapter2") {
        if (typeof handleBarChapter2Click === "function") {
            handleBarChapter2Click(tx, ty);
        }
        return; 
    }
    if (gameState === "title") {
        if (titleStep === 0) {
            // 點擊第一頁：播放雨聲
            if (bgm.rain) {
                bgm.rain.loop = true;
                // 🚀 加一個 50 毫秒的延遲，確保 index.html 的解鎖先生效
                setTimeout(() => {
                    bgm.rain.play().catch(e => console.log("音樂播放受限:", e));
                }, 50);
            }
            titleStep = 1;
        }
    else if (titleStep === 1) {
        // 點擊第二頁：進入正式標題
        titleStep = 2;
    } 
    else if (titleStep === 2) {
        // 原本的按鈕判定
        if (tx > 300 && tx < 500 && ty > 300 && ty < 360) {
            changeScene("dialog"); 
            switchBGM('main'); // 這裡會切換到主音樂，把雨聲停掉或並存
            if (sfx.cassandra) {
                sfx.cassandra.currentTime = 0; 
                sfx.cassandra.play();
            }
        }
    }
    return;
}
    if (gameState === "chapter2_start" || gameState === "chapter2_explore") {
        if (typeof handleChapter2Click === "function") {
            handleChapter2Click(tx, ty);
        }
        return; 
    }

    const box = (layout && layout.textArea) ? layout.textArea : { x: 400, y: 50, w: 370, h: 260 };
    const isAnySceneTalking = (isRiverGodTalking || isJackTalking || isNoahTalking || isMineTalking || isQueenTalking || isHamelinTalking|| gameState === "SeerDialog");

    if (isAnySceneTalking) {
        if (ty < 320) {
            if (gameState === "river") handleRiverClick(tx, ty);
            else if (gameState === "jack_street") handleJackClick(tx, ty);
            else if (gameState === "noah_yard") handleNoahClick(tx, ty);
            else if (gameState === "dwarf_mine") handleMineClick(tx, ty);
            else if (gameState === "castle_inside") handleCastleInsideClick(tx, ty);
            else if (gameState === "forest_inside") handleForestClick(tx, ty);
        }
        if (ty < 320) return; 
    }

    if (window.isNpcTalking) {
        const isInsideBox = (tx > box.x && tx < box.x + box.w && ty > box.y && ty < box.y + box.h);
        if (isInsideBox) {
            let clickedOnButton = false;
            if (typeof handleDynamicNpcClick === "function") {
                clickedOnButton = handleDynamicNpcClick(tx, ty, gameState);
            }
            if (!clickedOnButton) {
                if (window.activeNpcType === "yaf" && 
                   (window.yafDialogState === "waiting_bull" || window.yafDialogState === "waiting_treasures")) {
                    return; 
                }
                handleNpcDialogClose();
            }
            return; 
        }
    }

    if (isBagFullWarning) {
        isBagFullWarning = false;
        systemMessageTimer = 0;
        return; 
    }
    
    isDraggingAny = false;

    const canInteractBag = (window.isNpcTalking || isAnySceneTalking || gameState === "dialog" || gameState === "game"|| gameState === "RiverGodDialog"||gameState === "BullDialog" || gameState === "DwarfDialog" ||gameState === "CarpenterDialog"|| gameState === "CleanerDialog"||gameState === "BlacksmithDialog"|| gameState === "BlacksmithFailDialog"|| gameState === "BlacksmithWinDialog"|| gameState === "BlacksmithWaitingItem");
    if (canInteractBag && ty > 320) {
        Object.values(items).forEach(item => {
            if (item.isOwned && tx > item.x && tx < item.x + item.w && ty > item.y && ty < item.y + item.h) {
                item.isDragging = true;
                isDraggingAny = true;
                longClickTimer = setTimeout(() => {
                    if (item.isDragging) {
                        previewItem = item;
                        item.isDragging = false; 
                        isDraggingAny = false; 
                    }
                }, 500);
            }
        });
    }
    if (!isDraggingAny && !window.isNpcTalking) {
        if (typeof handleDynamicNpcClick === "function") {
            if (handleDynamicNpcClick(tx, ty, gameState)) return;
        }

        if (["room", "street", "dialog"].includes(gameState)) {
            if (typeof handleCassandraClick === "function") handleCassandraClick(tx, ty);
        } else if (["jack_street", "jack_house"].includes(gameState)) {
            if (typeof handleJackClick === "function") handleJackClick(tx, ty);
        } else if (gameState === "noah_yard") {
            if (typeof handleNoahClick === "function") handleNoahClick(tx, ty);
        } else if (gameState === "dwarf_mine") {
            if (typeof handleMineClick === "function") handleMineClick(tx, ty);
        } else if (gameState === "pasture") {
            if (typeof handlePastureClick === "function") handlePastureClick(tx, ty);
        } else if (gameState === "river") { 
            if (typeof handleRiverClick === "function") handleRiverClick(tx, ty);
        } else if (gameState === "castle") {
            if (typeof handleCastleClick === "function") handleCastleClick(tx, ty);
        } else if (gameState === "castle_inside") {
            if (typeof handleCastleInsideClick === "function") handleCastleInsideClick(tx, ty);
        } else if (gameState === "game") {
            if (typeof handleMinigameClick === "function") handleMinigameClick(tx, ty);
        } else if (gameState === "hamelin_game") {
            if (typeof handleHamelinMiniGameClick === "function") 
                handleHamelinMiniGameClick(tx, ty);
        } else if (gameState === "bar") {
            if (typeof handleBarClick === "function") handleBarClick(tx, ty);
        } else if (gameState === "bar_chapter2") {
            if (typeof handleBarChapter2Click === "function") handleBarChapter2Click(tx, ty);
        }else if (gameState === "past_castle_inside" || gameState === "DwarfDialog") { 
            if (typeof handlePastCastleInsideClick === "function") { handlePastCastleInsideClick(tx, ty);
         }
        }else if (gameState === "past_gate" || gameState === "BlacksmithDialog"|| gameState === "BlacksmithFailDialog"|| gameState === "BlacksmithWinDialog"|| gameState === "BlacksmithWaitingItem") { 
            
            if (typeof handlePastGateClick === "function") {
                handlePastGateClick(tx, ty);
            }
        } else if (gameState === "forest" || gameState === "forest_inside") {
            if (typeof handleForestClick === "function") handleForestClick(tx, ty);
        }
    }
});

canvas.addEventListener("pointermove", (e) => {
    // 只需要宣告一次就好
    const {tx, ty} = getMousePos(e);

    // 1. 小遊戲優先處理
    if (gameState === "past_singing_game") {
        if (typeof handleSingingGameClick === "function") {
            handleSingingGameClick(tx, ty, "move");
        }
        return; // 玩遊戲時不處理後面的背包拖拽
    }

    // 2. 原本的背包物品拖拽邏輯
    if (isDraggingAny) clearTimeout(longClickTimer); 
    
    Object.values(items).forEach(item => {
        if (item.isDragging) {
            item.x = tx - item.w / 2;
            item.y = ty - item.h / 2;
        }
    });
});

canvas.addEventListener("pointerup", (e) => {
    // 1. 先把座標拿出來，後面大家都能用
    const {tx, ty} = getMousePos(e);
    clearTimeout(longClickTimer);

    // 2. 小遊戲優先攔截
    if (gameState === "past_singing_game") {
        if (typeof handleSingingGameClick === "function") {
            handleSingingGameClick(tx, ty, "up");
        }
        return; // 玩遊戲時，不執行後面的背包丟棄邏輯
    }

    // 3. 原本的背包與道具邏輯
    if (previewItem) return; 
    if (!isDraggingAny) return;

    handleItemDrop(tx, ty);
    Object.values(items).forEach(item => item.isDragging = false);
    isDraggingAny = false;
    
    if (typeof autoArrangeAll === "function") autoArrangeAll(); 
});

function handleItemDrop(tx, ty) {
    const draggedItemKey = Object.keys(items).find(key => items[key].isDragging);
    if (!draggedItemKey) return;

    const isOverInteractingArea = ty < 320; 

   if (isOverInteractingArea) {
        if (["BlacksmithDialog", "BlacksmithWaitingItem"].includes(gameState)) {
    if (typeof onBlacksmithReceivedItem === "function") {
        onBlacksmithReceivedItem(draggedItemKey);
        return; 
    }
}
         if (gameState === "CleanerDialog") {
    // 取得當前那一行對話
    const currentLine = currentDialogue[dialogueIndex];

    // 關鍵：除了在對話中，還必須是「正在等待道具」的那一行才收東西
    if (currentLine && currentLine.isWaitingItem) {
        if (typeof onCleanerReceivedItem === "function") {
            onCleanerReceivedItem(draggedItemKey);
            return; 
        }
    } else {
        // 如果不是在等待道具的台詞，道具會直接彈回背包
        return; 
    }
}
       if (gameState === "BullDialog") {
            if (typeof onBullReceivedItem === "function") {
                onBullReceivedItem(draggedItemKey);
                
                // --- 這裡加強保險 ---
                // 不管 onBullReceivedItem 裡面做了什麼，
                // 強制確保 richbull 這項「場景道具」的擁有狀態是 false
                if (items.richbull) {
                    items.richbull.isOwned = false; 
                }
                // ------------------
                
                return; 
            }
        }
        if (gameState === "CarpenterDialog") {
           
            if (typeof onDeliverToCarpenter === "function") {
                onDeliverToCarpenter(draggedItemKey);
                return; 
            }
        }

        if (gameState === "RiverGodDialog") {
            if (typeof onDeliverToRiverGod === "function") {

                onDeliverToRiverGod(draggedItemKey); 
                return; 
            }
        }      
        if (gameState === "game" && StealthGame.state.isActive) {
            StealthGame.state.lastResult = "有東西從背包掉出來，發出聲響...";
            StealthGame.state.isActive = false; 
            setTimeout(() => {
                StealthGame.state.isCaught = true; 
                StealthGame.state.lastResult = ""; 
switchBGM('main');
            }, 1200); 
            return; 
        }
if (window.isNpcTalking && window.activeNpcType === "yaf") {
            
            if (typeof onYafReceivedItem === "function") {
                onYafReceivedItem(draggedItemKey);
                return; 
            }
        }
if (gameState === "SeerDialog" && (window.seerTaskStep === "waiting" || seerTaskStep === "waiting")) {
            if (typeof onSeerReceivedItem === "function") {
                onSeerReceivedItem(draggedItemKey);
                return; 
            }
        }
        
        if (["dialog", "room", "street"].includes(gameState)) {
            if (typeof onCassandraReceivedItem === "function") onCassandraReceivedItem(draggedItemKey);
        } 
        else if (gameState === "jack_street") {
            if (typeof onJackReceivedItem === "function") onJackReceivedItem(draggedItemKey);
        } 
        else if (gameState === "noah_yard") { 
            if (typeof onNoahReceivedItem === "function") onNoahReceivedItem(draggedItemKey);
        } 
        else if (gameState === "castle_inside") {
            if (typeof onQueenReceivedItem === "function") onQueenReceivedItem(draggedItemKey);
        } 
        else if (gameState === "dwarf_mine") {
            if (typeof onMineReceivedItem === "function") onMineReceivedItem(draggedItemKey);
        }
        else if (gameState === "forest_inside") {
            if (typeof onHamelinReceivedItem === "function") onHamelinReceivedItem(draggedItemKey);
        }
    }
}


let systemMessage = "";
let systemMessageTimer = 0;

function showSystemMessage(msg) {
    systemMessage = msg;
    systemMessageTimer = 90; }

function drawSystemAlert() {
    if (isBagFullWarning) {
        ctx.save();
        
        
        ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        
        ctx.fillStyle = "#221111"; 
        ctx.strokeStyle = "#ff4444"; 
        ctx.lineWidth = 3;
        const boxW = 500;
        const boxH = 200;
        const bx = (canvas.width - boxW) / 2;
        const by = (canvas.height - boxH) / 2;
        
        ctx.beginPath();
        if (ctx.roundRect) {
            ctx.roundRect(bx, by, boxW, boxH, 15);
        } else {
            ctx.fillRect(bx, by, boxW, boxH);
        }
        ctx.fill();
        ctx.stroke();

        
        ctx.fillStyle = "#ff6666";
        ctx.font = "bold 32px 'Microsoft JhengHei'";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("⚠️ 你的背包已滿", 400, by + 60);
        
        ctx.fillStyle = "white";
        ctx.font = "20px 'Microsoft JhengHei'";
        ctx.fillText("想想其他辦法。", 400, by + 110);
        
        ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
        ctx.font = "16px 'Microsoft JhengHei'";
        ctx.fillText("[ 點擊任意處返回遊戲 ]", 400, by + 160);
        
        ctx.restore();
    }
}

function getMousePos(e) {
    const rect = canvas.getBoundingClientRect();
    return {
        tx: (e.clientX - rect.left) * (canvas.width / rect.width),
        ty: (e.clientY - rect.top) * (canvas.height / rect.height)
    };
}


function changeScene(sceneName, playDoorSound = false) {
    
    if (fadeAlpha > 0) return; 

    
    nextState = sceneName;

    fadeTarget = 1; 


    if (playDoorSound && typeof sfx !== 'undefined' && sfx.door) {
        sfx.door.currentTime = 0;
        sfx.door.play().catch(e => console.log("音效播放失敗:", e));
    }
}

function handleFadeEffect() {

    if (fadeAlpha < fadeTarget) {
        fadeAlpha = Math.min(1, fadeAlpha + fadeSpeed);
    } else if (fadeAlpha > fadeTarget) {
        fadeAlpha = Math.max(0, fadeAlpha - fadeSpeed);
    }


if (fadeAlpha >= 1 && nextState) {
    const prevState = gameState; 
    gameState = nextState; 


    const isEnteringMiniGame = (
        gameState === "game" ||gameState === "forest_inside" || gameState === "past_forest_inside" );
    

    const isPastEra = (gameState === "past_river" || gameState === "SeerDialog"|| gameState === "past_forest"||gameState === "past_forest_inside"|| 
    gameState === "past_castle"||gameState === "past_castle_inside"|| gameState === "past_castle_base"|| gameState === "past_pasture"|| gameState === "past_gate");


    if (isEnteringMiniGame) {
        switchBGM('minigame');
    } else if (isPastEra) {
        switchBGM('past');
    } else {
        switchBGM('main');
    }

    if (typeof randomizeNpcLocations === "function") {
        randomizeNpcLocations();
    }

    nextState = null;
    fadeTarget = 0; 
}

    if (fadeAlpha > 0) {
        ctx.save();
        ctx.fillStyle = `rgba(0, 0, 0, ${fadeAlpha})`;
        ctx.fillRect(0, 0, 800, 450);
        ctx.restore();
    }
}

function drawNpcDialogContent() {
    
    if (typeof drawNpcDialogBox === "function") {
        drawNpcDialogBox();
    }
}

function drawNpcBigAvatar() {
    const box = (layout && layout.textArea) ? layout.textArea : { x: 400, y: 50, w: 370, h: 260 };
    
    
    if (window.activeNpcType === "bull" && images.npcBull) {
        ctx.save();
        const avatarW = 400, avatarH = 480;
        const avatarX = box.x - avatarW - 20;
        const avatarY = (box.y + (box.h - avatarH) / 2) + 60;
        ctx.translate(avatarX + avatarW / 2, avatarY + avatarH / 2);
        ctx.scale(-1, 1); 
        ctx.drawImage(images.npcBull, -avatarW / 2, -avatarH / 2, avatarW, avatarH);
        ctx.restore();
    } 
    else if (window.activeNpcType === "yaf" && images.npcYaf) {
        
        const avW = 380, avH = 380; 
        const avX = box.x - avW - 20;
        const avY = box.y + (box.h - avH) / 2 + 50;
        ctx.drawImage(images.npcYaf, avX, avY, avW, avH);
    }
    
}

function startFloodCutscene() {
    const video = document.getElementById("floodVideo");
 
    changeScene("cutscene_black"); 

    setTimeout(() => {
        // 進入影片前先停掉原本的 BGM
        bgm.main.pause();
        bgm.main.currentTime = 0; // 重置音樂進度

        video.style.display = "block";
        video.play();

        video.onended = () => {
            video.style.display = "none";
            
            // 關鍵點：呼叫顯示「六個月後」的函式
            showSixMonthsLater();
            
            // --- 在這裡啟動雨聲 ---
            bgm.rain.currentTime = 0; // 從頭播放
            bgm.rain.play();
            console.log("進入六個月後場景：啟動環境雨聲");
        };
    }, 1000); 
}
let timeskipAlpha = 0; 

function showSixMonthsLater() {
    gameState = "timeskip"; 
    timeskipAlpha = 0; 

    const textFadeIn = setInterval(() => {
        timeskipAlpha += 0.01; 
        if (timeskipAlpha >= 1) {
            timeskipAlpha = 1;
            clearInterval(textFadeIn); 

            setTimeout(() => {
                if (typeof startChapter2 === "function") {
                    console.log("切換至第二章並播放音樂...");
                    
                    
                    if (typeof switchBGM === "function") {
                        switchBGM('main'); 
                    }
                    if (sfx && sfx.noah) {
                        sfx.noah.currentTime = 0;
                        sfx.noah.play().catch(e => console.log("第二章諾亞音效播放失敗", e));
                    }
                    startChapter2(); 
                } else {
                    console.error("錯誤：找不到 startChapter2 函數！");
                 
                    switchBGM('main');
                    gameState = "bar"; 
                }
            }, 2000); 
        }
    }, 30); 
}

function triggerTimeTravel() {
    if (typeof CassandraChapter2 !== 'undefined') CassandraChapter2.isTalking = false;
    window.isBarCassandraTalking = false;

    // 播放穿越音效
    if (sfx && sfx.gopast) {
        sfx.gopast.currentTime = 0;
        sfx.gopast.play().catch(e => console.log("音效播放失敗"));
    }

    flashOpacity = 0; 
    
    const fadeInterval = setInterval(() => {
        flashOpacity += 0.1;

        if (flashOpacity >= 1.5) { 
            clearInterval(fadeInterval);
            
            gameState = "SeerDialog"; 
            
            if (typeof seerTaskStep !== 'undefined') {
                seerTaskStep = "intro"; 
            } else {
                window.seerTaskStep = "intro"; 
            }

            if (typeof pastSubScene !== 'undefined') {
                pastSubScene = "bar"; 
            }
                         
            
            console.log("發動時空跳躍音樂：past"); 
            try {
                if (typeof switchBGM === "function") {
                    // 原本是 switchBGM(bgm.past) -> 報錯
                    // 現在改回字串 'past' -> 配合你原本沒問題的函式
                    switchBGM('past'); 
                }
            } catch (err) {
                console.error("音樂切換失敗:", err);
            }

            fadeOutWhite();
        }
    }, 50);
}

function fadeOutWhite() {
    const fadeInterval = setInterval(() => {
        flashOpacity -= 0.05; 
        if (flashOpacity <= 0) {
            clearInterval(fadeInterval);
            flashOpacity = 0;
        }
    }, 50);
}

