# Acervo de imagens de produtos

**Versão:** 0.2.1  
**Fonte de pesquisa inicial:** Open Food Facts  
**Objetivo:** localizar imagens reais de embalagens e produtos para apoiar a montagem do catálogo amplo do mercado.

## Escopo

O importador contém uma lista inicial de 300 termos de busca distribuídos entre hortifrúti, mercearia, enlatados, carnes, aves e peixes, laticínios, padaria, bebidas, congelados, limpeza, higiene, pet shop e utilidades.

O importador consulta a API pública do Open Food Facts e gera `src/data/product-images.json`. O arquivo é um inventário de pesquisa de imagens, não uma publicação automática de produtos comerciais.

## Como executar no Windows / PowerShell

Na raiz do projeto:

```powershell
npm run catalog:images
```

Para testar com 20 termos:

```powershell
node scripts/import-open-food-facts.mjs --limit=20
```

A execução depende de internet e pode levar alguns minutos. A API pode não encontrar imagem para todos os termos, pode retornar produtos estrangeiros ou embalagens diferentes. O total importado será informado no terminal.

## Revisão obrigatória antes de publicar

Cada registro contém código de barras, nome retornado, marca, quantidade, URL da imagem, página de origem e metadados de licença. Todos começam com `verifiedForSale: false`.

Antes de exibir uma imagem como foto de um produto vendido pela loja:

1. Confirmar que a embalagem e a variante correspondem ao produto anunciado.
2. Confirmar que o produto e a embalagem estão disponíveis no Brasil.
3. Conferir a licença vigente da imagem, os requisitos de atribuição e compartilhamento pela mesma licença.
4. Verificar se a marca/embalagem pode ser usada na apresentação comercial pretendida.
5. Manter a página de origem e os créditos exigidos.

O Open Food Facts utiliza licença ODbL para a base de dados e imagens submetidas pelos contribuidores sob CC BY-SA 3.0, sujeitas aos termos aplicáveis. A disponibilidade de uma URL pública não significa autorização irrestrita para uso comercial. Confira os termos atuais: https://world.openfoodfacts.org/terms-of-use

## Política de qualidade

- Não usar imagem genérica como se fosse embalagem específica.
- Não inferir preço, estoque ou fornecedor a partir da imagem.
- Não publicar imagens com correspondência duvidosa.
- Produtos frescos, cortes de açougue, peixes e hortifrúti podem exigir fotos próprias ou autorização dos fornecedores.
- Se não houver imagem confiável, usar o placeholder da categoria até obter uma foto aprovada.

## Próximas etapas

1. Executar o importador e medir quantos resultados com imagem foram encontrados.
2. Revisar e aprovar as imagens por departamento.
3. Relacionar imagens aprovadas aos SKUs/variantes do catálogo.
4. Só então substituir as imagens demonstrativas da vitrine.
