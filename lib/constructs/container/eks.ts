import * as eks from 'aws-cdk-lib/aws-eks';
import { KubectlV31Layer } from '@aws-cdk/lambda-layer-kubectl-v31'; 
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

interface RedmineEKSProps {
  vpc: ec2.IVpc;
}

export class RedmineEKS extends Construct {

  public readonly cluster: eks.Cluster;
  constructor(scope: Construct, id: string, props: RedmineEKSProps) {
    super(scope, id);
    this.cluster = this.createEksCluster(props);
    this.createFargateProfile(this.cluster);
  }

  private createEksCluster(props: RedmineEKSProps): eks.Cluster {
    return new eks.Cluster(this, 'RedmineEksCluster', {
        vpc: props.vpc,
        version: eks.KubernetesVersion.V1_31,
        clusterName: 'redmine-eks-cluster',
        kubectlLayer: new KubectlV31Layer(this, 'KubectlLayer'),
        defaultCapacity: 0,
        albController: {
            version: eks.AlbControllerVersion.V2_8_2,
        }
    });
  }

  private createFargateProfile(cluster: eks.Cluster) {
      // システム用（CoreDNSなど）
      cluster.addFargateProfile('SystemProfile', {
      selectors: [{ namespace: 'kube-system' }],
      });

      // アプリ用（Redmineなど）
      cluster.addFargateProfile('AppProfile', {
      selectors: [{ namespace: 'redmine-app' }],
      });
    }
}

