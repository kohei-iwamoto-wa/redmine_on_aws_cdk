import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { RedmineVpc } from '../constructs/network/vpc';
import { RedmineEfs } from '../constructs/storage/efs';
import { RedmineAurora } from '../constructs/database/aurora';

export class RedmineOnAwsCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const vpc = new RedmineVpc(this, 'RedmineVPC', {});
    new RedmineEfs(this, 'RedmineEFS', {
      vpc: vpc.vpc,
    });
    new RedmineAurora(this, 'RedmineAurora', {
      vpc: vpc.vpc,
    });
  }
}
