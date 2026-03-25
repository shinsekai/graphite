import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { Readable } from 'node:stream';

export interface S3ClientConfig {
	endpoint: string;
	bucket: string;
	accessKey: string;
	secretKey: string;
	region: string;
}

export class S3StorageClient {
	constructor(
		private readonly client: S3Client,
		private readonly bucket: string,
	) {}

	async upload(key: string, body: Buffer | ReadableStream | Uint8Array | string, contentType: string): Promise<void> {
		const command = new PutObjectCommand({
			Bucket: this.bucket,
			Key: key,
			Body: body,
			ContentType: contentType,
		});

		await this.client.send(command);
	}

	async get(key: string): Promise<{ stream: Readable; mimeType: string } | null> {
		try {
			const command = new GetObjectCommand({
				Bucket: this.bucket,
				Key: key,
			});

			const response = await this.client.send(command);

			if (!response.Body) {
				return null;
			}

			const stream = response.Body as Readable;
			const mimeType = response.ContentType ?? 'application/octet-stream';

			return { stream, mimeType };
		} catch {
			return null;
		}
	}

	async remove(key: string): Promise<void> {
		const command = new DeleteObjectCommand({
			Bucket: this.bucket,
			Key: key,
		});

		await this.client.send(command);
	}
}

export function createS3Client(config: S3ClientConfig): S3StorageClient {
	const client = new S3Client({
		endpoint: config.endpoint,
		credentials: {
			accessKeyId: config.accessKey,
			secretAccessKey: config.secretKey,
		},
		region: config.region,
		forcePathStyle: true,
	});

	return new S3StorageClient(client, config.bucket);
}
