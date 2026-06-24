# Sigma Chart · Notion Radar

Radar chart configurável para bases de dados do Notion, inspirado no fluxo de ferramentas como Notion2Charts/ChartBase: escolher uma database, selecionar uma página/linha, configurar o campo de título e marcar quais propriedades numéricas viram eixos do radar.

## O que foi incluído

- Configurador lateral com seleção de base de dados, registro, campo de título, métricas numéricas, valor máximo e tema.
- Preview do embed em estilo limpo compatível com Notion claro/escuro.
- Radar chart em SVG puro, sem dependências externas.
- URL de embed gerada com parâmetros para manter a configuração selecionada.

## Como editar as bases de dados

Edite o array `databases` em `src/main.js`:

```js
const databases = [
  {
    id: 'personagens-rpg',
    name: 'Personagens RPG',
    rows: [
      { Nome: 'Aventureiro Sigma', Classe: 'Guardião Arcano', Força: 8, Destreza: 7 },
    ],
  },
];
```

Cada objeto em `rows` representa uma página/linha de uma base de dados do Notion. Campos numéricos aparecem automaticamente como opções de métricas do radar.

## Como configurar pelo link

A configuração também pode ser controlada por query params:

```txt
?database=personagens-rpg&row=0&label=Nome&metrics=Força,Destreza,Inteligência,Carisma,Constituição,Sabedoria&max=10&theme=light
```

Parâmetros disponíveis:

- `database`: ID da base configurada em `src/main.js`.
- `row`: índice da linha/página selecionada.
- `label`: propriedade usada como título.
- `metrics`: lista de propriedades numéricas separadas por vírgula.
- `max`: valor máximo da escala do radar.
- `theme`: `light` ou `dark`.

## Rodar localmente

Como o projeto é estático, não precisa instalar dependências:

```bash
python3 -m http.server 4173
```

Depois acesse `http://localhost:4173`.

## Hospedar grátis

Opções recomendadas:

- **Vercel**: importe o repositório e use como site estático.
- **Netlify**: arraste a pasta do projeto ou conecte ao GitHub.
- **Cloudflare Pages**: conecte o repositório e publique sem comando de build.
- **GitHub Pages**: publique a branch com `index.html` na raiz.

## Incorporar no Notion

1. Faça o deploy em uma das plataformas acima.
2. Configure o gráfico na página publicada.
3. Copie a URL exibida no campo **URL de embed**.
4. No Notion, digite `/embed`.
5. Cole a URL configurada.

## Integração real com Notion API

Este widget já segue a lógica de configuração por database, mas usa dados locais em `src/main.js`. Para sincronização real com Notion, o próximo passo é adicionar uma função serverless que leia a Notion API com segurança e converta as páginas da database para o mesmo formato do array `databases`.
