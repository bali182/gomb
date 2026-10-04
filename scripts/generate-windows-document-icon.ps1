param(
    [Parameter(Mandatory = $true)][string]$SourcePath,
    [Parameter(Mandatory = $true)][string]$DestinationPath
)

$ErrorActionPreference = 'Stop'

Add-Type -Path "$PSScriptRoot/DocumentIconGenerator.cs"

[DocumentIconGenerator]::GenerateDocumentIcon($SourcePath, $DestinationPath)
