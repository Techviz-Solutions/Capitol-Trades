import static com.x2iq.tools.SlackNotificationTypes.BUILD_FAILURE
import static com.x2iq.tools.SlackNotificationTypes.BUILD_OK
import static com.x2iq.tools.SlackNotificationTypes.BUILD_START
import static com.x2iq.tools.SlackNotificationTypes.BUILD_UNSTABLE

pipeline {
  agent any

  environment {
    product = 'senator'
    component = 'frontend'
    buildEnv = "${GIT_BRANCH.split("/")[1]}"  // usual name 'env' is not possible as this is a name for some internal jenkins object
    region = 'eu-central-1'  // TODO hardcoded
    accountName = 'master'  // TODO hardcoded
    awsAccountDomainName = "${accountName}.2iq.cloud"  // TODO take from ssm:/ib2/aws/accountDomainName
    productBucket = "${product}.${region}.${awsAccountDomainName}"
    deploymentTarget = "${productBucket}/${buildEnv}/${component}/cloudfront"

    AWS_REGION = "${region}"

    backofficeDistributionId = sh(returnStdout: true, script:"""
        aws cloudformation describe-stacks \
          --region ${region} \
          --stack-name ${product}-${component}-${buildEnv} \
          --query 'Stacks[0].Outputs[?OutputKey == `BackofficeDistributionId`].OutputValue' \
          --output text
      """).trim()

    publicDistributionId = sh(returnStdout: true, script:"""
        aws cloudformation describe-stacks \
          --region ${region} \
          --stack-name ${product}-${component}-${buildEnv} \
          --query 'Stacks[0].Outputs[?OutputKey == `PublicDistributionId`].OutputValue' \
          --output text
      """).trim()
  }

  options {
    buildDiscarder(logRotator(artifactNumToKeepStr: '2'))
    ansiColor('xterm')
  }

  triggers {
    bitbucketPush()
  }

  tools {
    nodejs 'node-14.16.1'
  }

  stages {
    stage('Build') {
      steps {
        x2iqSlack BUILD_START
        configFileProvider([configFile(fileId: 'npmjs-with-gh-2iq-bot-user-token', targetLocation: '.npmrc')]) {
          sh 'npm i'
         }
          sh "npm run-script ${x2iqMapping.ngEnv}"
       }
    }

    stage('Deploy') {
      steps {
       sh """
         aws s3 cp dist/ s3://${deploymentTarget} \
             --region ${region} \
             --recursive \
             --exclude 'index.html' \
             --include '*' \
             --cache-control 'max-age=31536000, public'
         """
       sh """
         aws s3 cp dist/index.html s3://${deploymentTarget} \
             --region ${region} \
             --cache-control 'no-cache'
         """
       sh """
         aws s3 sync dist/ s3://${deploymentTarget} \
             --delete \
             --region ${region}
         """
      }
    }

    stage('Invalidate CloudFront cache') {
      parallel {
        stage('Invalidate backoffice distribution') {
          steps {
            sh "npx ci-steward cloudfront invalidateAllCache ${backofficeDistributionId}"
          }
        }

        stage('Invalidate public distribution') {
          when {
            expression { env.publicDistributionId != null }
          }
          steps {
            sh "npx ci-steward cloudfront invalidateAllCache ${publicDistributionId}"
          }
        }
      }
    }
  }

  post {
    success {
      x2iqSlack BUILD_OK
    }
    failure {
      x2iqSlack BUILD_FAILURE
    }
    unstable {
      x2iqSlack BUILD_UNSTABLE
    }
    cleanup {
      sh 'rm -rf node_modules'
      archiveArtifacts artifacts: '**'
      cleanWs()
    }
  }
}
