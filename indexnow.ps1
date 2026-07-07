$body = @{
    host = "alexpi.art"
    key = "7aaddae9529a41828bf0a9983dc6ab30"
    keyLocation = "https://alexpi.art/7aaddae9529a41828bf0a9983dc6ab30.txt"
    urlList = @(
        "https://alexpi.art/",
        "https://alexpi.art/about.html",
        "https://alexpi.art/marvel-rivals.html",
        "https://alexpi.art/dead-space.html",
        "https://alexpi.art/secret-level.html",
        "https://alexpi.art/ss-rajamouli-teaser.html",
        "https://alexpi.art/lak.html"
    )
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "https://api.indexnow.org/indexnow" -Method Post -Body $body -ContentType "application/json; charset=utf-8" -PassThru -ErrorAction Stop
Write-Host "IndexNow API Response:"
$response
