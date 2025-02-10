import {
  S3Client,
  ListObjectsV2Command,
  DeleteObjectsCommand,
  DeleteBucketCommand,
} from "@aws-sdk/client-s3";

export async function deleteS3Bucket(bucketArn: string) {
  const bucketName = bucketArn.split(":")[5];
  const client = new S3Client();

  try {
    // List and delete all objects in the bucket
    let continuationToken;
    do {
      const listCommand = new ListObjectsV2Command({
        Bucket: bucketName,
        ContinuationToken: continuationToken,
      });
      const listResponse = await client.send(listCommand);

      if (listResponse.Contents && listResponse.Contents.length > 0) {
        const deleteCommand = new DeleteObjectsCommand({
          Bucket: bucketName,
          Delete: {
            Objects: listResponse.Contents.map((object) => ({
              Key: object.Key,
            })),
          },
        });
        await client.send(deleteCommand);
        console.log(
          `Deleted ${listResponse.Contents.length} objects from S3 bucket: ${bucketName}`
        );
      }

      continuationToken = listResponse.NextContinuationToken;
    } while (continuationToken);

    // Delete the bucket
    const deleteBucketCommand = new DeleteBucketCommand({ Bucket: bucketName });
    await client.send(deleteBucketCommand);
    console.log(`Deleted S3 bucket: ${bucketName}`);
  } catch (error) {
    console.error(`Error deleting S3 bucket ${bucketName}:`, error);
    throw error;
  }
}
