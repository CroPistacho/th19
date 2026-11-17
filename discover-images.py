import urllib.request,urllib.parse,json,re,pathlib
found={}
for prefix in ['Multi','Builder_Hut','Builder%27s','Builder_Hut','Builder_Hut','Builders_Hut']:
 q=urllib.parse.urlencode({'action':'query','list':'allimages','aiprefix':prefix,'ailimit':100,'format':'json'})
 try:
  r=json.load(urllib.request.urlopen(urllib.request.Request('https://clashofclans.fandom.com/api.php?'+q,headers={'User-Agent':'Mozilla/5.0'}),timeout=25))
  matches=[x for x in r['query']['allimages'] if re.search(r'(14_|4\.|9\.|6\.)',x['name'])]
  found[prefix]=matches
  print(prefix,json.dumps([(x['name'],x['url']) for x in matches],ensure_ascii=False))
 except Exception as e:print(e)
pathlib.Path('discovered.json').write_text(json.dumps(found),encoding='utf-8')
