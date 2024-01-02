console.log("commonlib running")
const AIRTABLE_API_KEY = 'patidCkFtN0pknaOx.03339cc7d71663ce5ec19bfe300c3c1a394f53df82beb3e1429c5b49a7bd9946';
const BASE_ID = 'appFuzXH2IrxndTLY';
const TABLE_NAME = 'tblfcQoHpNQx2x1ZE';
var COMBO_OBJ = {};
function getURLParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const params = {};

    for (const [key, value] of urlParams.entries()) {
        params[key] = value;
    }

    return params;
}




async function getRecords() {
    const response = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}`, {
        headers: {
            Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        },
    });
    const data = await response.json();
    const records = data.records;
    return records
}
async function fetchRandomItems(NUM_ITEMS = 3) {
    function checkCategoryDuplicates(itemList, newItem) {
        // Extract the category from the new item
        const newItemCategory = newItem.fields.Category;

        // Check if any of the existing items have the same category
        for (const item of itemList) {
            if (item.fields.Category === newItemCategory) {
                return true; // Found a match, return true
            }
        }

        return false; // No matching category found, return false
    }
    const records = await getRecords();

    if (records.length < NUM_ITEMS) {
        console.error('Not enough items in the Airtable database');
        return;
    }

    const randomItems = [];
    while (randomItems.length < NUM_ITEMS) {
        const randomIndex = Math.floor(Math.random() * records.length);
        const randomItem = records[randomIndex];

        if (!randomItems.includes(randomItem) && !checkCategoryDuplicates(randomItems, randomItem)) {

            if (NUM_ITEMS == 1) {
                if (!COMBO_OBJ.items.includes(randomItem) && !checkCategoryDuplicates(COMBO_OBJ.items, randomItem)) {
                    console.log(randomItem)
                    randomItems.push(randomItem);
                }
            } else {
                console.log(randomItem)
                randomItems.push(randomItem);
            }


        }
    }
    console.log("returning")
    return randomItems
}
async function reRollItems() {
    var randomItems = await fetchRandomItems()
    displayItems({ items: randomItems, title: randomItems.map((item) => { return item.fields.Title }).join(", ") });
    COMBO_OBJ = { items: randomItems, title: randomItems.map((item) => { return item.fields.Title }).join(", ") }
}
function docid(id) {
    return document.getElementById(id)
}


function setItemEl(item, index) {
    var titleEl = docid("title" + index)
    var imageEl = docid("picture" + index)
    console.log(imageEl)
    console.log(imageEl.src)
    console.log(item.fields.Image[0]["url"])
    imageEl.removeAttribute('srcset');
    titleEl.innerText = item.fields.Title;
    imageEl.src = item.fields.Image[0]["url"];



}
async function reroll(item, itemEl) {
    const newItem = await fetchRandomItems(1);
    console.log(newItem)
    setTimeout(() => {
        resetData(itemEl, newItem[0], item)
    }, 1000)


}

function showPopup(item) {
    docid("popup_title").innerText = item.fields.Title
    docid("popup_year").innerText = item.fields.Year
    docid("popup_credit").innerText = item.fields.Credit
    docid("popup_longdesc").innerText = item.fields["Full Description"] 
    docid("popup_image").src = item.fields.Image[0]["url"];
    docid("popup_image").removeAttribute('srcset');
    docid("popup_container").style.opacity = 1;
    docid("popup_container").style.transform = "translate3d(0px, 0px, 0px) scale3d(1, 1, 1) rotateX(0deg) rotateY(0deg) rotateZ(0deg) skew(0deg, 0deg)";
}

function onPictureClick(i) {
    var item = COMBO_OBJ.items[i]
    showPopup(item)
}

async function onRerollClick(i, id_index) {
    var newItem = await fetchRandomItems(1)
    newItem = newItem[0];
    COMBO_OBJ.items[i] = newItem
    setItemEl(newItem, id_index)
}

function initEventListeners() {
    function createOnClickHandler(i, id_index) {
        return function() {
            onRerollClick(i, id_index);
        };
    }
    function createPopupClickHandler(i) {
        return function() {
            onPictureClick(i);
        };
    }
    for (var i = 0; i < 3; i++) {
        var id_index = (i + 1).toString();
        docid("reroll" + id_index).onclick = createOnClickHandler(i, id_index);
        docid("imagediv" + id_index).onclick = createPopupClickHandler(i);
    }


}

function displayItems(comboObj) {
    const items = comboObj.items;

    for (var i = 0; i < items.length; i++) {
        const item = items[i];
        const id_index = (i + 1).toString()
        setItemEl(item, id_index)

    }

    //const combinationTitleElement = document.getElementById("combo_title")
    //combinationTitleElement.innerText = comboObj.title;
    //combinationTitleElement.addEventListener('input', function() {
    //    comboObj.title = combinationTitleElement.innerText
    //});
};





function serializeComboObj(comboObj) {
    const newItems = comboObj.items.map(i => i.id)
    return { items: newItems, title: comboObj.title }
}
function initBookmarkButton(bookmarkEl, comboObj) {
    if (isBookmarked(serializeComboObj(comboObj))) {
        bookmarkEl.innerText = "Remove Bookmark"
    } else {
        bookmarkEl.innerText = "Bookmark Combination"
    }
}
function isBookmarked(bookmark) {
    return JSON.stringify(getBookmarkedItems()).includes(JSON.stringify(bookmark))
}
function handleBookmarkButtonClick(el, comboObj) {

    if (isBookmarked(serializeComboObj(COMBO_OBJ))) {
        removeBookmark(serializeComboObj(COMBO_OBJ))
        window.location = "/"
    } else {
        bookmarkCombination(serializeComboObj(COMBO_OBJ));
    }
}
function removeValue(array, value) {
    const index = array.findIndex(item => JSON.stringify(item) === JSON.stringify(value));
    if (index !== -1) {
        array.splice(index, 1);
    }
}
function removeBookmark(item) {
    var bookmarkedItems = getBookmarkedItems();
    removeValue(bookmarkedItems, item)
    saveBookmarkedItems(bookmarkedItems);
}
function extractDomainFromURL(url) {
    const hostnameRegex = /^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:/\n]+)/;
    const matches = url.match(hostnameRegex);
    return matches ? matches[1] : null;
}
function openPopup(item) {
    const popupContainer = document.getElementById('popup-container');
    const popupContent = document.getElementById('popup-content');
    const popupTitle = document.getElementById('popup-title');
    const popupImage = document.getElementById('popup-image');
    const popupLongDesc = document.getElementById('popup-longdesc');


    popupTitle.textContent = item.fields.Title;
    popupImage.src = item.fields.Image[0]["thumbnails"]["large"]["url"];

    var urlHTML = "";
    var urls = item.fields.URL.split(",");
    urls.forEach((url) => {
        urlHTML += "<a href='" + url + "'>" + extractDomainFromURL(url) + "</a>"
    })


    popupLongDesc.innerHTML = item.fields.Credit + " : " + item.fields.Year + "<br>" + item.fields["Full Description"] + "<br><br>" + urlHTML;



    popupContainer.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    const closeButton = document.getElementById('close-button');
    closeButton.addEventListener('click', closePopup);
}

function closePopup() {
    const popupContainer = document.getElementById('popup-container');
    popupContainer.style.display = 'none';
    document.body.style.overflow = 'auto';
}

function bookmarkCombination(comboObj) {
    var bookmarkedItems = getBookmarkedItems();
    bookmarkedItems.push(comboObj);
    saveBookmarkedItems(bookmarkedItems);

}

function saveBookmarkedItems(bookmarkedItems) {
    localStorage.setItem("bookmarkedItems", JSON.stringify(bookmarkedItems))
}


function getBookmarkedItems() {
    const bookmarkedItemsJSON = localStorage.getItem('bookmarkedItems');
    return bookmarkedItemsJSON ? JSON.parse(bookmarkedItemsJSON) : [];
}

function openCombo(combo) {
    window.location = "/?combo=" + encodeURIComponent(JSON.stringify(combo))
}


async function displayBookmarkedItems() {
    var bookmarkedItemsContainer = document.getElementById('bookmarked-items');
    bookmarkedItemsContainer.innerHTML = '';
    const records = await getRecords();
    var bookmarkedCombos = getBookmarkedItems();
    console.dir(bookmarkedCombos)
    if (bookmarkedCombos.length === 0) {
        const noBookmarkMessage = document.createElement('p');
        noBookmarkMessage.textContent = 'No items bookmarked.';
        bookmarkedItemsContainer.appendChild(noBookmarkMessage);
        return;
    }

    bookmarkedCombos.forEach(combo => {
        var container = document.createElement("div")
        var itemcontainer = document.createElement("div")
        itemcontainer.classList.add('items');
        const combinationTitleElement = document.createElement("h2")
        combinationTitleElement.innerText = combo.title;
        container.appendChild(combinationTitleElement)
        combo.items.forEach(id => {
            const item = records.find(item => item.id === id)
            console.log(item)
            const itemElement = makeItemEl(item, false)
            itemcontainer.appendChild(itemElement)
        })
        container.appendChild(itemcontainer)
        container.addEventListener('click', () => {
            openCombo(combo)
        });

        bookmarkedItemsContainer.appendChild(container);
        bookmarkedItemsContainer.appendChild(document.createElement("br"))
    });
}
