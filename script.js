
 var items = [
    { desc:'ESD Tweezer Set',           hsn:'82032000', qty:1,  unit:'Each', price:173.25, gst:18 },
    { desc:'CBL - 76 -16 Pin FRC Wire', hsn:'85446090', qty:20, unit:'Each', price:15.75,  gst:18 }
  ];
  var logoDataUrl = '';
  var sigDataUrl  = '';

  /* ── BOOT ── */
  window.addEventListener('DOMContentLoaded', function(){
    var today = new Date();
    document.getElementById('q-date').value =
      today.getFullYear()+'-'+String(today.getMonth()+1).padStart(2,'0')+'-'+String(today.getDate()).padStart(2,'0');
    initCanvas();
    renderItems();
    renderPreview();
    scaleSheet();
  });
  window.addEventListener('resize', scaleSheet);

  /* ── SCALE QUOTATION SHEET to fit screen ── */
  function scaleSheet(){
    var wrap  = document.getElementById('q-wrap');
    var sheet = document.getElementById('q-sheet');
    if(!wrap || !sheet) return;
    var sheetW = 794; /* ~210mm at 96dpi */
    var available = wrap.clientWidth - 4;
    if(available < sheetW){
      var scale = available / sheetW;
      sheet.style.transform = 'scale('+scale+')';
      sheet.style.marginBottom = '-' + Math.round(sheetW * (1-scale)) + 'px';
    } else {
      sheet.style.transform = 'none';
      sheet.style.marginBottom = '0';
    }
  }

  /* ── MOBILE TAB SWITCH ── */
  function mobSwitch(tab){
    var tabs = document.querySelectorAll('.mob-tab');
    tabs[0].classList.toggle('active', tab==='form');
    tabs[1].classList.toggle('active', tab==='preview');
    document.getElementById('form-panel').classList.toggle('mob-active', tab==='form');
    document.getElementById('preview-panel').classList.toggle('mob-active', tab==='preview');
    if(tab==='preview'){ renderPreview(); setTimeout(scaleSheet,50); }
  }
  function genAndSwitch(){ renderPreview(); mobSwitch('preview'); }

  /* ── DEBOUNCE ── */
  var _t = null;
  function autoRefresh(){ clearTimeout(_t); _t = setTimeout(renderPreview, 400); }

  /* ══ SIGNATURE DRAW PAD ══ */
  var canvas, ctx, drawing=false, hasMark=false;
  function initCanvas(){
    canvas=document.getElementById('sig-canvas'); if(!canvas) return;
    var dpr=window.devicePixelRatio||1;
    var w=canvas.offsetWidth||400, h=120;
    canvas.width=w*dpr; canvas.height=h*dpr;
    canvas.style.width='100%'; canvas.style.height='120px';
    ctx=canvas.getContext('2d');
    ctx.scale(dpr,dpr);
    ctx.strokeStyle='#000'; ctx.lineWidth=1.8; ctx.lineCap='round'; ctx.lineJoin='round';
    canvas.addEventListener('mousedown',  startDraw);
    canvas.addEventListener('mousemove',  drawMove);
    canvas.addEventListener('mouseup',    endDraw);
    canvas.addEventListener('mouseleave', endDraw);
    canvas.addEventListener('touchstart', function(e){e.preventDefault();startDraw(e.touches[0]);},{passive:false});
    canvas.addEventListener('touchmove',  function(e){e.preventDefault();drawMove(e.touches[0]);},{passive:false});
    canvas.addEventListener('touchend',   endDraw,{passive:false});
  }
  function getPos(e){ var r=canvas.getBoundingClientRect(); return {x:e.clientX-r.left, y:e.clientY-r.top}; }
  function startDraw(e){ drawing=true; hasMark=true; var p=getPos(e); ctx.beginPath(); ctx.moveTo(p.x,p.y); }
  function drawMove(e){ if(!drawing) return; var p=getPos(e); ctx.lineTo(p.x,p.y); ctx.stroke(); }
  function endDraw(){ drawing=false; ctx.beginPath(); }
  function clearCanvas(){ ctx.clearRect(0,0,canvas.width,canvas.height); hasMark=false; document.getElementById('draw-status').textContent=''; }
  function applyDrawnSig(){
    if(!hasMark){ alert('Please draw your signature first.'); return; }
    sigDataUrl=canvas.toDataURL('image/png');
    document.getElementById('draw-status').textContent='✓ Signature applied!';
    renderPreview();
  }

  /* ══ SIGNATURE UPLOAD ══ */
  function handleSigUpload(evt){
    var file=evt.target.files[0]; if(!file) return;
    var r=new FileReader();
    r.onload=function(e){ sigDataUrl=e.target.result; document.getElementById('sig-upload-preview').innerHTML='<img src="'+sigDataUrl+'" />'; renderPreview(); };
    r.readAsDataURL(file);
  }
  function removeSig(){ sigDataUrl=''; document.getElementById('sig-upload-preview').innerHTML='<span>No signature uploaded</span>'; renderPreview(); }
  function switchSigTab(tab){
    document.getElementById('tab-draw').classList.toggle('active',tab==='draw');
    document.getElementById('tab-upload').classList.toggle('active',tab==='upload');
    document.getElementById('panel-draw').classList.toggle('active',tab==='draw');
    document.getElementById('panel-upload').classList.toggle('active',tab==='upload');
  }

  /* ── LOGO ── */
  function handleLogo(evt){
    var file=evt.target.files[0]; if(!file) return;
    var r=new FileReader();
    r.onload=function(e){ logoDataUrl=e.target.result; document.getElementById('logo-preview-box').innerHTML='<img src="'+logoDataUrl+'" />'; renderPreview(); };
    r.readAsDataURL(file);
  }
  function removeLogo(){ logoDataUrl=''; document.getElementById('logo-preview-box').innerHTML='<span>No logo</span>'; renderPreview(); }

  /* ── ITEMS ── */
  function gstOpts(sel){ var o=''; [0,5,12,18,28].forEach(function(v){ o+='<option value="'+v+'"'+(v===sel?' selected':'')+'>'+v+'%</option>'; }); return o; }
  function renderItems(){
    var tb=document.getElementById('items-body'); if(!tb) return; tb.innerHTML='';
    for(var i=0;i<items.length;i++){
      (function(idx){
        var it=items[idx], tr=document.createElement('tr');
        tr.innerHTML=
          '<td><input value="'+xe(it.desc)+'" oninput="items['+idx+'].desc=this.value;autoRefresh()"/></td>'+
          '<td><input value="'+xe(it.hsn)+'" oninput="items['+idx+'].hsn=this.value;autoRefresh()"/></td>'+
          '<td><input type="number" value="'+it.qty+'" min="0" step="0.01" style="width:44px" oninput="items['+idx+'].qty=+(this.value)||0;autoRefresh()"/></td>'+
          '<td><input value="'+xe(it.unit)+'" style="width:44px" oninput="items['+idx+'].unit=this.value;autoRefresh()"/></td>'+
          '<td><input type="number" value="'+it.price+'" min="0" step="0.01" oninput="items['+idx+'].price=+(this.value)||0;autoRefresh()"/></td>'+
          '<td><select onchange="items['+idx+'].gst=+(this.value);autoRefresh()">'+gstOpts(it.gst)+'</select></td>'+
          '<td style="text-align:right;padding:2px 5px;font-size:10.5px;">'+(it.qty*it.price).toFixed(2)+'</td>'+
          '<td><button class="btn-rm" onclick="rmItem('+idx+')" title="Remove">&#10005;</button></td>';
        tb.appendChild(tr);
      })(i);
    }
  }
  function addItem(){ items.push({desc:'',hsn:'',qty:1,unit:'Each',price:0,gst:18}); renderItems(); renderPreview(); }
  function rmItem(i){ items.splice(i,1); renderItems(); renderPreview(); }

  /* ── UTILS ── */
  function xe(s){ return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function gv(id){ var el=document.getElementById(id); return el?el.value.trim():''; }
  function fmtDate(s){ if(!s) return ''; var p=s.split('-'); if(p.length!==3) return s; return p[2]+'-'+p[1]+'-'+p[0]; }
  function toWords(n){
    var o=['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen'];
    var t=['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];
    function h(x){return x<20?o[x]:t[Math.floor(x/10)]+(x%10?' '+o[x%10]:'');}
    function th(x){return x>=100?o[Math.floor(x/100)]+' Hundred'+(x%100?' '+h(x%100):''):h(x);}
    var m=Math.round(n),r='';
    if(!m) return 'Zero';
    if(m>=10000000){r+=th(Math.floor(m/10000000))+' Crore '; m%=10000000;}
    if(m>=100000)  {r+=th(Math.floor(m/100000))+' Lakh ';   m%=100000;}
    if(m>=1000)    {r+=th(Math.floor(m/1000))+' Thousand '; m%=1000;}
    if(m>=100)     {r+=o[Math.floor(m/100)]+' Hundred ';    m%=100;}
    if(m>0)         r+=h(m);
    return r.trim();
  }

  /* ── MAIN RENDER ── */
  function renderPreview(){
    var sheet=document.getElementById('q-sheet'); if(!sheet) return;
    var transport=parseFloat(gv('transport'))||0;
    var transportGst=parseFloat(gv('transport-gst'))||0;
    var groups={};
    function addG(rate,amt){ var k=String(rate); if(!groups[k]) groups[k]={taxable:0,cgst:0,sgst:0}; groups[k].taxable+=amt; groups[k].cgst+=amt*(rate/2)/100; groups[k].sgst+=amt*(rate/2)/100; }
    var rows='',tqty=0,subtotal=0;
    for(var k=0;k<items.length;k++){
      var it=items[k],amt=it.qty*it.price; subtotal+=amt; tqty+=it.qty; addG(it.gst,amt);
      rows+='<tr><td class="tc">'+(k+1)+'.</td><td>'+xe(it.desc)+'</td><td class="tc">'+xe(it.hsn)+'</td>'+
        '<td class="tr">'+it.qty.toFixed(2)+'</td><td class="tc">'+xe(it.unit)+'</td>'+
        '<td class="tr">'+it.price.toFixed(2)+'</td><td class="tr">'+amt.toFixed(2)+'</td></tr>';
    }
    if(transport>0){
      tqty+=1; addG(transportGst,transport);
      rows+='<tr><td class="tc">'+(items.length+1)+'.</td><td>Transport Charges</td><td class="tc">8704</td>'+
        '<td class="tr">1.00</td><td class="tc">Each</td>'+
        '<td class="tr">'+transport.toFixed(2)+'</td><td class="tr">'+transport.toFixed(2)+'</td></tr>';
    }
    var fill=Math.max(0,10-items.length-(transport>0?1:0));
    for(var f=0;f<fill;f++) rows+='<tr><td colspan="7" style="height:17px;border:1px solid #000;">&nbsp;</td></tr>';
    var taxableTotal=subtotal+transport,totalCgst=0,totalSgst=0;
    var sortedKeys=Object.keys(groups).sort(function(a,b){return +a-+b;});
    sortedKeys.forEach(function(k){ totalCgst+=groups[k].cgst; totalSgst+=groups[k].sgst; });
    var preRound=taxableTotal+totalCgst+totalSgst,grand=Math.round(preRound),roff=preRound-grand;
    rows+='<tr><td colspan="6" style="border:none;border-bottom:1px solid #000;">&nbsp;</td><td class="tr" style="border:1px solid #000;">'+taxableTotal.toFixed(2)+'</td></tr>';
    sortedKeys.forEach(function(rk){
      if(parseFloat(rk)===0) return;
      var g=groups[rk],half=parseFloat(rk)/2;
      rows+='<tr><td colspan="5" style="border:none;"></td><td style="border:none;text-align:right;padding-right:4px;font-size:8.5pt;">Add : SGST @ '+half.toFixed(2)+' %</td><td class="tr" style="border:1px solid #000;">'+g.sgst.toFixed(2)+'</td></tr>'+
        '<tr><td colspan="5" style="border:none;"></td><td style="border:none;text-align:right;padding-right:4px;font-size:8.5pt;">Add : CGST @ '+half.toFixed(2)+' %</td><td class="tr" style="border:1px solid #000;">'+g.cgst.toFixed(2)+'</td></tr>';
    });
    if(Math.abs(roff)>0.001) rows+='<tr><td colspan="5" style="border:none;"></td><td style="border:none;text-align:right;padding-right:4px;font-size:8.5pt;">Less : Rounded Off (-)</td><td class="tr" style="border:1px solid #000;">'+Math.abs(roff).toFixed(2)+'</td></tr>';
    rows+='<tr><td colspan="3" style="border:none;"></td><td colspan="2" style="border:1px solid #000;text-align:center;font-weight:bold;font-size:8.5pt;">Grand Total</td><td style="border:1px solid #000;text-align:center;font-weight:bold;font-size:8.5pt;">'+tqty.toFixed(2)+' Each</td><td style="border:1px solid #000;text-align:right;font-weight:bold;padding:3px 5px;font-size:8.5pt;">'+grand.toFixed(2)+'</td></tr>';
    var taxTbl='';
    if(sortedKeys.length>0){
      taxTbl='<table class="qtax"><thead><tr><th>Tax Rate</th><th>Taxable Amt.</th><th>CGST Amt.</th><th>SGST Amt.</th><th>Total Tax</th></tr></thead><tbody>';
      var gT=0,gTax=0,gC=0,gS=0;
      sortedKeys.forEach(function(rk){ var g=groups[rk],ttl=g.cgst+g.sgst; gTax+=g.taxable;gC+=g.cgst;gS+=g.sgst;gT+=ttl;
        taxTbl+='<tr><td>'+rk+'%</td><td class="tr">'+g.taxable.toFixed(2)+'</td><td class="tr">'+g.cgst.toFixed(2)+'</td><td class="tr">'+g.sgst.toFixed(2)+'</td><td class="tr">'+ttl.toFixed(2)+'</td></tr>';
      });
      if(sortedKeys.length>1) taxTbl+='<tr style="font-weight:bold;"><td>Total</td><td class="tr">'+gTax.toFixed(2)+'</td><td class="tr">'+gC.toFixed(2)+'</td><td class="tr">'+gS.toFixed(2)+'</td><td class="tr">'+gT.toFixed(2)+'</td></tr>';
      taxTbl+='</tbody></table>';
    }
    var logoHtml=logoDataUrl?'<div class="qh-logo"><img src="'+logoDataUrl+'" /></div>':'<div class="qh-logo"><div class="qh-logo-ph">RK<br>ENT.</div></div>';
    var sigBlock=sigDataUrl?'<div class="qfoot-sig-img"><img src="'+sigDataUrl+'" /></div>':'<div class="qfoot-gap"></div>';
    sheet.innerHTML=
      '<div class="qh-wrap"><div class="qh-center">'+
        '<div class="qh-sq">Sales Quotation</div>'+
        '<div class="qh-co">'+xe(gv('s-name'))+'</div>'+
        '<div class="qh-sub">'+xe(gv('s-addr').replace(/\n/g,', '))+'</div>'+
        '<div class="qh-sub">PAN : '+xe(gv('s-pan'))+'</div>'+
        '<div class="qh-sub">GSTIN : '+xe(gv('s-gst'))+'</div>'+
        '<div class="qh-sub">Tel. : '+xe(gv('s-phone'))+'&nbsp;&nbsp; email : '+xe(gv('s-email'))+'</div>'+
      '</div>'+logoHtml+'</div>'+
      '<div class="qpm-wrap"><div class="qpm-left">'+
        '<div class="qpm-lbl">Party Details :</div>'+
        '<div>'+xe(gv('b-name'))+'</div>'+
        '<div style="white-space:pre-wrap;">'+xe(gv('b-addr'))+'</div>'+
        '<div style="margin-top:4px;">GSTIN / UIN &nbsp; : &nbsp;'+xe(gv('b-gst'))+'</div>'+
      '</div><div class="qpm-right">'+
        '<div><span class="qpm-key">Quotation No.</span> : '+xe(gv('q-no'))+'</div>'+
        '<div><span class="qpm-key">Dated</span> : '+fmtDate(gv('q-date'))+'</div>'+
      '</div></div>'+
      '<div class="qsubj">QUOTATION FOR '+xe(gv('q-subj')).toUpperCase()+'</div>'+
      '<table class="qit"><thead><tr>'+
        '<th style="width:5%">S.N.</th><th class="tl" style="width:35%">Description of Goods</th>'+
        '<th style="width:11%">HSN/SAC<br>Code</th><th style="width:8%">Qty.</th>'+
        '<th style="width:7%">Unit</th><th style="width:11%">Price</th><th style="width:14%">Amount(Rs.&nbsp;)</th>'+
      '</tr></thead><tbody>'+rows+'</tbody></table>'+
      taxTbl+
      '<div class="qwords">Rupees '+toWords(grand)+' Only</div>'+
      '<div class="qfoot"><div class="qfoot-sig">'+sigBlock+'<div>'+xe(gv('signatory'))+'</div><div style="margin-top:2px;">Authorised Signatory</div></div></div>';
    setTimeout(scaleSheet, 50);
  }

  function doPrint(){ renderPreview(); setTimeout(function(){ window.print(); },300); }

  function dlHTML(){
    renderPreview();
    var st='<sc'+'ript id="__st__">items='+JSON.stringify(items)+';logoDataUrl='+JSON.stringify(logoDataUrl)+';sigDataUrl='+JSON.stringify(sigDataUrl)+';'+
      'window.addEventListener("DOMContentLoaded",function(){'+
        'if(logoDataUrl) document.getElementById("logo-preview-box").innerHTML=\'<img src="\'+logoDataUrl+\'" />\';'+
        'if(sigDataUrl) document.getElementById("sig-upload-preview").innerHTML=\'<img src="\'+sigDataUrl+\'" />\';'+
      '});<\/sc'+'ript>';
    var src=document.documentElement.outerHTML;
    src=src.replace('<\/body>',st+'<\/body>');
    var blob=new Blob([src],{type:'text/html'});
    var a=document.createElement('a');
    a.href=URL.createObjectURL(blob); a.download='RK_Quotation_Maker.html'; a.click();
    URL.revokeObjectURL(a.href);
  }

 // GSTIN AUTO-FILL MAP
var gstMap = {
  "sahyadri":            "27AADCS9911L1ZW",
  "symbiosis":           "27AABTS4503R1Z1",
  "lupin manufacturing": "27AAFCL4868F1Z8",
  "lupin":               "27AAACL1069K1ZF",
  "ruby hall":           "27AAATP1145P1Z9",
  "schaeffler":          "27ABICS9269F1ZR",
  "yashada":             "27AAATY0693H1Z6",
  "ensono":              "29AAGFE9254N1ZP",
  "godrej":              "27AAACG1395D1ZU",
  "ecolab":              "27AAGCE6482K1Z5",
  "rieter":              "27AAACR3556P1ZV",
  "alada":               "27AATCA5591J1ZY",
  "surya hospital":      "27AACCS9236M1ZT",
  "nilesh gaikwad":      "27AAECN3691H1Z8",
  "hmh":                 "27AAGCH6858Q1ZM"
};

// Sort longest-first so "lupin manufacturing" matches before "lupin"
var gstKeys = Object.keys(gstMap).sort(function(a, b) {
  return b.length - a.length;
});

function autoFillGSTIN(name) {
  var input = name.toLowerCase();
  var hint  = document.getElementById('gstin-hint');
  var field = document.getElementById('b-gst');

  for (var i = 0; i < gstKeys.length; i++) {
    if (input.includes(gstKeys[i])) {
      var found = gstMap[gstKeys[i]];
      field.value = found;
      hint.innerHTML = '<span style="color:#27ae60;font-weight:600;">&#10003; Auto-filled: ' + found + '</span>';
      return;
    }
  }
  hint.innerHTML = '<span style="color:#aaa;">Type a known company name to auto-fill GSTIN</span>';
}

