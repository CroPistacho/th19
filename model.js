'use strict';
const TH19Model=(()=>{
 const placements={'Cuartel de escuadrones':'Edificios','Templo de guardianes':'Edificios','Antiaéreo · quinto edificio':'Defensas','Trampa de muelle · décima unidad':'Trampas','Torre pinchuda':'Defensas','Torre pirotécnica':'Defensas'};
 const spells=['Rayo','Curación','Tótem','Veneno','Prisa','Murciélagos','Hechizo heroico'];
 const laneFor=x=>['Laboratorio','Escuadrones'].includes(x.category)?'Laboratorio':x.category==='Mascotas'?'Mascotas':'Constructores';
 function typeFor(x){if(x.category==='Mascotas')return 'Mascotas';if(x.category==='Escuadrones')return 'Escuadrones';if(x.category==='Laboratorio')return spells.includes(x.name)?'Hechizos':x.name==='Lanzallamas'?'Asedio':'Tropas';if(x.category==='Héroes'||x.category==='Guardianes')return 'Héroes';if(['Defensas','Trampas'].includes(x.category)||/Torre pinchuda|Torre pirotécnica|Antiaéreo|Trampa/.test(x.name))return 'Defensa';return /Almacén|Recolector|Mina de oro|Extractor/.test(x.name)?'Recursos':'Ejército';}
 function resourceFor(x){if(x.resource&&x.resource!=='Por confirmar')return x.resource;if(/Torre pinchuda/.test(x.name))return 'Elixir oscuro';if(/Ayuntamiento|Almacén de elixir$|Recolector de elixir/.test(x.name))return 'Oro';if(/Laboratorio|Cuartel|Templo|Consejo|Castillo|Fábrica|Almacén de oro|Almacén de elixir oscuro|Destructor|Mina de oro|Extractor/.test(x.name))return 'Elixir';return x.resource||'Por confirmar';}
 function expand(item){
  const steps=[];let remaining=item.completed;const count=item.quantity;
  for(let level=item.base+1;level<=item.target;level++)for(let unit=1;unit<=count;unit++){
   const next=steps.length===item.completed&&item.completed<(item.target-item.base)*count;
   const construction=!!item.isNew&&level===1&&item.base===0;
   const ordinal=item.name==='Antiaéreo · quinto edificio'?5:item.name==='Trampa de muelle · décima unidad'?10:unit;
   steps.push({...item,id:`${item.id}:u${unit}:l${level}`,familyId:item.id,unit:ordinal,showUnit:count>1||ordinal>1,name:item.name.replace(' · quinto edificio','').replace(' · décima unidad',''),base:level-1,target:level,quantity:1,completed:remaining-->0?1:0,isNew:construction,priority:['Torre pinchuda','Torre pirotécnica'].includes(item.name)?(construction?2:1):item.priority,category:construction?'Nuevas construcciones':placements[item.name]||item.category,end:next?item.end||'':'',cost:next?item.cost??null:null,hours:next?item.hours??null:null,magic:next?item.magic||'Ninguno':'Ninguno',imageLevel:item.imageLevel||item.target});
  }
  return steps;
 }
 function normalize(data){
  if(!data||![1,2,3].includes(data.version)||!Array.isArray(data.items)||data.items.length>5000)throw Error('Formato de copia no compatible.');
  if(data.version===1)for(const x of data.items)if(!Number.isInteger(x.base)||!Number.isInteger(x.target)||!Number.isInteger(x.quantity)||x.base<0||x.target<=x.base||x.target>999||x.quantity<1||x.quantity>999||!Number.isInteger(x.completed)||x.completed<0||x.completed>(x.target-x.base)*x.quantity)throw Error('La copia contiene niveles o cantidades no válidos.');
  if(data.version===1&&data.items.reduce((sum,x)=>sum+(x.target-x.base)*x.quantity,0)>5000)throw Error('La copia contiene demasiadas tareas.');
  const items=data.version===1?data.items.flatMap(expand):structuredClone(data.items);
  if(items.length>5000||new Set(items.map(x=>x.id)).size!==items.length)throw Error('Hay demasiadas tareas o identificadores duplicados.');
  return {...data,version:3,items:items.map((x,i)=>({...x,order:Number.isFinite(x.order)?x.order:i,unit:x.unit||1,showUnit:!!x.showUnit,imageLevel:x.imageLevel||x.target,lane:x.lane||laneFor(x),type:x.type||typeFor(x),resource:resourceFor(x),building:x.completed===1?false:!!(x.building||x.end)})),history:Array.isArray(data.history)?data.history:[]};
 }
 const compare=(a,b)=>a.priority-b.priority||a.order-b.order||a.id.localeCompare(b.id);
 function move(items,id,priority,position){
  const item=items.find(x=>x.id===id);if(!item)throw Error('La tarea ya no está disponible.');
  if(!Number.isInteger(priority)||priority<1||priority>3||!Number.isInteger(position))throw Error('Prioridad o posición no válida.');
  const peers=items.filter(x=>x.id!==id&&x.priority===priority&&x.lane===item.lane&&x.completed===0).sort(compare);
  peers.splice(Math.max(0,Math.min(peers.length,position-1)),0,item);peers.forEach((x,i)=>{x.priority=priority;x.order=i;});
 }
 function previous(items,item){return items.find(x=>x.id!==item.id&&x.familyId&&x.familyId===item.familyId&&x.unit===item.unit&&x.target===item.base&&x.completed===0);}
 function band(x){if(x.lane!=='Constructores')return 0;if(/Recolector|Mina de oro|Extractor/.test(x.name))return 3;if(/Almacén/.test(x.name))return 2;if(x.category==='Trampas'||/Trampa|Bomba aérea/.test(x.name))return 1;return 0;}
 function costCompare(a,b,mode='costmax'){
  const grouping=band(a)-band(b);if(grouping)return grouping;
  const missing=Number(a.cost==null)-Number(b.cost==null);if(missing)return missing;
  if(a.cost!=null&&b.cost!=null&&a.cost!==b.cost)return mode==='costmin'?a.cost-b.cost:b.cost-a.cost;
  if(a.lane==='Mascotas'&&b.lane==='Mascotas'&&a.target!==b.target)return b.target-a.target;
  return compare(a,b);
 }
 function reorder(ids,source,target,after=false){const list=ids.filter(id=>id!==source);const at=list.indexOf(target);if(at<0||source===target)return ids.slice();list.splice(at+(after?1:0),0,source);return list;}
 const completedRank=x=>Number.isSafeInteger(x.completedOrder)&&x.completedOrder>=0?x.completedOrder:0;
 function statusCompare(a,b){const band=x=>x.completed===1?0:x.building?1:2;const group=band(a)-band(b);return group||(a.completed===1&&b.completed===1?completedRank(a)-completedRank(b):0);}
 function progressExport(items){return {format:'th19-progress',version:1,tasks:items.map(x=>({id:x.id,completed:x.completed,building:!!x.building,end:x.end||'',completedOrder:completedRank(x)})),definitions:items.filter(x=>!x.id.startsWith('seed-')).map(({order,priority,...x})=>x)};}
 function applyProgress(items,data){
  if(data?.format!=='th19-progress'||data.version!==1||!Array.isArray(data.tasks)||data.tasks.length>5000)throw Error('El archivo no es una copia de progreso.');
  if(new Set(data.tasks.map(x=>x.id)).size!==data.tasks.length)throw Error('La copia contiene tareas duplicadas.');
  const result=structuredClone(items);
  for(const task of data.tasks){if(typeof task.id!=='string'||![0,1].includes(task.completed)||typeof task.building!=='boolean'||typeof task.end!=='string'||(task.end&&!Number.isFinite(new Date(task.end).getTime())))throw Error('La copia contiene un estado no válido.');if(task.completedOrder!=null&&(!Number.isSafeInteger(task.completedOrder)||task.completedOrder<0))throw Error('La secuencia de terminadas no es válida.');const x=result.find(x=>x.id===task.id);if(x){x.completedOrder=task.completed===1?completedRank(task):0;x.completed=task.completed;x.building=task.completed===1?false:task.building;x.end=task.completed===1?'':task.end;}}
  return result;
 }
 function advance(items,id,building=false){
  const target=items.find(x=>x.id===id);if(!target)throw Error('La tarea ya no existe.');
  let sequence=items.reduce((n,x)=>Math.max(n,completedRank(x)),0);
  for(const x of items.slice().sort((a,b)=>a.target-b.target)){
   const sameUnit=x.unit===target.unit&&(target.familyId?x.familyId===target.familyId:x.name===target.name);
   if(sameUnit&&x.target<=target.target-(building?1:0)){if(x.completed!==1)x.completedOrder=++sequence;x.completed=1;x.building=false;x.end='';}
  }
  if(building){target.completed=0;target.building=true;}
 }
 function catalogMatch(x,r){return x.name===r.name&&x.lane===r.lane&&(x.type==='Escuadrones')===r.squad&&x.target>=r.from&&x.target<=r.to;}
 function mergeCatalog(items,catalog){let changed=0;for(const x of items){const r=catalog.find(r=>r.from===r.to&&catalogMatch(x,r))||catalog.find(r=>catalogMatch(x,r));if(!r)continue;const unknownCost=x.cost==null;for(const k of ['cost','hours'])if(x[k]==null&&r[k]!=null){x[k]=r[k];changed++;}if(r.resource&&((!x.catalogSource&&unknownCost)||x.resource==='Por confirmar'))x.resource=r.resource;if(x.name==='Recolector de elixir'&&x.lane==='Constructores'&&x.resource==='Elixir')x.resource='Oro';x.catalogSource=r.source||'HTML adjuntos';}return changed;}
 function boosted(x,percent){const factor=x.lane==='Constructores'&&[10,15,20].includes(percent)?1-percent/100:1;return {cost:x.cost==null?null:Math.round(x.cost*factor),hours:x.hours==null?null:x.hours*factor};}
 function guideCompare(a,b,guide){const rank=x=>{const i=guide.findIndex(r=>catalogMatch(x,r));return i<0?1e6:i;};return rank(a)-rank(b)||a.target-b.target||a.unit-b.unit||compare(a,b);}
 return {statusCompare,mergeCatalog,boosted,guideCompare,expand,normalize,compare,move,previous,laneFor,typeFor,band,costCompare,reorder,progressExport,applyProgress,advance};
})();
if(typeof module!=='undefined')module.exports=TH19Model;
