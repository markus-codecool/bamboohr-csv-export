const payPeriodSelector = 'TimesheetSecondHeader__dates';

const dailyEntrySelector = 'TimesheetSlat';
const dateSelector = 'TimesheetSlat__dayDate';
const dayOfWeekSelector = 'TimesheetSlat__dayOfWeek';
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

function copyHtmlToClipboard(html) {
    var container = document.createElement("div");
    container.innerHTML = html;

    // Avoid scrolling to bottom
    container.style.top = "0";
    container.style.left = "0";
    container.style.position = "fixed";

    document.body.appendChild(container);
    window.getSelection().selectAllChildren(container);

    try {
        var successful = document.execCommand('copy');
        var msg = successful ? 'successful' : 'unsuccessful';
        console.log('Fallback: Copying text command was ' + msg);
    } catch (err) {
        console.error('Fallback: Oops, unable to copy', err);
    }

    document.body.removeChild(container);
}

function main() {
    console.log('Extracting working time from bamboo');

    let payPeriod = document.getElementsByClassName(payPeriodSelector)[0].getElementsByTagName('h4')[0].innerText.trim();
    let payPeriodMonth = payPeriod.split(' ')[0].trim();
    console.log('Pay period month:', payPeriodMonth);
    let htmlString = '<table><tbody>'; // This string is the result of this function

    let entries = document.getElementsByClassName(dailyEntrySelector);

    let didHaveSat = false;
    let didHaveSatEntry = false;

    for (let entry of entries) {
        let date = entry.getElementsByClassName(dateSelector)[0];

        if (!date.innerHTML.startsWith(payPeriodMonth)) {
            continue;
        }

        let timeEntries = entry.getElementsByClassName(timeEntrySelector);
        if (timeEntries.length !== 2 && timeEntries.length !== 0) {
            htmlString += '<tr><td>Day does not have exactly 2 entries</td><td></td><td></td><td></td></tr>';
            continue;
        }

        // console.log('Extracting entry', entry, date, timeEntries);
        let previous = undefined;
        let breakTime = '';
        let breakDuration = '';
        let beginning = '';
        let end = ''

        const dayOfWeek = entry.getElementsByClassName(dayOfWeekSelector)[0].innerText.trim();
        const isSaturday = dayOfWeek === 'Sat';
        const isSunday = dayOfWeek === 'Sun';

        didHaveSat ||= isSaturday;

        for (let timeEntry of timeEntries) {
            let timeEntryStart = timeEntry.getElementsByClassName(timeEntryStartSelector)[0].innerHTML;
            let timeEntryEnd = timeEntry.getElementsByClassName(timeEntryEndSelector)[0].innerHTML;
            let timeEntryTotal = timeEntry.getElementsByClassName(timeEntryTotalSelector)[0].innerHTML;
            let currentEntry = {
                'start': convert12hTo24(timeEntryStart),
                'end': convert12hTo24(timeEntryEnd),
                'duration': timeEntryTotal
            };

            // NOTE: Special case, Saturdays get two entries in spreadsheet.
            if (isSaturday) {
                didHaveSatEntry = true;

                if (!previous) {
                    const BREAK_END = "13:00"
                    const satBreakTime = `${currentEntry.end} - ${BREAK_END}`;
                    const satBreakDuration = subtractTimes(BREAK_END, currentEntry.end);

                    htmlString +=
                        `<tr>
                            <td>${currentEntry.start}</td>
                            <td>${currentEntry.end}</td>
                            <td>${satBreakDuration}</td>
                            <td>${satBreakTime}</td>
                        </tr>`.replace(/\s+/g, '');

                    previous = currentEntry;
                } else {
                    beginning = currentEntry.start;
                    end = currentEntry.end;
                    breakTime = "";
                    breakDuration = "";
                }

                continue;
            }

            if (!!previous) {
                breakTime = `${previous['end']} - ${currentEntry['start']}`;
                breakDuration = subtractTimes(currentEntry['start'], previous['end']);
            } else {
                beginning = currentEntry['start'];
            }
            end = currentEntry['end'];
            previous = currentEntry;
        }

        if (isSunday && didHaveSat) {
            if (!didHaveSatEntry) {
                htmlString += `<tr><td></td><td></td><td></td><td></td></tr>`;
            }
            didHaveSat = false;
            didHaveSatEntry = false;
        }

        // csv format is
        // BEGIN, END, BREAK (Duration), BREAK TIME
        htmlString +=
            `<tr>
                <td>${beginning}</td>
                <td>${end}</td>
                <td>${breakDuration}</td>
                <td>${breakTime}</td>
            </tr>`.replace(/\s+/g, '');
    }

    htmlString += '</tbody></table>'
    console.log(htmlString);
    copyHtmlToClipboard(htmlString);
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
