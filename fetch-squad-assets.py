import urllib.request,urllib.parse,json,pathlib
def api(params):
 q=urllib.parse.urlencode({'format':'json',**params})
 return json.load(urllib.request.urlopen(urllib.request.Request('https://clashofclans.fandom.com/api.php?'+q,headers={'User-Agent':'Mozilla/5.0'}),timeout=25))
r=api({'action':'query','titles':'Squads','prop':'images','imlimit':500})
titles=[x['title'] for page in r['query']['pages'].values() for x in page.get('images',[]) if 'squad' in x['title'].lower()]
print(json.dumps(titles))
found={}
for start in range(0,len(titles),40):
 r=api({'action':'query','titles':'|'.join(titles[start:start+40]),'prop':'imageinfo','iiprop':'url'})
 for page in r['query']['pages'].values():
  if page.get('imageinfo'):found[page['title']]=page['imageinfo'][0]['url']
pathlib.Path('squad-assets-found.json').write_text(json.dumps(found,indent=2),encoding='utf-8')
mapping={'Bárbaros y arqueras':'Barch','Gigantes y magos':'Giant Wizard','Rompemuros':'Wall Breaker','Esbirros':'Minion','Globos':'Balloon','Gólem y brujas':'Golem Witch','Montapuercos':'Hog Rider','Mineros':'Miner','Sanadoras':'Healer','P.E.K.K.A y titánide':'P.E.K.K.A Titan','Dragones':'Dragons','Bebés dragón':'Baby Dragon'}
p=pathlib.Path('dist/images.json');images=json.loads(p.read_text(encoding='utf-8'))
for name,english in mapping.items():
 title='File:Avatar '+english+' Squad.png'
 if title in found:images['squad:'+name]={'src':found[title],'url':found[title],'page':'https://clashofclans.fandom.com/wiki/Squads','generic':True}
p.write_text(json.dumps(images,ensure_ascii=False,indent=2),encoding='utf-8')
print('Squads:',sum(k.startswith('squad:') for k in images))
r=api({'action':'query','titles':'File:Hammer of Heroes.png|File:Hammer of Spells.png|File:Hammer of Fighting.png','prop':'imageinfo','iiprop':'url'})
for page in r['query']['pages'].values():
 if page.get('imageinfo'):print(page['title'],page['imageinfo'][0]['url'])
