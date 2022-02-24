import { Stack, StackProps, CfnOutput } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as lambda from "aws-cdk-lib/aws-lambda";
// import * as iam from 'aws-cdk-lib/aws-iam';
import * as ssm from 'aws-cdk-lib/aws-ssm'
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb'
import * as eventbus from 'aws-cdk-lib/aws-events'
import * as targets from 'aws-cdk-lib/aws-events-targets'
import * as source from 'aws-cdk-lib/aws-lambda-event-sources'
import * as cdk from 'aws-cdk-lib'

export class CdkStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // const s3ListBucketsPolicy = new iam.PolicyStatement({
    //   actions: ['s3:ListAllMyBuckets'],
    //   resources: ['arn:aws:s3:::*'],
    // })

    const bus = new eventbus.EventBus(this, 'cdk-eventbridge-test', {
      eventBusName: 'cdk-eventbridge-test'
    })
    const busRule = new eventbus.Rule(this, 'cdk-eventbridge-rule-test', {
      ruleName: 'cdk-eventbridge-test',
      description: 'Rule matching dynamoDB events',
      eventBus: bus,

      eventPattern: {
        detailType: ['Object State Change'],
        account: [Stack.of(this).account],
      }
    })

    const dynamo = new dynamodb.Table(this, 'cdk-dynamo-test', {
      tableName: 'cdk-dynamo-test',
      // billingMode: dynamodb.BillingMode.PROVISIONED,
      // readCapacity: 1,
      // writeCapacity: 1,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      partitionKey: {name: 'id', type: dynamodb.AttributeType.STRING},
      // sortKey: {name: 'createdAt', type: dynamodb.AttributeType.NUMBER},
      // pointInTimeRecovery: false,
      stream: dynamodb.StreamViewType.NEW_AND_OLD_IMAGES,
    })

    const firstLambda = new lambda.Function(this, 'cdk-handler-test', {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: 'first.main',
      code: lambda.Code.fromAsset('resources'),
      memorySize: 512
    })
    // firstLambda.addToRolePolicy(s3ListBucketsPolicy)
    dynamo.grantReadWriteData(firstLambda)

    const secondLambda = new lambda.Function(this, 'cdk-funnel-test', {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: 'second.main',
      code: lambda.Code.fromAsset('resources'),
      memorySize: 512
    })
    secondLambda.addEventSource(new source.DynamoEventSource(dynamo, {
      startingPosition: lambda.StartingPosition.TRIM_HORIZON,
      batchSize: 1,
      bisectBatchOnError: false,
      retryAttempts: 0
    }))
    bus.grantPutEventsTo(secondLambda)

    const thirdLambda = new lambda.Function(this, 'cdk-reactor-test', {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: 'third.main',
      code: lambda.Code.fromAsset('resources'),
      memorySize: 512
    })
    busRule.addTarget(new targets.LambdaFunction(thirdLambda))


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

    const getBucketsIntegration = new apigateway.LambdaIntegration(firstLambda, {
      requestTemplates: { "application/json": '{ "statusCode": "200" }' }
    })

    api.root.addMethod("GET", getBucketsIntegration); // GET /

    console.info('Access at: ', api.urlForPath('/'))
  }
}