$base = 'http://localhost:3005/api'

function safeInvoke($method, $path, $body=$null) {
  try {
    if ($method -eq 'GET') {
      $res = Invoke-RestMethod -Uri ("$base/$path") -Method GET -UseBasicParsing
    } else {
      $jsonBody = $null
      if ($body -ne $null) { $jsonBody = $body | ConvertTo-Json -Depth 6 }
      $res = Invoke-RestMethod -Uri ("$base/$path") -Method $method -ContentType 'application/json' -Body $jsonBody -UseBasicParsing
    }
    Write-Host "--- OK: $method /$path ---"
    $res | ConvertTo-Json -Depth 6 | Write-Host
    return $res
  } catch {
    Write-Host "--- ERROR: $method /$path ---"
    Write-Host $_.Exception.Message
    return $null
  }
}

Write-Host "START smoke tests -> $base"

# health
safeInvoke 'GET' 'health'

# test
safeInvoke 'GET' 'test'

# usuarios
$usersResp = safeInvoke 'GET' 'usuarios'

# normalize array
$users = @()
if ($usersResp -ne $null) {
  if ($usersResp -is [System.Array]) { $users = $usersResp }
  elseif ($usersResp.data) { $users = $usersResp.data }
  elseif ($usersResp.usuarios) { $users = $usersResp.usuarios }
  else { $users = @($usersResp) }
}

Write-Host "Usuarios count: $($users.Count)"

if ($users.Count -lt 2) {
  Write-Host "Não há usuários suficientes (menos de 2). Pulando POSTs que dependem de usuários."
  exit 0
}

# pick responsavel and bolsista
$responsavel = $users | Where-Object { $_.tipo_usuario -eq 'responsavel' -or $_.tipoUsuario -eq 'responsavel' -or $_.tipo -eq 'responsavel' } | Select-Object -First 1
$bolsista = $users | Where-Object { $_.tipo_usuario -eq 'bolsista' -or $_.tipoUsuario -eq 'bolsista' -or $_.tipo -eq 'bolsista' } | Select-Object -First 1

if (-not $responsavel) { $responsavel = $users[0] }
if (-not $bolsista) { $bolsista = $users[1] }

Write-Host "Responsavel id: $($responsavel.id)  Bolsista id: $($bolsista.id)"

# POST atribuicoes
$body = @{ responsavel_id = [int]$responsavel.id; bolsista_id = [int]$bolsista.id; titulo = 'Smoke atribuição'; descricao = 'Criada pelo smoke_test.ps1'; status = 'pendente' }
$atr = safeInvoke 'POST' 'atribuicoes' $body

# get atribuicao id
$atrId = $null
if ($atr -ne $null) {
  if ($atr.Data) { $atrId = $atr.Data.id } elseif ($atr.data) { $atrId = $atr.data.id } elseif ($atr.id) { $atrId = $atr.id }
}
Write-Host "Atribuicao id: $atrId"

# POST horarios entrada
if ($atrId) {
  $bodyEntrada = @{ bolsista_id = [int]$bolsista.id; atribuicao_id = [int]$atrId }
  safeInvoke 'POST' 'horarios/entrada' $bodyEntrada

  # POST horarios saida
  $bodySaida = @{ bolsista_id = [int]$bolsista.id; atribuicao_id = [int]$atrId }
  safeInvoke 'POST' 'horarios/saida' $bodySaida
} else {
  Write-Host "Sem atribuicao criada, pulando POST /horarios/*"
}

Write-Host "SMOKE TESTS FINISHED"
