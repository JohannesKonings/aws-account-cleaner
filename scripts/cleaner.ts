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

  if (resourceArn.includes("alarm")) {
    const alarmName = resourceArn.split(":").pop();
    if (alarmName) {
      await deleteCloudWatchAlarm(alarmName);
    }
  } else if (resourceArn.includes("log-group")) {
    const logGroupName = resourceArn.split(":").pop();
    if (logGroupName) {
      await deleteLogGroup(logGroupName);
    }
  } else {
    console.warn(`No deletion function for resource: ${resourceArn}`);
  }
}

// Example usage
const dryRun = process.argv.includes("--dry-run");
const resources = await getResourcesByTag(
  "awsApplication",
  "arn:aws:resource-groups:eu-central-1:471112809534:group/CMS-dev-main/063c589ruggljvp9bwogmyrr27",
  ["cloudwatch:alarm", "logs:log-group"]
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
