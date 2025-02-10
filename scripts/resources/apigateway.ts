import {
  APIGatewayClient,
  DeleteRestApiCommand,
} from "@aws-sdk/client-api-gateway";

export async function deleteApiGateway(resourceArn: string) {
  const client = new APIGatewayClient();
  const apiId = resourceArn.split("/").pop();

  if (!apiId) {
    console.error("Invalid API Gateway ARN:", resourceArn);
    return;
  }

  const command = new DeleteRestApiCommand({ restApiId: apiId });

  try {
    await client.send(command);
    console.log(`Deleted API Gateway: ${resourceArn}`);
  } catch (error) {
    console.error("Error deleting API Gateway:", error);
    throw error;
  }
}
