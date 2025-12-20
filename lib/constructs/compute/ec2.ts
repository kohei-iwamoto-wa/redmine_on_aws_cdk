import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

interface RedmineEc2ConstructProps {
    targetVpc: ec2.IVpc;
    securityGroup?: ec2.ISecurityGroup;
    instanceType?: ec2.InstanceType;
    machineImage?: ec2.IMachineImage;
    subnetType?: ec2.SubnetType;
    createSecurityGroupIfMissing?: boolean;
}

export class RedmineEc2 extends Construct {
    public readonly vpc: ec2.IVpc;
    public readonly instance: ec2.Instance;
    public readonly securityGroup: ec2.ISecurityGroup;

    constructor(scope: Construct, id: string, props: RedmineEc2ConstructProps) {
        super(scope, id);
        this.vpc = props.targetVpc;

        const resolved = this.resolveDefaults(props);
        this.securityGroup = this.ensureSecurityGroup(props, resolved.subnetType);
        this.instance = this.createInstance(props, resolved);
    }

    private resolveDefaults(props: RedmineEc2ConstructProps) {
        const instanceType = props.instanceType ?? new ec2.InstanceType('t3.micro');
        const machineImage = props.machineImage ?? ec2.MachineImage.latestAmazonLinux2();
        const subnetType = props.subnetType ?? ec2.SubnetType.PUBLIC;
        return { instanceType, machineImage, subnetType };
    }

    private ensureSecurityGroup(props: RedmineEc2ConstructProps, subnetType: ec2.SubnetType): ec2.ISecurityGroup {
        if (props.securityGroup) return props.securityGroup;

        if (props.createSecurityGroupIfMissing ?? true) {
            return new ec2.SecurityGroup(this, 'RedmineEc2SecurityGroup', {
                vpc: this.vpc,
                allowAllOutbound: true,
            });
        }

        throw new Error('securityGroup must be provided when createSecurityGroupIfMissing is false');
    }

    private createInstance(props: RedmineEc2ConstructProps, resolved: { instanceType: ec2.InstanceType; machineImage: ec2.IMachineImage; subnetType: ec2.SubnetType; }) {
        return new ec2.Instance(this, 'KmsAmiInstance', {
            instanceType: resolved.instanceType,
            machineImage: resolved.machineImage,
            vpc: this.vpc,
            vpcSubnets: this.vpc.selectSubnets({ subnetType: resolved.subnetType }),
            securityGroup: this.securityGroup,
        });
    }
}