var lData = 
{"levels":[{"width":2,"rooms":["@q!o@!o@!o@!o@!o@!o@!o@!o@!o@!o@!o@!o@4!4@l!4@h","!n@2!n@2!n@2!n@2!n@2!n@2!n@2!n@2!n@2!n@2!n@2!n@2!n@b!e@b!b@5","@4!4@l!4@j!g@9!m@3!m@3!n@2!n@2!n@2!n@2!n@2!n@2!n@2!n@O","@9!b@e!b@h!c@d!c@d!c@!o@!o@!h@8!h@8!h@8!h@8!e@b!e@Z"]},{"width":2,"rooms":["@q!o@!o@!o@!o@!o@!o@!o@!o@!o@!o@!o@!o@!o@p","@p!o@!o@!o@!o@!o@!o@!o@!o@!o@!o@!o@!o@!o@q"]},{"width":1,"rooms":["!T5"]}]}
for(var l of lData.levels)
for(var r of l.rooms) l.rooms[l.rooms.indexOf(r)]=uncompress(r);