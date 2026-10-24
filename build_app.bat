@echo off
set GRADLE_PATH=C:\Users\Tlau\.gradle\wrapper\dists\gradle-8.7-bin\bhs2wmbdwecv87pi65oeuq5iu\gradle-8.7\bin\gradle.bat

echo Building AuraPlan APK...
if exist gradlew.bat (
    call gradlew.bat assembleDebug
) else if exist "%GRADLE_PATH%" (
    echo Using detected gradle at %GRADLE_PATH%
    call "%GRADLE_PATH%" assembleDebug
) else (
    echo Gradle not found. Attempting to use system gradle...
    gradle assembleDebug
)

if %ERRORLEVEL% EQU 0 (
    echo.
    echo Build Successful!
    if exist "app\build\outputs\apk\debug\app-debug.apk" (
        echo APK location: app\build\outputs\apk\debug\app-debug.apk
    )
) else (
    echo.
    echo Build Failed!
)
pause
