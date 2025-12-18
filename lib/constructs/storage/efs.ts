import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as efs from 'aws-cdk-lib/aws-efs'; 

interface RedmineEfsProps {
  vpc: ec2.Vpc;
}

export class RedmineEfs extends Construct {
  public readonly fileSystem: efs.FileSystem;

  constructor(scope: Construct, id: string, props: RedmineEfsProps) {
    super(scope, id);

    this.fileSystem = new efs.FileSystem(this, 'RedmineEFS', {
    vpc: props.vpc,
    removalPolicy: cdk.RemovalPolicy.DESTROY,
    encrypted: true,
    vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS, 
    },
    });
    this.fileSystem.connections.allowDefaultPortFrom(ec2.Peer.ipv4(props.vpc.vpcCidrBlock));
  }
}