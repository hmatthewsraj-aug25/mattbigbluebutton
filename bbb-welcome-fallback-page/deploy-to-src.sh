#!/usr/bin/env bash
cd "$(dirname "$0")"

for var in "$@"
do
    if [[ $var == --reset ]] ; then
    	echo "Performing a full reset..."
      rm -rf node_modules
    fi
done

if [ ! -d ./node_modules ] ; then
	npm install
fi

npm run build
#postbuild will rename static to welcome-page-static, as /static is reserved to etherpad

sudo rm -r ../bigbluebutton-config/assets/welcome-page-static
sudo rm build/asset-manifest.json
sudo cp -r build/* ../bigbluebutton-config/assets
echo ''
echo ''
echo '----------------'
echo 'bbb-config updated with last bbb-welcome-fallback-page'
