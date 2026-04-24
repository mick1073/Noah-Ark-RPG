// --- scene_river.js ---

let godAlpha = 0;
let sharpAxeAlpha = 0;
let axeAlpha = 0;
let riverGodMode = "normal";
let riverGodStep = 1; 
let fallingAxeAlpha = 0;
let fallingAxeX = 0;
let fallingAxeY = 0;
let ironAxeAlpha = 0;

function renderRiverScene() {
if (gameState === "bar"){
        renderBarInternal();
        return; 
    }
    // 1. 背景
    ctx.save();
    ctx.globalAlpha = 1.0; 
    if (images.bgRiver) {
        ctx.drawImage(images.bgRiver, 0, 0, 800, 450);
    }
    ctx.restore();

    if (isRiverGodTalking) {
        // 2. 畫河神
        const godImg = images.npcRiverGod;
        if (godImg && godImg.complete) {
            if (godAlpha < 1) godAlpha += 0.02;
            ctx.save();
            ctx.globalAlpha = godAlpha;
            const centerX = 200, centerY = 160, radius = 130;
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            ctx.clip();
            ctx.drawImage(godImg, centerX - 200, centerY - 150, 400, 300);
            
            const grad = ctx.createRadialGradient(centerX, centerY, radius * 0.7, centerX, centerY, radius);
            grad.addColorStop(0, "rgba(0,0,0,0)");
            grad.addColorStop(1, "rgba(0,0,0,1)");
            ctx.globalCompositeOperation = 'destination-out';
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        // 3. 畫對話框 (先畫，被金斧頭壓在下面)
        ctx.save();
        ctx.globalAlpha = godAlpha;
        drawRiverGodSideDialog();
        ctx.restore();

        // 4. 畫金斧頭 (在對話框之上)
        if (riverGodMode === "event" && riverGodStep === 2) {
            if (axeAlpha < 1) axeAlpha += 0.015;
            const goldAxeImg = items.gold_axe.imgObj; 
            if (goldAxeImg && goldAxeImg.complete) {
                ctx.save();
                ctx.globalAlpha = axeAlpha;
                let hoverY = Math.sin(Date.now() / 300) * 10;
                ctx.drawImage(goldAxeImg, 550, 160 + hoverY, 100, 100); 
                ctx.restore();
            }
        }if (riverGodMode === "event" && riverGodStep === 3) {
            if (sharpAxeAlpha < 1) sharpAxeAlpha += 0.015;
            const sharpAxeImg = items.sharp_axe.imgObj; 
            if (sharpAxeImg && sharpAxeImg.complete) {
                ctx.save();
                ctx.globalAlpha = sharpAxeAlpha;
                let hoverY = Math.sin(Date.now() / 300) * 10;
                ctx.drawImage(sharpAxeImg, 550, 160 + hoverY, 100, 100); 
                ctx.restore();
            }
        }if (riverGodMode === "event" && riverGodStep === 4) {
            if (ironAxeAlpha < 1) ironAxeAlpha += 0.015;
            const ironAxeImg = items.axe.imgObj; 
            if (ironAxeImg && ironAxeImg.complete) {
                ctx.save();
                ctx.globalAlpha = ironAxeAlpha;
                let hoverY = Math.sin(Date.now() / 300) * 10;
                ctx.drawImage(ironAxeImg, 550, 160 + hoverY, 100, 100); 
                ctx.restore();
            }
        }
    }

    // 5. 方向箭頭 (只有不在對話時顯示)
    if (!isRiverGodTalking) {
        ctx.save();
        ctx.globalAlpha = 1.0;
        drawDoor(layout.barDoor);
        
        drawDirectionArrow(layout.riverLeft.x, layout.riverLeft.y, layout.riverLeft.w, layout.riverLeft.h, "left");
        drawDirectionArrow(layout.riverUp.x, layout.riverUp.y, layout.riverUp.w, layout.riverUp.h, "up");
        drawDirectionArrow(layout.riverRight.x, layout.riverRight.y, layout.riverRight.w, layout.riverRight.h, "right");
        ctx.restore();
    }
}

function renderBarInternal() {
    ctx.save();
    // 1. 畫酒吧背景
    if (images.bgBar) {
        ctx.drawImage(images.bgBar, 0, 0, 800, 450);
    } else {
        ctx.fillStyle = "#2a1a0a"; 
        ctx.fillRect(0, 0, 800, 450);
        ctx.fillStyle = "white";
        ctx.fillText("酒吧內部 (尚未載入背景圖)", 300, 200);
    }

    // 2. 畫出口的門 (回河邊)
    // 這裡使用你指定的 barExit: { x: 360, y: 350, w: 80, h: 100 }
    drawDoor(layout.barExit); 
    ctx.restore();
}

function handleRiverClick(tx, ty) {
if (gameState === "bar") {
        handleBarInternalClick(tx, ty);
        return;
    }
    // 【修改後】直接進入酒吧，取消所有信件判定
    if (!isRiverGodTalking && checkClick(tx, ty, layout.barDoor)) {
        changeScene("bar", true); 
        return;
    }    const boxArea = { x: 420, y: 50, w: 350, h: 250 }; 

    if (isRiverGodTalking) {
        if (riverGodMode === "event") {
            if (riverGodStep === 1) {
                if (checkClick(tx, ty, boxArea)) {
                    riverGodStep = 2;
                    axeAlpha = 0;
                }
                return;
            }
            if (riverGodStep === 2) {
                if (checkClick(tx, ty, layout.btnYes)) {
                    riverGodMode = "greedy_end";
                    riverGodStep = 3;
                    items["axe"].isOwned = true; // 彈回破斧頭
                    if (typeof autoArrangeAll === "function") autoArrangeAll();
                    axeAlpha = 0; 
                }else if (checkClick(tx, ty, layout.btnNo)) {
                    // --- 修改：不直接結束，進入下一題 ---
                    riverGodStep = 3; 
                    sharpAxeAlpha = 0; // 初始化鋒利斧頭漸顯
                }
                return;
            }
           if (riverGodStep === 3) {
                if (checkClick(tx, ty, layout.btnYes)) {
                    riverGodMode = "greedy_end";
                    riverGodStep = 4;
                    items["axe"].isOwned = true;
                    if (typeof autoArrangeAll === "function") autoArrangeAll();
                    sharpAxeAlpha = 0;
                } else if (checkClick(tx, ty, layout.btnNo)) {
                    // --- 修改：不直接結束，問最後一題 ---
                    riverGodStep = 4; 
                    ironAxeAlpha = 0; 
                }
                return;
            }if (riverGodStep === 4) {
                if (checkClick(tx, ty, layout.btnYes)) {
                    // 答對了！這才是你的
                    riverGodMode = "honest_end";
                    riverGodStep = 5;
                    if (typeof addItem === "function") {
                        addItem("gold_axe");
                        addItem("sharp_axe");
                    }
                    if (typeof autoArrangeAll === "function") autoArrangeAll();
                } else if (checkClick(tx, ty, layout.btnNo)) {
                    riverGodMode = "trash_end"; // 進入搞笑結局
                    riverGodStep = 5;
                    // 強制把破斧頭彈回背包 (不要亂丟垃圾！)
                    items["axe"].isOwned = true;
                    if (typeof autoArrangeAll === "function") autoArrangeAll();
                    ironAxeAlpha = 0; // 讓河面上的斧頭消失
                }
                return;
            }

        } // 這裡是原本漏掉的 event 結束括號

        // 結局點擊關閉
        if (checkClick(tx, ty, boxArea)) {
            isRiverGodTalking = false;
            godAlpha = 0;
            axeAlpha = 0;
            sharpAxeAlpha = 0;  // 補上這個
            ironAxeAlpha = 0;   // 補上這個
            riverGodMode = "normal";
            riverGodStep = 1;   // 補上這個，重置步數供下次掉斧頭使用
        }
        return;
    } // 這裡是原本漏掉的 isRiverGodTalking 結束括號

    // 觸發區域 (漩渦)
    if (tx > 400 && tx < 560 && ty > 220 && ty < 270) {
window.isNpcTalking = false; 
    window.activeNpcType = null;
        if (typeof items !== "undefined" && items["axe"] && items["axe"].isOwned) {
           if (sfx && sfx.drop) {
                sfx.drop.currentTime = 0;
                sfx.drop.play().catch(e => console.log("掉落音效失敗", e));
            }
            fallingAxeX = items["axe"].x;
            fallingAxeY = items["axe"].y;
            riverGodMode = "event";
            riverGodStep = 1;
            items["axe"].isOwned = false; 
            fallingAxeAlpha = 1.0; 
            if (typeof autoArrangeAll === "function") autoArrangeAll(); 
        } else {
            if (sfx && sfx.rivergod) {
                sfx.rivergod.currentTime = 0;
                sfx.rivergod.play().catch(e => console.log("河神音效播放失敗", e));
            }
            riverGodMode = "normal";
        }
        isRiverGodTalking = true;
        godAlpha = 0; 
        axeAlpha = 0;
        return;
    }

    // 場景切換
    if (checkClick(tx, ty, layout.riverLeft)) changeScene("pasture");
    else if (checkClick(tx, ty, layout.riverUp)) changeScene("castle");
    else if (checkClick(tx, ty, layout.riverRight)) changeScene("forest");
}

function handleBarInternalClick(tx, ty) {
    // 點擊出口門，回到河邊
    if (checkClick(tx, ty, layout.barExit)) {
        changeScene("river");
    }
}

function drawRiverGodSideDialog() {
    const boxX = 420, boxY = 50, boxW = 350, boxH = 250;
    ctx.fillStyle = "rgba(0, 0, 50, 0.85)";
    ctx.fillRect(boxX, boxY, boxW, boxH);
    ctx.strokeStyle = "#00ffff";
    ctx.lineWidth = 3;
    ctx.strokeRect(boxX, boxY, boxW, boxH);

    ctx.fillStyle = "#b0e2ff";
    ctx.font = "bold 24px 'Microsoft JhengHei'";
    ctx.fillText("河神-泊紐", boxX + 20, boxY + 50);

    ctx.font = "18px 'Microsoft JhengHei'";
    ctx.fillStyle = "white";

    if (riverGodMode === "event") {
        if (riverGodStep === 1) {
            ctx.fillText("年輕人，你掉東西進水裡了。", boxX + 20, boxY + 110);
            ctx.font = "italic 14px 'Microsoft JhengHei'";
                    } else if (riverGodStep === 2) {
            ctx.fillText("這把金斧頭是你掉的嗎？", boxX + 20, boxY + 110);
            if (axeAlpha > 0.5) {
                drawRiverButton(layout.btnYes, "是", "#CCCCCC"); 
                drawRiverButton(layout.btnNo, "否", "#CCCCCC");
            }
        }else if (riverGodStep === 3) {
            ctx.fillText("喔？那這把鋒利的斧頭", boxX + 20, boxY + 100);
            ctx.fillText("是你掉的嗎？", boxX + 20, boxY + 130);
            if (sharpAxeAlpha > 0.5) {
                drawRiverButton(layout.btnYes, "是", "#CCCCCC"); 
                drawRiverButton(layout.btnNo, "否", "#CCCCCC");
            }
        }else if (riverGodStep === 4) {
            ctx.fillText("...那這把破舊的斧頭", boxX + 20, boxY + 110);
            ctx.fillText("是你掉的嗎？", boxX + 20, boxY + 140);
            if (ironAxeAlpha > 0.5) {
                drawRiverButton(layout.btnYes, "是", "#CCCCCC"); 
                drawRiverButton(layout.btnNo, "否", "#CCCCCC");
            }
        }
    } else if (riverGodMode === "greedy_end") {
        ctx.fillStyle = "#ff6666"; 
        ctx.fillText("哼...現在的年輕人一點也不誠實！", boxX + 20, boxY + 110);
        ctx.font = "14px 'Microsoft JhengHei'";
       
    } else if (riverGodMode === "honest_end") {
        ctx.fillText("年輕人，你很誠實，真難得。", boxX + 20, boxY + 110);
        ctx.fillText("金斧頭和鋒利的斧頭都送給你吧！", boxX + 20, boxY + 140);
        ctx.fillText("破舊的斧頭留給我做紀念囉！", boxX + 20, boxY + 170);
    } else if (riverGodMode === "trash_end") {
        // --- 新增：好笑結局台詞 ---
        ctx.fillStyle = "#ffcc00"; // 警告色
        ctx.fillText("這個破爛明明就是你的！", boxX + 20, boxY + 110);
        ctx.fillText("不要把垃圾丟進河裡！", boxX + 20, boxY + 140);
        
    }else {
        ctx.fillStyle = "#aaa";
        ctx.fillText("真想念以前誠實又善良的人啊！", boxX + 20, boxY + 110);
    }
}

function drawRiverButton(rect, text, bgColor) {
    ctx.fillStyle = bgColor;
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
    ctx.fillStyle = "black";
    ctx.font = "bold 18px 'Microsoft JhengHei'";
    ctx.textAlign = "center";
    ctx.fillText(text, rect.x + rect.w/2, rect.y + rect.h/1.5);
    ctx.textAlign = "left";
}

function checkClick(tx, ty, area) {
    return area && tx > area.x && tx < area.x + area.w && ty > area.y && ty < area.y + area.h;
}

function drawAxeFallingEffect() {
    if (fallingAxeAlpha > 0) {
        const oldAxeImg = items.axe.imgObj;
        if (oldAxeImg && oldAxeImg.complete) {
            ctx.save();
            ctx.globalAlpha = fallingAxeAlpha;
            ctx.drawImage(oldAxeImg, fallingAxeX, fallingAxeY - (1 - fallingAxeAlpha) * 40, items.axe.w, items.axe.h);
            ctx.restore();
            fallingAxeAlpha -= 0.015;
        }
    }
}