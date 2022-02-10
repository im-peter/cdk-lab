import { Stack, StackProps, CfnOutput } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as iam from 'aws-cdk-lib/aws-iam';
import * as ssm from 'aws-cdk-lib/aws-ssm'

export class CdkStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const s3ListBucketsPolicy = new iam.PolicyStatement({
      actions: ['s3:ListAllMyBuckets'],
      resources: ['arn:aws:s3:::*'],
    })

    const bucketLambda = new lambda.Function(this, 'cdk-handler-ts', {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: 'buckets.main',
      code: lambda.Code.fromAsset('resources'),
      memorySize: 1024
    })

    bucketLambda.addToRolePolicy(s3ListBucketsPolicy)

    const api = new apigateway.RestApi(this, 'cdk-gateway-ts', {
      restApiName: "cdk-api",
      description: "cdk-test-api",
      deployOptions: {
        stageName: 'dev',
      },
      // enable CORS
      defaultCorsPreflightOptions: {
        allowHeaders: [
          'Content-Type',
          'X-Amz-Date',
          'Authorization',
          'X-Api-Key',
        ],
        allowMethods: ['OPTIONS', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        allowCredentials: true,
        allowOrigins: ['http://localhost:3000'],
      },
    })

    new CfnOutput(this, 'apiUrl', {
      description: 'cdk test output',
      exportName: 'cdk-exported-output',
      value: api.url
    })

    new ssm.CfnParameter(this, 'cdk-ssm-test', {
      type: 'String',
      description: "This is a test from cdk",
      value: 'this is value from cdk'
    })

    const getBucketsIntegration = new apigateway.LambdaIntegration(bucketLambda, {
      requestTemplates: { "application/json": '{ "statusCode": "200" }' }
    })

    api.root.addMethod("GET", getBucketsIntegration); // GET /

    console.info('Access at: ', api.urlForPath('/'))
  }
}