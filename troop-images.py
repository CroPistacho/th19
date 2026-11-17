import urllib.request,urllib.parse,json,pathlib
names={'Destructor':'Smasher','Gran centinela':'Grand_Warden','Duque dragón':'Dragon_Duke','Reina arquera':'Archer_Queen','Rey bárbaro':'Barbarian_King','Luchadora real':'Royal_Champion','Príncipe esbirro':'Minion_Prince','Medusa':'Angry_Jelly','Arquera':'Archer','Mago':'Wizard','Bárbaro':'Barbarian','Gigante':'Giant','Duende':'Goblin','Rompemuros':'Wall_Breaker','Globo':'Balloon','Sanadora':'Healer','Dragón':'Dragon','P.E.K.K.A':'P.E.K.K.A','Bebé dragón':'Baby_Dragon','Minero':'Miner','Dragón eléctrico':'Electro_Dragon','Yeti':'Yeti','Montadragones':'Dragon_Rider','Titánide':'Electro_Titan','Druida':'Druid','Lanzador':'Thrower','Gólem meteórico':'Meteor_Golem','Luchadora de raíces':'Root_Rider','Esbirro':'Minion','Montapuercos':'Hog_Rider','Valquiria':'Valkyrie','Gólem':'Golem','Bruja':'Witch','Sabueso de lava':'Lava_Hound','Lanzarrocas':'Bowler','Cazadora de héroes':'Headhunter','Bruja de ruinas':'Ruin_Witch','Lanzallamas':'Flame_Flinger','Rayo':'Lightning_Spell','Curación':'Healing_Spell','Tótem':'Totem_Spell','Veneno':'Poison_Spell','Prisa':'Haste_Spell','Murciélagos':'Bat_Spell','Hechizo heroico':'Heroic_Spell'}
p=pathlib.Path('dist/images.json');data=json.loads(p.read_text())
for start in range(0,len(names),40):
 subset=list(names.items())[start:start+40]
 q=urllib.parse.urlencode({'action':'query','titles':'|'.join('File:'+en+'_info.png' for es,en in subset),'prop':'imageinfo','iiprop':'url','format':'json'})
 r=json.load(urllib.request.urlopen(urllib.request.Request('https://clashofclans.fandom.com/api.php?'+q,headers={'User-Agent':'Mozilla/5.0'})))
 for x in r['query']['pages'].values():
  if not x.get('imageinfo'):continue
  info=x['imageinfo'][0]; stem=x['title'][5:-9].replace(' ','_')
  for es,en in subset:
   if en==stem:data[es]={'src':info['url'],'url':info['url'],'page':info['descriptionurl'],'generic':True}
data={k:v for k,v in data.items() if v.get('src') and k!='Wall20'}
p.write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf-8');print('Renders e ilustraciones encontrados:',len(data))
