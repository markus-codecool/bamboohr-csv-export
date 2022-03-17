// Initialize button with users's preferred color
let extractorButton = document.getElementById("worktime-extractor");

chrome.storage.sync.get("worktime", ({color}) => {
    extractorButton.style.backgroundColor = color;
});

// When the button is clicked, inject extractWorkingTimeToStorage into current page
extractorButton.addEventListener("click", async () => {
    let [tab] = await chrome.tabs.query({active: true, currentWindow: true});

    chrome.scripting.executeScript({
        target: {tabId: tab.id},
        function: extractWorkingTimeToStorage,
    });
});

// Bamboo part from here
function extractWorkingTimeToStorage() {
    const payPeriodSelector = 'TimesheetSecondHeader__dates';
    const payPeriodRegex = /(\w+) (\d+)-(\d+)/g

    const dailyEntrySelector = 'TimesheetSlat';
    const dateSelector = 'TimesheetSlat__dayDate';
    const timeEntrySelector = 'TimeEntry';
    const storageKey = 'worktime';

    const timeEntryStartSelector = 'TimeEntry__start';
    const timeEntryEndSelector = 'TimeEntry__end';
    const timeEntryTotalSelector = 'TimeEntry__total';
    console.log('Extracting working time from bamboo');

    let workingTimeEntries = []
    let payPeriod = document.getElementsByClassName(payPeriodSelector)[0].getElementsByTagName('h4')[0].innerText.trim();
    let payPeriodMonth = payPeriod.split(' ')[0].trim();
    let payPeriodEnd = payPeriod.split(' ')[1].trim().split(/–/);
    console.log('Pay period', payPeriod, payPeriodMonth);
    console.log('Pay period month', payPeriodMonth);
    console.log('Pay period end', payPeriodEnd); // TODO Fix this
    // TODO create a list with every day accordingly

    let entries = document.getElementsByClassName(dailyEntrySelector);
    for (let entry of entries) {
        let date = entry.getElementsByClassName(dateSelector)[0];
        if (!date.innerHTML.startsWith(payPeriodMonth)) {
            continue;
        }
        let timeEntries = entry.getElementsByClassName(timeEntrySelector);
        console.log('Extracting entry', entry, date, timeEntries);
        let previous = undefined;
        for (let timeEntry of timeEntries) {
            let timeEntryData = {};

        }
    }
}



