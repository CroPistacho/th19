import urllib.request,urllib.parse,json,pathlib
names=['Gold','Elixir','Dark_Elixir','Villager','Villager_info','Villager_Icon','Builder','Builder_Icon','Builder_info','Hammer_of_Building','Hammer_Of_Building','Hammer_of_Fighting','Builders_Hut_icon']
query=urllib.parse.urlencode({'action':'query','titles':'|'.join('File:'+n+'.png' for n in names),'prop':'imageinfo','iiprop':'url','format':'json'})
data=json.load(urllib.request.urlopen(urllib.request.Request('https://clashofclans.fandom.com/api.php?'+query,headers={'User-Agent':'Mozilla/5.0'})))
found={}
for x in data['query']['pages'].values():
 if x.get('imageinfo'):
  n=x['title'][5:-4].replace(' ','_');found[n]=x['imageinfo'][0]['url'];print(n,found[n])
pathlib.Path('ui-assets-found.json').write_text(json.dumps(found,indent=2),encoding='utf-8')
query=urllib.parse.urlencode({'action':'query','list':'allimages','aiprefix':'Villager','ailimit':100,'format':'json'})
data=json.load(urllib.request.urlopen(urllib.request.Request('https://clashofclans.fandom.com/api.php?'+query,headers={'User-Agent':'Mozilla/5.0'})))
print(json.dumps([(x['name'],x['url']) for x in data.get('query',{}).get('allimages',[])],ensure_ascii=False))
