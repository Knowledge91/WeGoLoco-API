rm ../tinponsManagerAPI.zip
zip -r ../tinponsManagerAPI.zip *
cd ..
aws lambda update-function-code --function-name WeGoLocoTinponsManagerAPI --zip-file fileb://tinponsManagerAPI.zip
cd WeGoLocoTinponsManagerAPI
