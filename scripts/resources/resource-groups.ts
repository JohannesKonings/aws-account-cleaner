import {
  ResourceGroupsClient,
  DeleteGroupCommand,
} from "@aws-sdk/client-resource-groups";

export async function deleteResourceGroup(resourceGroupArn: string) {
  const client = new ResourceGroupsClient();
  const groupName = resourceGroupArn.split("/").pop();
  try {
    const deleteCommand = new DeleteGroupCommand({
      GroupName: groupName,
    });
    await client.send(deleteCommand);
    console.log(`Deleted resource group: ${groupName}`);
  } catch (error) {
    console.error(`Error deleting resource group ${groupName}:`, error);
    throw error;
  }
}
