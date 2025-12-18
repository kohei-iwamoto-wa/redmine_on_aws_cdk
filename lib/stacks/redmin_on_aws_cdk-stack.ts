import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { RedmineVpc } from '../constructs/network/vpc';
import { RedmineEfs } from '../constructs/storage/efs';

export class RedmineOnAwsCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const vpc = new RedmineVpc(this, 'RedmineVPC', {});
    const efs = new RedmineEfs(this, 'RedmineEFS', {
      vpc: vpc.vpc,
    });
  }
}
