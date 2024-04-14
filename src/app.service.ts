import { Injectable, PreconditionFailedException } from '@nestjs/common';
import { WhiteListItem } from './dtos';
import { read, utils } from 'xlsx';
import config from './config';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';

@Injectable()
export class AppService {
  constructor(
    @InjectQueue('dynamicImageJobQueue') private dynamicImageQueue: Queue,
  ) {}

  async generateImagesFromFile(file: Express.Multer.File) {
    let datas: WhiteListItem[];
    try {
      datas = this.buildWhitelistFromFile(file);
    } catch (error) {
      throw new PreconditionFailedException(
        error.toString().substring(0, 100),
        'INVALID_FILE_CONTENT',
      );
    }

    await Promise.all(
      datas.map((item) =>
        this.dynamicImageQueue.add('createImage', { imageData: item }),
      ),
    );
    return datas;
  }

  buildWhitelistFromFile(file: Express.Multer.File): WhiteListItem[] {
    var wb = read(file.buffer, { type: 'buffer' });
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const lastCellName = utils.encode_cell({ c: 25, r: 10000 });
    sheet['!ref'] = `A1:${lastCellName}`;
    const data = utils.sheet_to_json<any>(sheet);
    if (data.length <= 0) {
      throw new Error('File must have content');
    }
    if (data.length > 10000) {
      throw new Error('Number of lines exceeded, maximum length is 10000');
    }

    const walletAddressKey = sheet['B1'].v;
    const amountKey = sheet['C1'].v;
    const hashIdKey = sheet['D1'].v;
    const output: WhiteListItem[] = [];

    for (let i = 0; i < data.length; i++) {
      if (
        !data[i][walletAddressKey] &&
        !data[i][amountKey] &&
        !data[i][hashIdKey]
      ) {
        continue;
      }

      if (isNaN(data[i][amountKey])) {
        throw new Error('Token ID / Amount must be a number');
      }

      output.push({
        walletAddress: data[i][walletAddressKey].toLowerCase(),
        amount: parseInt(data[i][amountKey]),
        hashId: data[i][hashIdKey],
      });
    }

    if (output.length == 0) throw new Error('File content empty');
    return output;
  }
}
