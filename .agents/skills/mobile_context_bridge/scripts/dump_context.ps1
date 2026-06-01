$OutputDir = Split-Path -Parent (Get-Location)
$OutputFile = "mobile_dump.md"
$OutputFilePath = Join-Path (Get-Location) $OutputFile

# Archivos base en la raíz
$BaseFiles = @(
    "package.json",
    "vite.config.ts",
    "index.html",
    "AGENTS.md"
)

# Carpetas a escanear (recursivamente)
$SourceDirs = @("src")
# Extensiones de interés
$ValidExtensions = @(".ts", ".tsx", ".css")

Write-Host "Iniciando empaquetado de contexto para móvil..."

# Crear o limpiar archivo
Set-Content -Path $OutputFilePath -Value "# NEXUS L4 - MOBILE CONTEXT DUMP`n`nEste documento contiene el estado completo del proyecto para ser analizado por LLMs en entornos aislados.`n"

# Escribir archivos base
foreach ($file in $BaseFiles) {
    if (Test-Path $file) {
        Write-Host "Empaquetando $file..."
        Add-Content -Path $OutputFilePath -Value "`n## File: $file"
        Add-Content -Path $OutputFilePath -Value ('```' + ($file -replace '^.*\.',''))
        Get-Content $file | Add-Content -Path $OutputFilePath
        Add-Content -Path $OutputFilePath -Value '```'
    }
}

# Escribir archivos de código fuente
foreach ($dir in $SourceDirs) {
    if (Test-Path $dir) {
        $Files = Get-ChildItem -Path $dir -Recurse -File | Where-Object { $ValidExtensions -contains $_.Extension }
        foreach ($file in $Files) {
            $RelativePath = $file.FullName.Replace((Get-Location).Path + "\", "").Replace("\", "/")
            Write-Host "Empaquetando $RelativePath..."
            Add-Content -Path $OutputFilePath -Value "`n## File: $RelativePath"
            
            $Lang = "typescript"
            if ($file.Extension -eq ".css") { $Lang = "css" }
            if ($file.Extension -eq ".tsx") { $Lang = "tsx" }
            
            Add-Content -Path $OutputFilePath -Value ('```' + $Lang)
            Get-Content $file.FullName | Add-Content -Path $OutputFilePath
            Add-Content -Path $OutputFilePath -Value '```'
        }
    }
}

Write-Host "¡Transición de dominio preparada! Archivo guardado en: $OutputFilePath"
