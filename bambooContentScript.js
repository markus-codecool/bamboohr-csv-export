const payPeriodSelector = 'TimesheetSecondHeader__dates';

const dailyEntrySelector = 'TimesheetSlat';
const dateSelector = 'TimesheetSlat__dayDate';
const timeEntrySelector = 'TimeEntry';

const timeEntryStartSelector = 'TimeEntry__start';
const timeEntryEndSelector = 'TimeEntry__end';
const timeEntryTotalSelector = 'TimeEntry__total';

const buttonClasses = [
    'TimeTrackingWidget__summary-link',
    'fab-Button',
    'fab-Button--outline',
    'fab-Button--secondary',
    'fab-Button--small'
];

function padNumber(original) {
    return ("00" + original).slice(-2);
}

function convert12hTo24(original) {
    original = original.toUpperCase();
    const isPm = original.includes('PM');
    original = original.replace('AM', '').replace('PM', '').trim();
    let hours = parseInt(original.split(':')[0].trim())
    let minutes = parseInt(original.split(':')[1].trim())
    if (isPm && hours !== 12) {
        hours += 12;
    }
    return `${padNumber(hours)}:${padNumber(minutes)}`;
}

function subtractTimes(a, b) {
    function strToMins(t) {
        var s = t.split(":");
        return Number(s[0]) * 60 + Number(s[1]);
    }

    function minsToStr(t) {
        const hours = Math.trunc(t / 60);
        const minutes = t % 60
        return `${padNumber(hours)}:${padNumber(minutes)}`;
    }

    return minsToStr(strToMins(a) - strToMins(b));
}

function fallbackCopyTextToClipboard(text) {
    var textArea = document.createElement("textarea");
    textArea.value = text;

    // Avoid scrolling to bottom
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
        var successful = document.execCommand('copy');
        var msg = successful ? 'successful' : 'unsuccessful';
        console.log('Fallback: Copying text command was ' + msg);
    } catch (err) {
        console.error('Fallback: Oops, unable to copy', err);
    }

    document.body.removeChild(textArea);
}

function copyTextToClipboard(text) {
    if (!navigator.clipboard) {
        fallbackCopyTextToClipboard(text);
        return;
    }
    navigator.clipboard.writeText(text).then(function() {
        console.log('Async: Copying to clipboard was successful!');
    }, function(err) {
        console.error('Async: Could not copy text: ', err);
    });
}

function main() {
    console.log('Extracting working time from bamboo');

    let payPeriod = document.getElementsByClassName(payPeriodSelector)[0].getElementsByTagName('h4')[0].innerText.trim();
    let payPeriodMonth = payPeriod.split(' ')[0].trim();
    console.log('Pay period month:', payPeriodMonth);
    let csvString = ''; // This string is the result of this function

    let entries = document.getElementsByClassName(dailyEntrySelector);
    for (let entry of entries) {
        let date = entry.getElementsByClassName(dateSelector)[0];
        if (!date.innerHTML.startsWith(payPeriodMonth)) {
            continue;
        }
        let timeEntries = entry.getElementsByClassName(timeEntrySelector);
        if (timeEntries.length !== 2 && timeEntries.length !== 0) {
            csvString += 'Day does not have exactly 2 entries\n';
            continue;
        }
        // console.log('Extracting entry', entry, date, timeEntries);
        let previous = undefined;
        let breakTime = '';
        let breakDuration = '';
        let beginning = '';
        let end = ''

        for (let timeEntry of timeEntries) {
            let timeEntryStart = timeEntry.getElementsByClassName(timeEntryStartSelector)[0].innerHTML;
            let timeEntryEnd = timeEntry.getElementsByClassName(timeEntryEndSelector)[0].innerHTML;
            let timeEntryTotal = timeEntry.getElementsByClassName(timeEntryTotalSelector)[0].innerHTML;
            let currentEntry = {
                'start': convert12hTo24(timeEntryStart),
                'end': convert12hTo24(timeEntryEnd),
                'duration': timeEntryTotal
            };

            if (!!previous) {
                breakTime = `${previous['end']} - ${currentEntry['start']}`;
                breakDuration = subtractTimes(currentEntry['start'], previous['end']);
            } else {
                beginning = currentEntry['start'];
            }
            end = currentEntry['end'];
            previous = currentEntry;
        }

        // csv format is
        // BEGIN, END, BREAK (Duration), BREAK TIME
        csvString += `${beginning},${end},${breakDuration},${breakTime}\n`
    }
    console.log(csvString);
    copyTextToClipboard(csvString);
}

function addWorkingButton() {
    const buttonParent = document.getElementsByClassName(payPeriodSelector)[0];
    let btn = document.createElement("button");
    btn.innerHTML = 'Copy CSV to Clipboard';
    btn.onclick = main;
    btn.style.marginLeft = '20px';
    for(let buttonClass of buttonClasses) {
        btn.classList.add(buttonClass);
    }
    buttonParent.appendChild(btn);
}


if (document.readyState !== 'complete') {
    window.addEventListener('load', addWorkingButton);
} else {
    addWorkingButton();
}