@echo off
call electron-packager ./ --platform=win32 --arch=x64 --electron-version=3.1.10 --overwrite --asar --appname=PIS --icon=pis.ico
copy app.config PIS-win32-x64\app.config
copy README PIS-win32-x64\README
md PIS-win32-x64\temp
xcopy /e .\temp PIS-win32-x64\temp
md PIS-win32-x64\template
xcopy /e .\template PIS-win32-x64\template
echo d | xcopy /e .\PDFtoPrinter PIS-win32-x64\PDFtoPrinter