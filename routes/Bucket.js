var express = require('express');
var router = express.Router();
var aws = require('aws-sdk');
var s3 = new aws.S3();

var fileUpload = require('express-fileupload');
router.use(fileUpload());


router.get('/', function(req, res) {
  s3.listBuckets({},function(err,data) {
      if(err) {
          throw err;
      }
      console.log(data);
      res.render('listBuckets', { buckets: data.Buckets});
  });
});

router.get('/:bucket/', function(req, res) {
    
    var bucketName = req.params.bucket;
    console.log(bucketName);
    s3.listObjects({
        Bucket: bucketName
    },function(err,data) {
        if(err) {
            res.render('error', {err});
            throw err;
        }
        console.log(data);
        res.render('mostrarOBjetos', { objects: data.Contents});
});

    /*
     * @TODO - Programa la logica para obtener los objetos de un bucket.
     *         Se debe tambien generar una nueblo templade en jade para presentar
     *         esta información. Similar al que lista los Buckets.
     */
    
});

router.get('/:bucket/:key', function(req, res) {
    var bucketName = req.params.bucket; 
    var objectKey = req.params.key;
    s3.getObject({
        Bucket: bucketName,
        Key: objectKey
    }, function(err, data) {
        if(err) {
            throw err;
        }
        console.log(data);
        res.type(data.ContentType).send(data.Body);
});
    /*
     * @TODO - Programa la logica para obtener un objeto en especifico
     * es importante a la salida enviar el tipo de respuesta y el contenido
     * 
     * Ejemplo de esto:
     *     res.type(...) --> String de content-type
     *     res.send(...) --> Buffer con los datos.
     */    
});


router.post('/', function(req,res) {
    var bucketName = req.body.bucketName;
    s3.createBucket({
        Bucket: bucketName,
        CreateBucketConfiguration: {
            LocationConstraint : 'us-west-2'
        }
    }, function(err, data) {
        if (err) {
            if(err.code == 'BucketAlreadyOwnedByYou') {
                res.send({'error': true, 'message':'Bucket Already Owned'});
            } else {
                res.send({'error': true, 'message': err});
            }
        } else {
            res.send({'error':false,'message': 'Bucket created'});
        }
});
    
    /*
     * @TODO - Programa la logica para crear un Bucket.
    */
});

router.post('/:bucket', function(req,res) {
    for(file in req.files){
        s3.putObject({
            Bucket: req.params.bucket,
            Key: file,
            Body : req.files[file].data,
            ContentType: req.files[file].mimetype
        }, function(err, data) {
            if(err) {
                res.send({
                    "error" : true,
                    "message": err
                });
            } else {
            res.send({
                "error": false,
                "message": "Uploaded file",
                "file": data
            });
        }
    });
    /*
     * @TODO - Programa la logica para crear un nuevo objeto.
     * TIPS:
     *  req.files contiene todo los archivos enviados mediante post.
     *  cada elemento de files contiene multiple información algunos campos
     *  importanets son:
     *      data -> Buffer con los datos del archivo.
     *      name -> Nombre del archivo original
     *      mimetype -> tipo de archivo.
     *  el conjunto files dentro del req es generado por el modulo 
     *  express-fileupload
     *  
    */
    } 
});

module.exports = router;
