rm ../tinponsSwiperAPI.zip
zip -r ../tinponsSwiperAPI.zip *
cd ..
aws lambda update-function-code --function-name WeGoLocoTinponsSwiperAPI --zip-file fileb://tinponsSwiperAPI.zip
cd WeGoLocoTinponsSwiperAPI
