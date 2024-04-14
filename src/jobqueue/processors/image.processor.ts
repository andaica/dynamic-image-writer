import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import Jimp from 'jimp';
import config from 'src/config';
import { WhiteListItem } from 'src/dtos';

@Processor('dynamicImageJobQueue')
export class ImageProcessor {
  constructor() {}

  @Process('createImage')
  async handleImage(job: Job<{ imageData: WhiteListItem }>) {
    try {
      const { imageData } = job.data;
      if (!imageData) {
        throw Error('Empty image data');
      }
      console.log('handleImage: ', imageData);

      const voucherData = {
        collectionName: 'AVEX Smart voucher',
        balance: imageData.amount.toLocaleString(),
        startTime: '01-05-2024 15:00:00 UTC',
        endTime: '01-11-2024 15:00:00 UTC',
        tokenAddress: '0xa89...5580',
        credit: 'Powered by Vemo',
      };

      const fontCollectionName = await Jimp.loadFont(
        'input/fonts/28_white/28_white.fnt',
      );
      const fontBalance = await Jimp.loadFont(
        'input/fonts/36_white_bold/36_white_bold.fnt',
      );
      const fontInfoTitle = await Jimp.loadFont(
        'input/fonts/16_black_bold/16_black_bold.fnt',
      );
      const fontInfoContent = await Jimp.loadFont(Jimp.FONT_SANS_16_BLACK);
      const fontPowerBy = await Jimp.loadFont(
        'input/fonts/15_white/15_white.fnt',
      );

      const image = await Jimp.read(config.BASE_IMAGE_URL);
      await image
        .print(fontCollectionName, 86, 34, voucherData.collectionName)
        .print(fontBalance, 30, 85, voucherData.balance)
        .print(fontInfoTitle, 50, 222, 'Start time:')
        .print(fontInfoContent, 135, 220, voucherData.startTime)
        .print(fontInfoTitle, 50, 267, 'End time:')
        .print(fontInfoContent, 135, 265, voucherData.endTime)
        .print(fontInfoTitle, 50, 312, 'Token:')
        .print(fontInfoContent, 135, 310, voucherData.tokenAddress)
        .print(fontPowerBy, 35, 392, voucherData.credit)
        .writeAsync(`output/${imageData.hashId}.png`);
    } catch (error) {
      console.error(`ImageProcessor:handleImage error ${error}`);
    }
  }
}
