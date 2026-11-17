import urllib.request,urllib.parse,json,pathlib
p=pathlib.Path('dist/images.json'); data=json.loads(p.read_text())
titles=['Multi-Gear_Tower4_FastAttack']
q=urllib.parse.urlencode({'action':'query','titles':'|'.join('File:'+x+'.png' for x in titles),'prop':'imageinfo','iiprop':'url','format':'json'})
r=json.load(urllib.request.urlopen(urllib.request.Request('https://clashofclans.fandom.com/api.php?'+q,headers={'User-Agent':'Mozilla/5.0'})))
for x in r['query']['pages'].values():
 if not x.get('imageinfo'):continue
 info=x['imageinfo'][0];name=x['title'][5:-4].replace(' ','_'); key={'X-Bow14_Ground':'X-Bow14','SkeletonTrap6':'Skeleton_Trap6','Builders_Hut9':'Builder_Hut9'}.get(name,name)
 if name=='Multi-Gear_Tower4_FastAttack':key='Multi-Gear_Tower4'
 data[key]={'src':info['url'],'url':info['url'],'page':info['descriptionurl']};print(name,info['url'])
p.write_text(json.dumps(data,indent=2))
q=urllib.parse.urlencode({'action':'query','titles':'Multi-Gear Tower','prop':'images','imlimit':500,'format':'json'})
r=json.load(urllib.request.urlopen(urllib.request.Request('https://clashofclans.fandom.com/api.php?'+q,headers={'User-Agent':'Mozilla/5.0'})))
print(json.dumps([i for p in r['query']['pages'].values() for i in p.get('images',[]) if '4' in i['title']]))
