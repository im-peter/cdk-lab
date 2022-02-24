#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { CdkStack } from '../lib/cdk-stack';

const app = new cdk.App();
console.log('Account: ', process.env.CDK_DEFAULT_ACCOUNT, ' Region: ', process.env.CDK_DEFAULT_REGION)
new CdkStack(app, 'CdkStack', {
  description: 'This is a CDK-test project',
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION
  },
});