import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { RedmineVpc } from '../constructs/network/vpc';
import { RedmineEfs } from '../constructs/storage/efs';
import { RedmineAurora } from '../constructs/database/aurora';

export class RedmineOnAwsCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // 1. ネットワーク基盤の作成
    const network = new RedmineVpc(this, 'RedmineNetwork', {});

    // 2. ストレージ層の作成
    const storage = new RedmineEfs(this, 'RedmineStorage', {
      vpc: network.vpc,
    });

    // 3. データベース層の作成
    const database = new RedmineAurora(this, 'RedmineDatabase', {
      vpc: network.vpc,
    });

    // 4. リソース間の連携（依存関係や通信許可）
    // this.configureInteractions(network, storage, database);

    // 5. 必要な情報の出力
    this.createOutputs(database);
  }

  /**
   * リソース間の相互作用（セキュリティグループの許可など）を定義
   */
  // private configureInteractions(
  //   network: RedmineVpc, 
  //   storage: RedmineEfs, 
  //   database: RedmineAurora
  // ): void {

  //   database.cluster.connections.allowDefaultPortFrom(app.service, 'Allow Redmine App to access DB');
  //   storage.fileSystem.connections.allowDefaultPortFrom(app.service, 'Allow Redmine App to access EFS');
  //   if (network.bastionHost) {
  //     database.cluster.connections.allowDefaultPortFrom(network.bastionHost);
  //   }
  // }

  /**
   * CloudFormation Output の定義
   */
  private createOutputs(database: RedmineAurora): void {
    new cdk.CfnOutput(this, 'DatabaseEndpoint', {
      value: database.cluster.clusterEndpoint.hostname,
      description: 'The hostname of the Aurora cluster',
    });
  }
}