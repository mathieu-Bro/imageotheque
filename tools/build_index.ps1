# ==========================================================
# build_index.ps1
# Génère data/index_site.json depuis photos/ et videos/
# Version robuste : écriture progressive
# ==========================================================

$Root = "C:\Users\mbrossard\Documents\Perso\00 - Site Photos Pascal\bp"

$PhotosRoot = Join-Path $Root "photos"
$VideosRoot = Join-Path $Root "videos"
$DataDir    = Join-Path $Root "data"
$OutputFile = Join-Path $DataDir "index_site.json"

if (!(Test-Path $DataDir)) {
    New-Item -ItemType Directory -Path $DataDir | Out-Null
}

function CleanJsonText {
    param($Text)

    if ($null -eq $Text) {
        return ""
    }

    $Value = "$Text"
    $Value = $Value -replace "\\", "\\"
    $Value = $Value -replace '"', '\"'
    $Value = $Value -replace "`r", ""
    $Value = $Value -replace "`n", " "
    return $Value
}

function NormalizeWebPath {
    param($Text)

    $Value = "$Text"
    $Value = $Value -replace "\\", "/"
    return $Value
}

Write-Host "ROOT   = $Root"
Write-Host "OUTPUT = $OutputFile"
Write-Host ""

$PhotosCount = 0
$VideosCount = 0
$TotalCount = 0
$First = $true

Set-Content -Path $OutputFile -Value "[" -Encoding UTF8

function Add-MediaFiles {
    param(
        $MediaRoot,
        $BaseFolder,
        $MediaType
    )

    if (!(Test-Path $MediaRoot)) {
        Write-Host "Dossier absent : $MediaRoot"
        return
    }

    $Files = Get-ChildItem -Path $MediaRoot -File -Recurse

    foreach ($File in $Files) {

        $FullName = $File.FullName
        $Relative = $FullName.Substring($MediaRoot.Length)

        if ($Relative.StartsWith("\") -or $Relative.StartsWith("/")) {
            $Relative = $Relative.Substring(1)
        }

        $RelativeWeb = NormalizeWebPath $Relative
        $WebPath = $BaseFolder + "/" + $RelativeWeb

        $FolderName = Split-Path $Relative -Parent
        $FolderName = NormalizeWebPath $FolderName

        $Extension = $File.Extension
        if ($Extension.StartsWith(".")) {
            $Extension = $Extension.Substring(1)
        }

        if ($script:First -eq $false) {
            Add-Content -Path $script:OutputFile -Value "," -Encoding UTF8
        }

        Add-Content -Path $script:OutputFile -Value "  {" -Encoding UTF8
        Add-Content -Path $script:OutputFile -Value ('    "path": "' + (CleanJsonText $WebPath) + '",') -Encoding UTF8
        Add-Content -Path $script:OutputFile -Value ('    "fileName": "' + (CleanJsonText $File.Name) + '",') -Encoding UTF8
        Add-Content -Path $script:OutputFile -Value ('    "folder": "' + (CleanJsonText $FolderName) + '",') -Encoding UTF8
        Add-Content -Path $script:OutputFile -Value ('    "extension": "' + (CleanJsonText $Extension.ToLower()) + '",') -Encoding UTF8
        Add-Content -Path $script:OutputFile -Value ('    "type": "' + (CleanJsonText $MediaType) + '",') -Encoding UTF8
        Add-Content -Path $script:OutputFile -Value ('    "displayName": "' + (CleanJsonText $File.BaseName) + '",') -Encoding UTF8
        Add-Content -Path $script:OutputFile -Value '    "keywords": []' -Encoding UTF8
        Add-Content -Path $script:OutputFile -Value "  }" -Encoding UTF8

        $script:First = $false
        $script:TotalCount = $script:TotalCount + 1

        if ($MediaType -eq "image") {
            $script:PhotosCount = $script:PhotosCount + 1
        }

        if ($MediaType -eq "video") {
            $script:VideosCount = $script:VideosCount + 1
        }

        if (($script:TotalCount % 500) -eq 0) {
            Write-Host "$script:TotalCount fichiers indexés..."
        }
    }
}

Add-MediaFiles -MediaRoot $PhotosRoot -BaseFolder "photos" -MediaType "image"
Add-MediaFiles -MediaRoot $VideosRoot -BaseFolder "videos" -MediaType "video"

Add-Content -Path $OutputFile -Value "]" -Encoding UTF8

$Size = (Get-Item $OutputFile).Length

Write-Host ""
Write-Host "Index généré : $OutputFile"
Write-Host "Photos indexées : $PhotosCount"
Write-Host "Vidéos indexées : $VideosCount"
Write-Host "Total indexé : $TotalCount"
Write-Host "Taille JSON : $Size octets"