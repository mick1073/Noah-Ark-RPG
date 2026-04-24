// --- data_items.js ---
const PATH_ITEM = "assets/items/";

// 1. 道具原始數據：新增了木炭與鋒利斧頭
const itemData = {
    river_daughter: { name: "河神的女兒", file: "fish.png" },
    magnet: { name: "磁鐵", file: "magnet.png" },
    gold: { name: "古老的金幣", file: "coin.png" },
    cow: { name: "偷來的母牛", file: "cow.png" },
    blessing: { name: "希望的加護", file: "blessing.png" },
    beans: { name: "魔法豆子", file: "beans.png" },
    axe: { name: "破舊的斧頭", file: "axe.png" },
    charcoal: { name: "木炭", file: "charcoal.png" },        
    sharp_axe: { name: "鋒利的斧頭", file: "sharp_axe.png" }, 
    mouse: { name: "好朋友老鼠", file: "mouse.png" },
    love: { name: "愛的加護", file: "love.png" },
    gold_axe: { name: "黃金斧頭", file: "gold_axe.png" },
    talking_bull: { name: "會說話的公牛", file: "talking_bull.png" },
    kindness: { name: "善良的證明", file: "kindness.png" },
    courage: { name: "勇氣的加護", file: "courage.png" },
    compass: { name: "羅盤", file: "compass.png" },            
    firestone: { name: "打火石", file: "firestone.png" }, 
    hamelinletter: { name: "哈梅林的書信", file: "letter.png" },
    dirty: { name: "骯髒的打火石", file: "dirty.png" }, 
    rivergodmagic: { name: "河神的魔法", file: "magic.png" }, 
    rich_bull: { name: "大牛比較懶", file: "rich_bull.png" }, 
    powder: { name: "古怪的粉末", file: "powder.png" },  
    papermaking: { name: "造紙術", file: "papermaking.png" }

};

// 實際運行的道具物件
let items = {};

// 2. 自動生成道具物件
Object.keys(itemData).forEach(key => {
    items[key] = {
        id: key,
        name: itemData[key].name,
        imgSrc: PATH_ITEM + itemData[key].file,
        x: 0, 
        y: 0, 
        // 寬高邏輯：金幣 60，其餘一律 90
        w: (key === "gold") ? 60 : 90, 
        h: (key === "gold") ? 60 : 90, 
        isOwned: false,
        isDragging: false,
        imgObj: new Image()
    };

    items[key].imgObj.onerror = () => {
        console.warn(`圖片載入失敗: ${items[key].imgSrc}，請檢查檔案是否存在。`);
    };
    items[key].imgObj.src = items[key].imgSrc;
});

// 3. 背包格子設定
const slotX = [25, 153, 281, 409, 537, 665];
const slotY = 345;
const slotSize = 90;

// 4. 自動排列函數 (防爆加強版)
function autoArrangeAll() {
    let currentSlot = 0;
    
    // 遍歷所有道具
    Object.keys(items).forEach(key => {
        let item = items[key];
        
        // 只有「持有中」且「沒有在拖拽」的道具才需要排列
        if (item.isOwned && !item.isDragging) {
            
            // 【關鍵保護】：檢查 currentSlot 是否超過了 slotX 的索引範圍 (0-5)
            if (currentSlot < slotX.length) {
                // 正常的排列邏輯
                item.x = slotX[currentSlot] + (slotSize - item.w) / 2;
                item.y = slotY + (slotSize - item.h) / 2;
                currentSlot++;
            } else {
                // 【安全機制】：如果真的不小心超過 6 個，把多的道具「藏起來」
                // 這樣就不會發生座標變成 NaN 導致蓋掉別人的情況
                item.x = -1000; 
                item.y = -1000;
                console.warn(`警告：道具 ${item.name} 溢出背包，已自動隱藏。`);
            }
        }
    });
}

// --- 5. 測試設定：將測試所需道具設為持有 ---

items.mouse.isOwned = false;  //測試用true


autoArrangeAll();

// --- 安全獲得道具函數 ---

// 觸發提示的函數
function showSystemMessage(msg) {
    systemMessage = msg;
    systemMessageTimer = 90; // 顯示時間 (約 1.5 秒)
}

// 修改後的 addItem 函數
function addItem(itemId) {
    if (!items[itemId]) return "ERROR";

    if (items[itemId].isOwned) return "ALREADY_OWNED";

    // 檢查背包空間
    let currentOwnedCount = Object.values(items).filter(item => item.isOwned).length;
    
    if (currentOwnedCount >= 6) {
        // --- 關鍵修正：觸發強大的遮罩提示 ---
        isBagFullWarning = true; 
        
        // 如果你還是想保留原本的小字提示也可以留著，但主要是上面那行
        if (typeof showSystemMessage === "function") {
            showSystemMessage("❌ 背包已滿，無法取得物品！");
        }
        
        console.log("背包已滿！已開啟攔截遮罩。");
        return "BAG_FULL";
    }

    items[itemId].isOwned = true;
    autoArrangeAll();
    return "SUCCESS";
}

function hasItemInBag(itemId) {
    if (items[itemId]) {
        return items[itemId].isOwned; // 回傳 true 或 false
    }
    return false;
}

function removeItem(itemId) {
    if (items[itemId]) {
        items[itemId].isOwned = false;
        autoArrangeAll(); // 重新排列背包，讓後面的道具往前補位
        return true;
    }
    return false;
}