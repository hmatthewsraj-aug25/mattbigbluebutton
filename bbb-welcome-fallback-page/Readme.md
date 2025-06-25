Welcome Fallback Page will be accessible through https://your-bbb-domain/

By default it shows `Welcome to BigBlueButton!`
When it contains param ?errors= it will show the error instead.

## Build (it will copy to /var/www/bigbluebutton-default/assets for testing)
```
./deploy.sh
```

## Commit (it will copy files to bbb-config and use this version for next bbb release)
```
./deploy-to-src.sh
```
