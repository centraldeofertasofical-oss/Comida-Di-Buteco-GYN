// Vercel Serverless Function — busca resultado do Comida di Buteco Goiás
module.exports = async function handler(req, res) {
res.setHeader(‘Access-Control-Allow-Origin’, ‘*’);
res.setHeader(‘Content-Type’, ‘application/json’);
res.setHeader(‘Cache-Control’, ‘public, max-age=3600’);

try {
const response = await fetch(‘https://comidadibuteco.com.br/vencedores/goias/’, {
headers: {
‘User-Agent’: ‘Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15’,
‘Accept’: ‘text/html’,
},
signal: AbortSignal.timeout(8000),
});

```
if (!response.ok) {
  return res.status(200).json({ ranking: null, erro: 'site_indisponivel' });
}

const html = await response.text();

// Verifica se já tem vencedores do ano atual
const ano = new Date().getFullYear();
const temAno = html.includes(`<h3 class="year">${ano}</h3>`);

if (!temAno) {
  return res.status(200).json({ ranking: null, status: 'aguardando' });
}

// Extrai os vencedores do ano atual
const inicioAno = html.indexOf(`<h3 class="year">${ano}</h3>`);
const idxBox = html.indexOf('box-vencedores', inicioAno);
if (idxBox < 0) {
  return res.status(200).json({ ranking: null, status: 'sem_dados' });
}
const fimBloco = html.indexOf('</div>', idxBox + 200);
const bloco = html.substring(inicioAno, fimBloco + 10);

// Extrai cada colocado
const ranking = [];
const re = /<li>(\d+)º<\/li>\s*<li><strong>([^<]+)<\/strong>/g;
let m;
while ((m = re.exec(bloco)) !== null) {
  ranking.push({ pos: parseInt(m[1]), nome: m[2].trim(), petisco: '' });
}

if (ranking.length === 0) {
  return res.status(200).json({ ranking: null, status: 'sem_dados' });
}

return res.status(200).json({ ranking, status: 'finalizado', ano });
```

} catch (e) {
return res.status(200).json({ ranking: null, erro: String(e.message || ‘erro’) });
}
};