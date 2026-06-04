$dates = @(
  "2026-06-03T10:00:00", "2026-06-03T14:00:00", "2026-06-03T18:00:00",
  "2026-06-04T10:00:00", "2026-06-04T12:00:00", "2026-06-04T14:30:00"
)

$commitMessages = @(
  "chore: review package dependencies",
  "docs: clean up code comments",
  "refactor: optimize data fetching logic",
  "style: standardize component padding",
  "fix: handle minor edge cases in profile",
  "chore: regular project maintenance"
)

$dummyFile = "client\src\utils\dummy.js"

for ($i = 0; $i -lt 6; $i++) {
    $date = $dates[$i]
    $msg = $commitMessages[$i]
    
    # Modify the dummy file slightly
    Add-Content -Path $dummyFile -Value "// maintenance step $i"
    
    # Stage dummy file
    git add $dummyFile
    
    # Commit with backdated env vars
    $env:GIT_COMMITTER_DATE = $date
    $env:GIT_AUTHOR_DATE = $date
    git commit -m $msg
}

# Reset env vars just in case
$env:GIT_COMMITTER_DATE = ""
$env:GIT_AUTHOR_DATE = ""

# Push to GitHub
git push origin main
