#!/usr/bin/env pwsh
# =============================================================================
# deploy.ps1 — Compila e instala Nexus L4 en un Android conectado por ADB.
#
#   .\deploy.ps1            build web + sync + APK debug + instalar + abrir
#   .\deploy.ps1 -NoLaunch  igual, pero no abre la app
#   .\deploy.ps1 -SkipWeb   saltea 'vite build' (reutiliza dist) → más rápido
#
# No necesita ANDROID_HOME en PATH: autodetecta el SDK y el adb.
# =============================================================================
param([switch]$NoLaunch, [switch]$SkipWeb)
$ErrorActionPreference = "Stop"
$root = $PSScriptRoot
$PKG  = "com.nexus.l4"

function Step($msg) { Write-Host "`n=> $msg" -ForegroundColor Cyan }

# --- 1) SDK + adb ------------------------------------------------------------
$sdk = if ($env:ANDROID_HOME) { $env:ANDROID_HOME } else { "$env:LOCALAPPDATA\Android\Sdk" }
if (-not (Test-Path $sdk)) { throw "Android SDK no encontrado en '$sdk'. Seteá ANDROID_HOME." }
$env:ANDROID_HOME = $sdk; $env:ANDROID_SDK_ROOT = $sdk
$adb = Join-Path $sdk "platform-tools\adb.exe"
if (-not (Test-Path $adb)) { throw "adb no encontrado en '$adb'." }

# --- 2) Dispositivo conectado ------------------------------------------------
Step "Buscando dispositivo..."
$devs = (& $adb devices) | Select-Object -Skip 1 | Where-Object { $_ -match "device$" }
if (-not $devs) { throw "No hay dispositivo AUTORIZADO conectado. Conectá el cel, activá Depuración USB y aceptá el prompt." }
Write-Host "   📱 $($devs -join ' | ')" -ForegroundColor Green

# --- 3) Build web (Vite) -----------------------------------------------------
if (-not $SkipWeb) {
  Step "vite build (web -> dist)..."
  npx vite build
  if ($LASTEXITCODE -ne 0) { throw "vite build falló." }
}

# --- 4) Capacitor sync -------------------------------------------------------
Step "cap sync android..."
npx cap sync android
if ($LASTEXITCODE -ne 0) { throw "cap sync falló." }

# --- 5) Gradle assembleDebug (gradlew, con fallback a la dist local) ---------
Step "Gradle assembleDebug..."
$androidDir = Join-Path $root "android"
$gradlew = Join-Path $androidDir "gradlew.bat"
$ok = $false
if (Test-Path $gradlew) {
  & $gradlew -p $androidDir assembleDebug --console=plain
  $ok = ($LASTEXITCODE -eq 0)
}
if (-not $ok) {
  Write-Host "   gradlew no funcionó; usando la distribución local de Gradle..." -ForegroundColor DarkYellow
  $propsFile = Join-Path $androidDir "gradle\wrapper\gradle-wrapper.properties"
  $ver = "8.14.3"
  if (Test-Path $propsFile) {
    $mm = (Get-Content $propsFile | Select-String -Pattern "gradle-([\d.]+)-")
    if ($mm) { $ver = $mm.Matches[0].Groups[1].Value }
  }
  $gb = Get-ChildItem "$env:USERPROFILE\.gradle\wrapper\dists\gradle-$ver*" -Filter gradle.bat -Recurse -ErrorAction SilentlyContinue |
        Select-Object -First 1 -ExpandProperty FullName
  if (-not $gb) { throw "No se pudo compilar: ni gradlew ni la dist local de Gradle $ver." }
  & $gb -p $androidDir assembleDebug --console=plain
  if ($LASTEXITCODE -ne 0) { throw "assembleDebug falló." }
}

# --- 6) Instalar -------------------------------------------------------------
$apk = Join-Path $androidDir "app\build\outputs\apk\debug\app-debug.apk"
if (-not (Test-Path $apk)) { throw "APK no generado en '$apk'." }
Step ("Instalando APK ({0} MB)..." -f [math]::Round((Get-Item $apk).Length / 1MB, 1))
& $adb install -r $apk
if ($LASTEXITCODE -ne 0) { throw "adb install falló." }

# --- 7) Abrir ----------------------------------------------------------------
if (-not $NoLaunch) {
  Step "Abriendo la app..."
  & $adb shell monkey -p $PKG -c android.intent.category.LAUNCHER 1 2>&1 | Out-Null
}
Write-Host "`n✅ Listo: $PKG instalada y corriendo." -ForegroundColor Green
