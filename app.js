'use strict';
const $=id=>document.getElementById(id),KEY='th19-notebook-v1',ORDERKEY=KEY+'-order-v3',DRAFTKEY=KEY+'-draft';
const LANES=['Constructores','Laboratorio','Mascotas'];
const TYPES={Constructores:[['Army','Ejército'],['Defense','Defensa'],['Hero','Héroes'],['Resource','Recursos'],['New','Nuevo'],['Permanent','Permanente']],Laboratorio:[['Troops','Tropas'],['Spells','Hechizos'],['Siege','Asedio'],['Squads','Escuadrones']],Mascotas:[]};
const UI={Oro:'https://static.wikia.nocookie.net/clashofclans/images/1/10/Gold.png/revision/latest?cb=20180110234054',Elixir:'https://static.wikia.nocookie.net/clashofclans/images/4/43/Elixir.png/revision/latest?cb=20180110233824','Elixir oscuro':'https://static.wikia.nocookie.net/clashofclans/images/4/4e/Dark_Elixir.png/revision/latest?cb=20180110233856',villager:'https://static.wikia.nocookie.net/clashofclans/images/6/61/Villager_info.png/revision/latest?cb=20251226214655',hammer:'https://static.wikia.nocookie.net/clashofclans/images/6/6b/Hammer_of_Building.png/revision/latest?cb=20181023123704'};
const SMASHER='https://static.wikia.nocookie.net/clashofclans/images/d/db/Guardians_Smasher_info2.png/revision/latest/scale-to-width-down/200?cb=20251115155828';
let db=TH19Model.normalize({version:1,items:SEED,history:[]}),images={},lane='Constructores',showCompleted=false;
let orders={},modes={},resources=new Set(),types=new Set(),undoState=null,draft=null,original='',jsonMode=false,autoTimer,storageError=false,importKind='progress',dragId=null,touchDrag=null;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let builderBoost=0;
const PASSKEY=KEY+'-builder-pass',passMonth=()=>new Date().getFullYear()+'-'+String(new Date().getMonth()+1).padStart(2,'0');
const taskLabel=x=>`${x.name}${x.showUnit?' · '+x.unit:''} · ${x.isNew?'NEW':x.target}`;
const options=values=>values.map(value=>`<option>${esc(value)}</option>`).join('');
function valid(x){
 if(!x||typeof x.id!=='string'||typeof x.name!=='string'||!x.name.trim()||x.name.length>120||!LANES.includes(x.lane)||!CATEGORIES.includes(x.category)||typeof x.type!=='string')throw Error('Revisa el nombre, la sección y el lugar.');
 for(const k of ['base','target','unit','quantity','completed','priority'])if(!Number.isSafeInteger(x[k]))throw Error('Los niveles y unidades deben ser enteros.');
 if(x.base<0||x.target!==x.base+1||x.target>999||x.unit<1||x.unit>999||x.quantity!==1||![0,1].includes(x.completed)||x.priority<1||x.priority>3)throw Error('Cada tarea corresponde a una unidad y un nivel.');
 for(const k of ['cost','hours'])if(x[k]!=null&&(!Number.isFinite(x[k])||x[k]<0))throw Error('Coste y tiempo deben ser positivos.');
 if(x.image&&!/^https:\/\//i.test(x.image))throw Error('La imagen debe usar HTTPS.');
 if(x.end&&!Number.isFinite(new Date(x.end).getTime()))throw Error('La fecha no es válida.');
 if(x.isNew&&(x.base!==0||x.target!==1))throw Error('New corresponde al nivel 1.');
 return x;
}
function notify(text){$('notice').textContent=text;}
function checkpoint(){undoState=structuredClone({db,orders,modes});}
function save(message){
 try{localStorage.setItem(KEY,JSON.stringify(db));localStorage.setItem(ORDERKEY,JSON.stringify({orders,modes}));storageError=false;notify(message||'Guardado automáticamente');}
 catch{storageError=true;notify('No se pudo guardar. Exporta tus copias antes de cerrar.');}
 render();return !storageError;
}
function mode(){return modes[lane]||'costmax';}
function ordered(section=lane){
 const list=db.items.filter(x=>x.lane===section),sorting=modes[section]||'costmax';
 if(sorting!=='manual')return list.sort((a,b)=>TH19Model.costCompare(a,b,sorting));
 const rank=new Map((orders[section]||[]).map((id,index)=>[id,index]));
 return list.sort((a,b)=>(rank.get(a.id)??1e9)-(rank.get(b.id)??1e9)||TH19Model.costCompare(a,b));
}
function matchesType(x){
 if(!types.size)return true;
 const regular=[...types].filter(t=>!['Nuevo','Permanente'].includes(t));
 return (!regular.length||regular.includes(x.type))&&((!types.has('Nuevo')&&!types.has('Permanente'))||(types.has('Nuevo')&&x.isNew)||(types.has('Permanente')&&!x.isNew));
}
function visible(){const q=$('search').value.toLocaleLowerCase('es');return ordered().filter(x=>(showCompleted||x.completed===0)&&(!resources.size||resources.has(x.resource))&&matchesType(x)&&taskLabel(x).toLocaleLowerCase('es').includes(q));}
function icon(name){const specific={villager:'https://static.wikia.nocookie.net/clashofclans/images/0/04/Builder_Icon.png/revision/latest?cb=20230304204110',heroHammer:'https://static.wikia.nocookie.net/clashofclans/images/b/b5/Hammer_of_Heroes.png/revision/latest?cb=20181023123750',spellHammer:'https://static.wikia.nocookie.net/clashofclans/images/e/ed/Hammer_of_Spells.png/revision/latest?cb=20181023123725',troopHammer:'https://static.wikia.nocookie.net/clashofclans/images/2/25/Hammer_of_Fighting.png/revision/latest?cb=20181023123644',cancel:'https://static.wikia.nocookie.net/clashofclans/images/c/c6/Icon_Cancel.png'};return `<img src="${specific[name]||UI[name]}" alt="" referrerpolicy="no-referrer" draggable="false">`;}
function hammerFor(x){return x.lane==='Mascotas'||x.category==='Héroes'?'heroHammer':x.lane==='Laboratorio'?(x.type==='Hechizos'?'spellHammer':'troopHammer'):'hammer';}
function art(x){const meta=(x.type==='Escuadrones'?images['squad:'+x.name]:null)||images[x.asset]||images[x.name],src=x.image||(x.name==='Destructor'?SMASHER:meta?.src);return `<div class="art" title="${esc(taskLabel(x))}">${src?`<img src="${esc(src)}" alt="${esc(x.name)}" referrerpolicy="no-referrer" loading="lazy" draggable="false">`:'<span class="missingart" aria-hidden="true"></span>'}<span class="level">${x.isNew?'NEW':x.target}</span></div>`;}
function time(hours){if(hours==null)return '';const minutes=Math.round(hours*60),days=Math.floor(minutes/1440),h=Math.floor(minutes%1440/60),m=minutes%60;return [days?days+'d':'',h?h+'h':'',m?m+'m':''].filter(Boolean).join(' ')||'0m';}
function card(x){
 const done=x.completed===1,working=!done&&!!x.building;
 const values=TH19Model.boosted(x,builderBoost);
 const metadata=[values.cost!=null?Number(values.cost).toLocaleString('es-ES'):'',time(values.hours)].filter(Boolean).map(esc).join(' · ');
 return `<article class="upgrade ${done?'done':working?'working':''}" data-id="${esc(x.id)}" draggable="false" tabindex="${done?-1:0}" aria-label="${esc(taskLabel(x)+(done?' · terminada':working?' · construyendo':''))}" aria-keyshortcuts="Alt+ArrowUp Alt+ArrowDown">
 ${art(x)}<div class="cardcopy"><button class="cardname" data-action="edit" ${done?'disabled':''}>${esc(x.name)}${x.showUnit?' · '+x.unit:''}</button>${metadata?`<span class="cardmeta">${metadata}</span>`:''}</div>
 <button class="actionicon ${done?'reserved':working?'working':''}" data-action="build" ${done?'disabled':''} aria-pressed="${working}" ${done?'aria-hidden="true" tabindex="-1"':''} aria-label="${esc((working?'Quitar constructor de ':'Poner a construir ')+taskLabel(x))}" title="${working?'Quitar constructor':'Poner a construir'}">${icon('villager')}</button>
 <button class="actionicon ${done?'finished':'finish'}" data-action="${done?'reopen':'finish'}" aria-pressed="${done}" aria-label="${esc((done?'Marcar pendiente ':'Terminar ')+taskLabel(x))}" title="${done?'Marcar pendiente':'Terminar'}">${done?icon('cancel'):icon(hammerFor(x))}</button></article>`;
}
function render(){
 $('passlabel').textContent='Pase · '+builderBoost+' %';$('openpass').setAttribute('aria-pressed',builderBoost>0);$('passoptions').querySelectorAll('[data-boost]').forEach(b=>b.setAttribute('aria-pressed',Number(b.dataset.boost)===builderBoost));
 const done=db.items.filter(x=>x.completed===1).length;$('total').textContent=done+' / '+db.items.length;$('undo').disabled=!undoState;
 $('lanes').innerHTML=LANES.map(l=>`<button data-lane="${l}" aria-pressed="${lane===l}">${l}<small>${db.items.filter(x=>x.lane===l&&x.completed===0).length}</small></button>`).join('');
 $('showcompleted').textContent=showCompleted?'Ocultar terminadas':'Mostrar terminadas';$('showcompleted').setAttribute('aria-pressed',showCompleted);
 const list=visible();$('viewinfo').textContent=list.length+' mejoras · '+(mode()==='manual'?'Orden manual':mode()==='costmin'?'Cost Min':'Cost Max');$('manualsort').hidden=!orders[lane]?.length;$('manualsort').setAttribute('aria-pressed',mode()==='manual');
 $('board').innerHTML=list.length?list.map(card).join(''):'<div class="empty"><p>No hay mejoras con estos filtros.</p><button id="clearfilters">Limpiar filtros</button></div>';
 $('board').querySelectorAll('.art img').forEach(img=>img.onerror=()=>{img.hidden=true;});
 renderFilters();renderManager();
}
function renderFilters(){
 const resourceList=lane==='Constructores'?['Oro','Elixir','Elixir oscuro']:lane==='Laboratorio'?['Elixir','Elixir oscuro']:['Elixir oscuro'];
 $('resourcefilters').style.gridTemplateColumns='repeat('+resourceList.length+',minmax(0,1fr))';
 $('resourcefilters').innerHTML=resourceList.map(r=>`<button data-resource="${esc(r)}" aria-label="${r}" title="${r}" aria-pressed="${resources.has(r)}">${icon(r)}</button>`).join('');
 $('typefieldset').hidden=!TYPES[lane].length;$('typefilters').innerHTML=TYPES[lane].map(([english,value])=>`<button data-type="${value}" aria-pressed="${types.has(value)}">${english}</button>`).join('');
 $('sorting').querySelectorAll('[data-sort]').forEach(button=>button.setAttribute('aria-pressed',mode()===button.dataset.sort));$('filtercount').textContent=resources.size+types.size?'('+ (resources.size+types.size)+')':'';
}
function renderManager(){
 const selected=$('movetask').value,oldReopen=$('reopentask').value;
 $('movetask').innerHTML=ordered().filter(x=>x.completed===0).map(x=>`<option value="${esc(x.id)}">${esc(taskLabel(x))}</option>`).join('');if([...$('movetask').options].some(x=>x.value===selected))$('movetask').value=selected;
 $('reopentask').innerHTML=db.items.filter(x=>x.completed===1).map(x=>`<option value="${esc(x.id)}">${esc(taskLabel(x))}</option>`).join('');if([...$('reopentask').options].some(x=>x.value===oldReopen))$('reopentask').value=oldReopen;
 $('reopen').disabled=!$('reopentask').options.length;$('applymove').disabled=!$('movetask').options.length;
}
function moveCard(source,target,after=false){
 const x=db.items.find(x=>x.id===source),y=db.items.find(x=>x.id===target);if(!x||!y||x.completed||y.completed||x.lane!==y.lane||source===target)return;
 checkpoint();orders[x.lane]=TH19Model.reorder(ordered(x.lane).map(x=>x.id),source,target,after);modes[x.lane]='manual';save('Orden guardado');
}
function clearDrop(){for(const node of $('board').querySelectorAll('.dropbefore,.dropafter,.dragging'))node.classList.remove('dropbefore','dropafter','dragging');}
function dropSide(card,event){const box=card.getBoundingClientRect();return event.clientY>box.top+box.height*.6||Math.abs(event.clientY-box.top-box.height/2)<box.height*.3&&event.clientX>box.left+box.width/2;}
$('board').ondragstart=e=>{const node=e.target.closest('.upgrade');if(!node||node.classList.contains('done')||e.target.closest('button')){e.preventDefault();return;}dragId=node.dataset.id;e.dataTransfer.setData('text/plain',dragId);e.dataTransfer.effectAllowed='move';node.classList.add('dragging');};
$('board').ondragover=e=>{const node=e.target.closest('.upgrade');if(!dragId||!node||node.classList.contains('done'))return;e.preventDefault();for(const previous of $('board').querySelectorAll('.dropbefore,.dropafter'))previous.classList.remove('dropbefore','dropafter');node.classList.add(dropSide(node,e)?'dropafter':'dropbefore');};
$('board').ondrop=e=>{e.preventDefault();const node=e.target.closest('.upgrade'),id=dragId;dragId=null;if(node&&id)moveCard(id,node.dataset.id,dropSide(node,e));clearDrop();};$('board').ondragend=()=>{dragId=null;clearDrop();};
$('board').onpointerdown=e=>{if(e.target.closest('button')||(e.pointerType==='touch'&&!e.target.closest('.art')))return;const node=e.target.closest('.upgrade');if(!node||node.classList.contains('done'))return;touchDrag={id:node.dataset.id,startX:e.clientX,startY:e.clientY,pointer:e.pointerId,active:false,target:null};$('board').setPointerCapture(e.pointerId);};
$('board').onpointermove=e=>{if(!touchDrag||e.pointerId!==touchDrag.pointer)return;if(Math.hypot(e.clientX-touchDrag.startX,e.clientY-touchDrag.startY)<7&&!touchDrag.active)return;touchDrag.active=true;e.preventDefault();const node=document.elementFromPoint(e.clientX,e.clientY)?.closest('.upgrade');clearDrop();if(node&&!node.classList.contains('done')){touchDrag.target=node.dataset.id;touchDrag.after=dropSide(node,e);node.classList.add(touchDrag.after?'dropafter':'dropbefore');}};
$('board').onpointerup=e=>{if(!touchDrag)return;const drag=touchDrag;touchDrag=null;if($('board').hasPointerCapture(e.pointerId))$('board').releasePointerCapture(e.pointerId);if(drag.active&&drag.target)moveCard(drag.id,drag.target,drag.after);clearDrop();};$('board').onpointercancel=()=>{touchDrag=null;clearDrop();};
$('board').onkeydown=e=>{const node=e.target.closest('.upgrade');if(!node||!e.altKey||!['ArrowUp','ArrowDown'].includes(e.key))return;e.preventDefault();const list=visible().filter(x=>x.completed===0),at=list.findIndex(x=>x.id===node.dataset.id),next=at+(e.key==='ArrowUp'?-1:1);if(next>=0&&next<list.length){moveCard(node.dataset.id,list[next].id,e.key==='ArrowDown');$('board').querySelector(`[data-id="${CSS.escape(node.dataset.id)}"]`)?.focus();}};
$('board').onclick=e=>{
 if(e.target.id==='clearfilters'){resources.clear();types.clear();$('search').value='';render();return;}
 const button=e.target.closest('[data-action]'),node=button?.closest('[data-id]');if(!node)return;const x=db.items.find(x=>x.id===node.dataset.id);if(!x)return;
 if(button.dataset.action==='reopen'){checkpoint();x.completed=0;x.building=false;x.end='';save('Mejora pendiente');return;}if(x.completed)return;
 if(button.dataset.action==='edit'){openEditor(x);return;}checkpoint();if(button.dataset.action==='build'){if(x.building){x.building=false;x.end='';save('Constructor retirado');}else{TH19Model.advance(db.items,x.id,true);save('Constructor asignado; niveles anteriores terminados');}}else{TH19Model.advance(db.items,x.id);save('Mejora y niveles anteriores terminados');}
};
$('lanes').onclick=e=>{const button=e.target.closest('[data-lane]');if(!button)return;lane=button.dataset.lane;resources.clear();types.clear();$('search').value='';render();};
$('search').oninput=render;$('showcompleted').onclick=()=>{showCompleted=!showCompleted;render();};$('undo').onclick=()=>{if(!undoState)return;({db,orders,modes}=undoState);undoState=null;save('Último cambio deshecho');};
$('openpass').onclick=()=>$('passdialog').showModal();$('closepass').onclick=()=>$('passdialog').close();
$('passoptions').onclick=e=>{const b=e.target.closest('[data-boost]');if(!b)return;builderBoost=Number(b.dataset.boost);try{localStorage.setItem(PASSKEY,JSON.stringify({month:passMonth(),percent:builderBoost}));notify('Descuento guardado');}catch{notify('No se pudo guardar el descuento.');}render();};
$('guideorder').onclick=()=>{checkpoint();for(const l of LANES){orders[l]=db.items.filter(x=>x.lane===l).sort(l==='Mascotas'?(a,b)=>b.target-a.target:(a,b)=>TH19Model.guideCompare(a,b,GUIDE_ORDER)).map(x=>x.id);modes[l]='manual';}save('Orden de la guía aplicado; progreso conservado');};
$('openfilters').onclick=()=>$('filters').showModal();$('closefilters').onclick=()=>$('filters').close();$('applyfilters').onclick=()=>$('filters').close();
$('resourcefilters').onclick=e=>{const button=e.target.closest('[data-resource]');if(button){const v=button.dataset.resource;resources.has(v)?resources.delete(v):resources.add(v);render();}};
$('typefilters').onclick=e=>{const button=e.target.closest('[data-type]');if(button){const v=button.dataset.type;types.has(v)?types.delete(v):types.add(v);render();}};
$('sorting').onclick=e=>{const button=e.target.closest('[data-sort]');if(button){modes[lane]=button.dataset.sort;save('Orden guardado');}};$('resetfilters').onclick=()=>{resources.clear();types.clear();modes[lane]='costmax';save('Cost Max');};$('manualsort').onclick=()=>{modes[lane]='manual';save('Orden manual');};
function exportFile(data,name){const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download=name+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);notify('Copia preparada');}
function orderExport(){return {format:'th19-order',version:1,lanes:Object.fromEntries(LANES.map(l=>[l,ordered(l).map(x=>x.id)])),modes:Object.fromEntries(LANES.map(l=>[l,modes[l]||'costmax'])),placements:db.items.map(x=>({id:x.id,lane:x.lane,category:x.category,priority:x.priority}))};}
$('exportorder').onclick=()=>exportFile(orderExport(),'th19-orden');$('exportprogress').onclick=()=>exportFile(TH19Model.progressExport(db.items),'th19-progreso');
$('importorder').onclick=()=>{importKind='order';$('importfile').click();};$('importprogress').onclick=()=>{importKind='progress';$('importfile').click();};
function importOrder(data){
 if(data?.format!=='th19-order'||data.version!==1||!data.lanes||!Array.isArray(data.placements)||data.placements.length>5000)throw Error('Este archivo no es una copia de orden.');
 const result=structuredClone(db.items),newOrders={};
 for(const l of LANES){const ids=data.lanes[l];if(!Array.isArray(ids)||ids.length>5000||ids.some(id=>typeof id!=='string')||new Set(ids).size!==ids.length)throw Error('La lista de orden no es válida.');newOrders[l]=ids;}
 for(const place of data.placements){if(!LANES.includes(place.lane)||!CATEGORIES.includes(place.category)||!Number.isInteger(place.priority)||place.priority<1||place.priority>3)throw Error('La ubicación de una tarea no es válida.');const x=result.find(x=>x.id===place.id);if(x){x.lane=place.lane;x.category=place.category;x.priority=place.priority;}}
 result.forEach(valid);return {items:result,orders:newOrders,modes:Object.fromEntries(LANES.map(l=>[l,['costmax','costmin','manual'].includes(data.modes?.[l])?data.modes[l]:'costmax']))};
}
$('importfile').onchange=async e=>{try{const file=e.target.files[0];if(!file)return;if(file.size>5000000)throw Error('El archivo supera 5 MB.');const data=JSON.parse(await file.text());
 if(importKind==='order'){const imported=importOrder(data);checkpoint();db.items=imported.items;orders=imported.orders;modes=imported.modes;save('Orden importado. Progreso conservado.');}
 else if(data.format==='th19-progress'){let items=structuredClone(db.items);for(const definition of data.definitions||[]){if(!items.some(x=>x.id===definition.id)){const normalized=TH19Model.normalize({version:3,items:[{priority:2,order:items.length,...definition}],history:[]}).items[0];valid(normalized);items.push(normalized);}}items=TH19Model.applyProgress(items,data);items.forEach(valid);checkpoint();db.items=items;save('Progreso importado. Orden conservado.');}
 else{const imported=TH19Model.normalize(data);imported.items.forEach(valid);checkpoint();localStorage.setItem(KEY+'-backup-import',JSON.stringify(db));db=imported;save('Copia antigua recuperada. Orden conservado.');}
 }catch(error){notify(error.message);}finally{e.target.value='';}};
function syncMove(){const x=db.items.find(x=>x.id===$('movetask').value);if(x){$('movelane').value=x.lane;$('movecategory').value=x.category;$('movepriority').value=x.priority;$('moveposition').value=ordered(x.lane).findIndex(y=>y.id===x.id)+1;}}
$('settings').onclick=()=>{renderManager();syncMove();$('manager').showModal();};$('closemanager').onclick=()=>$('manager').close();$('movetask').onchange=syncMove;
$('applymove').onclick=()=>{const x=db.items.find(x=>x.id===$('movetask').value),position=Number($('moveposition').value);if(!x||!Number.isInteger(position)||position<1){notify('Indica una posición válida.');return;}checkpoint();const oldLane=x.lane;x.lane=$('movelane').value;x.category=$('movecategory').value;x.priority=Number($('movepriority').value);orders[oldLane]=(orders[oldLane]||[]).filter(id=>id!==x.id);const ids=ordered(x.lane).map(y=>y.id).filter(id=>id!==x.id);ids.splice(Math.min(ids.length,position-1),0,x.id);orders[x.lane]=ids;modes[x.lane]='manual';save('Tarea movida');syncMove();};
$('reopen').onclick=()=>{const x=db.items.find(x=>x.id===$('reopentask').value);if(x){checkpoint();x.completed=0;x.building=false;x.end='';save('Tarea reabierta');}};
function fromForm(){if(jsonMode){const parsed=JSON.parse($('jsontext').value);if(parsed.id!==draft.id)throw Error('No se puede cambiar el identificador.');draft=parsed;return;}const f=$('form').elements;for(const k of ['name','lane','category','type','resource','end','image','notes'])draft[k]=f.namedItem(k).value;for(const k of ['base','target','unit'])draft[k]=Number(f.namedItem(k).value);for(const k of ['cost','hours'])draft[k]=f.namedItem(k).value===''?null:Number(f.namedItem(k).value);draft.isNew=f.namedItem('isNew').checked;draft.quantity=1;draft.showUnit=!!draft.showUnit||draft.unit>1;}
function toForm(){for(const k of ['name','lane','category','type','resource','end','image','notes','base','target','unit','cost','hours'])$('form').elements.namedItem(k).value=draft[k]??'';$('form').elements.namedItem('isNew').checked=!!draft.isNew;}
function openEditor(x){draft={image:'',notes:'',...structuredClone(x||{id:crypto.randomUUID(),name:'',lane,category:lane==='Mascotas'?'Mascotas':lane==='Laboratorio'?'Laboratorio':'Edificios',type:lane==='Mascotas'?'Mascotas':lane==='Laboratorio'?'Tropas':'Ejército',unit:1,base:0,target:1,quantity:1,completed:0,building:false,priority:2,order:db.items.length,resource:'Por confirmar',cost:null,hours:null,end:'',isNew:true})};original=JSON.stringify(draft);jsonMode=false;$('fields').hidden=false;$('jsonpanel').hidden=true;$('delete').hidden=!x;$('editortitle').textContent=x?taskLabel(x):'Añadir tarea';$('dirty').textContent='Guardado automático';$('formerror').textContent='';toForm();$('editor').showModal();}
function rememberDraft(){try{try{fromForm();}catch{}localStorage.setItem(DRAFTKEY,JSON.stringify({version:3,record:draft,jsonMode,rawJSON:jsonMode?$('jsontext').value:null}));}catch{notify('No se pudo guardar el borrador.');}}
function forgetDraft(){try{localStorage.removeItem(DRAFTKEY);}catch{}}
function saveEditor(){clearTimeout(autoTimer);try{fromForm();valid(draft);if(JSON.stringify(draft)!==original){checkpoint();const at=db.items.findIndex(x=>x.id===draft.id),record=structuredClone(draft);if(at<0)db.items.push(record);else db.items[at]=record;if(!save())throw Error('No se pudo guardar.');}original=JSON.stringify(draft);forgetDraft();$('dirty').textContent='Guardado automáticamente';$('formerror').textContent='';return true;}catch(error){rememberDraft();$('dirty').textContent='Borrador guardado';$('formerror').textContent=error.message;return false;}}
function closeEditor(){clearTimeout(autoTimer);try{fromForm();if(JSON.stringify(draft)!==original&&!saveEditor()){rememberDraft();$('editor').close();notify('Borrador conservado para la próxima apertura');return;}}catch{rememberDraft();$('editor').close();notify('Borrador conservado para la próxima apertura');return;}forgetDraft();$('editor').close();}
function editorMode(json){try{fromForm();if(json)$('jsontext').value=JSON.stringify(draft,null,2);else toForm();jsonMode=json;$('fields').hidden=json;$('jsonpanel').hidden=!json;$('formerror').textContent='';}catch(error){$('formerror').textContent=error.message;}}
$('add').onclick=()=>{$('manager').close();openEditor();};$('closeeditor').onclick=closeEditor;$('editor').addEventListener('cancel',e=>{e.preventDefault();closeEditor();});$('formtab').onclick=()=>editorMode(false);$('jsontab').onclick=()=>editorMode(true);
$('form').oninput=e=>{if(!jsonMode&&e.target.name==='base')$('form').elements.namedItem('target').value=Number(e.target.value)+1;rememberDraft();$('dirty').textContent='Guardando…';clearTimeout(autoTimer);autoTimer=setTimeout(saveEditor,500);};$('form').onsubmit=e=>{e.preventDefault();if(saveEditor())$('editor').close();};
$('delete').onclick=()=>{clearTimeout(autoTimer);checkpoint();db.items=db.items.filter(x=>x.id!==draft.id);forgetDraft();save('Tarea eliminada · puedes deshacer');$('editor').close();};$('copyjson').onclick=async()=>{try{await navigator.clipboard.writeText($('jsontext').value);$('formerror').textContent='Copiado';}catch{$('jsontext').select();$('formerror').textContent='Pulsa Ctrl+C para copiar.';}};
$('movelane').innerHTML=options(LANES);$('movecategory').innerHTML=options(CATEGORIES);$('form').elements.namedItem('lane').innerHTML=options(LANES);$('form').elements.namedItem('category').innerHTML=options(CATEGORIES);$('form').elements.namedItem('type').innerHTML=options(['Ejército','Defensa','Héroes','Recursos','Tropas','Hechizos','Asedio','Escuadrones','Mascotas']);
async function init(){
 try{const pass=JSON.parse(localStorage.getItem(PASSKEY)||'null');if(pass?.month===passMonth()&&[0,10,15,20].includes(pass.percent))builderBoost=pass.percent;}catch{}
 try{const saved=localStorage.getItem(KEY);if(saved){const old=JSON.parse(saved),normalized=TH19Model.normalize(old);normalized.items.forEach(valid);if(old.version!==3)localStorage.setItem(KEY+'-backup-v'+old.version,saved);db=normalized;if(old.version!==3)localStorage.setItem(KEY,JSON.stringify(db));}const stored=JSON.parse(localStorage.getItem(ORDERKEY)||'{}');for(const l of LANES){if(Array.isArray(stored.orders?.[l])&&stored.orders[l].every(id=>typeof id==='string'))orders[l]=stored.orders[l];if(['costmax','costmin','manual'].includes(stored.modes?.[l]))modes[l]=stored.modes[l];}notify('Guardado automático');}catch{notify('No se pudo leer una copia local. Los datos anteriores se conservan.');}
 TH19Model.mergeCatalog(db.items,UPGRADE_DATA);try{localStorage.setItem(KEY,JSON.stringify(db));}catch{notify('No se pudo guardar el catálogo actualizado.');}
 try{images=await(await fetch('images.json?v=20261117-squads',{cache:'no-store'})).json();}catch{notify('No se pudieron cargar las imágenes.');}render();
 try{const pending=JSON.parse(localStorage.getItem(DRAFTKEY)||'null');if(pending?.record){if([2,3].includes(pending.version)){const record=TH19Model.normalize({version:3,items:[pending.record],history:[]}).items[0];openEditor(record);original=JSON.stringify(db.items.find(x=>x.id===record.id)||{});if(pending.jsonMode){jsonMode=true;$('fields').hidden=true;$('jsonpanel').hidden=false;$('jsontext').value=pending.rawJSON;}$('dirty').textContent='Borrador recuperado';}else localStorage.setItem(KEY+'-legacy-draft',JSON.stringify(pending));}}catch{notify('No se pudo recuperar un borrador. El progreso sigue disponible.');}
}
init();
