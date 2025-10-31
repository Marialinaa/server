# Script PowerShell para Migração Automática de Arquivos TypeScript

$files = @(
    "c:\Users\maria\Downloads\aura-hubb\server\routes\users_new.ts",
    "c:\Users\maria\Downloads\aura-hubb\server\routes\atribuicoes.ts"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "Migrando $file..." -ForegroundColor Yellow
        
        # Ler conteúdo
        $content = Get-Content $file -Raw
        
        # 1. Adicionar const pool = await DatabaseConnection.getInstance() nas funções
        $content = $content -replace '(export const \w+[^{]*\{[\s\S]*?try\s*\{[\s\S]*?)(\s*)(const \[)', '$1$2// ✅ Obter pool de forma segura$2const pool = await DatabaseConnection.getInstance();$2$2$3'
        
        # 2. Adicionar return nos res.json
        $content = $content -replace '(\s+)(res\.json\()', '$1return $2'
        
        # 3. Trocar catch blocks
        $content = $content -replace 'catch \(error: any\) \{[\s\S]*?res\.status\(\d+\)\.json\([^)]+\);[\s\S]*?\}', 'catch (error: any) {    console.error("❌ Erro:", error);    return handleDatabaseError(error, res);  }'
        
        # Salvar
        $content | Set-Content $file -NoNewline
        
        Write-Host "✅ $file migrado!" -ForegroundColor Green
    }
}

Write-Host "`n✅ Migração automática concluída!" -ForegroundColor Cyan
