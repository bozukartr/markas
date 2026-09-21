param([string]$DotnetPath = 'dotnet')
$ErrorActionPreference = 'Stop'
$repo = Split-Path $PSScriptRoot -Parent
$testDir = Join-Path $repo ('.local/test-' + [guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $testDir -Force | Out-Null
& $DotnetPath build (Join-Path $repo 'backend/Markas.Api.csproj') --nologo
if ($LASTEXITCODE -ne 0) { throw 'Build failed' }
$dll = Join-Path $repo 'backend/bin/Debug/net10.0/Markas.Api.dll'
$processes = [System.Collections.Generic.List[System.Diagnostics.Process]]::new()
function Start-Api([string]$mode, [int]$port, [string]$db) {
 $info = [System.Diagnostics.ProcessStartInfo]::new()
 $info.FileName = $DotnetPath
 $info.ArgumentList.Add($dll)
 $info.WorkingDirectory = $testDir
 $info.UseShellExecute = $false
 $info.CreateNoWindow = $true
 $info.Environment['Mode'] = $mode
 $info.Environment['Urls'] = "http://127.0.0.1:$port"
 $info.Environment['ConnectionStrings__Store'] = "Data Source=$db"
 $info.Environment['StoreId'] = 'test-store'
 $info.Environment['Cloud__Url'] = 'http://127.0.0.1:5190'
 $info.Environment['Cloud__ApiKey'] = 'smoke-test-key-not-for-production'
 $info.Environment['Logging__LogLevel__Default'] = 'Error'
 $proc = [System.Diagnostics.Process]::Start($info)
 $processes.Add($proc)
 for ($i=0;$i -lt 60;$i++) {
  try { Invoke-RestMethod "http://127.0.0.1:$port/api/health" | Out-Null; return $proc } catch { Start-Sleep -Milliseconds 250 }
 }
 throw "API $port did not start"
}
function Req([string]$method,[string]$path,$body=$null,[int]$status=200,[int]$port=5180,$headers=@{}) {
 $options=@{Method=$method;Uri="http://127.0.0.1:$port/api/$path";SkipHttpErrorCheck=$true;Headers=$headers}
 if($null -ne $body){$options.ContentType='application/json';$options.Body=ConvertTo-Json $body -Depth 8 -Compress}
 $r=Invoke-WebRequest @options
 if([int]$r.StatusCode -ne $status){throw "$method $path expected $status, got $($r.StatusCode): $($r.Content)"}
 if($r.Content){return ($r.Content|ConvertFrom-Json)}
}
function Assert($condition,[string]$message){if(!$condition){throw $message}}
try {
 $local=Start-Api 'Store' 5180 'store.db'
 $products=Req GET products
 Assert ($products.Count -eq 8) 'Seed products missing'
 $p=Req POST products @{name='Test ürün';barcode='TEST-001';category='Test';priceCents=1250;stock=5;minStock=2} 201
 $old=$p|ConvertTo-Json|ConvertFrom-Json
 $p.priceCents=1500
 $p=Req PUT "products/$($p.id)" $p
 Req PUT "products/$($p.id)" $old 409 | Out-Null
 Req POST products @{name='';barcode='invalid';category='Test';priceCents=-1;stock=-1} 400 | Out-Null
 Req POST sales @{id=[guid]::NewGuid();productId=$p.id;quantity=0} 400 | Out-Null
 Req POST sales @{id=[guid]::NewGuid();productId=$p.id;quantity=6} 409 | Out-Null
 $request=@{id=[guid]::NewGuid().ToString();productId=$p.id;quantity=2}
 $sale=Req POST sales $request
 Req POST sales $request | Out-Null
 $remaining=Req GET "products/$($p.id)"
 Assert ($remaining.stock -eq 3) 'Duplicate sale changed inventory'
 $summary=Req GET sales/summary
 Assert ($summary.revenueCents -eq 3000 -and $summary.pending -eq 1) 'Offline sale or outbox missing'
 $local.Kill();$local.WaitForExit()
 $local=Start-Api 'Store' 5180 'store.db'
 $summary=Req GET sales/summary
 Assert ($summary.pending -eq 1 -and $summary.saleCount -eq 1) 'Queue was lost after restart'
 $cloud=Start-Api 'Cloud' 5190 'cloud.db'
 for($i=0;$i -lt 100;$i++){
  $summary=Req GET sales/summary
  if($summary.pending -eq 0){break}
  Start-Sleep -Milliseconds 250
 }
 Assert ($summary.pending -eq 0) 'Queue did not sync after reconnect'
 $headers=@{'X-Sync-Key'='smoke-test-key-not-for-production'}
 $ack=Req POST sync $sale 200 5190 $headers
 Assert ($ack.id -eq $sale.id) 'Cloud deduplication failed'
 $sale.quantity=3
 Req POST sync $sale 409 5190 $headers | Out-Null
 Req POST sync $sale 401 5190 | Out-Null
 $sale.storeId='wrong-store'
 Req POST sync $sale 403 5190 $headers | Out-Null
 Req GET products $null 404 5190 | Out-Null
 Req DELETE "products/$($p.id)?version=$($remaining.version)" $null 204 | Out-Null
 Req GET "products/$($p.id)" $null 404 | Out-Null
 $summary=Req GET sales/summary
 Assert ($summary.revenueCents -eq 3000) 'Deleting product changed historical revenue'
 Write-Output 'PASS: CRUD, validation, concurrency, offline sale, duplicate retry, restart, reconnect, cloud idempotency and authorization.'
} finally {
 foreach($proc in $processes){if(!$proc.HasExited){$proc.Kill();$proc.WaitForExit()}}
}
