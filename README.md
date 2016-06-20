# Pré-requis
# Node JS
## Win
Télécharger et installer la dernière version de node.js : <https://nodejs.org/en/download>
## Linux
```sh
sudo yum install nodejs npm
```
http://www-player-i.ina.fr/amalia.js/docs/guide-setup.html
# Installation d'environnement de développement
## Structure du projet
 - app : les sources du player
  -  samples: exemple
  -  samples-data : Test data
  -  src : Sources
  -  tests: Testes unitaires
 - doc : les sources du site web open source
 - libs
 - poc 
 - samples : page de test dev
 - showcases : démo

# PUSH GIT-HUB
## Créer un répertoire pour descendre les sources :
``` sh
mkdir G:\ws\GitHub\amalia.js-master
```
## Descendre la dernière version du player: 
``` sh
svn co http://svn2.ina.fr:8190/svn/Player_Ina_Labs/tags/<latest-version>/app .
```

# Initialiser le dépot git
``` sh
git init
git remote add origin https://github.com/ina-foss/amalia.js.git
git fetch
git reset origin/master
```

# Commiter dans git les modifs
``` sh
git add *
git commit -m "add <latest-version> blah blahb blah"
git push -u origin master
```
/!\  Vérifier les fichiers supprimer

# Faire un pre-release pour générer le répertoire dist
``` sh
set http_proxy=http://firewall.ina.fr:81
set https_proxy=$http_proxy
git checkout -b <latest-version>-pre
bower install
npm install
# Run grunt
grunt
mv build dist
git add dist
git commit -m "dist <latest-version>"
git tag -a <latest-version> -m "add version <latest-version>"
git push origin <latest-version>-pre --tags
git checkout master
git branch -D <latest-version>-pre
git push origin :<latest-version>-pre
```

# Push to git hub
git clone https://github.com/ina-foss/amalia.js.git .
git checkout gh-pages

# Copy new site content 
``` sh
git add ...
git commit -m "add doc for version  1.3.1"
git push origin gh-pages
```
/!\ vérifier Les anciennes versions de download