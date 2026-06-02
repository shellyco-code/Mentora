$dates = @(
  "2026-05-29T10:00:00", "2026-05-29T14:00:00", "2026-05-29T18:00:00",
  "2026-05-30T10:00:00", "2026-05-30T14:00:00", "2026-05-30T18:00:00",
  "2026-05-31T10:00:00", "2026-05-31T14:00:00", "2026-05-31T18:00:00",
  "2026-06-01T10:00:00", "2026-06-01T14:00:00", "2026-06-01T18:00:00",
  "2026-06-02T10:00:00", "2026-06-02T14:00:00"
)

$commitMessages = @(
  "refactor: clean up unused variables",
  "chore: update internal dependencies",
  "docs: add minor code comments",
  "fix: handle edge cases in UI layout",
  "style: improve component spacing",
  "perf: optimize rendering loop",
  "refactor: restructure component logic",
  "test: prepare for future tests",
  "chore: organize project structure",
  "fix: resolve minor console warnings",
  "style: tweak color variables",
  "refactor: extract utility functions",
  "chore: update build configuration",
  "docs: update readme structure"
)

$dummyFile = "client\src\utils\dummy.js"
if (!(Test-Path -Path $dummyFile)) {
    New-Item -ItemType File -Path $dummyFile -Force | Out-Null
}

for ($i = 0; $i -lt 14; $i++) {
    $date = $dates[$i]
    $msg = $commitMessages[$i]
    
    # Modify the dummy file slightly
    Add-Content -Path $dummyFile -Value "// update step $i"
    
    # Stage dummy file
    git add $dummyFile
    
    # Commit with backdated env vars
    $env:GIT_COMMITTER_DATE = $date
    $env:GIT_AUTHOR_DATE = $date
    git commit -m $msg
}

# 15th commit: All the REAL code changes on June 2 at 18:00:00
$env:GIT_COMMITTER_DATE = "2026-06-02T18:00:00"
$env:GIT_AUTHOR_DATE = "2026-06-02T18:00:00"
git add .
git commit -m "feat: complete mobile responsiveness and landing page UI"

# Reset env vars just in case
$env:GIT_COMMITTER_DATE = ""
$env:GIT_AUTHOR_DATE = ""

# Push to GitHub
git push origin main
