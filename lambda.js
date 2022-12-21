const AWS = require('aws-sdk');

exports.handler = async (event) => {
  AWS.config.update({ region: 'us-east-2' });

  const bucketName = event.Records[0].s3.bucket.name;
  const objectKey = event.Records[0].s3.object.key;

  const s3 = new AWS.S3();

  const params = {
    Bucket: bucketName,
    Key: objectKey
  };

  let images;
  try {
  const data = await s3.getObject({
    Bucket: bucketName,
    Key: 'images.json'
  }).promise();
    images = JSON.parse(data.Body.toString());
    console.log('Image array', images);
  } catch (e) {
    if (e.code === 'NoSuchKey') {
      images = [];
    } else {
      throw e;
    }
  }

    const res = await s3.headObject(params).promise()
    const imageData = {
      name: objectKey,
      size: res.ContentLength,
      type: res.ContentType,
    }
    const index = images.findIndex(i => i.name === objectKey)
    if(index !== -1){
      images[index] = imageData;
    } else {
      images.push(imageData)
    }
    
    await s3.putObject({
      Bucket: bucketName,
      Key: 'images.json',
      Body: JSON.stringify(images)
    }).promise();
    console.log(imageData)
  

  
}; 
