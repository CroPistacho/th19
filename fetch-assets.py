import json, urllib.request, urllib.parse, pathlib, concurrent.futures
ROOT=pathlib.Path(__file__).parent/'dist'
names=['Town_Hall19','Spiky_Tower2','Firecracker_Tower2','Guardian_Shrine','Squad_Barracks12','Laboratory17','Hero_Hall13','Clan_Castle15','Air_Defense17','Hidden_Tesla18','X-Bow14','Ricochet_Cannon5','Multi-Archer_Tower5','Multi-Gear_Tower4','Builder_Hut9','Gold_Storage20','Elixir_Storage20','Dark_Elixir_Storage14','Spell_Factory10','Gold_Mine18','Elixir_Collector18','Dark_Elixir_Drill12','Spring_Trap14','Air_Bomb14','Skeleton_Trap6','Wall20']
def request(url):
 return urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0'}),timeout=25)
def fetch(name):
 try:
  q=urllib.parse.urlencode({'action':'query','titles':'File:'+name+'.png','prop':'imageinfo','iiprop':'url','format':'json'})
  data=json.load(request('https://clashofclans.fandom.com/api.php?'+q))
  info=next(iter(data['query']['pages'].values())).get('imageinfo',[])
  if not info:return name,{'error':'File not found'}
  url=info[0]['url']; meta={'src':url,'url':url,'page':info[0]['descriptionurl']}
  try: body=request(url.replace('/revision/latest','/revision/latest/scale-to-width-down/256')).read()
  except Exception: return name,meta
  if body[:8]!=b'\x89PNG\r\n\x1a\n':return name,{'url':url,'error':'Not PNG'}
  file='assets/'+name+'.png'; (ROOT/file).write_bytes(body)
  return name,{'src':file,'url':url,'page':info[0]['descriptionurl']}
 except Exception as e:return name,{'error':str(e)}
with concurrent.futures.ThreadPoolExecutor(max_workers=5) as pool: result=dict(pool.map(fetch,names))
(ROOT/'images.json').write_text(json.dumps(result,indent=2),encoding='utf-8')
print(json.dumps(result,indent=2))
