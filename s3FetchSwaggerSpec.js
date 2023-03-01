var AWS = require('aws-sdk');
const fs = require('fs');
var rimraf = require('rimraf');
const repoName = require('./package.json').repoName;
const s3Path = require('./package.json').s3Path;
const versionType = require('./package.json').versionType;
const appVersion = require('./package.json').swaggerSpecVersion;
const bucketName = repoName + "/" + versionType + s3Path;
const swaggerSpec = require('./package.json').swaggerSpec;
var keyName;
var latestVersion;
var s3 = new AWS.S3();
var extract = require('extract-zip');
function s3download() {
    let localDest = keyName;
    let bucketPath = bucketName + appVersion;
    if (versionType == "snapshot") {
        bucketPath = bucketPath + "-SNAPSHOT";
    }
    let params = {
        Bucket: bucketPath,
        Key: keyName
    };
    let file = fs.createWriteStream(localDest);

    return new Promise((resolve, reject) => {
        s3.getObject(params).createReadStream()
        .on('end', () => {
        extractingJar(localDest);
    return resolve();
})
.on('error', (error) => {
        return reject(error);
}).pipe(file);
});
};

const extractingJar = (source) => {
    var target = __dirname + "/SwaggerSpec/";
    extract(source, { dir: target }, function (err) {
        fs.unlink(source, function () {
            fs.copyFileSync(target + 'api.yml', __dirname + "/api.yml");
            rimraf(target, function () { return; });
        });
    })
}

const startDownloadProcess = () => {
    if (require('./package.json').versionType === "release") {
        keyName = swaggerSpec + "-" + appVersion + ".jar";
        s3download();
    } else {
        var bucket;
        let jarFilesList = [];
        var prefix = "snapshot" + s3Path + appVersion + "-SNAPSHOT/" + swaggerSpec + "-" + appVersion;
        bucket = new AWS.S3({
            params: {
                Bucket: repoName,
                Prefix: prefix
            }
        });
        latestVersion = s3ListObjects({
            Bucket: repoName,
            Prefix: prefix
        });
    }
}

function s3ListObjects(params) {
    s3.listObjectVersions(params, function (err, data) {
        var latestVersionLocal;
        if (err) {
            console.log("s3ListObjects Error:", err);
        } else {
            var contents = data;
            latestVersionLocal = findLatestjar(data);
            if (latestVersion !== undefined) {
                latestVersion = (latestVersion.LastModified > latestVersionLocal.LastModified) ? latestVersion : latestVersionLocal
            } else {
                latestVersion = latestVersionLocal;
            }
            if (data.IsTruncated) {
                params.Marker = contents[contents.length - 1].Key;
                s3ListObjects(params);
            } else {
                keyName = latestVersion.substring(latestVersion.lastIndexOf('/') + 1, latestVersion.length);
                s3download();
            }
        }
    });
}

function findLatestjar(data) {
    return data.Versions.filter(function (content) {
        return content.Key.endsWith(".jar");
    }).reduce(function (prev, current) {
        return (prev.LastModified > current.LastModified) ? prev : current
    }).Key;
}

startDownloadProcess();
