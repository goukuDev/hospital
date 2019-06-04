@echo off
call electron-packager ./ --platform=win32 --arch=x64 --electron-version=3.0.5 --overwrite --asar --appname=PIS
copy app.config PIS-win32-x64\app.config
copy README PIS-win32-x64\README
md PIS-win32-x64\temp
xcopy /e .\temp PIS-win32-x64\temp
md PIS-win32-x64\template
xcopy /e .\template PIS-win32-x64\template