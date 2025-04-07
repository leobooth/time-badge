# TimeBadge
A simple extension that displays the current time. 
Pin the extension, and you will always be able to see the current time 
in your browser window. That's it!

Beta testing instructions (until available from Chrome Web Store):

To install:
1. In the Chrome Extensions tab:
   1. activate Developer Mode 
   2. remove any previously installed version of TimeBadge
2. Download zipped file containing new version
3. Place the zipped file in a folder whose location you will remember
4. Delete any unzipped folders containing previous versions
5. Unzip the new version
6. Open the unzipped folder - it should have another folder inside it also named "TimeBadge"
   1. Inside the inner folder should be a "background.js" file
   2. The inner folder is the one you want to install
7. In the Chrome Extensions tab:
   1. Click "Load Unpacked"
   2. Navigate to the 'TimeBadge' folder
   3. Click the inner folder
   4. Click "Select Folder"
8. In the Chrome browser toolbar, click the Extensions "puzzle piece" icon
9. Pin TimeBadge in your browser, so that you can always see the time on-screen

Testing instructions:
1. TimeBadge should display the current time in 12-hour format by default.
2. If you hover over the extension icon, it should display the current date in a "title" tooltip.
   1. The date should appear in the same format as the system date on your computer.
3. Click the extension to toggle between 12-hour and 24-hour time.
4. The extension should remember your settings:
   1. If you lock the computer and reopen it (after at least 20 seconds)
   2. If you shut down and restart your computer
  