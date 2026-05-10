// Vercel Edge Function — raspa o resultado de Goiás do site oficial
export const config = { runtime: ‘edge’ };

export default async function handler(req) {
const headers = {
‘Access-Control-Allow-Origin’: ‘*’,
‘Content-Type’: ‘application/json’,
‘Cache-Control’: ‘public, max-age=3600’, // cache 1h
};

try {
const res = await fetch(‘https://comidadibuteco.com.br/vencedores/goias/’, {
headers: {
‘User-Agent’: ‘Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15’,
‘Accept’: ‘text/html’,
},
signal: AbortSignal.timeout(8000),
});

```
if (!res.ok) {
  return new Response(JSON.stringify({ ranking: null, erro: 'site_indisponivel' }), { headers });
}

const html = await res.text();

// Verifica se já tem vencedores do ano atual (2026)
const ano = new Date().getFullYear();
const temAno = html.includes(`<h3 class="year">${ano}</h3>`);

if (!temAno) {
  return new Response(JSON.stringify({ ranking: null, status: 'aguardando' }), { headers });
}

// Extrai os vencedores do ano atual
const inicioAno = html.indexOf(`<h3 class="year">${ano}</h3>`);
const fimBloco = html.indexOf('</div>', html.indexOf('box-vencedores', inicioAno) + 200);
const bloco = html.substring(inicioAno, fimBloco + 10);

// Extrai cada colocado: <li>Xº</li><li><strong>NOME</strong>...</li>
const ranking = [];
const re = /<li>(\d+)º<\/li>\s*<li><strong>([^<]+)<\/strong>/g;
let m;
while ((m = re.exec(bloco)) !== null) {
  ranking.push({ pos: parseInt(m[1]), nome: m[2].trim(), petisco: '' });
}

if (ranking.length === 0) {
  return new Response(JSON.stringify({ ranking: null, status: 'sem_dados' }), { headers });
}

return new Response(JSON.stringify({ ranking, status: 'finalizado', ano }), { headers });
```

} catch (e) {
return new Response(JSON.stringify({ ranking: null, erro: e.message }), { headers, status: 200 });
}
}
