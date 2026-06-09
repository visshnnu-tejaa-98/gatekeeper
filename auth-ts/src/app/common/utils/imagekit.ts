import ImageKit, { toFile } from "@imagekit/nodejs";
import { env } from "../zod/env";

const client = new ImageKit({
  privateKey: env.IMAGEKIT_PRIVATE_KEY,
});

const fileUpload = async (fileBuffer: Buffer, finleName: string) => {
  const response = await client.files.upload({
    file: await toFile(Buffer.from(fileBuffer), "avatar"),
    fileName: finleName,
  });
  return response;
};

export { fileUpload };
