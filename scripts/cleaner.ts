import {
  ResourceGroupsTaggingAPIClient,
  GetResourcesCommand,
  ResourceTagMapping,
} from "@aws-sdk/client-resource-groups-tagging-api";
import {
  CloudFormationClient,
  DescribeStackResourcesCommand,
} from "@aws-sdk/client-cloudformation";
import { deleteCloudWatchAlarm } from "./resources/cloudwatch";
import { deleteLogGroup } from "./resources/logs";
import { deleteApiGateway } from "./resources/apigateway";
import {
  deleteLambdaFunction,
  deleteEventSourceMapping,
} from "./resources/lambda";
import { deleteFirehoseDeliveryStream } from "./resources/firehose";
import { deleteS3Bucket } from "./resources/s3";
import { deleteStateMachine } from "./resources/states";
import { deleteWorkGroup } from "./resources/athena"; // Update this import
import { deleteSnsTopic } from "./resources/sns"; // Add this import
import { deleteSecurityGroup } from "./resources/ec2"; // Add this import
import { deleteResourceGroup } from "./resources/resource-groups"; // Add this import

async function getResourcesByTag(
  tagKey: string,
  tagValue: string,
  resourceTypeFilters: string[] = []
) {
  const client = new ResourceGroupsTaggingAPIClient();
  let resources: ResourceTagMapping[] = [];
  let paginationToken;

  do {
    const command = new GetResourcesCommand({
      TagFilters: [
        {
          Key: tagKey,
          Values: [tagValue],
        },
      ],
      PaginationToken: paginationToken,
      ResourceTypeFilters: resourceTypeFilters,
    });

    try {
      const response = await client.send(command);
      resources = resources.concat(response.ResourceTagMappingList || []);
      paginationToken = response.PaginationToken;
    } catch (error) {
      console.error("Error fetching resources by tag:", error);
      throw error;
    }
  } while (paginationToken);

  return resources;
}

async function checkResourceInStack(resourceArn: string) {
  const client = new CloudFormationClient();
  const command = new DescribeStackResourcesCommand({
    PhysicalResourceId: resourceArn,
  });

  try {
    const response = await client.send(command);
    const stackResources = response.StackResources || [];
    return stackResources.some(
      (stackResource) => stackResource.PhysicalResourceId === resourceArn
    );
  } catch (error) {
    if (
      error.Code === "ValidationError" &&
      error.message.includes("does not exist")
    ) {
      console.warn(`Warning: Stack for ${resourceArn} does not exist`);
      return false;
    } else {
      console.error("Error checking resource in stack:", error);
      throw error;
    }
  }
}

async function deleteResource(resourceArn: string, dryRun: boolean) {
  if (dryRun) {
    console.log(`[Dry Run] Would delete resource: ${resourceArn}`);
    return;
  }

  const serviceFromArn = resourceArn.split(":")[2];
  let resourceTypeFromArn;
  if (
    serviceFromArn === "firehose" ||
    serviceFromArn === "ec2" ||
    serviceFromArn === "athena"
  ) {
    resourceTypeFromArn = resourceArn.split(":")[5].split("/")[0];
  } else if (serviceFromArn === "sns") {
    resourceTypeFromArn = "topic";
  } else if (serviceFromArn === "resource-groups") {
    resourceTypeFromArn = resourceArn.split(":")[5].split("/")[0];
  } else {
    resourceTypeFromArn = resourceArn.split(":")[5];
  }

  console.log(
    `service: ${serviceFromArn}, resourceType: ${resourceTypeFromArn}`
  );

  if (serviceFromArn === "cloudwatch" && resourceTypeFromArn === "alarm") {
    await deleteCloudWatchAlarm(resourceArn);
  } else if (serviceFromArn === "logs" && resourceTypeFromArn === "log-group") {
    await deleteLogGroup(resourceArn);
  } else if (
    serviceFromArn === "apigateway" &&
    resourceTypeFromArn === "restapis"
  ) {
    await deleteApiGateway(resourceArn);
  } else if (
    serviceFromArn === "lambda" &&
    resourceTypeFromArn === "function"
  ) {
    await deleteLambdaFunction(resourceArn);
  } else if (
    serviceFromArn === "lambda" &&
    resourceTypeFromArn === "event-source-mapping"
  ) {
    await deleteEventSourceMapping(resourceArn);
  } else if (
    serviceFromArn === "firehose" &&
    resourceTypeFromArn === "deliverystream"
  ) {
    await deleteFirehoseDeliveryStream(resourceArn);
  } else if (serviceFromArn === "s3") {
    await deleteS3Bucket(resourceArn);
  } else if (
    serviceFromArn === "states" &&
    resourceTypeFromArn === "stateMachine"
  ) {
    await deleteStateMachine(resourceArn);
  } else if (
    serviceFromArn === "athena" &&
    resourceTypeFromArn === "workgroup"
  ) {
    await deleteWorkGroup(resourceArn);
  } else if (serviceFromArn === "sns" && resourceTypeFromArn === "topic") {
    await deleteSnsTopic(resourceArn);
  } else if (
    serviceFromArn === "ec2" &&
    resourceTypeFromArn === "security-group"
  ) {
    await deleteSecurityGroup(resourceArn);
  } else if (
    serviceFromArn === "resource-groups" &&
    resourceTypeFromArn === "group"
  ) {
    await deleteResourceGroup(resourceArn);
  } else {
    console.warn(`No deletion function for resource: ${resourceArn}`);
  }
}

// Example usage
const dryRun = process.argv.includes("--dry-run");
const resources = await getResourcesByTag(
  "awsApplication",
  "arn:aws:resource-groups:eu-central-1:471112809534:group/CMS-dev-main/063c589ruggljvp9bwogmyrr27",
  [
    // "cloudwatch:alarm",
    // "logs:log-group",
    // "apigateway:restapis",
    // "lambda:function",
    // "lambda:event-source-mapping",
    // "firehose:deliverystream",
    // "s3:bucket",
    // "states:stateMachine",
    // "athena:workgroup",
    // "sns:topic",
    // "ec2:security-group",
    "resource-groups:group",
  ]
);
if (!resources) {
  console.log("No resources found");
  process.exit(0);
}
for (const resource of resources) {
  if (resource.ResourceARN === undefined) {
    console.log("ResourceARN is undefined");
    continue;
  }
  const isInStack = await checkResourceInStack(resource.ResourceARN);
  if (!isInStack) {
    await deleteResource(resource.ResourceARN, dryRun);
  }
}
console.log(`Total resources found: ${resources.length}`);
