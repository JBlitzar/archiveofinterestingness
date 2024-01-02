
function findRecordsForIds(records, ids) {
    const recordsForIds = [];

    ids.forEach(id => {
        recordsForIds.push(records.filter(record => record.id === id)[0]);
    });

    return recordsForIds;
}
async function onOnload() {

    var params = getURLParams();
    var flag = 0
    if (params.combo) {
        var combo = JSON.parse(params.combo);
        if (combo.items && combo.title) {
            var records = await getRecords();
            console.dir(records)
            combo.items = findRecordsForIds(records, combo.items)
            console.log(combo)
            displayItems(combo);
            flag = 1
        }
    }
    if (!flag) {
        reRollItems()
    }
    initEventListeners()

}
window.addEventListener('DOMContentLoaded', onOnload);
docid("rerollall").addEventListener("click", () => {
    reRollItems()
})
