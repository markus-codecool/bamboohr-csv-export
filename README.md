This extension is only used by Codecool Austria to use their timetracking more easily.

How to install this extension

- Download this project from Github. There should be a green "Code" button with another button called "Download ZIP". Alternatively you can directly go to https://github.com/markus-codecool/bamboohr-csv-export/archive/refs/heads/master.zip 
- Unzip this folder. Under windows you can right-click the .zip file and click "extract all". Choose a permanent location for the extracted files.
- Open up Chrome (it cannot be firefox or any other browser)
- Go to the extensions page `chrome://extensions/`
- Enable "developer mode" in the top right corner (since this extension is not publicly listed)
- In the top left, a button called "Load unpacked" should appear - press it.
- Select the folder containing this `README.md`, the `manifest.json` and other files. You will only be able to see directories, the files will be invisible.
- The extension should appear in the extension list and be enabled by default.
- If your Timesheet is already open in BambooHR, you need to refresh the page.
- A button called "Copy CSV to Clipboard" should appear next to the current pay period.

![Extensions Page](/documentation/chrome_extensions_1.png)


Once the extension is up and running, you can start to use it.

- Open up the desired timesheet page (should be under `https://codecool.bamboohr.com/employees/timesheet...`)
- Press the "Copy CSV to Clipboard" button. You will get no feedback and nothing will be changed. However, the desired CSV should be in your clipboard now.
- Open up the desired target Google Sheet, where you want to enter the working times.
- Select the beginning cell (First day of month, colum called "BEGIN"). In my case this is C9.
- Paste your clipboard (CTRL+V) or right-click -> paste.
- The formatting will be garbage and a lot of entries containing commas will appear. However, DON'T click away from the freshly inserted cells.
- In the bottom right of the selection (last day of month) a popup with a clipboard button will appear.

![Google Sheets Preview](/documentation/google_sheets_2.png)


