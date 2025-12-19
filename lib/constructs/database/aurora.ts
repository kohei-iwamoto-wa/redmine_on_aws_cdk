import * as rds from 'aws-cdk-lib/aws-rds';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { RemovalPolicy } from 'aws-cdk-lib';


interface RedmineAuroraProps {
    vpc: ec2.IVpc;
}
// Todo: クラスタ識別子やサブネットグループ名を固定値に変更する
export class RedmineAurora extends Construct {
    public readonly cluster: rds.DatabaseCluster;
    public readonly subnetGroup: rds.SubnetGroup;

    constructor(scope: Construct, id: string, props: RedmineAuroraProps) {
        super(scope, id);

        this.subnetGroup = new rds.SubnetGroup(this, 'RedmineDBSubnetGroup', {
            vpc: props.vpc,
            subnetGroupName: 'redmine-db-subnet-group',
            description: 'Subnet group for Redmine Aurora DB cluster',
            vpcSubnets: {
                subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
            },
        });
        
        this.cluster = new rds.DatabaseCluster(this, 'RedmineDB', {
            engine: rds.DatabaseClusterEngine.auroraPostgres({ version: rds.AuroraPostgresEngineVersion.VER_16_8 }),
            subnetGroup: this.subnetGroup,
            credentials: rds.Credentials.fromGeneratedSecret('adminuser'),
            writer: rds.ClusterInstance.provisioned('writer', {
                instanceType: ec2.InstanceType.of(ec2.InstanceClass.BURSTABLE3, ec2.InstanceSize.MEDIUM),
                publiclyAccessible: false,
            }),
            readers: [
                rds.ClusterInstance.provisioned('reader', {
                    instanceType: ec2.InstanceType.of(ec2.InstanceClass.BURSTABLE3, ec2.InstanceSize.MEDIUM),
                    publiclyAccessible: false,
                    applyImmediately: false
                })
            ],
            storageType: rds.DBClusterStorageType.AURORA,
            vpcSubnets: {
                subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
            },
            vpc: props.vpc,
            removalPolicy: RemovalPolicy.DESTROY
        });
    }
}