// scene_pasture.js

const pastureLayout = {
    cow: { x: 380, y: 230, w: 100, h: 80 },
    grasses: [
        { x: 100, y: 0, w: 180, h: 100 }, 
        { x: 310, y: 0, w: 180, h: 100 }, 
        { x: 520, y: 0, w: 180, h: 100 }
    ]
};

const caughtRunBtn = { x: 530, y: 235, w: 100, h: 60 };
const gameProgress = { hasStolenCowBefore: false };

function renderPastureScene() {
    const bg = images.bgPasture; 
    if (bg && bg.complete) {
        ctx.drawImage(bg, 0, 0, 800, 450);
    } else {
        ctx.fillStyle = "green"; 
        ctx.fillRect(0, 0, 800, 450);
    }
    if (layout.pastureBack) {
        drawDirectionArrow(layout.pastureBack.x, layout.pastureBack.y, layout.pastureBack.w, layout.pastureBack.h, "left");
    }if (layout.pastureToRiver) {
        drawDirectionArrow(layout.pastureToRiver.x, layout.pastureToRiver.y, layout.pastureToRiver.w, layout.pastureToRiver.h, "right");
    }
}

function renderStealthGame() {
    const bg = images.bgPasture;
    const currentStep = StealthGame.state.currentStep;
    const totalSteps = StealthGame.config.totalSteps;
    const isWin = currentStep >= totalSteps;
    const renderProgress = currentStep / totalSteps;
    const stepScale = 1.0 + (currentStep * 0.1);
    const progress = currentStep / totalSteps;

    const cowCenterX = pastureLayout.cow.x + pastureLayout.cow.w / 2; 
    const cowCenterY = pastureLayout.cow.y + pastureLayout.cow.h / 2; 
    const targetX = 400;
    const targetY = 180; 

    ctx.save();
    const moveX = (targetX - cowCenterX) * progress;
    const moveY = (targetY - cowCenterY) * progress;

    ctx.translate(400, 225); 
    ctx.scale(stepScale, stepScale);
    ctx.translate(-400 + moveX, -225 + moveY);

    if (bg && bg.complete) {
        ctx.drawImage(bg, 0, 0, 800, 450);
    } else {
        ctx.fillStyle = "green";
        ctx.fillRect(0, 0, 800, 450);
    }
    ctx.restore();

   if (isWin && !StealthGame.state.isCaught) {
        if (typeof drawUI === "function") drawUI();
        
        // 如果已經「偷到手了」，只顯示黃字，不畫遮罩和其他白字
        if (StealthGame.state.finalCaught) {
            ctx.save();
            ctx.textAlign = "center";
            ctx.fillStyle = "#FFFF00"; 
            ctx.font = "bold 32px 'Microsoft JhengHei'";
            ctx.fillText(StealthGame.state.lastResult, 400, 130);
            ctx.restore();
            return; // 結束渲染，不跑後面的遮罩和進度條
        }}

    // --- 遮罩與 UI ---
    ctx.fillStyle = "rgba(0, 0, 0, 0.4)"; 
    ctx.fillRect(0, 0, 800, 450);

    if (StealthGame.state.isCaught) {
        const ownerImg = images.npcOwner;
        if (ownerImg && ownerImg.complete) ctx.drawImage(ownerImg, -50, -20, 480, 600);
        
        ctx.fillStyle = "black";
        ctx.fillRect(320, 150, 430, 120);
        ctx.strokeStyle = "#FF4500";
        ctx.lineWidth = 4;
        ctx.strokeRect(320, 150, 430, 120);

        ctx.save();
        ctx.fillStyle = "white";
        ctx.textAlign = "left";
        ctx.font = "bold 24px 'Microsoft JhengHei'";
        ctx.fillText("牧場主人：", 340, 190);
        ctx.font = "20px 'Microsoft JhengHei'";
        

       if (StealthGame.state.finalCaught) {
            if (StealthGame.state.lastResult === "咦！這牛是假的" || StealthGame.state.lastResult === "咦！這牛是假的") {
                ctx.fillText("「我說過不要再讓我看到你！」", 340, 230);
            } else {
                ctx.fillText("「偷牛賊，別再讓我看到你！」", 340, 230);
            }
        } else {
            ctx.fillText("「是誰在那裡？偷牛賊嗎！」", 340, 230);
        }
        ctx.restore();

        const btn = { x: 630, y: 175, w: 100, h: 70 }; 
        ctx.fillStyle = "#A30000"; 
        ctx.fillRect(btn.x, btn.y, btn.w, btn.h);
        ctx.save();
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.font = "bold 20px 'Microsoft JhengHei'";
        ctx.fillText("逃跑", btn.x + 50, btn.y + 43);
        ctx.restore();
    }else {
        // --- 核心修正：只有在遊戲啟動中才增加動畫進度 ---
        if (StealthGame.state.isActive && StealthGame.state.animProgress < 1.0) {
            StealthGame.state.animProgress += 0.05;
        }
        ctx.save();
        ctx.textAlign = "center";
        ctx.fillStyle = "white";
        ctx.font = "bold 26px 'Microsoft JhengHei'";
        const dots = "●".repeat(currentStep) + "○".repeat(totalSteps - currentStep);
        ctx.fillText(`潛行進度：${dots}`, 400, 50);
        ctx.font = "20px 'Microsoft JhengHei'";
        ctx.fillText("要偷到那頭母牛，小心不要發出聲響", 400, 90);
        if (StealthGame.state.lastResult) {
            ctx.fillStyle = "#FFFF00"; 
            ctx.font = "bold 22px 'Microsoft JhengHei'";
            ctx.fillText(StealthGame.state.lastResult, 400, 130);
        }
        const quitBtn = { x: 680, y: 20, w: 100, h: 40 }; 
        ctx.fillStyle = "rgba(163, 0, 0, 0.8)";
        ctx.fillRect(quitBtn.x, quitBtn.y, quitBtn.w, quitBtn.h);
        ctx.fillStyle = "white";
        ctx.font = "bold 18px 'Microsoft JhengHei'";
        ctx.fillText("逃跑", quitBtn.x + 50, quitBtn.y + 27);
        ctx.restore();
       if (!isWin && !StealthGame.state.isCaught) {
            drawGrassRow(StealthGame.state.animProgress, StealthGame.state.animProgress); 
        } 
    }
    if (typeof drawUI === "function") drawUI();
}

function handleMinigameClick(tx, ty) {
    // --- 1. 最優先判定：如果已經被主人抓到了 (顯示大逃跑按鈕) ---
    if (StealthGame.state.isCaught) {
        const runBtn = { x: 630, y: 175, w: 100, h: 70 };
        if (tx > runBtn.x && tx < runBtn.x + runBtn.w && ty > runBtn.y && ty < runBtn.y + runBtn.h) {
            changeScene("pasture");
            StealthGame.state.isCaught = false;
        }
        return; 
    }

    // --- 2. 次優先判定：右上角的逃跑按鈕 (隨時都能點) ---
    const quitBtn = { x: 680, y: 20, w: 100, h: 40 };
    if (tx > quitBtn.x && tx < quitBtn.x + quitBtn.w && ty > quitBtn.y && ty < quitBtn.y + quitBtn.h) {
        changeScene("pasture");
        StealthGame.state.isActive = false;
        return;
    }

    // --- 3. 遊戲過關後的判定 (點擊母牛) ---
    const isWin = StealthGame.state.currentStep >= StealthGame.config.totalSteps;
    if (isWin) {
        if (StealthGame.state.finalCaught) return;

        const cowArea = { x: 280, y: 80, w: 240, h: 220 }; 
        if (tx > cowArea.x && tx < cowArea.x + cowArea.w && ty > cowArea.y && ty < cowArea.y + cowArea.h) {
            
            if (gameProgress.hasStolenCowBefore) { 
                StealthGame.state.lastResult = "咦！這牛是假的";
            } else {
                if (items && items.cow) {
                    let result = addItem("cow"); 
                    if (result === "BAG_FULL") return; 

                    // 播放母牛被偷時的叫聲
                    if (sfx && sfx.cow) {
                        sfx.cow.currentTime = 0;
                        sfx.cow.play().catch(e => console.log("牛叫失敗", e));
                    }

                    gameProgress.hasStolenCowBefore = true; 
                    if (typeof autoArrangeAll === "function") autoArrangeAll();
                }
                StealthGame.state.lastResult = "母牛偷到手了！";
            }

            StealthGame.state.isActive = false; 
            StealthGame.state.finalCaught = true; 

            // --- 關鍵修改：1.2 秒後主人跳出來，同時發出主人音效 ---
            setTimeout(() => {
                if (sfx && sfx.farmmer) {
                    sfx.farmmer.currentTime = 0;
                    sfx.farmmer.play().catch(e => console.log("主人音效播放失敗", e));
                }
                StealthGame.state.isCaught = true;
            }, 1200);
        }
        return;
    }

    // --- 4. 遊戲進行中的草地判定 ---
    const clickZones = [{ x: 100, y: 180, w: 180, h: 120 }, { x: 310, y: 180, w: 180, h: 120 }, { x: 520, y: 180, w: 180, h: 120 }];
    clickZones.forEach((zone, index) => {
        if (tx > zone.x && tx < zone.x + zone.w && ty > zone.y && ty < zone.y + zone.h) {
            if (StealthGame.state.animProgress < 0.5) return;
            StealthGame.checkChoice(index);
        }
    });
}

function handlePastureClick(tx, ty) {
    if (isClicked(tx, ty, pastureLayout.cow)) {
        changeScene("game");     
        StealthGame.start();     
    }
    if (isClicked(tx, ty, layout.pastureBack)) {
        changeScene("street");
    }// 3. 新增：點擊右箭頭去河流
    if (isClicked(tx, ty, layout.pastureToRiver)) {
        changeScene("river");
    }
}

function isClicked(tx, ty, area) {
    return area && tx > area.x && tx < area.x + area.w && ty > area.y && ty < area.y + area.h;
}

function playFarmerSfx() {
    if (sfx && sfx.farmmer) {
        sfx.farmmer.currentTime = 0;
        sfx.farmmer.play().catch(e => console.log("主人音效播放失敗", e));
    }
}

const StealthGame = {
    config: { path: [2, 0, 1, 1, 2, 2, 0], totalSteps: 7 },
    state: { 
        currentStep: 0, 
        isActive: false, 
        lastResult: "", 
        animProgress: 1.0, 
        isCaught: false,
        finalCaught: false 
    },
    start: function() {
        this.state.currentStep = 0;
        this.state.isActive = true;
        this.state.isCaught = false;
        this.state.finalCaught = false;
        this.state.animProgress = 1.0;
        this.state.lastResult = "正在悄悄接近中...";
    },
    checkChoice: function(playerChoice) {
        if (!this.state.isActive) return;
        const correctChoice = this.config.path[this.state.currentStep];
        
        if (playerChoice === correctChoice) {
            this.state.currentStep++;
            this.state.animProgress = 0; 
            this.state.lastResult = "呼...這步沒問題。";
            if (this.state.currentStep >= this.config.totalSteps) {
                this.state.lastResult = ""; 
                this.state.isActive = false; 
            }
            return "CORRECT";
        } else {
            this.state.animProgress = 0; 
            const traps = ["哎呀！這塊草地有陷阱！", "哎呀！摸到乾掉的大便了！", "哎呀！好痛，踩到枯枝了！"];
            this.state.lastResult = traps[Math.floor(Math.random() * traps.length)];
            this.state.isActive = false; 
            
            // --- 潛行失敗：等 1.2 秒後主人跳出來並尖叫 ---
            setTimeout(() => {
                if (sfx && sfx.farmmer) {
                    sfx.farmmer.currentTime = 0;
                    sfx.farmmer.play().catch(e => console.log("主人音效播放失敗", e));
                }
                this.state.isCaught = true; 
                this.state.lastResult = ""; 
            }, 1200); 
            return "FAIL";
        }
    }
};

function drawGrassRow(moveProgress, alphaMult = 1) {
    const skew = 40; 
    const yBase = 80 + (moveProgress * 120); 
    const scale = 0.4 + (moveProgress * 0.6);
    const alpha = (moveProgress > 1.5 ? 2 - moveProgress : 1) * alphaMult;
    const grassImg = images.imgGrass;
    pastureLayout.grasses.forEach((g, i) => {
        ctx.save();
        ctx.translate(400, yBase);
        ctx.scale(scale, scale);
        ctx.globalAlpha = alpha;
        const relX = g.x - 400 + g.w/2;
        let horizontalSkew = (i === 0) ? -0.35 : (i === 2 ? 0.35 : 0);
        ctx.beginPath();
        if (i === 0) { ctx.moveTo(relX-g.w/2+skew*2,0); ctx.lineTo(relX+g.w/2+skew,0); ctx.lineTo(relX+g.w/2,g.h); ctx.lineTo(relX-g.w/2,g.h); }
        else if (i === 1) { ctx.moveTo(relX-g.w/2+skew,0); ctx.lineTo(relX+g.w/2-skew,0); ctx.lineTo(relX+g.w/2,g.h); ctx.lineTo(relX-g.w/2,g.h); }
        else { ctx.moveTo(relX-g.w/2-skew,0); ctx.lineTo(relX+g.w/2-skew*2,0); ctx.lineTo(relX+g.w/2,g.h); ctx.lineTo(relX-g.w/2,g.h); }
        ctx.closePath();
        ctx.save();
        ctx.clip(); 
        if (grassImg && grassImg.complete) {
            ctx.transform(1, 0, horizontalSkew, 1, 0, 0);
            ctx.drawImage(grassImg, relX - g.w/2 - (horizontalSkew * g.h / 2), 0, g.w, g.h);
        } else {
            ctx.fillStyle = "rgba(20, 60, 20, 0.3)";
            ctx.fill();
        }
        ctx.restore();
        ctx.restore();
    });
}