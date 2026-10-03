const huffmanPage = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Huffman Coding Lab</title>
<style>
*{box-sizing:border-box}body{margin:0;background:#eef2f6;color:#182334;font:16px system-ui,sans-serif}main{max-width:1150px;margin:36px auto;padding:0 20px}h1{margin-bottom:6px}p{line-height:1.6}.card{background:white;border:1px solid #dbe2ea;border-radius:16px;padding:20px;margin:18px 0}.controls{display:flex;gap:10px;flex-wrap:wrap;align-items:center}textarea{width:100%;min-height:90px;padding:12px;border:1px solid #aab8ca;border-radius:8px;font:inherit;resize:vertical}button{padding:11px 16px;border:0;border-radius:8px;background:#e7edf6;color:#182334;font:inherit;cursor:pointer}button:disabled{opacity:.4;cursor:default}#canvas{overflow:auto}svg{display:block;min-width:100%;height:auto;transform:scale(.7);transform-origin:top center}#error{color:#b6203b;min-height:24px}#bits{font:600 1.25rem ui-monospace,monospace;overflow-wrap:anywhere;line-height:1.8}.muted{color:#526477;font-size:14px}table{border-collapse:collapse;width:100%}th,td{padding:10px;text-align:left;border-bottom:1px solid #dbe2ea}code{background:#eef2f6;padding:2px 5px}
</style>
</head>
<body>
<main>
<h1>Huffman Coding</h1>
<p>Build a frequency-based binary tree, then encode each character using its root-to-leaf bits.</p>
<section class="card">
<label for="text">Text to encode</label>
<textarea id="text" maxlength="120" spellcheck="false">HUFFMAN CODING</textarea>
<div class="controls"><button id="build">Build tree and encode</button><button id="example">Load example</button><span class="muted">Up to 120 characters</span></div>
<p id="error" role="status" aria-live="polite"></p>
</section>
<section class="card">
<h2>Huffman tree</h2>
<p class="muted">Each edge is labelled 0 (left) or 1 (right); leaf labels show the character and its frequency.</p>
<div id="canvas"><svg id="tree" role="img" aria-label="Huffman coding tree"></svg></div>
</section>
<section class="card">
<h2>Encoded bits</h2>
<p id="bits" aria-live="polite"></p>
<p id="bit-count" class="muted"></p>
</section>
<section class="card">
<h2>Character codes</h2>
<div id="codes"></div>
</section>
</main>
<script>
'use strict';
const $=id=>document.getElementById(id);
let root=null,codeMap=new Map(),text='';
function symbolLabel(symbol){if(symbol===' ')return 'Space';if(symbol==='\\n')return 'Line break';if(symbol==='\\t')return 'Tab';return symbol;}
function makeTree(input){
 const counts=new Map();
 for(const symbol of Array.from(input))counts.set(symbol,(counts.get(symbol)||0)+1);
 let order=0;
 const queue=Array.from(counts,([symbol,frequency])=>({symbol,frequency,order:order++,left:null,right:null}));
 while(queue.length>1){
  queue.sort((a,b)=>a.frequency-b.frequency||a.order-b.order);
  const left=queue.shift(),right=queue.shift();
  queue.push({symbol:null,frequency:left.frequency+right.frequency,order:order++,left,right});
 }
 return {root:queue[0],counts};
}
function collectCodes(node,prefix,map){
 if(node.symbol!==null){map.set(node.symbol,prefix||'0');return;}
 collectCodes(node.left,prefix+'0',map);
 collectCodes(node.right,prefix+'1',map);
}
function draw(){
 const svg=$('tree');
 svg.replaceChildren();
 if(!root)return;
 const leaves=[];
 const gather=node=>{if(node.symbol!==null){leaves.push(node);return;}gather(node.left);gather(node.right);};
 gather(root);
 const width=Math.max(640,leaves.length*120),positions=new Map();
 let nextLeaf=0,maxDepth=0;
 const layout=(node,depth)=>{
  maxDepth=Math.max(maxDepth,depth);
  if(node.symbol!==null){const pos={x:60+nextLeaf++*120,y:55+depth*100};positions.set(node,pos);return pos;}
  const left=layout(node.left,depth+1),right=layout(node.right,depth+1);
  const pos={x:(left.x+right.x)/2,y:55+depth*100};
  positions.set(node,pos);
  return pos;
 };
 layout(root,0);
 const height=Math.max(190,maxDepth*100+120);
 svg.setAttribute('viewBox','0 0 '+width+' '+height);
 svg.style.width=width+'px';
 const el=(tag,attrs,label)=>{
  const item=document.createElementNS('http://www.w3.org/2000/svg',tag);
  for(const [key,value] of Object.entries(attrs))item.setAttribute(key,value);
  if(label!==undefined)item.textContent=label;
  svg.appendChild(item);
  return item;
 };
 const edges=(node,code)=>{
  if(node.symbol!==null)return;
  for(const [child,bit] of [[node.left,'0'],[node.right,'1']]){
   const from=positions.get(node),to=positions.get(child),mx=(from.x+to.x)/2,my=(from.y+to.y)/2;
   el('line',{x1:from.x,y1:from.y+22,x2:to.x,y2:to.y-22,stroke:'#9baac0','stroke-width':2});
   el('text',{x:mx+7,y:my,'text-anchor':'middle',fill:'#526477','font-size':14,'font-weight':700},bit);
   edges(child,code+bit);
  }
 };
 edges(root,'');
 for(const [node,pos] of positions){
  const leaf=node.symbol!==null,label=leaf?symbolLabel(node.symbol):String(node.frequency);
  el('circle',{cx:pos.x,cy:pos.y,r:25,fill:leaf?'#247447':'#202c3f',stroke:'white','stroke-width':2});
  el('text',{x:pos.x,y:pos.y+5,'text-anchor':'middle',fill:'white','font-size':label.length>4?10:13},label);
  if(leaf)el('text',{x:pos.x,y:pos.y+43,'text-anchor':'middle',fill:'#526477','font-size':12},String(node.frequency));
 }
};
function build(){
 text=$('text').value.toUpperCase();
 $('text').value=text;
 const symbols=Array.from(text);
 if(!symbols.length){$('error').textContent='Enter some text to encode.';return;}
 if(symbols.length>120){$('error').textContent='Enter no more than 120 characters.';return;}
 $('error').textContent='';
 const result=makeTree(text);
 root=result.root;
 codeMap=new Map();
 collectCodes(root,'',codeMap);
 draw();
 const encoded=symbols.map(symbol=>codeMap.get(symbol));
 $('bits').textContent=encoded.join(' ');
 $('bit-count').textContent=encoded.join('').length+' bits for '+symbols.length+' characters.';
 const rows=Array.from(result.counts,([symbol,frequency])=>({symbol,frequency,code:codeMap.get(symbol)}))
  .sort((a,b)=>a.frequency-b.frequency||a.symbol.localeCompare(b.symbol));
 const table=document.createElement('table');
 const head=document.createElement('thead'),headerRow=document.createElement('tr');
 for(const label of ['Character','Frequency','Code']){const cell=document.createElement('th');cell.textContent=label;headerRow.appendChild(cell);}
 head.appendChild(headerRow);table.appendChild(head);
 const body=document.createElement('tbody');
 for(const row of rows){const tr=document.createElement('tr');for(const value of [symbolLabel(row.symbol),String(row.frequency),row.code]){const td=document.createElement('td');td.textContent=value;tr.appendChild(td);}body.appendChild(tr);}
 table.appendChild(body);
 $('codes').replaceChildren(table);
}
$('build').onclick=build;
$('example').onclick=()=>{$('text').value='HUFFMAN CODING';build();};
$('text').oninput=()=>{
 const field=$('text'),start=field.selectionStart,end=field.selectionEnd,upper=field.value.toUpperCase();
 if(field.value!==upper){field.value=upper;field.setSelectionRange(field.value.slice(0,start).length,field.value.slice(0,end).length);}
};
$('text').onkeydown=event=>{if(event.ctrlKey&&event.key==='Enter')build();};
build();
</script>
</body>
</html>`;

sources.huffman = huffmanPage;
const link = document.createElement('a');
link.href = '#huffman';
link.textContent = 'Huffman coding';
document.querySelector('nav').append(link);
route();
function setHuffmanTitle() {
  const frame = Array.from(document.querySelectorAll('#pages iframe'))
    .find(item => item.srcdoc.includes('<title>Huffman Coding Lab</title>'));
  if (frame) frame.title = 'Huffman coding';
}
window.addEventListener('hashchange', setHuffmanTitle);
setHuffmanTitle();
