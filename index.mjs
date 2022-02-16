import { Transform } from 'stream';
import fs from 'fs';
import fuzzy from 'fuzzy';
import { parse } from 'csv-parse';

export class FuzzyCompare extends Transform {
  first = true;
  _destroy(err, cb) {
    cb(err);
  }

  _transform(obj, encoding, cb) {
    const data = this.first && [...obj, 'Result'] || [...obj, fuzzy.test(obj[1], obj[0])];
    if (this.first) { this.first = false; }
    this.push(data);
    cb();
  }
  constructor(){
    super({ writableObjectMode: true, objectMode: true, readableObjectMode: true })
  }
}

export class JSONtoCsv extends Transform {
  _destroy(err, cb) {
    cb(err);
  }

  _transform(obj, encoding, cb) {
    this.push(obj.join(',') + '\n');
    cb();
  }
  constructor(){
    super({ writableObjectMode: true, objectMode: true, readableObjectMode: true })
  }
}

const parser = parse({
  delimiter: ','
});
const fuzzier = new FuzzyCompare();
const jsonToCsv = new JSONtoCsv();
const reader = fs.createReadStream('test.csv');
const writer = fs.createWriteStream('test_result.csv');

reader
  .pipe(parser)
  .pipe(fuzzier)
  .pipe(jsonToCsv)
  .pipe(writer)
  .on('end', res => console.log(res))
  .on('error', err => console.error(err));
