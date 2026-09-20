$f = "c:\antigravity workspace\ai-career-guidance\frontend\src\pages\student\Profile.tsx"
$lines = Get-Content $f
$lines[0..769] | Set-Content $f
Write-Host "Done. Lines: $((Get-Content $f).Count)"
